import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useTeacher } from "@/hooks/use-teachers";
import { useReviews } from "@/hooks/use-reviews";
import { Navbar } from "@/components/Navbar";
import { ReviewForm } from "@/components/ReviewForm";
import { PyqList, UploadPyqDialog } from "@/components/PyqList";
import {
  Building2, MapPin, BookOpen, User, Smile, Frown, Meh,
  GraduationCap, Pencil, Trash2, MessageSquarePlus, Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsFavorite, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function TeacherProfile() {
  const [, params] = useRoute("/teacher/:id");
  const teacherId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pyqDialogOpen, setPyqDialogOpen] = useState(false);
  const { data: favData } = useIsFavorite(teacherId);
  const isFavorite = favData?.isFavorite ?? false;
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const { data: teacher, isLoading: teacherLoading, error: teacherError } = useTeacher(teacherId);
  const { data: reviews, isLoading: reviewsLoading } = useReviews(teacherId);

  useEffect(() => {
    if (teacher) {
      document.title = `${teacher.fullName} Reviews — SEU Rate My Faculty`;
    }
  }, [teacher]);

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.reviews.delete.path, { id }), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reviews.list.path, teacherId] });
      toast({ title: "Review deleted" });
    },
  });

  if (teacherLoading) return <ProfileSkeleton />;
  if (teacherError || !teacher) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <p style={{ color: "hsl(var(--destructive))" }}>Faculty not found</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <main className="flex-1">

        {/* ===== HEADER BANNER ===== */}
        <div style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start fade-in">

              {/* Avatar */}
              <div style={{
                width: "112px", height: "112px", flexShrink: 0,
                borderRadius: "20px", overflow: "hidden",
                border: "3px solid hsl(var(--card))",
                boxShadow: "0 0 0 1px hsl(var(--border)), 0 8px 24px hsl(0 0% 0% / 0.15)",
              }}>
                <img src={teacher.photoUrl} alt={teacher.fullName} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h1 style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.1,
                }}>
                  {teacher.fullName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" style={{ color: "hsl(var(--muted-foreground))" }} />
                    <span style={{ fontSize: "0.88rem", color: "hsl(var(--muted-foreground))" }}>{teacher.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: "hsl(var(--muted-foreground))" }} />
                    <span style={{ fontSize: "0.88rem", color: "hsl(var(--muted-foreground))" }}>{teacher.university}</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {teacher.coursesTaught.map((course, i) => (
                    <span key={i} className="app-chip" style={{ fontSize: "0.78rem", padding: "5px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <BookOpen className="h-3 w-3" />
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">

          {/* ===== REVIEWS COLUMN ===== */}
          <div className="lg:col-span-2 space-y-6 slide-up">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: "hsl(var(--foreground))" }}>
                Reviews
              </h2>
              <div className="flex items-center gap-2 flex-wrap">

                {/* Favorite */}
                <div className="relative group/fav">
                  <button
                    onClick={() => {
                      if (!user) { window.location.href = "/auth"; return; }
                      isFavorite ? removeFavorite.mutate(teacherId) : addFavorite.mutate(teacherId);
                    }}
                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "36px", height: "36px", borderRadius: "9999px",
                      border: isFavorite ? "1px solid hsl(0 70% 60% / 0.5)" : "1px solid hsl(var(--border))",
                      background: isFavorite ? "hsl(0 70% 60% / 0.1)" : "hsl(var(--card))",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    <Heart className="h-4 w-4" style={{ color: isFavorite ? "hsl(0 70% 55%)" : "hsl(var(--muted-foreground))" }} fill={isFavorite ? "hsl(0 70% 55%)" : "none"} />
                  </button>
                </div>

                {!!user && (user.role === "admin" || user.role === "moderator" || user.email === "2025100000379@seu.edu.bd") && (
                  <UploadPyqDialog teacherId={teacherId} open={pyqDialogOpen} onOpenChange={setPyqDialogOpen} />
                )}

                <ReviewForm
                  teacherId={teacherId}
                  teacherName={teacher.fullName}
                  coursesTaught={teacher.coursesTaught}
                  trigger={
                    <button
                      className="glow-on-hover"
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        fontSize: "0.82rem", fontWeight: 600,
                        padding: "8px 16px", borderRadius: "9999px",
                        border: "none",
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        cursor: "pointer",
                      }}
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      Write a Review
                    </button>
                  }
                />

                <span className="app-chip" style={{ fontSize: "0.8rem", padding: "7px 14px", fontWeight: 600 }}>
                  {teacher.reviewCount} Total
                </span>
              </div>
            </div>

            {/* Review list */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse" style={{ height: "150px", borderRadius: "var(--radius)", background: "hsl(var(--muted))" }} />
                ))}
              </div>
            ) : reviews?.length === 0 ? (
              <div className="text-center py-16 app-card" style={{ borderStyle: "dashed" }}>
                <p style={{ fontSize: "0.9rem", color: "hsl(var(--muted-foreground))" }}>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews?.map((review, index) => {
                  const isAdmin = user?.email === "2025100000379@seu.edu.bd";
                  const isOwner = user?.id === review.studentId;

                  return (
                    <div key={review.id} className="app-card slide-up" style={{ padding: "22px", animationDelay: `${index * 0.06}s` }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: "38px", height: "38px", borderRadius: "9999px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "hsl(var(--primary) / 0.1)",
                          }}>
                            <User className="h-4.5 w-4.5" style={{ color: "hsl(var(--primary))" }} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>
                              {isAdmin ? review.studentUsername : "Anonymous Student"}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "hsl(var(--muted-foreground))" }}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isOwner && (
                            <ReviewForm
                              teacherId={teacher.id}
                              teacherName={teacher.fullName}
                              coursesTaught={teacher.coursesTaught}
                              review={review}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" style={{ color: "hsl(var(--muted-foreground))" }} />
                                </Button>
                              }
                            />
                          )}
                          {(isOwner || isAdmin) && (
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => { if (confirm("Delete this review?")) deleteReviewMutation.mutate(review.id); }}
                            >
                              <Trash2 className="h-4 w-4" style={{ color: "hsl(var(--destructive))" }} />
                            </Button>
                          )}
                          {getPersonalityIcon(review.personality)}
                        </div>
                      </div>

                      {review.comment && (
                        <p style={{
                          fontSize: "0.92rem", color: "hsl(var(--foreground))", lineHeight: 1.7,
                          marginBottom: "18px", borderLeft: "3px solid hsl(var(--primary) / 0.4)", paddingLeft: "14px",
                        }}>
                          "{review.comment}"
                        </p>
                      )}

                      <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "14px" }}>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <Metric label="Course" value={review.courseTaken} />
                          <Metric label="Personality" value={review.personality} />
                          <Metric label="Best For" value={review.bestFor} />
                          <Metric label="Marking" value={review.markingStyle} />
                          <Metric label="Difficulty" value={review.questionDifficulty} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="space-y-5 slide-in-right stagger-2">
            <div className="app-card overflow-hidden">
              <PyqList teacherId={teacher.id} hideUpload={true} />
            </div>

            <div className="app-card" style={{ padding: "16px" }}>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>Pro Tip</span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                Always check the syllabus along with past year questions to ensure you're studying relevant topics.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.65rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em", marginBottom: "4px" }}>
        {label}
      </p>
      <p style={{ fontSize: "0.85rem", color: "hsl(var(--foreground))", fontWeight: 600 }}>
        {value}
      </p>
    </div>
  );
}

