import { playKeyClick, playClick } from "@/lib/sounds";
import { useState, useEffect, useRef } from "react";
import { useTeachers } from "@/hooks/use-teachers";
import { Navbar } from "@/components/Navbar";
import { TeacherCard } from "@/components/TeacherCard";
import { Footer } from "@/components/Footer";

// ── Hardcoded stats (update manually) ──
const STATS = {
  pyqUploaded: 74,
  usersJoined: 10,
};

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animFrameId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));
    const shootingStars: { x: number; y: number; len: number; speed: number; alpha: number; active: boolean; angle: number; }[] =
      Array.from({ length: 5 }, () => ({ x: 0, y: 0, len: 0, speed: 0, alpha: 0, active: false, angle: 0 }));
    let frame = 0;
    const spawnShootingStar = (s: typeof shootingStars[0]) => {
      s.x = Math.random() * window.innerWidth;
      s.y = Math.random() * window.innerHeight * 0.5;
      s.len = Math.random() * 120 + 60;
      s.speed = Math.random() * 8 + 6;
      s.alpha = 1; s.active = true;
      s.angle = Math.PI / 6 + Math.random() * Math.PI / 8;
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 1) { s.alpha = 1; s.twinkleDir = -1; }
        if (s.alpha <= 0.1) { s.alpha = 0.1; s.twinkleDir = 1; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${s.alpha})`; ctx.fill();
        if (s.r > 1.2) {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100,200,255,${s.alpha * 0.15})`; ctx.fill();
        }
      });
      frame++;
      shootingStars.forEach((s, i) => {
        if (!s.active && frame % 120 === i * 24) spawnShootingStar(s);
        if (!s.active) return;
        s.x += Math.cos(s.angle) * s.speed; s.y += Math.sin(s.angle) * s.speed; s.alpha -= 0.015;
        if (s.alpha <= 0 || s.x > canvas.width || s.y > canvas.height) { s.active = false; return; }
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
        grad.addColorStop(0, `rgba(0,220,255,${s.alpha})`); grad.addColorStop(1, "rgba(0,220,255,0)");
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
      });
      animFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animFrameId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none" }} />;
}

const PAGE_SIZE = 6;
const INITIAL_SIZE = 12;

export default function Home() {
  const { data: teachers, isLoading, error } = useTeachers();
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SIZE);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const filteredTeachers = teachers
    ?.filter(t =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.university.toLowerCase().includes(search.toLowerCase()) ||
      t.coursesTaught.some(c => c.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b.reviewCount - a.reviewCount) ?? [];

  const visibleTeachers = filteredTeachers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTeachers.length;
  const totalReviews = teachers?.reduce((sum, t) => sum + t.reviewCount, 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "hsl(220,30%,4%)" }}>
      <StarField />
      <Navbar search={search} onSearch={(v) => { setSearch(v); setVisibleCount(INITIAL_SIZE); }} />

      <main className="flex-1 relative z-10">

        {/* ===== HERO BANNER ===== */}
        <div className="container mx-auto px-4 pt-8 pb-4" style={{ maxWidth:"1400px" }}>
          <div style={{
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(0,200,255,0.2)",
            background: "rgba(2,10,25,0.85)",
            backdropFilter: "blur(48px)",
            padding: "48px 40px 40px",
           boxShadow: "0 0 60px rgba(0,200,255,0.25), 0 0 120px rgba(0,200,255,0.1), inset 0 0 80px rgba(0,200,255,0.05)",
          }}>
            {/* Grid background inside box */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(0,200,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.08) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
              filter: "blur(0.8px)",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            }} />
            {/* Top glow line */}
            <div style={{ position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.7),rgba(168,85,247,0.6),transparent)",zIndex:1 }} />
            {/* Corner brackets */}
            <div style={{ position:"absolute",top:"-1px",left:"-1px",width:"16px",height:"16px",borderTop:"2px solid rgba(0,200,255,0.8)",borderLeft:"2px solid rgba(0,200,255,0.8)",zIndex:2 }} />
            <div style={{ position:"absolute",top:"-1px",right:"-1px",width:"16px",height:"16px",borderTop:"2px solid rgba(0,200,255,0.8)",borderRight:"2px solid rgba(0,200,255,0.8)",zIndex:2 }} />
            <div style={{ position:"absolute",bottom:"-1px",left:"-1px",width:"16px",height:"16px",borderBottom:"2px solid rgba(0,200,255,0.8)",borderLeft:"2px solid rgba(0,200,255,0.8)",zIndex:2 }} />
            <div style={{ position:"absolute",bottom:"-1px",right:"-1px",width:"16px",height:"16px",borderBottom:"2px solid rgba(0,200,255,0.8)",borderRight:"2px solid rgba(0,200,255,0.8)",zIndex:2 }} />

            {/* Content */}
            <div className="relative" style={{ zIndex: 2 }}>
              <div style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(24px)",
                transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <h1 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem,4vw,3rem)",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "linear-gradient(135deg,#00e5ff 0%,#ffffff 45%,#a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.15,
                  marginBottom: "16px",
                  maxWidth: "700px",
                }}>
                  Access PYQ and Faculty Review<br />Anytime, Anywhere
                </h1>

                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.5rem",
                  color: "rgba(150,210,255,0.65)",
                  letterSpacing: "0.03em",
                  marginBottom: "40px",
                  maxWidth: "520px",
                }}>
                  Get detailed info about your next faculty's personality, marking style and exam difficulty.
                </p>

                {/* Three separate stat boxes */}
                <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", maxWidth:"520px" }}>

                 {/* Parent Container - Ensure this is present to keep them side-by-side */}
