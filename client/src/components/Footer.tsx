import { useEffect, useRef, useState } from "react";
import { GraduationCap, Mail, ArrowUp, Facebook } from "lucide-react";
import { Link } from "wouter";

function AnimatedName({ text }: { text: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frame: number;
    let startTime: number | null = null;
    const duration = 1200;

    const animate = () => {
      if (!startTime) startTime = performance.now();
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const letters = el.querySelectorAll<HTMLSpanElement>(".letter");
      letters.forEach((letter, i) => {
        const delay = i * 0.08;
        const localProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay * 0.5)));
        const wave = Math.sin(localProgress * Math.PI) * -4;
        const scale = 1 + Math.sin(localProgress * Math.PI) * 0.1;
        letter.style.transform = `translateY(${wave}px) scale(${scale})`;
        letter.style.opacity = `${0.7 + Math.sin(localProgress * Math.PI) * 0.3}`;
      });

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        letters.forEach((letter) => {
          letter.style.transform = "translateY(0) scale(1)";
          letter.style.opacity = "1";
        });
        startTime = null;
      }
    };

    const interval = setInterval(() => {
      startTime = null;
      frame = requestAnimationFrame(animate);
    }, 4000);

    const initialTimeout = setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <span
      ref={containerRef}
      className="animated-name"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        cursor: "default",
        position: "relative",
      }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="letter"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            letterSpacing: "0.02em",
            transition: `transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.03}s`,
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/* ─── Reusable link style ─── */
const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.8rem",
  color: "hsl(var(--muted-foreground))",
  textDecoration: "none",
  transition: "color 0.2s ease",
  cursor: "pointer",
  lineHeight: 1.8,
};

const columnHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "hsl(var(--foreground))",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "12px",
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      style={{
        borderTop: "1px solid hsl(var(--border))",
        marginTop: "auto",
        background: "hsl(var(--card) / 0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="container mx-auto px-6 sm:px-8">
        {/* ═══ Main 3-Column Grid ═══ */}
        <div
          className="py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-8"
        >
          {/* Column 1 — Brand / About */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.15))",
                  border: "1px solid hsl(var(--primary) / 0.2)",
                  flexShrink: 0,
                }}
              >
                <GraduationCap className="h-4.5 w-4.5" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: "hsl(var(--foreground))",
                    lineHeight: 1.2,
                  }}
                >
                  Rate My <span className="gradient-text">Faculty</span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    color: "hsl(var(--muted-foreground))",
                    marginTop: "2px",
                  }}
                >
                  Southeast University
                </div>
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "hsl(var(--muted-foreground))",
                lineHeight: 1.6,
                maxWidth: "280px",
              }}
            >
              An open platform for SEU students to share honest faculty reviews
              and access previous year questions — helping you make informed decisions.
            </p>
          </div>

          {/* Column 2 — Navigation & Resources */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 style={columnHeadingStyle}>Navigate</h4>
              <div className="flex flex-col">
                <Link href="/">
                  <span className="footer-link" style={linkStyle}>Home</span>
                </Link>
                <Link href="/auth">
                  <span className="footer-link" style={linkStyle}>Sign In</span>
                </Link>
                <Link href="/favorites">
                  <span className="footer-link" style={linkStyle}>Favorites</span>
                </Link>
              </div>
            </div>
            <div>
              <h4 style={columnHeadingStyle}>Resources</h4>
              <div className="flex flex-col">
                <span className="footer-link" style={{ ...linkStyle, opacity: 0.6, cursor: "default" }}>
                  About
                </span>
                <span className="footer-link" style={{ ...linkStyle, opacity: 0.6, cursor: "default" }}>
                  Privacy Policy
                </span>
                <span className="footer-link" style={{ ...linkStyle, opacity: 0.6, cursor: "default" }}>
                  Terms of Service
                </span>
              </div>
            </div>
          </div>

          {/* Column 3 — Social & Contact */}
          <div className="flex flex-col gap-4">
            <h4 style={columnHeadingStyle}>Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61559153593868"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="footer-social-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--muted-foreground))",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                  e.currentTarget.style.color = "hsl(var(--primary))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border))";
                  e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="mailto:ratemyfaculty.seu@gmail.com"
                aria-label="Email"
                className="footer-social-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--muted-foreground))",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                  e.currentTarget.style.color = "hsl(var(--primary))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border))";
                  e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <a
              href="mailto:ratemyfaculty.seu@gmail.com"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              className="footer-link"
            >
              ratemyfaculty.seu@gmail.com
            </a>
          </div>
        </div>

        {/* ═══ Divider ═══ */}
        <div style={{ height: "1px", background: "hsl(var(--border) / 0.5)" }} />

        {/* ═══ Bottom Bar ═══ */}
        <div
          className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Left — Credit */}
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Built with{" "}
            <span
              style={{
                display: "inline-block",
                animation: "heartbeat 1.5s ease-in-out infinite",
              }}
            >
              ❤️
            </span>
            {" "}by{" "}
            <AnimatedName text="Mahmud" />
          </span>

          {/* Right — Copyright + Scroll to top */}
          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                color: "hsl(var(--muted-foreground) / 0.6)",
              }}
            >
              © {new Date().getFullYear()} Rate My Faculty. All rights reserved.
            </span>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--secondary))",
                color: "hsl(var(--muted-foreground))",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                e.currentTarget.style.color = "hsl(var(--primary))";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
