import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { pool } from "./db";

const PgStore = connectPgSimple(session);
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "replit_session_secret",
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      pool,
      createTableIfMissing: true,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: app.get("env") === "production",
    },
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "https://seu-ratemyfaculty.onrender.com/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email || !email.endsWith("@seu.edu.bd")) {
            return done(null, false);
          }
          const displayName = profile.displayName || null;
          const photoUrl = profile.photos?.[0]?.value || null;

          let user = await storage.getUserByGoogleId(profile.id);
          if (!user) {
            user = await storage.getUserByEmail(email);
            if (user) {
              // Link Google ID + update profile info
              user = await storage.updateUserGoogleId(user.id, profile.id) || user;
              await storage.updateUserProfile(user.id, displayName, photoUrl);
            } else {
              // Create new account with profile info
              user = await storage.createUser({
                email,
                password: "",
                googleId: profile.id,
                displayName,
                photoUrl,
              });
            }
          } else {
            // Update profile info on each login (photo may change)
            await storage.updateUserProfile(user.id, displayName, photoUrl);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const isSeuEmail = email.toLowerCase().endsWith("@seu.edu.bd");
        const isAllowedGmail = ["mahmudur.ft@gmail.com", "ratemyfaculty.seu@gmail.com"].includes(email.toLowerCase());

        if (!isSeuEmail && !isAllowedGmail) {
          return done(null, false, { message: "Please try with your university mail (@seu.edu.bd)" });
        }

        let user = await storage.getUserByEmail(email);
        
        if (!user) {
          // Auto-register
          const hashedPassword = await hashPassword(password);
          user = await storage.createUser({
            email,
            password: hashedPassword,
          });
        } else {
          // Check password for existing user
          if (!(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid password" });
          }
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as User).id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send("Email and password are required");
      }

      const isSeuEmail = email.toLowerCase().endsWith("@seu.edu.bd");
      const isAllowedGmail = email.toLowerCase() === "mahmudur.ft@gmail.com";

      if (!isSeuEmail && !isAllowedGmail) {
        return res.status(403).send("Please try with your university mail (@seu.edu.bd)");
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).send("Email already exists");
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=not_seu_email" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send("Not logged in");
    }
  });
}
