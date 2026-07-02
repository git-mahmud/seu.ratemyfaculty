import { Link } from "wouter";
import { type TeacherWithReviewCount } from "@shared/schema";
import { Star, Building2, BookOpen, MapPin } from "lucide-react";

interface TeacherCardProps {
  teacher: TeacherWithReviewCount;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Link href={`/teacher/${teacher.id}`} style={{ textDecoration: "none" }}>
      <div
        className="group app-card relative flex flex-col overflow-hidden h-full"
        style={{ cursor: "pointer" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
      >
        {/* Photo */}
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            src={teacher.photoUrl || "https://images.unsplash.com/photo-1544531320-9854b5098cf4?w=800&auto=format&fit=crop&q=60"}
            alt={teacher.fullName}
            className="h-full w-full object-cover"
            style={{ transition: "transform 0.4s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, hsl(0 0% 0% / 0.85) 0%, hsl(0 0% 0% / 0.25) 50%, transparent 100%)",
          }} />

          <div style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px" }}>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {teacher.fullName}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
              <Building2 style={{ width: "11px", height: "11px", color: "rgba(255,255,255,0.75)", flexShrink: 0 }} />
              <span style={{
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.75)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {teacher.department}
              </span>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div style={{ padding: "12px", flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <MapPin style={{ width: "11px", height: "11px", color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
            <span style={{
              fontSize: "0.72rem",
              color: "hsl(var(--muted-foreground))",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {teacher.university}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Star style={{ width: "11px", height: "11px", color: "hsl(var(--primary))", flexShrink: 0 }} fill="hsl(var(--primary))" />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--foreground))" }}>
              {teacher.reviewCount} Reviews
            </span>
          </div>

          {teacher.coursesTaught.length > 0 && (
            <div className="hidden sm:block">
              <span className="app-chip" style={{
                fontSize: "0.68rem",
                padding: "3px 10px",
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}>
                {teacher.coursesTaught[0]}
              </span>
            </div>
          )}
        </div>

        {/* View button bar */}
        <div
          className="w-full"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px",
            background: "hsl(var(--primary) / 0.08)",
            borderTop: "1px solid hsl(var(--border))",
            color: "hsl(var(--primary))",
            fontSize: "0.75rem",
            fontWeight: 600,
            transition: "background 0.2s ease",
          }}
        >
          <BookOpen style={{ width: "12px", height: "12px" }} />
          View Profile
        </div>
      </div>
    </Link>
  );
}