<div style={{ display: "flex", flexWrap: "nowrap", gap: "45px", alignItems: "center" }}>
  
  {/* Reviews */}
  <div style={{
    flex: "0 0 auto",
    border: "1px solid rgba(0,200,255,0.3)",
    background: "rgba(0,200,255,0.05)",
    padding: "6px 18px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}>
    <div style={{ position:"absolute",top:"-1px",left:"-1px",width:"8px",height:"8px",borderTop:"1px solid rgba(0,200,255,0.7)",borderLeft:"1px solid rgba(0,200,255,0.7)" }} />
    <div style={{ position:"absolute",bottom:"-1px",right:"-1px",width:"8px",height:"8px",borderBottom:"1px solid rgba(0,200,255,0.7)",borderRight:"1px solid rgba(0,200,255,0.7)" }} />
    
    <div style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:800, color:"#00dcff", lineHeight:1 }}>
      {totalReviews}
    </div>
    <div style={{ fontFamily:"var(--font-mono)", fontSize:"1rem", fontWeight:800, color:"#00dcff", textTransform:"uppercase", whiteSpace:"nowrap", lineHeight:1 }}>
      Reviews
    </div>
  </div>

  {/* PYQ */}
  <div style={{
    flex: "0 0 auto",
    border: "1px solid rgba(168,85,247,0.3)",
    background: "rgba(168,85,247,0.05)",
    padding: "6px 18px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}>
    <div style={{ position:"absolute",top:"-1px",left:"-1px",width:"8px",height:"8px",borderTop:"1px solid rgba(168,85,247,0.7)",borderLeft:"1px solid rgba(168,85,247,0.7)" }} />
    <div style={{ position:"absolute",bottom:"-1px",right:"-1px",width:"8px",height:"8px",borderBottom:"1px solid rgba(168,85,247,0.7)",borderRight:"1px solid rgba(168,85,247,0.7)" }} />
    
    <div style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:800, color:"#a855f7", lineHeight:1 }}>
      {STATS.pyqUploaded}
    </div>
    <div style={{ fontFamily:"var(--font-mono)", fontSize:"1rem", fontWeight:800, color:"#a855f7", textTransform:"uppercase", whiteSpace:"nowrap", lineHeight:1 }}>
      PYQ Uploaded
    </div>
  </div>

  {/* Users */}
  <div style={{
    flex: "0 0 auto",
    border: "1px solid rgba(0,255,150,0.3)",
    background: "rgba(0,255,150,0.05)",
    padding: "6px 18px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }}>
    <div style={{ position:"absolute",top:"-1px",left:"-1px",width:"8px",height:"8px",borderTop:"1px solid rgba(0,255,150,0.7)",borderLeft:"1px solid rgba(0,255,150,0.7)" }} />
    <div style={{ position:"absolute",bottom:"-1px",right:"-1px",width:"8px",height:"8px",borderBottom:"1px solid rgba(0,255,150,0.7)",borderRight:"1px solid rgba(0,255,150,0.7)" }} />
    
    <div style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:800, color:"#00ff96", lineHeight:1 }}>
      {STATS.usersJoined}
    </div>
    <div style={{ fontFamily:"var(--font-mono)", fontSize:"1rem", fontWeight:800, color:"#00ff96", textTransform:"uppercase", whiteSpace:"nowrap", lineHeight:1 }}>
      Users Joined
    </div>
  </div>

