import { useState, useEffect } from "react";
import { useTeachers } from "@/hooks/use-teachers";
import { Navbar } from "@/components/Navbar";
import { TeacherCard } from "@/components/TeacherCard";
import { Footer } from "@/components/Footer";
import { Search, MessageSquare, FileText, Users } from "lucide-react";

// ── Hardcoded stats (update manually) ──
const STATS = {
  pyqUploaded: 117,
  usersJoined: 86,
};

const PAGE_SIZE = 6;
const INITIAL_SIZE = 12;

export default function Home() {
  const { data: teachers, isLoading, error } = useTeachers();
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SIZE);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const filteredTeachers = teachers
    ?.filter(t =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.university.toLowerCase().includes(search.toLowerCase()) ||
      t.coursesTaught.some(c => c.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b.reviewCount - a.reviewCount) ?? [];

  const visibleTeachers = filteredTeachers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTeachers.length;
  const totalReviews = teachers?.reduce((sum, t) => sum + t.reviewCount, 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar search={search} onSearch={(v) => { setSearch(v); setVisibleCount(INITIAL_SIZE); }} />

      <main className="flex-1 relative z-10">

        {/* ===== HERO BANNER ===== */}
        <div className="container mx-auto px-4 pt-10 pb-4" style={{ maxWidth: "1300px" }}>
          <div
            className="fade-in"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "24px",
              border: "1px solid hsl(var(--border))",
              background: "linear-gradient(150deg, hsl(235 45% 10%) 0%, hsl(250 40% 14%) 35%, hsl(265 45% 16%) 65%, hsl(280 40% 13%) 100%)",
              padding: "48px 40px",
            }}
          >
            {/* Grid lines */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(hsl(0 0% 100% / 0.12) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.12) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
            {/* Soft accent glow blobs */}
            <div style={{
              position: "absolute", top: "-80px", right: "-80px", width: "340px", height: "340px",
              borderRadius: "50%", background: "hsl(250 85% 65% / 0.3)", filter: "blur(80px)", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: "-110px", left: "5%", width: "300px", height: "300px",
              borderRadius: "50%", background: "hsl(285 80% 60% / 0.28)", filter: "blur(80px)", pointerEvents: "none",
            }} />

            <div className="relative" style={{ zIndex: 2, maxWidth: "640px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "9999px",
                marginBottom: "20px",
                background: "hsl(230 80% 65% / 0.15)",
                border: "1px solid hsl(230 80% 65% / 0.3)",
                color: "hsl(230 90% 75%)",
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.03em" }}>
                  SEU Rate My Faculty
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "white",
                marginBottom: "16px",
              }}>
                Access PYQ and Faculty Review<br />
                <span style={{
                  background: "linear-gradient(135deg, hsl(220 90% 70%), hsl(280 85% 72%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Anytime, Anywhere
                </span>
              </h1>

              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.05rem",
                color: "hsl(220 15% 75%)",
                lineHeight: 1.6,
                marginBottom: "32px",
              }}>
                Get detailed info about your next faculty's personality, marking style and exam difficulty.
              </p>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", maxWidth: "520px" }}>
                <StatPill icon={<MessageSquare className="h-4 w-4" />} value={totalReviews} label="Reviews" />
                <StatPill icon={<FileText className="h-4 w-4" />} value={STATS.pyqUploaded} label="PYQ Uploaded" />
                <StatPill icon={<Users className="h-4 w-4" />} value={STATS.usersJoined} label="Users Joined" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div className="container mx-auto px-4 pt-10 pb-2" style={{ maxWidth: "900px" }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search faculty name, department, or course title"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(INITIAL_SIZE); }}
              style={{
                width: "100%",
                paddingLeft: "44px",
                paddingRight: "16px",
                paddingTop: "14px",
                paddingBottom: "14px",
                fontSize: "0.92rem",
                borderRadius: "14px",
              }}
            />
          </div>
        </div>

        {/* ===== FACULTY GRID ===== */}
        <div className="container mx-auto px-4 py-8">

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <div key={i} className="aspect-[4/5] animate-pulse"
                  style={{ background: "hsl(var(--muted))", borderRadius: "var(--radius)" }} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "hsl(var(--destructive))" }}>
                Connection Failed
              </h2>
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "8px" }}>
                Unable to retrieve faculty data. Please retry later.
              </p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-20">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "hsl(var(--foreground))" }}>
                No results found
              </h2>
              <p style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginTop: "8px" }}>
                Try adjusting your search.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {visibleTeachers.map((teacher, i) => (
                  <div
                    key={teacher.id}
                    className={mounted ? "fade-in" : ""}
                    style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
                  >
                    <TeacherCard teacher={teacher} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      padding: "12px 28px",
                      borderRadius: "9999px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      cursor: "pointer",
                      transition: "border-color 0.2s ease, background 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary) / 0.5)";
                      (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary) / 0.06)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
                      (e.currentTarget as HTMLElement).style.background = "hsl(var(--card))";
                    }}
                  >
                    Show More ({filteredTeachers.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 16px",
      borderRadius: "14px",
      background: "hsl(0 0% 100% / 0.05)",
      border: "1px solid hsl(0 0% 100% / 0.1)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "32px", height: "32px", borderRadius: "10px",
        background: "hsl(230 80% 65% / 0.18)", color: "hsl(230 90% 75%)", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "white", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: "0.7rem", color: "hsl(220 15% 70%)", fontWeight: 500, marginTop: "2px" }}>
          {label}
        </div>
      </div>
    </div>
  );
}
