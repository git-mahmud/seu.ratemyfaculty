import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "kitty";
  content: string;
}

function renderMessageText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const driveRegex = /(https:\/\/drive\.google\.com\/[^\s]+)/g;
    const parts = line.split(driveRegex);

    if (parts.length === 1) {
      return <span key={lineIndex}>{line}<br/></span>;
    }

    return (
      <span key={lineIndex}>
        {parts.map((part, i) => {
          if (part.startsWith("https://drive.google.com/")) {
            const labelMatch = line.match(/([A-Z]{2,}[\w\d_\s]*(?:Mid|Final|Quiz)[\w\s\d]*?):/i);
            const label = labelMatch ? labelMatch[1].trim() : "View PYQ";
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "hsl(var(--primary) / 0.15)",
                  border: "1px solid hsl(var(--primary) / 0.3)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  color: "hsl(var(--primary))",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  margin: "2px 0",
                }}
              >
                {"\ud83d\udcc4"} {label}
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
        <br/>
      </span>
    );
  });
}

export function KittyAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customKey, setCustomKey] = useState(() => {
    try { return localStorage.getItem("kitty_custom_api_key") || ""; } catch { return ""; }
  });
  const [useCustomKey, setUseCustomKey] = useState(() => !!customKey);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const saveKey = (key: string) => {
    setCustomKey(key);
    try { localStorage.setItem("kitty_custom_api_key", key); } catch {}
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg = text.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const body: any = { message: userMsg };
      const storedKey = localStorage.getItem("kitty_custom_api_key");
      if (storedKey) body.customApiKey = storedKey;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const rawReply = data.reply || "Hmm, I got nothing. Try again?";
      const cleanReply = rawReply
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6} /g, "")
        .replace(/\* /g, "\u2022 ")
        .trim();
      setMessages(prev => [...prev, { role: "kitty", content: cleanReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "kitty", content: "Oops! I'm having a moment. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Help me find a faculty \ud83c\udf93",
    "Help me find a PYQ \ud83d\udcc4",
  ];

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Tooltip */}
      {!isOpen && (
        <div style={{
          position: "fixed", bottom: "88px", right: "24px", zIndex: 9998,
          background: "white", color: "#333", fontFamily: "var(--font-sans)",
          fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px",
          borderRadius: "8px", boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          whiteSpace: "nowrap",
        }}>
          Need help? Ask Kitty! {"\ud83d\udc31"}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowSettings(false); }}
        aria-label="Chat with Kitty AI"
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          zIndex: 9999, animation: isOpen ? "none" : "kittyBounce 2s ease-in-out infinite",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>{isOpen ? "\u2715" : "\ud83d\udc31"}</span>
        {!isOpen && (
          <span style={{
            position: "absolute", top: "0", right: "0",
            width: "10px", height: "10px", borderRadius: "50%",
            background: "#ef4444", border: "2px solid hsl(var(--background))",
          }} />
        )}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px",
          width: "380px", maxWidth: "calc(100vw - 32px)",
          borderRadius: "20px", border: "none",
          background: "hsl(var(--card))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          zIndex: 9998, animation: "kittySlideUp 0.25s ease-out",
        }}>
          {/* Header */}
          <div style={{
            height: "64px", padding: "0 16px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "20px 20px 0 0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", flexShrink: 0,
              }}>
                {"\ud83d\udc31"}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "white", lineHeight: 1.2 }}>
                  Kitty AI
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.8)" }}>Online</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button onClick={() => setShowSettings(!showSettings)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "1.1rem", padding: "0" }}>{"\u2699"}</button>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "1.2rem", padding: "0" }}>{"\u2715"}</button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings ? (
            <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto", background: "hsl(var(--card))" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "4px" }}>
                Kitty Brain Settings
              </h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
                Choose which brain Kitty should use
              </p>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", borderRadius: "10px", border: `1px solid ${!useCustomKey ? "#6366f1" : "hsl(var(--border))"}`, background: !useCustomKey ? "rgba(99,102,241,0.05)" : "transparent", cursor: "pointer", marginBottom: "10px" }}>
                <input type="radio" checked={!useCustomKey} onChange={() => { setUseCustomKey(false); saveKey(""); }} style={{ marginTop: "3px" }} />
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>Default Brain (System)</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(var(--muted-foreground))" }}>Shared quota, might be slow</p>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", borderRadius: "10px", border: `1px solid ${useCustomKey ? "#6366f1" : "hsl(var(--border))"}`, background: useCustomKey ? "rgba(99,102,241,0.05)" : "transparent", cursor: "pointer", marginBottom: "10px" }}>
                <input type="radio" checked={useCustomKey} onChange={() => setUseCustomKey(true)} style={{ marginTop: "3px" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>My Custom API Key</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(var(--muted-foreground))", marginBottom: "8px" }}>Faster, your own Groq key</p>
                  {useCustomKey && (
                    <input type="password" value={customKey} onChange={e => saveKey(e.target.value)} placeholder="Enter your Groq API key"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", fontFamily: "var(--font-sans)", fontSize: "0.72rem" }} />
                  )}
                </div>
              </label>
              <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", marginTop: "12px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                Back to Chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages area */}
              <div ref={scrollRef} style={{ height: "360px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "hsl(var(--card))" }}>

                {/* Empty state */}
                {!hasMessages && !isLoading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "10px", paddingTop: "40px" }}>
                    <span style={{ fontSize: "3rem" }}>{"\ud83d\udc31"}</span>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "hsl(var(--muted-foreground))", textAlign: "center", maxWidth: "260px", lineHeight: 1.5 }}>
                      Ask about faculties, their marking style, exam difficulty, or PYQs!
                    </p>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                    {msg.role === "kitty" && (
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>
                        {"\ud83d\udc31"}
                      </div>
                    )}
                    <div style={{
                      maxWidth: "80%", padding: "12px 14px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "hsl(var(--secondary))",
                      color: msg.role === "user" ? "white" : "hsl(var(--foreground))",
                      fontFamily: "var(--font-sans)", fontSize: "0.88rem", lineHeight: 1.6,
                      whiteSpace: "pre-line", wordBreak: "break-word",
                    }}>
                      {msg.role === "kitty" ? renderMessageText(msg.content) : msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>
                      {"\ud83d\udc31"}
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: "16px 16px 16px 4px", background: "hsl(var(--secondary))", display: "flex", gap: "3px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginRight: "6px" }}>Gathering info</span>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1s ease-in-out infinite 0s" }} />
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1s ease-in-out infinite 0.15s" }} />
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1s ease-in-out infinite 0.3s" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick question chips */}
              {!hasMessages && !isLoading && (
                <div style={{ padding: "8px 16px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {quickQuestions.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)} style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.78rem", padding: "6px 14px",
                      borderRadius: "9999px", border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--secondary))", color: "hsl(var(--foreground))",
                      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--background))", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
                  placeholder="Ask about a faculty..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "12px", border: "none", background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", fontFamily: "var(--font-sans)", fontSize: "0.88rem", outline: "none" }}
                />
                <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()} style={{
                  width: "36px", height: "36px", borderRadius: "50%", border: "none",
                  background: isLoading || !input.trim() ? "hsl(var(--muted))" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", fontSize: "1rem", cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {"\u2191"}
                </button>
              </div>

              {/* Disclaimer */}
              <div style={{ padding: "6px 16px 10px", textAlign: "center", background: "hsl(var(--background))" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "hsl(var(--muted-foreground) / 0.6)" }}>
                  AI can make mistakes. Verify info.
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes kittyBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes kittySlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kittyDot { 0%,100%{opacity:0.3;transform:translateY(0)} 50%{opacity:1;transform:translateY(-3px)} }
        .kitty-chips::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
