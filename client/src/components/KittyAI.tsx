import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "kitty";
  content: string;
}

const CatSVG = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    {/* Head */}
    <circle cx="28" cy="30" r="18" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
    {/* Left ear */}
    <polygon points="14,18 10,6 22,14" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
    <polygon points="14,16 12,10 20,14" fill="hsl(var(--accent))" opacity="0.4" />
    {/* Right ear */}
    <polygon points="42,18 46,6 34,14" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
    <polygon points="42,16 44,10 36,14" fill="hsl(var(--accent))" opacity="0.4" />
    {/* Eyes */}
    <circle cx="22" cy="28" r="3" fill="hsl(var(--primary))" />
    <circle cx="34" cy="28" r="3" fill="hsl(var(--primary))" />
    <circle cx="23" cy="27" r="1" fill="white" />
    <circle cx="35" cy="27" r="1" fill="white" />
    {/* Nose */}
    <polygon points="28,33 26,36 30,36" fill="hsl(var(--accent))" />
    {/* Mouth */}
    <path d="M24 38 Q28 41 32 38" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" fill="none" />
    {/* Whiskers */}
    <line x1="8" y1="32" x2="20" y2="34" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
    <line x1="8" y1="36" x2="20" y2="36" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
    <line x1="36" y1="34" x2="48" y2="32" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
    <line x1="36" y1="36" x2="48" y2="36" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" />
  </svg>
);

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
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6} /g, '')
        .replace(/\* /g, '\u2022 ')
        .trim();
      setMessages(prev => [...prev, { role: "kitty", content: cleanReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "kitty", content: "Oops! I'm having a moment. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Who is strict in CSE?",
    "Best faculty for beginners?",
    "How is FBH for discrete math?",
    "Find PYQs for CSE181",
  ];

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Tooltip badge */}
      {!isOpen && (
        <div style={{
          position: "fixed", bottom: "88px", right: "24px", zIndex: 9998,
          background: "white", color: "#333", fontFamily: "var(--font-sans)",
          fontSize: "0.68rem", fontWeight: 600, padding: "6px 10px",
          borderRadius: "8px", boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
        }}>
          Need help? Ask Kitty! 🐱
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowSettings(false); }}
        aria-label="Chat with Kitty AI"
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px hsl(var(--primary) / 0.4)",
          zIndex: 9999, transition: "transform 0.2s ease",
          animation: isOpen ? "none" : "kittyBounce 2s ease-in-out infinite",
          overflow: "hidden",
        }}
      >
        {isOpen ? (
          <span style={{ fontSize: "1.3rem", color: "white" }}>{"\u2715"}</span>
        ) : (
          <CatSVG size={40} />
        )}
        {/* Notification dot */}
        {!isOpen && (
          <span style={{
            position: "absolute", top: "2px", right: "2px",
            width: "10px", height: "10px", borderRadius: "50%",
            background: "hsl(0 75% 55%)", border: "2px solid hsl(var(--background))",
          }} />
        )}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "92px", right: "24px",
          width: "360px", maxWidth: "calc(100vw - 32px)",
          height: "500px", maxHeight: "90vh",
          borderRadius: "20px", border: "1px solid hsl(var(--border))",
          background: "hsl(var(--card))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          zIndex: 9998, animation: "kittySlideUp 0.25s ease-out",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 14px",
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CatSVG size={32} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: "white" }}>
                Kitty AI
              </span>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "hsl(140 70% 50%)" }} />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setShowSettings(!showSettings)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "1rem", padding: "4px" }}>
                {"\u2699\uFE0F"}
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "1rem", padding: "4px" }}>
                {"\u2715"}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings ? (
            <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: "4px" }}>
                Kitty Brain Settings
              </h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", marginBottom: "16px" }}>
                Choose which brain Kitty should use
              </p>

              {/* Option 1 */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", borderRadius: "10px", border: `1px solid ${!useCustomKey ? "hsl(var(--primary))" : "hsl(var(--border))"}`, background: !useCustomKey ? "hsl(var(--primary) / 0.05)" : "transparent", cursor: "pointer", marginBottom: "10px" }}>
                <input type="radio" checked={!useCustomKey} onChange={() => { setUseCustomKey(false); saveKey(""); }} style={{ marginTop: "3px" }} />
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>Default Brain (System)</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(var(--muted-foreground))" }}>Shared quota, might be slow</p>
                </div>
              </label>

              {/* Option 2 */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", borderRadius: "10px", border: `1px solid ${useCustomKey ? "hsl(var(--primary))" : "hsl(var(--border))"}`, background: useCustomKey ? "hsl(var(--primary) / 0.05)" : "transparent", cursor: "pointer", marginBottom: "10px" }}>
                <input type="radio" checked={useCustomKey} onChange={() => setUseCustomKey(true)} style={{ marginTop: "3px" }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>My Custom API Key</p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "hsl(var(--muted-foreground))", marginBottom: "8px" }}>Faster, your own Groq key</p>
                  {useCustomKey && (
                    <input
                      type="password"
                      value={customKey}
                      onChange={e => saveKey(e.target.value)}
                      placeholder="Enter your Groq API key"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--input))", color: "hsl(var(--foreground))", fontFamily: "var(--font-sans)", fontSize: "0.72rem" }}
                    />
                  )}
                </div>
              </label>

              <button onClick={() => setShowSettings(false)} style={{
                width: "100%", padding: "10px", borderRadius: "10px", border: "none", marginTop: "12px",
                background: "hsl(var(--primary))", color: "white", fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              }}>
                Back to Chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages area */}
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: "300px", maxHeight: "340px" }}>

                {/* Empty state */}
                {!hasMessages && !isLoading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", paddingTop: "20px" }}>
                    <CatSVG size={60} />
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "hsl(var(--muted-foreground))", textAlign: "center", maxWidth: "240px", lineHeight: 1.5 }}>
                      Ask about faculties, their marking style, exam difficulty, or PYQs!
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginTop: "8px" }}>
                      {quickQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(q)}
                          style={{
                            fontFamily: "var(--font-sans)", fontSize: "0.65rem", padding: "6px 10px",
                            borderRadius: "9999px", border: "1px solid hsl(var(--primary) / 0.3)",
                            background: "hsl(var(--primary) / 0.06)", color: "hsl(var(--primary))",
                            cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap",
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "6px" }}>
                    {msg.role === "kitty" && <CatSVG size={24} />}
                    <div style={{
                      maxWidth: "78%", padding: "10px 13px",
                      borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      background: msg.role === "user" ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" : "hsl(var(--secondary))",
                      color: msg.role === "user" ? "white" : "hsl(var(--foreground))",
                      fontFamily: "var(--font-sans)", fontSize: "0.78rem", lineHeight: 1.6, whiteSpace: "pre-line", wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                    <CatSVG size={24} />
                    <div style={{ padding: "12px 16px", borderRadius: "12px 12px 12px 4px", background: "hsl(var(--secondary))", display: "flex", gap: "4px", alignItems: "center" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1.2s ease-in-out infinite 0s" }} />
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1.2s ease-in-out infinite 0.2s" }} />
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "hsl(var(--muted-foreground))", animation: "kittyDot 1.2s ease-in-out infinite 0.4s" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div style={{ padding: "3px 14px", textAlign: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.56rem", color: "hsl(var(--muted-foreground) / 0.6)" }}>
                  Kitty can make mistakes. Verify info.
                </span>
              </div>

              {/* Input */}
              <div style={{ padding: "10px 14px 14px", borderTop: "1px solid hsl(var(--border))", display: "flex", gap: "8px", flexShrink: 0 }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(input); }}
                  placeholder="Ask about a faculty..."
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: "9999px",
                    border: "1px solid hsl(var(--border))", background: "hsl(var(--secondary))",
                    color: "hsl(var(--foreground))", fontFamily: "var(--font-sans)", fontSize: "0.78rem", outline: "none",
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  style={{
                    width: "38px", height: "38px", borderRadius: "50%", border: "none",
                    background: isLoading || !input.trim() ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                    color: "white", fontSize: "1rem", cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  {"\u2191"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes kittyBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes kittySlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kittyDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>
    </>
  );
}