function getPersonalityIcon(type: string) {
  switch (type) {
    case "Friendly": return <Smile className="h-5 w-5" style={{ color: "hsl(140 65% 45%)" }} />;
    case "Strict":   return <Frown className="h-5 w-5" style={{ color: "hsl(0 70% 55%)" }} />;
    default:         return <Meh   className="h-5 w-5" style={{ color: "hsl(40 90% 50%)" }} />;
  }
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <div className="flex-1">
        <div style={{ borderBottom: "1px solid hsl(var(--border))", padding: "32px 0" }}>
          <div className="container mx-auto px-4 flex gap-6">
            <div style={{ width: "112px", height: "112px", borderRadius: "20px", background: "hsl(var(--muted))", animation: "pulse 2s infinite" }} />
            <div className="flex-1 space-y-3">
              <div style={{ height: "28px", width: "60%", background: "hsl(var(--muted))", animation: "pulse 2s infinite", borderRadius: "8px" }} />
              <div style={{ height: "18px", width: "40%", background: "hsl(var(--muted))", animation: "pulse 2s infinite", borderRadius: "8px" }} />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1,2].map(i => <div key={i} style={{ height: "160px", borderRadius: "var(--radius)", background: "hsl(var(--muted))", animation: "pulse 2s infinite" }} />)}
          </div>
          <div style={{ height: "200px", borderRadius: "var(--radius)", background: "hsl(var(--muted))", animation: "pulse 2s infinite" }} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
