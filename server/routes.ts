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
      const userEmail = (req.user as any).email;
      if (userEmail !== "2025100000379@seu.edu.bd") {
        const existing = await storage.getReviewByStudentTeacherCourse(studentId, input.teacherId, input.courseTaken);
        if (existing) {
          return res.status(409).json({ message: "You have already submitted a review for this faculty in this course." });
        }
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
      const { message, messages, customApiKey } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ reply: "Please provide a message." });
      }

      const apiKey = customApiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error("AI Chat: No GROQ_API_KEY available");
        return res.json({ reply: "AI is not configured yet. Please add your Groq API key in settings." });
      }

      // Fetch all teachers
      let teachers: any[] = [];
      try {
        teachers = await storage.getTeachers();
      } catch (e) {
        console.error("AI Chat: Failed to fetch teachers", e);
      }

      // Build faculty context: fetch reviews and PYQs for each teacher in parallel
      const teachersWithData = await Promise.all(
        teachers.map(async (t: any) => {
          let reviews: any[] = [];
          let pyqs: any[] = [];
          try {
            [reviews, pyqs] = await Promise.all([
              storage.getReviewsByTeacherId(t.id),
              storage.getPyqsByTeacherId(t.id),
            ]);
          } catch (e) { /* skip individual errors */ }
          return { teacher: t, reviews, pyqs };
        })
      );

      // Build a compact faculty context string with review summaries and PYQs
      const facultyContext = teachersWithData.map(({ teacher: t, reviews, pyqs }) => {
        const initMatch = t.fullName.match(/\[([A-Z]+)\]/i);
        const initials = initMatch ? "[" + initMatch[1] + "]" : "";
        const name = t.fullName.replace(/\[.*?\]/g, "").trim();

        let section = name + " " + initials + "\n  Department: " + t.department + "\n  Courses: " + ((t.coursesTaught || []).join(", ") || "N/A") + "\n  Reviews: " + t.reviewCount;

        if (reviews.length > 0) {
          // Aggregate review stats — find the majority value for each field
          const top = (arr: string[]) => {
            const counts: Record<string, number> = {};
            for (const v of arr) counts[v] = (counts[v] || 0) + 1;
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
          };
          section += "\n  Personality: Mostly " + top(reviews.map((r: any) => r.personality));
          section += "\n  Marking style: Mostly " + top(reviews.map((r: any) => r.markingStyle));
          section += "\n  Exam difficulty: Mostly " + top(reviews.map((r: any) => r.questionDifficulty));
          section += "\n  Best for: " + top(reviews.map((r: any) => r.bestFor));

          // Include standout student comments
          const comments = reviews.filter((r: any) => r.comment && r.comment.length > 10).slice(0, 3);
          if (comments.length > 0) {
            section += "\n  Student comments: " + comments.map((r: any) => '"' + r.comment + '"').join(" | ");
          }

          // Include per-course review breakdown
          const courseMap: Record<string, any[]> = {};
          for (const r of reviews) {
            if (!courseMap[r.courseTaken]) courseMap[r.courseTaken] = [];
            courseMap[r.courseTaken].push(r);
          }
          const courseDetails = Object.entries(courseMap).map(([course, revs]) =>
            course + ": " + revs.map((r: any) => r.personality + "/" + r.markingStyle + "/" + r.questionDifficulty).join(", ")
          );
          if (courseDetails.length > 0) {
            section += "\n  Course reviews: " + courseDetails.join(" | ");
          }
        }

        if (pyqs.length > 0) {
          const pyqList = pyqs.map((p: any) => p.courseCode + " " + p.examType + " " + p.year + " " + p.semester + ": " + p.fileUrl).join("\n  ");
          section += "\n  PYQs:\n  " + pyqList;
        }

        return section;
      }).join("\n\n");

      // Build the system prompt with faculty data injected
      const systemPrompt = "You are Kitty \ud83d\udc31, the AI assistant for SEU Rate My Faculty \u2014 a student platform for Southeast University (SEU) in Dhaka, Bangladesh. You were built by Mahmudur Rahman, a CSE student from Batch 70 at SEU.\n\n" +
        "You help students find faculty, understand reviews, get PYQs (Previous Year Questions), and make better academic decisions.\n\n" +
        "CONVERSATION INTELLIGENCE:\n" +
        "- You can see the full conversation history. Use it to understand follow-up questions and references.\n" +
        "- When a student says \"tell me more about him\", \"what about his teaching style\", or \"who is better\", refer to the faculty member discussed in previous messages. Never confuse a follow-up about a faculty with a question about yourself or your creator.\n" +
        "- Resolve pronouns like \"him\", \"her\", \"that faculty\", \"them\" from the conversation context.\n" +
        "- Track which faculty is being discussed. If the student was discussing Professor X, \"tell me more about him\" means more about Professor X \u2014 not about your creator, not about yourself.\n" +
        "- When the student switches to a new faculty, update your focus.\n" +
        "- If something is genuinely ambiguous, ask a brief clarification question.\n" +
        "- Understand informal, short, misspelled, and mixed Bangla-English messages from Bangladeshi university students.\n" +
        "- Don't repeat your full previous answer when asked to \"tell me more.\" Add new information or a different angle.\n" +
        "- Be conversational and natural \u2014 like a knowledgeable senior student giving friendly advice.\n\n" +
        "ANSWERING RULES:\n" +
        "- Give detailed, helpful answers. When a student asks about a faculty, provide a thorough summary: teaching style, marking approach, exam difficulty, who they're best for, and student opinions. Don't give one-liners.\n" +
        "- Use only the faculty data provided below. Never fabricate information.\n" +
        "- If you don't have enough data about a faculty (fewer than 5 reviews), say so honestly.\n" +
        "- Only mention the creator (Mahmudur Rahman) when the user is genuinely asking about YOU (Kitty) or the APP \u2014 never when they're asking about a faculty member.\n" +
        "- Summarize review data into natural language. Don't list \"Review 1:\", \"Review 2:\". Describe the overall picture.\n" +
        "- Quote 1-2 standout student comments when relevant.\n" +
        "- When listing PYQs, put each on a new line exactly as: COURSECODE ExamType Year Semester: DRIVELINK\n" +
        "- When recommending faculty, rank them and explain why each is a good or poor match.\n" +
        "- When a student asks for a recommendation but hasn't specified preferences, ask what matters most (good marks, learning, easy exams, or a chill semester).\n" +
        "- Never say \"I don't understand\" \u2014 always try your best to help.\n" +
        "- Stay on topic (SEU faculty, reviews, PYQs, the platform) but handle general greetings naturally.\n\n" +
        "FORMATTING:\n" +
        "- Never use markdown. No asterisks, no bold, no headers, no bullet points with *. Write in plain conversational sentences with line breaks.\n" +
        "- Don't introduce yourself in every response. Get straight to the answer.\n" +
        "- Keep responses under 250 words unless the student asks for detail.\n\n" +
        "=== FACULTY DATA ===\n" + facultyContext;

      // Build Groq messages: system prompt + conversation history + current message
      const groqMessages: any[] = [{ role: "system", content: systemPrompt }];

      // Add conversation history from the frontend (already in user/assistant format)
      if (Array.isArray(messages)) {
        for (const msg of messages.slice(-30)) {
          if (msg && msg.role && msg.content) {
            groqMessages.push({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            });
          }
        }
      }

      // Add the current user message
      groqMessages.push({ role: "user", content: message });

      // Call Groq API
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
        }),
      });

      if (!groqRes.ok) {
        const errBody = await groqRes.text().catch(() => "unknown error");
        console.error("AI Chat: Groq error", groqRes.status, errBody);
        return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
      }

      const groqData = await groqRes.json();
      return res.json({ reply: groqData.choices?.[0]?.message?.content || "I couldn't generate a response." });

    } catch (err) {
      console.error("AI Chat top-level error:", err);
      return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
    }
  });

  return httpServer;
}
