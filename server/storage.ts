import { 
  users, teachers, reviews, pyqs, favorites,
  type User, type InsertUser,
  type Teacher, type InsertTeacher, type TeacherWithReviewCount,
  type Review, type InsertReview,
  type Pyq, type InsertPyq,
  type Favorite
} from "@shared/schema";
import { db } from "./db";
import { eq, count, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUserGoogleId(id: number, googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Teachers
  getTeachers(): Promise<TeacherWithReviewCount[]>;
  getTeacher(id: number): Promise<TeacherWithReviewCount | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: number): Promise<boolean>;

  // Reviews
  getReviewsByTeacherId(teacherId: number): Promise<(Review & { studentUsername: string; studentEmail: string | null })[]>;
  getReview(id: number): Promise<Review | undefined>;
  getReviewByStudentAndTeacher(studentId: number, teacherId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;

  // PYQs
  getPyqsByTeacherId(teacherId: number): Promise<Pyq[]>;
  createPyq(pyq: InsertPyq): Promise<Pyq>;
  updatePyq(id: number, updates: Partial<InsertPyq>): Promise<Pyq | undefined>;
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  addFavorite(userId: number, teacherId: number): Promise<Favorite>;
  removeFavorite(userId: number, teacherId: number): Promise<boolean>;
  isFavorite(userId: number, teacherId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const isAdmin = ["2025100000379@seu.edu.bd", "2025100000403@seu.edu.bd"].includes(insertUser.email ?? "");
    const [user] = await db.insert(users).values({
      ...insertUser,
      role: isAdmin ? "admin" : "student"
    }).returning();
    return user;
  }

async updateUserGoogleId(id: number, googleId: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ googleId })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async updateUserRole(email: string, role: "admin" | "moderator" | "student"): Promise<User | undefined> {
    // Prevent changing role of the fixed admin
    if (email === "2025100000379@seu.edu.bd") return undefined;

    const [updated] = await db
      .update(users)
      .set({ role })
      .where(eq(users.email, email))
      .returning();
    return updated;
  }

  // Teachers
  async getTeachers(): Promise<TeacherWithReviewCount[]> {
    // Left join reviews to count them
    const result = await db
      .select({
        teacher: teachers,
        reviewCount: count(reviews.id),
      })
      .from(teachers)
      .leftJoin(reviews, eq(teachers.id, reviews.teacherId))
      .groupBy(teachers.id);

    return result.map(({ teacher, reviewCount }) => ({
      ...teacher,
      reviewCount: Number(reviewCount),
    }));
  }

  async getTeacher(id: number): Promise<TeacherWithReviewCount | undefined> {
    const [result] = await db
      .select({
        teacher: teachers,
        reviewCount: count(reviews.id),
      })
      .from(teachers)
      .leftJoin(reviews, eq(teachers.id, reviews.teacherId))
      .where(eq(teachers.id, id))
      .groupBy(teachers.id);

    if (!result) return undefined;

    return {
      ...result.teacher,
      reviewCount: Number(result.reviewCount),
    };
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
  console.log("createTeacher input:", JSON.stringify(teacher));
  const [newTeacher] = await db.insert(teachers).values(teacher).returning();
  return newTeacher;
}

  async updateTeacher(id: number, updates: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const [updated] = await db
      .update(teachers)
      .set(updates)
      .where(eq(teachers.id, id))
      .returning();
    return updated;
  }

  async deleteTeacher(id: number): Promise<boolean> {
  await db.delete(pyqs).where(eq(pyqs.teacherId, id));
  await db.delete(reviews).where(eq(reviews.teacherId, id));
  const [deleted] = await db.delete(teachers).where(eq(teachers.id, id)).returning();
  return !!deleted;
}

  // Reviews
  async getReviewsByTeacherId(teacherId: number): Promise<(Review & { studentUsername: string; studentEmail: string | null })[]> {
    const result = await db
      .select({
        review: reviews,
        student: users,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.studentId, users.id))
      .where(eq(reviews.teacherId, teacherId));

    return result.map(({ review, student }) => ({
      ...review,
      studentUsername: student.email,
      studentEmail: student.email,
    }));
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewByStudentAndTeacher(studentId: number, teacherId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.studentId, studentId),
          eq(reviews.teacherId, teacherId)
        )
      );
    return review;
  }

  async getReviewByStudentTeacherCourse(studentId: number, teacherId: number, courseTaken: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.studentId, studentId),
          eq(reviews.teacherId, teacherId),
          eq(reviews.courseTaken, courseTaken)
        )
      );
    return review;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [updated] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updated;
  }

  async deleteReview(id: number): Promise<boolean> {
    const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return !!deleted;
  }

  // PYQs
  async getPyqsByTeacherId(teacherId: number): Promise<Pyq[]> {
    return await db.select().from(pyqs).where(eq(pyqs.teacherId, teacherId));
  }

  async createPyq(pyq: InsertPyq): Promise<Pyq> {
    const [newPyq] = await db.insert(pyqs).values(pyq).returning();
    return newPyq;
  }

  async updatePyq(id: number, updates: Partial<InsertPyq>): Promise<Pyq | undefined> {
    const [updated] = await db
      .update(pyqs)
      .set(updates)
      .where(eq(pyqs.id, id))
      .returning();
    return updated;
  }

  async getFavoritesByUserId(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(userId: number, teacherId: number): Promise<Favorite> {
    const [fav] = await db.insert(favorites).values({ userId, teacherId }).returning();
    return fav;
  }

  async removeFavorite(userId: number, teacherId: number): Promise<boolean> {
    const [deleted] = await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.teacherId, teacherId)))
      .returning();
    return !!deleted;
  }

  async isFavorite(userId: number, teacherId: number): Promise<boolean> {
    const [fav] = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.teacherId, teacherId)));
    return !!fav;
  }
  // Leaderboard
  async getLeaderboard(): Promise<{ userId: number; email: string; reviewCount: number; pyqCount: number; points: number }[]> {
    // Get review counts per user
    const reviewCounts = await db
      .select({
        userId: reviews.studentId,
        reviewCount: count(reviews.id),
      })
      .from(reviews)
      .groupBy(reviews.studentId);

    if (reviewCounts.length === 0) return [];

    // Get all users to map IDs to emails
    const allUsers = await db.select({ id: users.id, email: users.email }).from(users);
    const userMap = new Map(allUsers.map(u => [u.id, u.email]));

    // Admin email to exclude from leaderboard
    const excludedEmail = "2025100000379@seu.edu.bd";

    // Build leaderboard - only review points (10 pts each)
    const leaderboard = reviewCounts
      .map(r => {
        const email = userMap.get(r.userId) || "unknown";
        const reviewCount = Number(r.reviewCount);
        return {
          userId: r.userId,
          email,
          reviewCount,
          pyqCount: 0,
          points: reviewCount * 10,
        };
      })
      .filter(entry => entry.points > 0 && entry.email !== excludedEmail)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    return leaderboard;
  }
}

export const storage = new DatabaseStorage();
