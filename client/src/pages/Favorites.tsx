import { useFavorites } from "@/hooks/use-favorites";
import { useTeachers } from "@/hooks/use-teachers";
import { Navbar } from "@/components/Navbar";
import { TeacherCard } from "@/components/TeacherCard";
import { Footer } from "@/components/Footer";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { data: favorites, isLoading } = useFavorites();
  const { data: teachers } = useTeachers();

  const favoriteTeachers = teachers?.filter(t =>
    favorites?.some((f: any) => f.teacherId === t.id)
  ) ?? [];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">

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
          <div className="text-center py-20 app-card" style={{ borderStyle: "dashed" }}>
            <Heart className="h-10 w-10 mx-auto mb-4" style={{ color: "hsl(0 70% 70%)" }} />
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              marginBottom: "8px",
            }}>
              No favorites yet
            </p>
            <p style={{ fontSize: "0.82rem", color: "hsl(var(--muted-foreground))" }}>
              Click the ❤️ on any faculty profile to add them here
            </p>
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
