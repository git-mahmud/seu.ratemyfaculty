import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // === TEACHERS ===

  app.get(api.teachers.list.path, async (req, res) => {
    const teachers = await storage.getTeachers();
    res.json(teachers);
  });

  app.get(api.teachers.get.path, async (req, res) => {
    const teacher = await storage.getTeacher(Number(req.params.id));
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  });

  app.post(api.teachers.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(user.email);
    if (!isAdmin && user.role !== "moderator") {
      return res.status(403).json({ message: "Forbidden: Admin or Moderator only" });
    }
    try {
      const input = api.teachers.create.input.parse(req.body);
      const teacher = await storage.createTeacher(input);
      res.status(201).json(teacher);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.teachers.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(user.email);
    if (!isAdmin && user.role !== "moderator") {
      return res.status(403).json({ message: "Forbidden: Admin or Moderator only" });
    }
    try {
      const input = api.teachers.update.input.parse(req.body);
      const updated = await storage.updateTeacher(Number(req.params.id), input);
      if (!updated) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.teachers.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(user.email);
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }
    const id = Number(req.params.id);
    const success = await storage.deleteTeacher(id);
    if (!success) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(204).send();
  });

  // User Roles Management (Admin Only)
  app.patch("/api/admin/users/role", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    const user = req.user as any;
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(user.email);
    if (!isAdmin) return res.status(403).send("Forbidden: Admin only");

    const { email, role } = req.body;
    if (!email || !role) return res.status(400).send("Missing email or role");

    const updated = await storage.updateUserRole(email, role);
    if (!updated) return res.status(404).send("User not found");

    res.json(updated);
  });

  // === REVIEWS ===

  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviewsByTeacherId(Number(req.params.teacherId));
    const isAdmin = req.isAuthenticated() && (req.user as any).email === "2025100000379@seu.edu.bd";
    const sanitized = reviews.map(r => ({
      ...r,
      studentUsername: isAdmin ? r.studentEmail : "Anonymous Student",
      studentEmail: isAdmin ? r.studentEmail : undefined
    }));
    res.json(sanitized);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to submit a review" });
    }
    try {
      const input = api.reviews.create.input.parse(req.body);
      const studentId = (req.user as any).id;
      const existing = await storage.getReviewByStudentTeacherCourse(studentId, input.teacherId, input.courseTaken);
      if (existing) {
        return res.status(409).json({ message: "You have already submitted a review for this faculty in this course." });
      }
      if (!input.termsAccepted) {
        return res.status(400).json({ message: "You must agree to the Terms & Conditions before submitting a review." });
      }
      const review = await storage.createReview({ ...input, studentId });
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.reviews.update.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const reviewId = Number(req.params.id);
      const existing = await storage.getReview(reviewId);
      if (!existing) {
        return res.status(404).json({ message: "Review not found" });
      }
      if (existing.studentId !== (req.user as any).id) {
        return res.status(403).json({ message: "You can only edit your own reviews" });
      }
      const input = api.reviews.update.input.parse(req.body);
      const updated = await storage.updateReview(reviewId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.reviews.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const reviewId = Number(req.params.id);
    const existing = await storage.getReview(reviewId);
    if (!existing) {
      return res.status(404).json({ message: "Review not found" });
    }
    const isAdmin = (req.user as any).email === "2025100000379@seu.edu.bd";
    const isOwner = existing.studentId === (req.user as any).id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden: You cannot delete this review" });
    }
    await storage.deleteReview(reviewId);
    res.status(204).send();
  });

  // === PYQS ===

  app.get(api.pyqs.list.path, async (req, res) => {
    const pyqs = await storage.getPyqsByTeacherId(Number(req.params.teacherId));
    res.json(pyqs);
  });

  // Accept Google Drive URL instead of file upload
  app.post(api.pyqs.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(user.email);
    if (!isAdmin && user.role !== "moderator") {
      return res.status(403).json({ message: "Forbidden: Admin or Moderator only" });
    }

    try {
      const teacherId = Number(req.body.teacherId);
      const courseCode = String(req.body.courseCode);
      const semester = req.body.semester as "Spring" | "Summer" | "Fall";
      const examType = req.body.examType as "Mid" | "Final" | "Quiz";
      const year = Number(req.body.year);
      const uploadedBy = (req.user as any).id;
      const fileUrl = String(req.body.driveUrl);

      if (!teacherId || !courseCode || !year || !semester || !examType || !fileUrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const pyq = await storage.createPyq({
        teacherId,
        courseCode,
        semester,
        examType,
        year,
        fileUrl,
        uploadedBy
      });

      res.status(201).json(pyq);
    } catch (err) {
      console.error("PYQ Create Error:", err);
      res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
    }
  });

  app.put("/api/pyqs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(user.email);
    if (!isAdmin && user.role !== "moderator") {
      return res.status(403).json({ message: "Forbidden: Admin or Moderator only" });
    }
    try {
      const id = Number(req.params.id);
      const { courseCode, semester, examType, year, driveUrl } = req.body;
      if (!courseCode || !semester || !examType || !year || !driveUrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const updated = await storage.updatePyq(id, {
        courseCode,
        semester,
        examType,
        year: Number(year),
        fileUrl: driveUrl,
      });
      if (!updated) return res.status(404).json({ message: "PYQ not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === FAVORITES ===

  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const favs = await storage.getFavoritesByUserId(userId);
    res.json(favs);
  });

  app.post("/api/favorites/:teacherId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const teacherId = Number(req.params.teacherId);
    try {
      const fav = await storage.addFavorite(userId, teacherId);
      res.status(201).json(fav);
    } catch (err) {
      res.status(500).json({ message: "Already in favorites or error" });
    }
  });

  app.delete("/api/favorites/:teacherId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).id;
    const teacherId = Number(req.params.teacherId);
    const success = await storage.removeFavorite(userId, teacherId);
    if (!success) return res.status(404).json({ message: "Favorite not found" });
    res.status(204).send();
  });

  app.get("/api/favorites/:teacherId/check", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(200).json({ isFavorite: false });
    const userId = (req.user as any).id;
    const teacherId = Number(req.params.teacherId);
    const isFavorite = await storage.isFavorite(userId, teacherId);
    res.json({ isFavorite });
  });

  // === LEADERBOARD ===

  app.get(api.leaderboard.list.path, async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard/me", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(200).json({ points: 0, reviewCount: 0 });
    try {
      const userId = (req.user as any).id;
      const myPoints = await storage.getUserPoints(userId);
      res.json(myPoints);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch points" });
    }
  });

  // === AI CHAT ===

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ reply: "Please provide a message." });
      }

      const teachers = await storage.getTeachers();
      const query = message.toLowerCase();

      // Find matching teachers by name (case-insensitive partial match)
      const matchedTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(query.split(" ").filter(w => w.length > 2).join(" ")) ||
        query.split(" ").filter(w => w.length > 2).some(word => t.fullName.toLowerCase().includes(word))
      );

      // Also check for initials in brackets like [MBH]
      const initialsMatch = message.match(/\[([A-Z]+)\]/);
      let resolvedTeacher = null;

      if (initialsMatch) {
        const initials = initialsMatch[1];
        resolvedTeacher = teachers.find(t => t.fullName.includes(`[${initials}]`)) || null;
      }

      // If no initials provided, check matched teachers
      if (!resolvedTeacher && matchedTeachers.length === 1) {
        resolvedTeacher = matchedTeachers[0];
      } else if (!resolvedTeacher && matchedTeachers.length > 1) {
        // Ambiguity — ask for clarification
        const options = matchedTeachers.map(t => {
          const bracketMatch = t.fullName.match(/\[([A-Z]+)\]/);
          const initials = bracketMatch ? `[${bracketMatch[1]}]` : "";
          return `${initials} ${t.fullName}`;
        }).join(" or ");
        return res.json({
          reply: `I found multiple faculty members matching that name. Could you specify which one?\n\n${options}\n\nYou can use their initials in brackets to be specific!`
        });
      }

      // If we have a resolved teacher, fetch their data
      if (resolvedTeacher) {
        const teacherReviews = await storage.getReviewsByTeacherId(resolvedTeacher.id);
        const teacherPyqs = await storage.getPyqsByTeacherId(resolvedTeacher.id);

        // Minimum review check
        if (teacherReviews.length < 5) {
          return res.json({
            reply: `I don't have enough data about ${resolvedTeacher.fullName} yet. We need at least 5 reviews to give you an accurate summary. Currently there are only ${teacherReviews.length} review(s). Be the first to contribute!`
          });
        }

        // Build context for Groq
        const reviewsContext = teacherReviews.map((r, i) =>
          `Review ${i + 1}: Personality: ${r.personality}, Marking: ${r.markingStyle}, Difficulty: ${r.questionDifficulty}, Best For: ${(r as any).bestFor}, Course: ${r.courseTaken}${r.comment ? `, Comment: "${r.comment}"` : ""}`
        ).join("\n");

        const pyqContext = teacherPyqs.length > 0
          ? "\nAvailable PYQs:\n" + teacherPyqs.map(p =>
            `- ${p.courseCode} ${p.examType} ${p.year} (${p.semester}): ${p.fileUrl}`
          ).join("\n")
          : "\nNo PYQs available for this faculty.";

        const context = `Faculty: ${resolvedTeacher.fullName}\nDepartment: ${resolvedTeacher.department}\nUniversity: ${resolvedTeacher.university}\nCourses: ${resolvedTeacher.coursesTaught.join(", ")}\nTotal Reviews: ${teacherReviews.length}\n\n${reviewsContext}\n${pyqContext}`;

        // Call Groq
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content: `You are Kitty, a cute and helpful AI assistant for SEU Rate My Faculty — a student platform for Southeast University, Bangladesh. You help students understand faculty based on real student reviews.

When summarizing a faculty:
- Mention their overall personality (friendly/strict/neutral) based on majority of reviews
- Summarize their marking style honestly
- Mention exam difficulty level
- Say who they are best suited for (strong/average/weak students)
- Quote 1-2 interesting student comments if relevant
- If PYQ links are available, share them clearly
- Keep tone friendly, honest, and helpful
- Be concise — don't write essays
- Never make up information. Only use the data provided to you.
- If data is insufficient, say so honestly`
              },
              {
                role: "user",
                content: `User asked: "${message}"\n\nHere is the real data from our database:\n\n${context}`
              }
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (!groqResponse.ok) {
          return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
        }

        const groqData = await groqResponse.json();
        const reply = groqData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
        return res.json({ reply });
      }

      // No teacher matched — general query, call Groq with general context
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `You are Kitty, a cute and helpful AI assistant for SEU Rate My Faculty — a student platform for Southeast University, Bangladesh. You help students with questions about the platform. Available faculty count: ${teachers.length}. You can help users search for faculty by name, ask about reviews, PYQs, and how the platform works. If a user asks about a specific faculty, tell them to mention the faculty name so you can look them up. Keep tone friendly and concise.`
            },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (!groqResponse.ok) {
        return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
      }

      const groqData = await groqResponse.json();
      const reply = groqData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
      return res.json({ reply });

    } catch (err) {
      console.error("AI Chat Error:", err);
      return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
    }
  });

  return httpServer;
}
