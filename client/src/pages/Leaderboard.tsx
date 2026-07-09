import { useLeaderboard, type LeaderboardEntry } from "@/hooks/use-leaderboard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Star, Medal, Crown, Sparkles } from "lucide-react";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

function getDisplayName(entry: LeaderboardEntry): string {
  if (entry.displayName) return entry.displayName;
  return maskEmail(entry.email);
}

function getInitial(entry: LeaderboardEntry): string {
  if (entry.displayName) return entry.displayName.charAt(0).toUpperCase();
  return entry.email.charAt(0).toUpperCase();
}

function getTier(points: number): { label: string; color: string; glow: string } {
  if (points >= 500) return { label: "PLATINUM", color: "hsl(200 80% 70%)", glow: "hsl(200 80% 70% / 0.3)" };
  if (points >= 200) return { label: "GOLD", color: "hsl(45 90% 55%)", glow: "hsl(45 90% 55% / 0.25)" };
  if (points >= 100) return { label: "SILVER", color: "hsl(220 15% 75%)", glow: "hsl(220 15% 75% / 0.2)" };
  return { label: "BRONZE", color: "hsl(25 60% 60%)", glow: "hsl(25 60% 60% / 0.2)" };
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2 slide-up">
          <div
            className="glow-card"
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.15))",
              border: "1px solid hsl(var(--primary) / 0.25)",
            }}
          >
            <Trophy className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "hsl(var(--foreground))",
            }}>
              Top <span className="gradient-text">Contributors</span>
            </h1>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "hsl(var(--muted-foreground))",
              marginTop: "2px",
            }}>
              Earn points by sharing reviews
            </p>
          </div>
        </div>

        {/* Points chip */}
        <div className="flex items-center gap-3 mb-8 slide-up stagger-1" style={{ marginTop: "14px" }}>
          <span className="app-chip" style={{ fontSize: "0.7rem", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Sparkles className="h-3 w-3" />
            1 Review = 10 pts
          </span>
        </div>

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
          <>
            {/* ═══ Top 3 Podium ═══ */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 slide-up stagger-2">
              {/* 2nd place — Silver */}
              <div className="pt-6 sm:pt-8">
                {top3[1] && (
                  <div
                    className="h-full flex flex-col items-center text-center"
                    style={{
                      padding: "20px 10px 18px",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "var(--radius)",
                      border: "1px solid hsl(220 15% 65% / 0.35)",
                      background: "linear-gradient(160deg, hsl(220 15% 18% / 0.9) 0%, hsl(220 12% 14%) 50%, hsl(220 15% 10%) 100%)",
                      boxShadow: "0 4px 24px hsl(220 15% 65% / 0.1), inset 0 1px 0 hsl(220 15% 75% / 0.12)",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "-30px", left: "50%", transform: "translateX(-50%)",
                      width: "140px", height: "140px", borderRadius: "50%",
                      background: "hsl(220 15% 75% / 0.08)", filter: "blur(40px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <PodiumCard entry={top3[1]} rank={2} />
                    </div>
                  </div>
                )}
              </div>

              {/* 1st place — Gold */}
              <div>
                {top3[0] && (
                  <div
                    className="h-full flex flex-col items-center text-center"
                    style={{
                      padding: "24px 10px 20px",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "var(--radius)",
                      border: "1px solid hsl(45 90% 55% / 0.4)",
                      background: "linear-gradient(160deg, hsl(45 40% 16% / 0.9) 0%, hsl(40 30% 12%) 50%, hsl(35 25% 9%) 100%)",
                      boxShadow: "0 4px 30px hsl(45 90% 55% / 0.12), inset 0 1px 0 hsl(45 90% 55% / 0.15)",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)",
                      width: "180px", height: "180px", borderRadius: "50%",
                      background: "hsl(45 90% 55% / 0.08)", filter: "blur(50px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <PodiumCard entry={top3[0]} rank={1} />
                    </div>
                  </div>
                )}
              </div>

              {/* 3rd place — Bronze */}
              <div className="pt-10 sm:pt-12">
                {top3[2] && (
                  <div
                    className="h-full flex flex-col items-center text-center"
                    style={{
                      padding: "20px 10px 18px",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "var(--radius)",
                      border: "1px solid hsl(25 60% 50% / 0.3)",
                      background: "linear-gradient(160deg, hsl(25 30% 15% / 0.9) 0%, hsl(20 25% 11%) 50%, hsl(20 20% 8%) 100%)",
                      boxShadow: "0 4px 24px hsl(25 60% 50% / 0.1), inset 0 1px 0 hsl(25 60% 60% / 0.1)",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "-30px", left: "50%", transform: "translateX(-50%)",
                      width: "140px", height: "140px", borderRadius: "50%",
                      background: "hsl(25 60% 55% / 0.07)", filter: "blur(40px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <PodiumCard entry={top3[2]} rank={3} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Rest of leaderboard ═══ */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 slide-up stagger-3">
                {rest.map((entry, i) => (
                  <LeaderboardRow key={entry.userId} entry={entry} rank={i + 4} />
                ))}
              </div>
            )}

            {/* Footer note */}
            <p className="text-center slide-up stagger-4" style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              color: "hsl(var(--muted-foreground) / 0.7)",
              marginTop: "28px",
            }}>
              Updated in real-time based on submitted reviews
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const tier = getTier(entry.points);
  const isFirst = rank === 1;
  const ringColor = rank === 1
    ? "hsl(45 90% 55%)"
    : rank === 2
      ? "hsl(220 15% 75%)"
      : "hsl(25 60% 60%)";
  const avatarSize = isFirst ? "76px" : rank === 2 ? "60px" : "52px";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      {/* Rank badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "4px 10px",
          borderRadius: "9999px",
          background: ringColor,
          color: "hsl(0 0% 8%)",
          fontSize: "0.62rem",
          fontWeight: 800,
          marginBottom: "12px",
          boxShadow: `0 2px 10px ${tier.glow}`,
        }}
      >
        {rank === 1 ? <Crown className="h-3 w-3" /> : <Medal className="h-3 w-3" />}
        #{rank}
      </div>

      {/* Avatar with glow */}
      <div style={{ position: "relative", marginBottom: "10px" }}>
        {isFirst && (
          <div style={{
            position: "absolute", inset: "-6px", borderRadius: "50%",
            background: `conic-gradient(from 0deg, hsl(45 90% 55% / 0.4), hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), hsl(45 90% 55% / 0.4))`,
            filter: "blur(8px)", zIndex: 0,
          }} />
        )}
        {entry.photoUrl ? (
          <img
            src={entry.photoUrl}
            alt={getDisplayName(entry)}
            style={{
              position: "relative", zIndex: 1,
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              border: `3px solid ${ringColor}`,
              objectFit: "cover",
              boxShadow: `0 4px 20px ${tier.glow}`,
            }}
          />
        ) : (
          <div
            style={{
              position: "relative", zIndex: 1,
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              border: `3px solid ${ringColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "hsl(var(--card))",
              fontSize: isFirst ? "1.5rem" : "1.1rem",
              fontWeight: 800,
              color: "hsl(var(--primary))",
              fontFamily: "var(--font-display)",
              boxShadow: `0 4px 20px ${tier.glow}`,
            }}
          >
            {getInitial(entry)}
          </div>
        )}
      </div>

      {/* Star */}
      <Star className="h-3.5 w-3.5" style={{ color: "hsl(45 90% 55%)", fill: "hsl(45 90% 55%)", marginBottom: "8px" }} />

      {/* Name */}
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: isFirst ? "0.78rem" : "0.7rem",
        fontWeight: 700,
        color: "hsl(var(--hero-text))",
        marginBottom: "2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        padding: "0 4px",
      }}>
        {getDisplayName(entry)}
      </p>

      {/* Email */}
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.56rem",
        color: "hsl(var(--hero-subtext) / 0.8)",
        marginBottom: "12px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        padding: "0 4px",
      }}>
        {maskEmail(entry.email)}
      </p>

      {/* Points pill */}
      <div style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "12px",
        padding: "6px 16px",
        marginBottom: "5px",
        boxShadow: "0 4px 12px hsl(0 0% 0% / 0.3)",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: isFirst ? "1.1rem" : "0.9rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {entry.points}
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.55rem",
          color: "hsl(var(--muted-foreground))",
          marginLeft: "4px",
          fontWeight: 600,
        }}>
          PTS
        </span>
      </div>

      {/* Tier */}
      <span style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.55rem",
        fontWeight: 700,
        color: tier.color,
        letterSpacing: "0.08em",
      }}>
        {tier.label}
      </span>
    </div>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const tier = getTier(entry.points);

  return (
    <div
      className="app-card flex items-center gap-3"
      style={{
        padding: "16px 18px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.3)";
        e.currentTarget.style.boxShadow = "0 4px 20px hsl(var(--primary) / 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--border))";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Rank circle */}
      <div style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(var(--secondary))",
        border: "1px solid hsl(var(--border))",
        fontFamily: "var(--font-display)",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "hsl(var(--muted-foreground))",
        flexShrink: 0,
      }}>
        {rank}
      </div>

      {/* Avatar */}
      {entry.photoUrl ? (
        <img
          src={entry.photoUrl}
          alt={getDisplayName(entry)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid hsl(var(--border))",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(var(--primary) / 0.08)",
            border: "2px solid hsl(var(--border))",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "hsl(var(--primary))",
            fontFamily: "var(--font-display)",
            flexShrink: 0,
          }}
        >
          {getInitial(entry)}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.84rem",
          fontWeight: 600,
          color: "hsl(var(--foreground))",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {getDisplayName(entry)}
        </p>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.68rem",
          color: "hsl(var(--muted-foreground))",
        }}>
          {maskEmail(entry.email)}
        </p>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 800,
          color: "hsl(var(--foreground))",
        }}>
          {entry.points}
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.58rem",
          color: "hsl(var(--muted-foreground))",
          marginLeft: "3px",
          fontWeight: 600,
          display: "block",
          textAlign: "right",
        }}>
          PTS
        </span>
      </div>
    </div>
  );
}