</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEARCH BAR ===== */}
        <div className="container mx-auto px-4 pt-12 pb-4" style={{ maxWidth:"900px" }}>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color:"rgba(0,255,240,1)",zIndex:2 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <input
              type="text"
              placeholder="SEARCH FACULTY NAME · FACULTY INITIAL · COURSE TITLE · DEPARTMENT"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(INITIAL_SIZE); }}
              onKeyDown={() => playKeyClick()}
             style={{
                width:"100%",
                paddingLeft:"48px",paddingRight:"20px",paddingTop:"18px",paddingBottom:"18px",
                background:"rgba(0,15,30,0.85)",
                border:"1px solid rgba(0,255,240,0.9)",
                fontFamily:"var(--font-mono)",fontSize:"0.85rem",
                letterSpacing:"0.08em",color:"rgba(0,200,255,0.9)",
                outline:"none",transition:"all 0.3s ease",
                boxShadow:"0 0 30px rgba(0,255,240,0.15), 0 0 30px rgba(0,255,240,0.03), inset 0 0 20px rgba(0,255,240,0.005)",
              }}
              onFocus={e => { e.currentTarget.style.borderColor="rgba(0,200,255,0.8)"; e.currentTarget.style.boxShadow="0 0 30px rgba(0,200,255,0.3), inset 0 0 20px rgba(0,200,255,0.05)"; }}
              onBlur={e => { e.currentTarget.style.borderColor="rgba(0,200,255,0.25)"; e.currentTarget.style.boxShadow="none"; }}
            />
          </div>
        </div>

        {/* ===== FACULTY GRID ===== */}
        <div className="container mx-auto px-4 py-8">
          <div style={{ height:"1px",background:"linear-gradient(90deg,rgba(0,200,255,0.3),transparent)",marginBottom:"24px" }} />

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-sm"
                  style={{ background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.1)" }} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20" style={{ color:"rgba(255,80,80,0.8)" }}>
              <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.2rem" }}>// CONNECTION FAILED</h2>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"0.85rem",marginTop:"8px" }}>Unable to retrieve faculty data. Retry later.</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-20">
              <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.2rem",color:"rgba(0,200,255,0.5)",letterSpacing:"0.1em" }}>// NO RESULTS FOUND</h2>
              <p style={{ fontFamily:"var(--font-mono)",fontSize:"0.8rem",color:"rgba(100,150,200,0.5)",marginTop:"8px" }}>Adjust your search parameters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {visibleTeachers.map((teacher, i) => (
                  <div key={teacher.id} style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(16px)",
                    transition: `all 0.5s ease ${Math.min(i * 0.04, 0.4)}s`,
                  }}>
                    <TeacherCard teacher={teacher} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => { playClick(); setVisibleCount(v => v + PAGE_SIZE); }}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "12px 32px",
                      border: "1px solid rgba(0,200,255,0.35)",
                      background: "rgba(0,200,255,0.06)",
                      color: "rgba(0,200,255,0.85)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 12px rgba(0,200,255,0.08)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,200,255,0.12)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(0,200,255,0.2)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.6)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,200,255,0.06)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(0,200,255,0.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,200,255,0.35)";
                    }}
                  >
                    Show More ({filteredTeachers.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
