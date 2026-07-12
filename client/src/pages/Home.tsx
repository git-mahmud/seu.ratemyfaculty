import { useState, useEffect } from "react";
import { useTeachers } from "@/hooks/use-teachers";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/use-leaderboard";
import { Navbar } from "@/components/Navbar";
import { TeacherCard } from "@/components/TeacherCard";
import { Footer } from "@/components/Footer";
import { Search, MessageSquare, FileText, Users, Trophy, Star, Medal, Crown, GraduationCap } from "lucide-react";

// ── Hardcoded stats (update manually) ──
const STATS = {
  pyqUploaded: 117,
  usersJoined: 167,
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
    <div className="flex flex-col min-h-screen">
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
              background: "linear-gradient(150deg, hsl(var(--hero-1)) 0%, hsl(var(--hero-2)) 35%, hsl(var(--hero-3)) 65%, hsl(var(--hero-4)) 100%)",
              padding: "48px 40px",
            }}
          >
            {/* Grid lines */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(hsl(0 0% 100% / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.04) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
            {/* Soft accent glow blobs */}
            <div style={{
              position: "absolute", top: "-80px", right: "-80px", width: "340px", height: "340px",
              borderRadius: "50%", background: "hsl(250 85% 65% / 0.14)", filter: "blur(90px)", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: "-110px", left: "5%", width: "300px", height: "300px",
              borderRadius: "50%", background: "hsl(285 80% 60% / 0.12)", filter: "blur(90px)", pointerEvents: "none",
            }} />

            <div className="relative" style={{ zIndex: 2, maxWidth: "640px" }}>
              <div className="blur-in glow-border" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "9999px",
                marginBottom: "20px",
                background: "hsl(230 80% 60% / 0.15)",
                border: "1px solid hsl(230 80% 60% / 0.3)",
                color: "hsl(var(--primary))",
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.03em" }}>
                  SEU Rate My Faculty
                </span>
              </div>

              <h1 className="slide-up stagger-1" style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "hsl(var(--hero-text))",
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

              <p className="slide-up stagger-2" style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.05rem",
                color: "hsl(var(--hero-subtext))",
                lineHeight: 1.6,
                marginBottom: "32px",
              }}>
                Get detailed info about your next faculty's personality, marking style and exam difficulty.
              </p>

              {/* Stats row */}
              <div className="slide-up stagger-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", maxWidth: "520px" }}>
                <StatPill icon={<MessageSquare className="h-4 w-4" />} value={totalReviews} label="Reviews" delay={0} />
                <StatPill icon={<FileText className="h-4 w-4" />} value={STATS.pyqUploaded} label="PYQ Uploaded" delay={1} />
                <StatPill icon={<Users className="h-4 w-4" />} value={STATS.usersJoined} label="Users Joined" delay={2} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div className="container mx-auto px-4 pt-10 pb-2 slide-up stagger-4" style={{ maxWidth: "900px" }}>
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

      {/* ===== TOP CONTRIBUTORS ===== */}
      <LeaderboardSection />

      <Footer />
    </div>
  );
}

