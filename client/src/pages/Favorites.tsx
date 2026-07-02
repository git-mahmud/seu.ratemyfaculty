import { useFavorites } from "@/hooks/use-favorites";
import { useTeachers } from "@/hooks/use-teachers";
import { Navbar } from "@/components/Navbar";
import { TeacherCard } from "@/components/TeacherCard";
import { Footer } from "@/components/Footer";
import { Heart, Search } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function Favorites() {
  const { data: favorites, isLoading: favLoading } = useFavorites();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();

  const isLoading = favLoading || teachersLoading;

  useEffect(() => {
    document.title = "My Favorites — SEU Rate My Faculty";
  }, []);

  const favoriteTeachers = teachers?.filter(t =>
    favorites?.some((f: any) => f.teacherId === t.id)
  ) ?? [];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-5 w-5" style={{ color: "hsl(0 70% 60%)" }} fill="hsl(0 70% 60%)" />
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "hsl(var(--foreground))",
          }}>
            My Favorites
          </h1>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "hsl(var(--border))", marginBottom: "24px" }} />

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[4/5] animate-pulse"
                style={{ background: "hsl(var(--muted))", borderRadius: "var(--radius)" }} />
            ))}
          </div>
        ) : favoriteTeachers.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ minHeight: "400px" }}
          >
            <div
              className="app-card text-center px-8 py-14 sm:px-12 sm:py-16 w-full max-w-md fade-in"
              style={{ borderStyle: "dashed" }}
            >
              {/* Decorative illustration with glow + pulse */}
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  margin: "0 auto 28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.12))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "0 0 30px hsl(var(--primary) / 0.12), 0 0 60px hsl(var(--accent) / 0.06)",
                  animation: "emptyPulse 3s ease-in-out infinite",
                }}
              >
                <Heart
                  className="h-8 w-8"
                  style={{
                    color: "hsl(0 70% 65%)",
                    opacity: 0.85,
                    animation: "emptyIconFloat 3s ease-in-out infinite",
                  }}
                />
                {/* Decorative orbiting dots */}
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "4px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "hsl(var(--primary) / 0.5)",
                    animation: "emptyDot 2.5s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    left: "-2px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "hsl(var(--accent) / 0.5)",
                    animation: "emptyDot 2.5s ease-in-out infinite 0.8s",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "-4px",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "hsl(var(--primary) / 0.35)",
                    animation: "emptyDot 2.5s ease-in-out infinite 1.5s",
                  }}
                />
              </div>

              {/* Heading */}
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "hsl(var(--foreground))",
                marginBottom: "10px",
                letterSpacing: "-0.01em",
              }}>
                No favorites yet
              </p>

              {/* Description — reduced opacity for hierarchy */}
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.84rem",
                fontWeight: 400,
                color: "hsl(var(--foreground) / 0.55)",
                lineHeight: 1.6,
                marginBottom: "28px",
                maxWidth: "260px",
                marginLeft: "auto",
                marginRight: "auto",
              }}>
                Tap the <span style={{ color: "hsl(0 70% 60%)" }}>❤️</span> on any
                faculty profile to save them here for quick access.
              </p>

              {/* CTA Button — pill style matching project conventions */}
              <Link href="/">
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    padding: "12px 28px",
                    borderRadius: "9999px",
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                    boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px hsl(var(--primary) / 0.35)";
                    e.currentTarget.style.filter = "brightness(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px hsl(var(--primary) / 0.25)";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1)";
                  }}
                >
                  <Search className="h-4 w-4" />
                  Browse Faculty
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {favoriteTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </main>

