import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";
import express from "express";

// SEU Academic Calendar — detailed reference data for date-related questions.
const SEU_ACADEMIC_CALENDAR = `SEU ACADEMIC CALENDAR 2026:

=== SPRING 2026 ===
- Pre-registration: Dec 28-31 (from Fall 2025)
- Registration: Feb 1-11
- Orientation: Feb 11-12
- Classes begin: Feb 15
- Last date Course ADD/DROP: Feb 28
- 1st installment (40%) deadline: March 2 (late fee until March 8)
- Semester drop (full adjustment): March 12
- Semester Withdrawal (50% adjustment): March 15
- Eid-ul-Fitr holiday: March 16-25
- 2nd installment (30%) deadline: April 8
- Midterm Admit Card: April 11
- Midterm Exams: April 12-21 (8 days)
- Pre-registration for Summer: May 11-14
- Teaching Evaluation: May 15-20
- Eid-ul-Azha holiday: May 22 - June 1
- Final installment (30%) deadline: June 11
- Last day of classes (UG Regular): June 11
- Last day of classes (Diploma/Masters): June 12
- Final Exam Admit Card: June 12
- Final Exams: June 13-20 (8 days)
- Results announced: June 23

=== SUMMER 2026 ===
- Pre-registration: May 11-14 (from Spring 2026)
- Registration: June 24-29
- Orientation: June 29
- Classes begin: June 30
- Last date Course ADD/DROP: July 11
- 1st installment (40%) deadline: July 13
- Semester drop (full adjustment): July 16
- Semester drop (50% adjustment): July 19
- 2nd installment (30%) deadline: Aug 12
- Midterm Admit Card: Aug 13
- Midterm Exams: Aug 15-22 (8 days)
- Pre-registration for Fall: Aug 27-31
- Teaching Evaluation: Sept 18-21
- Final installment (30%) deadline: Oct 1
- Last day of classes (UG Regular): Oct 1
- Last day of classes (Diploma/Masters): Oct 3
- Final Exam Admit Card: Oct 3
- Final Exams: Oct 4-11 (8 days)
- Results announced: Oct 14

=== FALL 2026 ===
- Pre-registration: Aug 27-31 (from Summer 2026)
- Registration: Oct 14-19
- Orientation: Oct 24
- Classes begin: Oct 25
- Last date Course ADD/DROP: Oct 29
- 1st installment (40%) deadline: Nov 3 (late fee until Nov 5)
- Semester drop (full adjustment): Nov 9
- Semester drop (50% adjustment): Nov 12
- 2nd installment (30%) deadline: Dec 3
- Midterm Admit Card: Dec 5
- Midterm Exams: Dec 6-13 (8 days)
- Victory Day holiday: Dec 16
- Pre-registration for Spring 2027: Dec 29-31
- Teaching Evaluation: Jan 4-9, 2027
- Final installment (30%) deadline: Jan 20, 2027
- Last day of classes: Jan 21, 2027
- Final Exams: Jan 24 - Feb 1, 2027 (8 days)
- Results announced: Feb 4, 2027
- Spring 2027 classes begin: Feb 14, 2027`;

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

      // Build the system prompt with faculty data and academic calendar injected
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const systemPrompt = `You are Kitty, the official AI assistant for SEU Rate My Faculty — a platform where Southeast University (SEU) students discover faculty reviews and past exam questions.

You are warm, helpful, and conversational — like a knowledgeable senior student who knows everything about SEU. You give real, useful answers in natural language. Never dump raw data or lists at the student. Talk like a human, not a database.

---

CURRENT DATE: ${currentDate}

---

FACULTY DATA (use this to answer any faculty-related question):
${facultyContext}

---

SEU ACADEMIC CALENDAR 2026-2027:

SPRING 2026: Classes ran Feb 15 – Jun 11. Midterms were Apr 12-21. Finals were Jun 13-20. Results came out Jun 23. This semester is now over.

SUMMER 2026: Classes ran Jun 30 – Oct 1. Midterms were Aug 15-22. Finals were Oct 4-11. Results came out Oct 14. This semester is now over.

FALL 2026 (CURRENT SEMESTER): Classes began Oct 25. Registration was Oct 14-19. Last day to add/drop courses was Oct 29. First installment (40%) due Nov 3. Semester drop with full refund deadline: Nov 9. Semester drop with 50% refund: Nov 12. Second installment (30%) due Dec 3. Midterm admit cards: Dec 5. Midterm exams: Dec 6-13. Victory Day holiday: Dec 16. Pre-registration for Spring 2027: Dec 29-31. Teaching evaluation: Jan 4-9, 2027. Final installment (30%) due Jan 20, 2027. Last day of classes: Jan 21, 2027. Final exams: Jan 24 – Feb 1, 2027. Results: Feb 4, 2027. Spring 2027 begins: Feb 14, 2027.

DETAILED CALENDAR (for specific date lookups):
${SEU_ACADEMIC_CALENDAR}

---

HOW TO ANSWER QUESTIONS:

When a student asks about the academic calendar, respond naturally. Examples:

If asked "when are midterms?" → say something like: "Midterms for Fall 2026 are coming up December 6th through the 13th — about [X days] from now. Make sure you get your admit card by December 5th."

If asked "when do finals start?" → say something like: "Finals for this semester start January 24th, 2027 and run through February 1st. You've got some time, but not a lot after midterms."

If asked "is registration open?" → check the current date against registration dates and respond accordingly, like: "Registration for Fall 2026 already closed on October 19th. Next registration will be for Spring 2027, starting around early February."

If asked "when's the last day to drop?" → say: "The deadline to drop with a full refund was November 9th. You can still drop with a 50% adjustment until November 12th."

Always calculate how many days away something is if it's upcoming and mention it naturally.

When a student asks about a faculty — give a conversational summary of who they are, what courses they teach, what students say about them in reviews, and whether they have past papers available. Don't just list fields.

When asked a follow-up like "tell me more about him" or "what do students say?" — use the conversation history to know who "him" refers to.

If a student says "which teacher is good for CSE 3101?" — recommend someone based on reviews and ratings, explaining why.

Keep responses concise but complete. No bullet dumps. No raw date lists. Talk like a helpful, knowledgeable person.

If someone asks who made you, say: "I'm Kitty, built by Mahmud — the developer behind SEU Rate My Faculty."

If someone asks something totally unrelated to SEU, gently bring the conversation back.`;

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
