import { useEffect, useRef } from "react";
function GlitchText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
    let timeout: ReturnType<typeof setTimeout>;
    const glitch = () => {
      const el = ref.current;
      if (!el) return;
      let iterations = 0;
      const interval = setInterval(() => {
        el.innerText = text
          .split("")
          .map((char, i) => i < iterations ? char : chars[Math.floor(Math.random() * chars.length)])
          .join("");
        iterations += 0.5;
        if (iterations >= text.length) {
          el.innerText = text;
          clearInterval(interval);
        }
      }, 40);
      // Schedule next glitch
      timeout = setTimeout(glitch, 3000 + Math.random() * 2000);
    };
    timeout = setTimeout(glitch, 1500);
    return () => clearTimeout(timeout);
  }, [text]);
  return (
    <span
      ref={ref}
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </span>
  );
}
export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid hsl(var(--border))", marginTop: "auto" }}>
      <div className="container mx-auto px-4 py-6 text-center">
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          color: "hsl(var(--muted-foreground))",
        }}>
          Made with{" "}
          <span style={{ fontSize: "1rem" }}>❤️</span>
          {" "}by{" "}
          <GlitchText text="Mahmud" />
        </span>
      </div>
    </footer>
  );
}
