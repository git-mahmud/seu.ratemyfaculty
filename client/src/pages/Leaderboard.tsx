import { useLeaderboard, type LeaderboardEntry } from "@/hooks/use-leaderboard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, Star, Medal, Crown } from "lucide-react";

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

function getTier(points: number): { label: string; color: string } {
  if (points >= 500) return { label: "PLATINUM", color: "hsl(200 80% 70%)" };
  if (points >= 200) return { label: "GOLD", color: "hsl(45 90% 55%)" };
  if (points >= 100) return { label: "SILVER", color: "hsl(220 10% 75%)" };
  return { label: "BRONZE", color: "hsl(25 60% 60%)" };
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
            style={{
              width: "40px",
              height: "40px",
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
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "hsl(var(--foreground))",
            }}>
              Top Contributors
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
        <div className="mb-8 slide-up stagger-1" style={{ marginTop: "12px" }}>
          <span className="app-chip" style={{ fontSize: "0.7rem", padding: "5px 12px" }}>
            1 Review = 10 pts
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse" style={{ height: "80px", borderRadius: "var(--radius)", background: "hsl(var(--muted))" }} />
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
            {/* Top 3 Podium inside a gradient card */}
            <div
              className="slide-up stagger-2"
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "20px",
                border: "1px solid hsl(var(--border))",
                background: "linear-gradient(150deg, hsl(var(--hero-1)) 0%, hsl(var(--hero-2)) 35%, hsl(var(--hero-3)) 65%, hsl(var(--hero-4)) 100%)",
                padding: "32px 16px 24px",
                marginBottom: "24px",
              }}
            >
              {/* Ambient blobs */}
              <div style={{
                position: "absolute", top: "-60px", right: "-60px", width: "250px", height: "250px",
                borderRadius: "50%", background: "hsl(250 85% 65% / 0.12)", filter: "blur(70px)", pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: "-80px", left: "10%", width: "200px", height: "200px",
                borderRadius: "50%", background: "hsl(285 80% 60% / 0.1)", filter: "blur(70px)", pointerEvents: "none",
              }} />

              <div className="relative grid grid-cols-3 gap-3 sm:gap-5" style={{ zIndex: 1 }}>
                {/* 2nd place */}
                <div className="flex flex-col items-center pt-8">
                  {top3[1] && <PodiumCard entry={top3[1]} rank={2} />}
                </div>
                {/* 1st place */}
                <div className="flex flex-col items-center">
                  {top3[0] && <PodiumCard entry={top3[0]} rank={1} />}
                </div>
                {/* 3rd place */}
                <div className="flex flex-col items-center pt-10">
                  {top3[2] && <PodiumCard entry={top3[2]} rank={3} />}
                </div>
              </div>
            </div>

            {/* Rest of leaderboard */}
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
              fontSize: "0.72rem",
              color: "hsl(var(--muted-foreground))",
              marginTop: "24px",
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
      ? "hsl(220 10% 75%)"
      : "hsl(25 60% 60%)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Rank badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 9px",
          borderRadius: "9999px",
          background: ringColor,
          color: "hsl(0 0% 8%)",
          fontSize: "0.6rem",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        {rank === 1 ? <Crown className="h-3 w-3" /> : <Medal className="h-3 w-3" />}
        #{rank}
      </div>

      {/* Avatar */}
      {entry.photoUrl ? (
        <img
          src={entry.photoUrl}
          alt={getDisplayName(entry)}
          style={{
            width: isFirst ? "72px" : "56px",
            height: isFirst ? "72px" : "56px",
            borderRadius: "50%",
            border: `3px solid ${ringColor}`,
            objectFit: "cover",
            marginBottom: "8px",
            boxShadow: isFirst ? `0 0 20px ${ringColor}` : "none",
          }}
        />
      ) : (
        <div
          style={{
            width: isFirst ? "72px" : "56px",
            height: isFirst ? "72px" : "56px",
            borderRadius: "50%",
            border: `3px solid ${ringColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(var(--card))",
            marginBottom: "8px",
            fontSize: isFirst ? "1.4rem" : "1.1rem",
            fontWeight: 800,
            color: "hsl(var(--primary))",
            fontFamily: "var(--font-display)",
            boxShadow: isFirst ? `0 0 20px ${ringColor}` : "none",
          }}
        >
          {getInitial(entry)}
        </div>
      )}

      {/* Star */}
      <Star className="h-3.5 w-3.5" style={{ color: "hsl(45 90% 55%)", fill: "hsl(45 90% 55%)", marginBottom: "6px" }} />

      {/* Name */}
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: "hsl(var(--hero-text))",
        marginBottom: "2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>
        {getDisplayName(entry)}
      </p>

      {/* Email */}
      <p style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.58rem",
        color: "hsl(var(--hero-subtext))",
        marginBottom: "10px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>
        {maskEmail(entry.email)}
      </p>

      {/* Points pill */}
      <div style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "10px",
        padding: "5px 14px",
        marginBottom: "4px",
        boxShadow: "0 2px 8px hsl(0 0% 0% / 0.2)",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: isFirst ? "1rem" : "0.85rem",
          fontWeight: 800,
          color: "hsl(var(--primary))",
        }}>
          {entry.points}
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.55rem",
          color: "hsl(var(--muted-foreground))",
          marginLeft: "3px",
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
        letterSpacing: "0.06em",
      }}>
        {tier.label}
      </span>
    </div>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <div
      className="app-card flex items-center gap-3"
      style={{ padding: "14px 16px" }}
    >
      {/* Rank */}
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.78rem",
        fontWeight: 700,
        color: "hsl(var(--muted-foreground))",
        width: "22px",
        textAlign: "center",
        flexShrink: 0,
      }}>
        {rank}
      </span>

      {/* Avatar */}
      {entry.photoUrl ? (
        <img
          src={entry.photoUrl}
          alt={getDisplayName(entry)}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid hsl(var(--border))",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(var(--primary) / 0.1)",
            border: "2px solid hsl(var(--border))",
            fontSize: "0.85rem",
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
          fontSize: "0.82rem",
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
          fontSize: "0.95rem",
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
        }}>
          PTS
        </span>
      </div>
    </div>
  );
}
