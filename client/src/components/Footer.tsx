import { useEffect, useRef, useState } from "react";
import { GraduationCap, Mail, ArrowUp, Facebook } from "lucide-react";
import { Link } from "wouter";

function AnimatedName({ text }: { text: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Magnetic wave animation on interval
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
        // Reset all letters
        letters.forEach((letter) => {
          letter.style.transform = "translateY(0) scale(1)";
          letter.style.opacity = "1";
        });
        startTime = null;
      }
    };

    // Run wave animation every 4 seconds
    const interval = setInterval(() => {
      startTime = null;
      frame = requestAnimationFrame(animate);
    }, 4000);

    // Initial animation after short delay
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
            transform: isHovered
              ? "translateY(-2px)"
              : "translateY(0)",
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
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div
          className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          {/* Left - Brand */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.15))",
                border: "1px solid hsl(var(--primary) / 0.2)",
              }}
            >
              <GraduationCap className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.2,
                }}
              >
                Rate My <span className="gradient-text">Faculty</span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  color: "hsl(var(--muted-foreground))",
                  marginTop: "1px",
                }}
              >
                Southeast University
              </div>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <span
                className="footer-link"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "hsl(var(--muted-foreground))",
                  transition: "color 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Home
              </span>
            </Link>
            <span style={{ color: "hsl(var(--border))", fontSize: "0.7rem" }}>•</span>
            <Link href="/auth">
              <span
                className="footer-link"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "hsl(var(--muted-foreground))",
                  transition: "color 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Sign In
              </span>
            </Link>
            <span style={{ color: "hsl(var(--border))", fontSize: "0.7rem" }}>•</span>
            <Link href="/favorites">
              <span
                className="footer-link"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "hsl(var(--muted-foreground))",
                  transition: "color 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Favorites
              </span>
            </Link>
          </div>

          {/* Right - Scroll to top */}
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

        {/* Divider */}
        <div style={{ height: "1px", background: "hsl(var(--border) / 0.6)" }} />

        {/* Bottom bar */}
        <div
          className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
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

          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61559153593868"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--secondary))",
                color: "hsl(var(--muted-foreground))",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                e.currentTarget.style.color = "hsl(var(--primary))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.color = "hsl(var(--muted-foreground))";
              }}
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a
              href="mailto:ratemyfaculty.seu@gmail.com"
              aria-label="Email"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--secondary))",
                color: "hsl(var(--muted-foreground))",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                e.currentTarget.style.color = "hsl(var(--primary))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.color = "hsl(var(--muted-foreground))";
              }}
            >
              <Mail className="h-3.5 w-3.5" />
            </a>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                color: "hsl(var(--muted-foreground) / 0.7)",
              }}
            >
              © {new Date().getFullYear()} Rate My Faculty
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
