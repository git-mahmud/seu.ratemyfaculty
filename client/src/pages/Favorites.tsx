import { useFavorites } from "@/hooks/use-favorites";
import { useTeachers } from "@/hooks/use-teachers";
import { Navbar } from "@/components/Navbar";
import { TeacherCard } from "@/components/TeacherCard";
import { Footer } from "@/components/Footer";
import { Heart, Search } from "lucide-react";
import { Link } from "wouter";

export default function Favorites() {
  const { data: favorites, isLoading: favLoading } = useFavorites();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();

  const isLoading = favLoading || teachersLoading;

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
              {/* Decorative illustration */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 24px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Heart
                  className="h-8 w-8"
                  style={{ color: "hsl(0 70% 65%)", opacity: 0.8 }}
                />
                {/* Decorative floating dots */}
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "2px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "hsl(var(--primary) / 0.4)",
                    animation: "heartbeat 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "0px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "hsl(var(--accent) / 0.4)",
                    animation: "heartbeat 2s ease-in-out infinite 0.5s",
                  }}
                />
              </div>

              {/* Heading */}
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "hsl(var(--foreground))",
                marginBottom: "10px",
              }}>
                No favorites yet
              </p>

              {/* Description */}
              <p style={{
                fontSize: "0.84rem",
                color: "hsl(var(--muted-foreground))",
                lineHeight: 1.6,
                marginBottom: "24px",
                maxWidth: "280px",
                marginLeft: "auto",
                marginRight: "auto",
              }}>
                Click the <span style={{ color: "hsl(0 70% 60%)" }}>❤️</span> on any
                faculty profile to save them here for quick access.
              </p>

              {/* CTA Button */}
              <Link href="/">
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                    color: "white",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 4px 14px hsl(var(--primary) / 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px hsl(var(--primary) / 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px hsl(var(--primary) / 0.25)";
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

      <Footer />
    </div>
  );
}
