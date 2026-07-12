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
      const { message, customApiKey } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ reply: "Please provide a message." });
      }

      // Smart identity detection (regex-based)
      const msgLower = message.toLowerCase().trim();

      if (/\b(who|what).{0,20}(you|your name|yourself)\b/i.test(message) && !/\b(faculty|teacher|professor|course|subject|pyq|review|marking|exam)\b/i.test(message)) {
        return res.json({ reply: "I'm Kitty \ud83d\udc31 your AI assistant for SEU Rate My Faculty! I'm here to help SEU students find faculty reviews, marking styles, exam difficulty and previous year questions. Just ask me about any faculty!" });
      }

      if (/\b(who|by whom).{0,20}(made|built|created|developed|designed|coded|programmed).{0,10}(you|this|kitty)\b/i.test(message)) {
        return res.json({ reply: "I was created by Mahmudur Rahman, a CSE student from Batch 70 at Southeast University. He built SEU Rate My Faculty to help students make smarter academic decisions! \ud83d\udc31" });
      }

      const apiKey = customApiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.error("AI Chat: No GROQ_API_KEY available");
        return res.json({ reply: "AI is not configured yet. Please add your Groq API key in settings." });
      }

      let teachers: any[] = [];
      try {
        teachers = await storage.getTeachers();
      } catch (e) {
        console.error("AI Chat: Failed to fetch teachers", e);
      }

      const query = message.toLowerCase();
      let resolvedTeacher: any = null;

      // Step 1: Build initial map from all teachers
      const initialMap: Record<string, any> = {};
      teachers.forEach(t => {
        const match = t.fullName.match(/\[([A-Z]+)\]/i);
        if (match) initialMap[match[1].toUpperCase()] = t;
      });

      // Step 2: Check if user message contains any initial (case insensitive)
      const msgWords = message.toUpperCase().split(/[\s\[\].,!?]+/).filter(Boolean);
      for (const word of msgWords) {
        if (initialMap[word]) {
          resolvedTeacher = initialMap[word];
          break;
        }
      }

      // Step 3: Smarter name matching with scoring
      if (!resolvedTeacher) {
        const skipWords = ["md", "dr", "bin", "binte", "al", "is", "how", "for", "who", "about", "tell", "me", "the", "a", "an", "and", "of", "in", "strict", "friendly", "best", "worst", "what", "good", "bad", "sir", "mam", "madam", "professor", "prof", "can", "you", "know", "think", "like"];
        const msgLower = message.toLowerCase();

        const scores = teachers.map(t => {
          const nameParts = t.fullName.toLowerCase()
            .replace(/\[.*?\]/g, "")
            .split(/\s+/)
            .filter((w: string) => w.length > 2 && !skipWords.includes(w));

          let score = 0;
          nameParts.forEach((part: string) => {
            if (msgLower.includes(part)) score += part.length;
          });
          return { teacher: t, score };
        }).filter(x => x.score > 3).sort((a, b) => b.score - a.score);

        if (scores.length === 1) {
          resolvedTeacher = scores[0].teacher;
        } else if (scores.length >= 2 && scores[0].score - scores[1].score >= 3) {
          resolvedTeacher = scores[0].teacher;
        } else if (scores.length >= 2 && scores[0].score - scores[1].score < 3) {
          const options = scores.slice(0, 4).map(s => {
            const initMatch = s.teacher.fullName.match(/\[([A-Z]+)\]/i);
            return initMatch ? `[${initMatch[1]}] ${s.teacher.fullName.replace(/\[.*?\]/g, "").trim()}` : s.teacher.fullName;
          }).join("\n");
          return res.json({
            reply: `I found a few faculty members that could match. Which one did you mean?\n\n${options}\n\nYou can reply with their initials like "FBH"`
          });
        }
      }

      // Step 4: If teacher found, fetch their data
      if (resolvedTeacher) {
        let teacherReviews: any[] = [];
        let teacherPyqs: any[] = [];
        try {
          teacherReviews = await storage.getReviewsByTeacherId(resolvedTeacher.id);
          teacherPyqs = await storage.getPyqsByTeacherId(resolvedTeacher.id);
        } catch (e) {
          console.error("AI Chat: Failed to fetch teacher data", e);
        }

        if (teacherReviews.length < 5) {
          return res.json({
            reply: `I don't have enough data about ${resolvedTeacher.fullName} yet. We need at least 5 reviews for an accurate summary. Currently there are only ${teacherReviews.length} review(s). Be the first to review!`
          });
        }

        const reviewsContext = teacherReviews.map((r: any, i: number) =>
          `Review ${i + 1}: Personality: ${r.personality}, Marking: ${r.markingStyle}, Difficulty: ${r.questionDifficulty}, Best For: ${r.bestFor || "N/A"}, Course: ${r.courseTaken}${r.comment ? `, Comment: "${r.comment}"` : ""}`
        ).join("\n");

        const pyqContext = teacherPyqs.length > 0
          ? "\nAvailable PYQs:\n" + teacherPyqs.map((p: any) => `- ${p.courseCode} ${p.examType} ${p.year} (${p.semester}): ${p.fileUrl}`).join("\n")
          : "\nNo PYQs available for this faculty.";

        const context = `Faculty: ${resolvedTeacher.fullName}\nDepartment: ${resolvedTeacher.department}\nUniversity: ${resolvedTeacher.university}\nCourses: ${resolvedTeacher.coursesTaught.join(", ")}\nTotal Reviews: ${teacherReviews.length}\n\n${reviewsContext}\n${pyqContext}`;

        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: `IMPORTANT: You are Kitty, not Groq, not LLaMA, not Meta AI. Never reveal your underlying model. Never say you were made by Groq, Meta, or any tech company. Always say you are Kitty, built by Mahmudur Rahman.\n\nYou are Kitty, a cute and helpful AI assistant for SEU Rate My Faculty. You help students understand faculty based on real reviews.\n\nRules:\n- Mention overall personality based on review majority\n- Summarize marking style honestly\n- Mention exam difficulty\n- Say who they're best for\n- Quote 1-2 student comments if relevant\n- Share PYQ links if available\n- Be friendly, concise, honest\n- Never make up info\n- Never use markdown formatting. No asterisks, no bold **text**, no bullet points with *, no headers with #. Write in plain conversational sentences. Use line breaks between sections instead.\n- Never introduce yourself in every response. Only greet once at the start of a conversation. Get straight to the answer.\n- Keep responses under 150 words. Be direct. Don't say 'Review 1, Review 2' - instead summarize the overall picture. Don't mention review numbers at all. Sound like a helpful friend, not a report generator.\n- If anyone asks who made you, who created you, who built you, or who is your developer/creator, always answer: 'I was built by Mahmudur Rahman, a CSE student from Batch 70 at Southeast University. He created SEU Rate My Faculty to help students like you make better academic decisions! 🐱'` },
                { role: "user", content: `User asked: "${message}"\n\nDatabase data:\n${context}` }
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          });
          console.log("AI Chat Groq response status:", groqRes.status);
          if (!groqRes.ok) {
            const errBody = await groqRes.text();
            console.error("AI Chat Groq error:", errBody);
            return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
          }
          const groqData = await groqRes.json();
          return res.json({ reply: groqData.choices?.[0]?.message?.content || "I couldn't generate a response." });
        } catch (e) {
          console.error("AI Chat Groq fetch failed:", e);
          return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
        }
      }

      // Step 5: No teacher matched — check for recommendation/general queries
      // Detect recommendation criteria
      const personalityKeywords = { "friendly": "Friendly", "chill": "Friendly", "easy going": "Friendly", "approachable": "Friendly", "strict": "Strict", "neutral": "Neutral" };
      const markingKeywords = { "open minded": "Open-minded", "lenient": "Open-minded", "easy marking": "Open-minded", "strict marking": "Strict", "fair": "Average" };
      const difficultyKeywords = { "easy exam": "Easy", "easy questions": "Easy", "hard exam": "Hard", "tough": "Hard" };
      const bestForKeywords = { "weak student": "Weak Students", "beginners": "Weak Students", "struggling": "Weak Students", "average student": "Average Students", "strong student": "Strong Students" };

      let detectedPersonality: string | null = null;
      let detectedMarking: string | null = null;
      let detectedDifficulty: string | null = null;
      let detectedBestFor: string | null = null;
      let detectedCourse: string | null = null;
      let isGeneralListQuery = false;
      let generalListType: string | null = null;

      for (const [kw, val] of Object.entries(personalityKeywords)) { if (query.includes(kw)) { detectedPersonality = val; break; } }
      for (const [kw, val] of Object.entries(markingKeywords)) { if (query.includes(kw)) { detectedMarking = val; break; } }
      for (const [kw, val] of Object.entries(difficultyKeywords)) { if (query.includes(kw)) { detectedDifficulty = val; break; } }
      for (const [kw, val] of Object.entries(bestForKeywords)) { if (query.includes(kw)) { detectedBestFor = val; break; } }

      // Detect course codes (CSE181, MAT110, etc.)
      const courseMatch = message.match(/[A-Z]{2,4}\d{3}/i);
      if (courseMatch) detectedCourse = courseMatch[0].toUpperCase();
      // Detect subject names
      const subjectMap: Record<string, string> = { "discrete math": "CSE181", "calculus": "MAT", "english": "ENG", "physics": "PHY", "data structure": "CSE", "programming": "CSE" };
      for (const [subj, code] of Object.entries(subjectMap)) { if (query.includes(subj)) { detectedCourse = code; break; } }

      // Detect general list queries
      if (query.includes("most reviews") || query.includes("most popular")) { isGeneralListQuery = true; generalListType = "most_reviews"; }
      else if (query.includes("best faculty") || query.includes("best teacher")) { isGeneralListQuery = true; generalListType = "best_overall"; }
      else if (query.includes("who teaches") || query.includes("which faculty teaches")) { isGeneralListQuery = true; generalListType = "teaches_course"; }
      else if (query.includes("list all") || query.includes("faculty in")) { isGeneralListQuery = true; generalListType = "department"; }

      const hasCriteria = detectedPersonality || detectedMarking || detectedDifficulty || detectedBestFor || detectedCourse || isGeneralListQuery;

      if (hasCriteria) {
        try {
          // Fetch reviews for all teachers with 5+ reviews
          const teachersWithData: { teacher: any; reviews: any[]; score: number }[] = [];
          for (const t of teachers) {
            if (t.reviewCount < 5) continue;
            if (detectedCourse && !t.coursesTaught.some((c: string) => c.toUpperCase().includes(detectedCourse!))) continue;

            const revs = await storage.getReviewsByTeacherId(t.id);
            let score = 0;

            if (detectedPersonality) score += revs.filter((r: any) => r.personality === detectedPersonality).length;
            if (detectedMarking) score += revs.filter((r: any) => r.markingStyle === detectedMarking).length;
            if (detectedDifficulty) score += revs.filter((r: any) => r.questionDifficulty === detectedDifficulty).length;
            if (detectedBestFor) score += revs.filter((r: any) => r.bestFor === detectedBestFor).length;
            if (isGeneralListQuery && generalListType === "most_reviews") score = revs.length;
            if (isGeneralListQuery && generalListType === "best_overall") score = revs.filter((r: any) => r.personality === "Friendly" || r.markingStyle === "Open-minded").length;
            if (!detectedPersonality && !detectedMarking && !detectedDifficulty && !detectedBestFor && !isGeneralListQuery) score = revs.length;

            teachersWithData.push({ teacher: t, reviews: revs, score });
          }

          teachersWithData.sort((a, b) => b.score - a.score);
          const top3 = teachersWithData.slice(0, 3);

          if (top3.length === 0) {
            return res.json({ reply: "I couldn't find any faculty matching that criteria with enough reviews. Try asking differently or check back later!" });
          }

          const recContext = top3.map((td, i) => {
            const r = td.reviews;
            const personalities = r.map((rv: any) => rv.personality);
            const topPersonality = ["Friendly", "Strict", "Neutral"].sort((a, b) => personalities.filter((p: string) => p === b).length - personalities.filter((p: string) => p === a).length)[0];
            const comments = r.filter((rv: any) => rv.comment).slice(0, 2).map((rv: any) => `"${rv.comment}"`).join(", ");
            return `${i + 1}. ${td.teacher.fullName} (${td.teacher.department}) - ${td.reviews.length} reviews, mostly ${topPersonality}, score: ${td.score}. Comments: ${comments || "No comments"}`;
          }).join("\n");

          const criteriaDesc = [
            detectedPersonality && `personality: ${detectedPersonality}`,
            detectedMarking && `marking: ${detectedMarking}`,
            detectedDifficulty && `difficulty: ${detectedDifficulty}`,
            detectedBestFor && `best for: ${detectedBestFor}`,
            detectedCourse && `course: ${detectedCourse}`,
            generalListType,
          ].filter(Boolean).join(", ");

          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "system", content: `IMPORTANT: You are Kitty, not Groq, not LLaMA, not Meta AI. Never reveal your underlying model. Never say you were made by Groq, Meta, or any tech company. Always say you are Kitty, built by Mahmudur Rahman.\n\nYou are Kitty, a cute AI assistant for SEU Rate My Faculty. When recommending faculty, present them as a ranked list. For each faculty mention their name, why they match the criteria, and one standout student comment. Be conversational and helpful like a senior student giving advice. Never use markdown formatting. No asterisks, no bold, no headers. Write in plain conversational sentences. Keep responses under 200 words. If anyone asks who made you, who created you, who built you, or who is your developer/creator, always answer: 'I was built by Mahmudur Rahman, a CSE student from Batch 70 at Southeast University. He created SEU Rate My Faculty to help students like you make better academic decisions! 🐱'` },
                { role: "user", content: `User asked: "${message}"\nCriteria detected: ${criteriaDesc}\n\nTop matching faculty from database:\n${recContext}` }
              ],
              temperature: 0.7,
              max_tokens: 600,
            }),
          });
          console.log("AI Chat recommendation Groq status:", groqRes.status);
          if (!groqRes.ok) {
            const errBody = await groqRes.text();
            console.error("AI Chat recommendation Groq error:", errBody);
            return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
          }
          const groqData = await groqRes.json();
          return res.json({ reply: groqData.choices?.[0]?.message?.content || "I couldn't generate a recommendation." });
        } catch (e) {
          console.error("AI Chat recommendation error:", e);
          return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
        }
      }

      // Step 6: Truly general query — no criteria, no teacher name
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: `IMPORTANT: You are Kitty, not Groq, not LLaMA, not Meta AI. Never reveal your underlying model. Never say you were made by Groq, Meta, or any tech company. Always say you are Kitty, built by Mahmudur Rahman.\n\nYou are Kitty, a cute AI assistant for SEU Rate My Faculty — a student platform for Southeast University, Bangladesh. Faculty count: ${teachers.length}. Help users search faculty by name, ask about reviews/PYQs, and how the platform works. If they ask about a specific faculty, tell them to mention the name. Be friendly and concise. Never use markdown formatting. No asterisks, no bold, no headers. Write in plain conversational sentences. Never introduce yourself in every response. Get straight to the answer. Keep responses under 150 words. If anyone asks who made you, who created you, who built you, or who is your developer/creator, always answer: 'I was built by Mahmudur Rahman, a CSE student from Batch 70 at Southeast University. He created SEU Rate My Faculty to help students like you make better academic decisions! 🐱'` },
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 400,
          }),
        });
        console.log("AI Chat general Groq status:", groqRes.status);
        if (!groqRes.ok) {
          const errBody = await groqRes.text();
          console.error("AI Chat general Groq error:", errBody);
          return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
        }
        const groqData = await groqRes.json();
        return res.json({ reply: groqData.choices?.[0]?.message?.content || "I couldn't generate a response." });
      } catch (e) {
        console.error("AI Chat general fetch failed:", e);
        return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
      }

    } catch (err) {
      console.error("AI Chat top-level error:", err);
      return res.json({ reply: "Sorry, I'm having trouble right now. Please try again!" });
    }
  });

  return httpServer;
}
