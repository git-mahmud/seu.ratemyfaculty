import { useLeaderboard, type LeaderboardEntry } from "@/hooks/use-leaderboard";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Star, Medal, Crown, GraduationCap, Sparkles } from "lucide-react";

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

function useMyPoints() {
  return useQuery<{ points: number; reviewCount: number }>({
    queryKey: ["/api/leaderboard/me"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard/me");
      if (!res.ok) return { points: 0, reviewCount: 0 };
      return res.json();
    },
  });
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { user } = useAuth();
  const { data: myPoints } = useMyPoints();

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 slide-up">
          <div style={{
            width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%",
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2))",
            border: "1px solid hsl(var(--primary) / 0.3)",
          }}>
            <Trophy className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "hsl(var(--foreground))" }}>
              Top Contributors
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "2px" }}>
              Earn points by sharing reviews
            </p>
          </div>
        </div>

        {/* Your points card */}
        {user && myPoints && (
          <div className="slide-up stagger-1" style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)",
              }}>
                <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>
                  Your Points
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "hsl(var(--muted-foreground))" }}>
                  {myPoints.reviewCount} review{myPoints.reviewCount !== 1 ? "s" : ""} submitted
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: "hsl(var(--primary))" }}>
                {myPoints.points}
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", color: "hsl(var(--muted-foreground))", marginLeft: "4px" }}>PTS</span>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.58rem", fontWeight: 700, color: getTier(myPoints.points).color, letterSpacing: "0.06em" }}>
                {getTier(myPoints.points).label}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse" style={{ height: "100px", borderRadius: "var(--radius)", background: "hsl(var(--muted))" }} />
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-16 app-card" style={{ borderStyle: "dashed" }}>
            <Trophy className="h-10 w-10 mx-auto mb-4" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }} />
            <p style={{ fontSize: "0.9rem", color: "hsl(var(--muted-foreground))" }}>
              No contributions yet. Be the first to earn points!
            </p>
          </div>
        ) : (
          /* Main container */
          <div className="slide-up stagger-2" style={{
            borderRadius: "20px",
            border: "1px solid hsl(210 25% 20%)",
            background: "hsl(215 30% 11%)",
            overflow: "hidden",
          }}>
            {/* Top 3 Podium */}
            <div style={{ padding: "36px 20px 28px" }}>
              <div className="grid grid-cols-3 gap-3 sm:gap-5" style={{ alignItems: "end" }}>
                <div>{top3[1] && <PodiumCard entry={top3[1]} rank={2} />}</div>
                <div>{top3[0] && <PodiumCard entry={top3[0]} rank={1} />}</div>
                <div>{top3[2] && <PodiumCard entry={top3[2]} rank={3} />}</div>
              </div>
            </div>

            {/* Rows 4-10 */}
            {rest.length > 0 && (
              <div style={{ borderTop: "1px solid hsl(210 25% 18%)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {rest.map((entry, i) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3"
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid hsl(210 25% 16%)",
                        borderRight: i % 2 === 0 ? "1px solid hsl(210 25% 16%)" : "none",
                      }}
                    >
                      <span style={{
                        width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)",
                        fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700, color: "hsl(var(--primary))", flexShrink: 0,
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
        )}

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", textAlign: "center", marginTop: "16px" }}>
          Updated in real-time based on submitted reviews
        </p>
      </main>
      <Footer />
    </div>
  );
}

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const tier = getTier(entry.points);
  const isFirst = rank === 1;
  const ringColor = rank === 1 ? "hsl(40 80% 45%)" : rank === 2 ? "hsl(210 15% 50%)" : "hsl(30 70% 45%)";
  const badgeBg = rank === 1 ? "linear-gradient(135deg, hsl(15 90% 55%), hsl(40 90% 50%))" : rank === 2 ? "hsl(215 20% 40%)" : "hsl(25 70% 45%)";
  const avatarSize = isFirst ? "100px" : "80px";

  return (
    <div style={{
      borderRadius: "16px",
      border: "1px solid hsl(210 25% 22%)",
      background: "hsl(210 30% 14%)",
      padding: "32px 16px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
        display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 14px", borderRadius: "9999px",
        background: badgeBg, color: "white", fontSize: "0.72rem", fontWeight: 800,
      }}>
        {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : <Medal className="h-3.5 w-3.5" />}
        #{rank}
      </div>

      {entry.photoUrl ? (
        <img src={entry.photoUrl} alt="" style={{
          width: avatarSize, height: avatarSize, borderRadius: "50%", border: `4px solid ${ringColor}`,
          objectFit: "cover", marginTop: "12px", marginBottom: "12px",
        }} />
      ) : (
        <div style={{
          width: avatarSize, height: avatarSize, borderRadius: "50%", border: `4px solid ${ringColor}`,
          display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(210 25% 18%)",
          marginTop: "12px", marginBottom: "12px",
        }}>
          <GraduationCap style={{ width: isFirst ? "36px" : "28px", height: isFirst ? "36px" : "28px", color: "hsl(210 15% 55%)" }} />
        </div>
      )}

      <span style={{ fontSize: "1.2rem", marginBottom: "10px" }}>&#11088;</span>

      <p style={{ fontFamily: "var(--font-display)", fontSize: isFirst ? "0.9rem" : "0.78rem", fontWeight: 700, color: "hsl(0 0% 92%)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", padding: "0 4px" }}>
        {entry.displayName || getStudentId(entry.email)}
      </p>
      {entry.displayName && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(210 15% 55%)", marginBottom: "14px" }}>
          {getStudentId(entry.email)}
        </p>
      )}
      {!entry.displayName && <div style={{ marginBottom: "14px" }} />}

      <div style={{
        background: "linear-gradient(135deg, hsl(250 50% 35%), hsl(260 45% 45%))",
        border: "1px solid hsl(250 40% 50% / 0.4)",
        borderRadius: "20px", padding: "6px 18px", marginBottom: "6px",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: isFirst ? "1rem" : "0.85rem", fontWeight: 800, color: "hsl(45 90% 60%)" }}>
          {entry.points}
        </span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", color: "hsl(0 0% 80%)", marginLeft: "5px", fontWeight: 600 }}>PTS</span>
      </div>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6rem", fontWeight: 700, color: tier.color, letterSpacing: "0.06em" }}>{tier.label}</span>
    </div>
  );
}
