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
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(220,30%,4%)" }}>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-6 w-6" style={{ color:"rgba(255,80,120,0.9)" }} />
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"1.6rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(200,230,255,0.95)" }}>
            My Favorites
          </h1>
        </div>

        {/* Divider */}
        <div style={{ height:"1px",background:"linear-gradient(90deg,rgba(0,200,255,0.3),transparent)",marginBottom:"24px" }} />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-sm"
                style={{ background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.1)" }} />
            ))}
          </div>
        ) : favoriteTeachers.length === 0 ? (
          <div className="text-center py-20" style={{
            border:"1px dashed rgba(0,200,255,0.35)",
            background:"rgba(0,200,255,0.02)",
          }}>
            <Heart className="h-12 w-12 mx-auto mb-4" style={{ color:"rgba(255,80,120,0.8)" }} />
            <p style={{ fontFamily:"var(--font-display)",fontSize:"1rem",color:"rgba(0,200,255,0.85)",letterSpacing:"0.1em",textTransform:"uppercase" }}>
              No favorites yet
            </p>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:"0.75rem",color:"rgba(0,200,255,0.6)",marginTop:"8px" }}>
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
