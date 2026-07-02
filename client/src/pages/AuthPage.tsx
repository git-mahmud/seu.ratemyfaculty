import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GraduationCap } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      setLocation(redirect);
    }
  }, [user]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Check for error in URL
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "hsl(var(--background))" }}>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center p-4" style={{ zIndex: 1, position: "relative" }}>
        <div className="scale-in" style={{
          position: "relative", width: "100%", maxWidth: "420px",
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "24px",
          boxShadow: "0 8px 40px hsl(var(--hero-text) / 0.1)",
          padding: "40px 32px",
          textAlign: "center",
        }}>

          {/* Icon */}
          <div className="glow-card" style={{
            width: "64px", height: "64px", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.3)",
            borderRadius: "16px",
          }}>
            <GraduationCap style={{ width: "30px", height: "30px", color: "hsl(var(--primary))" }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800,
            color: "hsl(var(--foreground))",
            marginBottom: "8px",
          }}>
            Rate My{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Faculty
            </span>
          </h1>

          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "hsl(var(--muted-foreground))", marginBottom: "32px" }}>
            Sign in with your SEU Google account
          </p>

          {/* Error message */}
          {error === "not_seu_email" && (
            <div style={{
              background: "hsl(var(--destructive) / 0.1)", border: "1px solid hsl(var(--destructive) / 0.3)",
              borderRadius: "12px",
              padding: "10px 16px", marginBottom: "20px",
              fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "hsl(var(--destructive))",
            }}>
              ⚠ Only @seu.edu.bd emails are allowed
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
              width: "100%", padding: "14px",
              background: "hsl(var(--secondary))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "14px",
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary) / 0.5)";
              (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary) / 0.06)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
              (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary))";
            }}
          >
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer note */}
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "hsl(var(--muted-foreground))", marginTop: "24px" }}>
            Only @seu.edu.bd emails are authorized
          </p>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </div>
    </div>
  );
}
