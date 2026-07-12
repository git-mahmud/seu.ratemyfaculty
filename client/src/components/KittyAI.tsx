import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "kitty";
  content: string;
}

export function KittyAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "kitty", content: "Hey! I'm Kitty \ud83d\udc31 your SEU Rate My Faculty assistant. Ask me about any faculty, their marking style, exam difficulty, or PYQs!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "kitty", content: data.reply || "Sorry, I couldn't understand that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "kitty", content: "Oops! Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Who is strict in CSE?",
    "Which faculty is best for beginners?",
    "How to find PYQs?",
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with Kitty AI"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 4px 20px hsl(var(--primary) / 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          animation: isOpen ? "none" : "kittyBounce 2s ease-in-out infinite",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 28px hsl(var(--primary) / 0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px hsl(var(--primary) / 0.4)";
        }}
        title="Need help? Ask Kitty! \ud83d\udc31"
      >
        {isOpen ? "\u2715" : "\ud83d\udc31"}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            height: "480px",
            maxHeight: "calc(100vh - 120px)",
            borderRadius: "16px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            boxShadow: "0 12px 40px hsl(0 0% 0% / 0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            animation: "kittySlideUp 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid hsl(var(--border))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.1rem" }}>{"\ud83d\udc31"}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>
                Kitty AI
              </span>
              <span style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "hsl(140 70% 45%)",
                display: "inline-block",
              }} />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "hsl(var(--muted-foreground))", fontSize: "1.1rem", padding: "4px",
              }}
            >
              {"\u2715"}
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--secondary))",
                  color: msg.role === "user"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--foreground))",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "hsl(var(--secondary))",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1.2s ease-in-out infinite 0s" }} />
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1.2s ease-in-out infinite 0.2s" }} />
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1.2s ease-in-out infinite 0.4s" }} />
                </div>
              </div>
            )}

            {/* Quick questions - show only when there's just the intro message */}
            {messages.length === 1 && !isLoading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.7rem",
                      padding: "6px 10px",
                      borderRadius: "9999px",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      background: "hsl(var(--primary) / 0.08)",
                      color: "hsl(var(--primary))",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "hsl(var(--primary) / 0.15)";
                      e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "hsl(var(--primary) / 0.08)";
                      e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.3)";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: "4px 14px",
            textAlign: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.58rem", color: "hsl(var(--muted-foreground) / 0.6)" }}>
              Kitty can make mistakes. Verify info.
            </span>
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 14px 14px",
            borderTop: "1px solid hsl(var(--border))",
            display: "flex",
            gap: "8px",
            flexShrink: 0,
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !isLoading) sendMessage(input); }}
              placeholder="Ask about a faculty..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--input))",
                color: "hsl(var(--foreground))",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: isLoading || !input.trim() ? "hsl(var(--muted))" : "hsl(var(--primary))",
                color: isLoading || !input.trim() ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 0.15s ease",
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes kittyBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes kittySlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kittyDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}
