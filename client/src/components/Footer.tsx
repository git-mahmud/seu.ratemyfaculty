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
      <div className="container mx-auto px-6 sm:px-10 lg:px-16">
        {/* ═══ Main 3-Column Grid ═══ */}
        <div
          className="py-12 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr] gap-12 sm:gap-10 lg:gap-16"
        >
          {/* Column 1 — Brand / About */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.15))",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  flexShrink: 0,
                }}
              >
                <GraduationCap className="h-[18px] w-[18px]" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
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
                    fontSize: "0.7rem",
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
                fontSize: "0.82rem",
                color: "hsl(var(--foreground) / 0.7)",
                lineHeight: 1.7,
                maxWidth: "300px",
              }}
            >
              An open platform for SEU students to share honest faculty reviews
              and access previous year questions — helping you make informed decisions.
            </p>
          </div>

          {/* Column 2 — Navigation & Resources */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10">
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "16px",
                }}
              >
                Navigate
              </h4>
              <nav aria-label="Footer navigation" className="flex flex-col gap-1">
                <Link href="/">
                  <span
                    className="footer-link"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "hsl(var(--foreground) / 0.7)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "6px 0",
                    }}
                  >
                    Home
                  </span>
                </Link>
                <Link href="/auth">
                  <span
                    className="footer-link"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "hsl(var(--foreground) / 0.7)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "6px 0",
                    }}
                  >
                    Sign In
                  </span>
                </Link>
                <Link href="/favorites">
                  <span
                    className="footer-link"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "hsl(var(--foreground) / 0.7)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "6px 0",
                    }}
                  >
                    Favorites
                  </span>
                </Link>
              </nav>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "16px",
                }}
              >
                Resources
              </h4>
              <div className="flex flex-col gap-1">
                <Link href="/about">
                  <span
                    className="footer-link"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "hsl(var(--foreground) / 0.7)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "6px 0",
                    }}
                  >
                    About
                  </span>
                </Link>
                <Link href="/privacy">
                  <span
                    className="footer-link"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "hsl(var(--foreground) / 0.7)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "6px 0",
                    }}
                  >
                    Privacy Policy
                  </span>
                </Link>
                <Link href="/terms">
                  <span
                    className="footer-link"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "hsl(var(--foreground) / 0.7)",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "6px 0",
                    }}
                  >
                    Terms of Service
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Column 3 — Social & Contact */}
          <div className="flex flex-col gap-5">
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Connect
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61559153593868"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground) / 0.7)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                  e.currentTarget.style.color = "hsl(var(--primary))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px hsl(var(--primary) / 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border))";
                  e.currentTarget.style.color = "hsl(var(--foreground) / 0.7)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Facebook className="h-[18px] w-[18px]" />
              </a>
              <a
                href="mailto:ratemyfaculty.seu@gmail.com"
                aria-label="Send us an email"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground) / 0.7)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                  e.currentTarget.style.color = "hsl(var(--primary))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px hsl(var(--primary) / 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "hsl(var(--border))";
                  e.currentTarget.style.color = "hsl(var(--foreground) / 0.7)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Mail className="h-[18px] w-[18px]" />
              </a>
            </div>
            <a
              href="mailto:ratemyfaculty.seu@gmail.com"
              className="footer-link"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "hsl(var(--foreground) / 0.6)",
                textDecoration: "none",
                transition: "color 0.2s ease",
                display: "inline-block",
                padding: "4px 0",
              }}
            >
              ratemyfaculty.seu@gmail.com
            </a>
          </div>
        </div>

        {/* ═══ Bottom Bar — Distinct visual break ═══ */}
        <div
          style={{
            borderTop: "1px solid hsl(var(--border) / 0.5)",
            background: "hsl(var(--background) / 0.4)",
            borderRadius: "12px 12px 0 0",
            margin: "0 -24px",
            padding: "0 24px",
          }}
        >
          <div
            className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Left — Credit */}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "hsl(var(--foreground) / 0.75)",
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
              <AnimatedName text="MAHMUD" />
            </span>

            {/* Right — Copyright + Scroll to top */}
            <div className="flex items-center gap-4">
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "hsl(var(--foreground) / 0.45)",
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
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground) / 0.6)",
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
                  e.currentTarget.style.color = "hsl(var(--foreground) / 0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