function StatPill({ icon, value, label, delay = 0 }: { icon: React.ReactNode; value: number; label: string; delay?: number }) {
  return (
    <div className="scale-in" style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 16px",
      borderRadius: "14px",
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      boxShadow: "0 4px 14px hsl(var(--hero-text) / 0.08)",
      animationDelay: `${0.25 + delay * 0.08}s`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "32px", height: "32px", borderRadius: "10px",
        background: "hsl(230 80% 60% / 0.18)", color: "hsl(var(--primary))", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "hsl(var(--hero-text))", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: "0.7rem", color: "hsl(var(--hero-subtext))", fontWeight: 500, marginTop: "2px" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function getStudentId(email: string): string {
  return email.replace("@seu.edu.bd", "");
}

function getInitial(entry: LeaderboardEntry): string {
  if (entry.displayName) return entry.displayName.charAt(0).toUpperCase();
  return entry.email.charAt(0).toUpperCase();
}

function getTier(points: number): { label: string; color: string } {
  if (points >= 500) return { label: "PLATINUM", color: "hsl(200 80% 70%)" };
  if (points >= 200) return { label: "GOLD", color: "hsl(45 90% 55%)" };
  if (points >= 100) return { label: "SILVER", color: "hsl(220 15% 75%)" };
  return { label: "BRONZE", color: "hsl(25 60% 60%)" };
}

function LeaderboardSection() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  if (isLoading || !leaderboard || leaderboard.length === 0) return null;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{
          width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))",
          border: "1px solid hsl(var(--primary) / 0.3)",
        }}>
          <Trophy className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: "hsl(var(--foreground))" }}>
            Top Contributors
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>
            Earn points by sharing reviews
          </p>
        </div>
      </div>

      {/* Main container card */}
      <div style={{
        borderRadius: "20px",
        border: "1px solid hsl(var(--border) / 0.6)",
        background: "hsl(var(--background))",
        overflow: "hidden",
        boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)",
      }}>
        {/* Top 3 Podium */}
        <div style={{ padding: "36px 20px 28px" }}>
          <div className="grid grid-cols-3 gap-3 sm:gap-5" style={{ alignItems: "end" }}>
            {/* 2nd */}
            <div>
              {top3[1] && <PodiumCardLB entry={top3[1]} rank={2} />}
            </div>
            {/* 1st */}
            <div>
              {top3[0] && <PodiumCardLB entry={top3[0]} rank={1} />}
            </div>
            {/* 3rd */}
            <div>
              {top3[2] && <PodiumCardLB entry={top3[2]} rank={3} />}
            </div>
          </div>
        </div>

        {/* Rows 4-10 */}
        {rest.length > 0 && (
          <div style={{ borderTop: "1px solid hsl(var(--border))" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {rest.map((entry, i) => (
                <div
                  key={entry.userId}
                  className="flex items-center gap-3"
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid hsl(var(--border) / 0.5)",
                    borderRight: i % 2 === 0 ? "1px solid hsl(var(--border) / 0.5)" : "none",
                  }}
                >
                  <span style={{
                    width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "1px solid hsl(var(--border))",
                    fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700, color: "hsl(var(--muted-foreground))", flexShrink: 0,
                  }}>{i + 4}</span>
                  {entry.photoUrl ? (
                    <img src={entry.photoUrl} alt="" style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "2px solid hsl(var(--border))", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--primary) / 0.1)", border: "2px solid hsl(var(--border))", flexShrink: 0 }}>
                      <GraduationCap style={{ width: "16px", height: "16px", color: "hsl(var(--primary))" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "hsl(var(--foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.displayName || getStudentId(entry.email)}
                    </p>
                    {entry.displayName && (
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(var(--muted-foreground))" }}>
                        {getStudentId(entry.email)}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 800, color: "hsl(var(--foreground))" }}>{entry.points}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.5rem", color: "hsl(var(--muted-foreground))", display: "block", textAlign: "right" }}>PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer text */}
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", textAlign: "center", marginTop: "16px" }}>
        Updated in real-time based on submitted reviews
      </p>
    </section>
  );
}

function PodiumCardLB({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const tier = getTier(entry.points);
  const isFirst = rank === 1;
  const ringColor = rank === 1 ? "hsl(40 80% 45%)" : rank === 2 ? "hsl(210 15% 50%)" : "hsl(30 70% 45%)";
  const badgeBg = rank === 1 ? "linear-gradient(135deg, hsl(15 90% 55%), hsl(40 90% 50%))" : rank === 2 ? "hsl(215 20% 40%)" : "hsl(25 70% 45%)";
  const avatarSize = isFirst ? "100px" : "80px";

  return (
    <div style={{
      borderRadius: "16px",
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--card))",
      padding: "32px 16px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      position: "relative",
      boxShadow: "0 2px 8px hsl(var(--foreground) / 0.03)",
    }}>
      {/* Badge */}
      <div style={{
        position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
        display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 14px", borderRadius: "9999px",
        background: badgeBg, color: "white", fontSize: "0.72rem", fontWeight: 800,
      }}>
        {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : <Medal className="h-3.5 w-3.5" />}
        #{rank}
      </div>

      {/* Avatar */}
      {entry.photoUrl ? (
        <img src={entry.photoUrl} alt="" style={{
          width: avatarSize, height: avatarSize, borderRadius: "50%", border: `4px solid ${ringColor}`,
          objectFit: "cover", marginTop: "12px", marginBottom: "12px",
        }} />
      ) : (
        <div style={{
          width: avatarSize, height: avatarSize, borderRadius: "50%", border: `4px solid ${ringColor}`,
          display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--card))",
          marginTop: "12px", marginBottom: "12px",
        }}>
          <GraduationCap style={{ width: isFirst ? "36px" : "28px", height: isFirst ? "36px" : "28px", color: "hsl(var(--muted-foreground))" }} />
        </div>
      )}

      {/* Star */}
      <span style={{ fontSize: "1.2rem", marginBottom: "10px" }}>&#11088;</span>

      {/* Name */}
      <p style={{ fontFamily: "var(--font-display)", fontSize: isFirst ? "0.9rem" : "0.78rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", padding: "0 4px" }}>
        {entry.displayName || getStudentId(entry.email)}
      </p>
      {entry.displayName && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(var(--muted-foreground))", marginBottom: "14px" }}>
          {getStudentId(entry.email)}
        </p>
      )}
      {!entry.displayName && <div style={{ marginBottom: "14px" }} />}

      {/* Points pill */}
      <div style={{
        background: "hsl(var(--primary) / 0.1)",
        border: "1px solid hsl(var(--primary) / 0.3)",
        borderRadius: "20px", padding: "6px 18px",
        marginBottom: "6px",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: isFirst ? "1rem" : "0.85rem", fontWeight: 800, color: "hsl(var(--primary))" }}>
          {entry.points}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", color: "hsl(var(--muted-foreground))", marginLeft: "5px", fontWeight: 600 }}>PTS</span>
      </div>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", fontWeight: 700, color: tier.color, letterSpacing: "0.06em" }}>{tier.label}</span>
    </div>
  );
}
