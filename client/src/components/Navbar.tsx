import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, LogOut, ShieldCheck, LogIn, Menu, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  search?: string;
  onSearch?: (value: string) => void;
}

export function Navbar({ search = "", onSearch }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "hsl(var(--card) / 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                flexShrink: 0,
              }}
            >
              <GraduationCap className="h-5 w-5" style={{ color: "white" }} />
            </div>
            <div className="hidden sm:block">
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "hsl(var(--foreground))",
                lineHeight: 1,
              }}>
                Rate My <span className="gradient-text">Faculty</span>
              </div>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: "hsl(var(--muted-foreground))",
                marginTop: "2px",
              }}>
                Faculty Reviews & Previous Year Questions
              </div>
            </div>
          </div>
        </Link>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Menu"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "9999px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground))",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary) / 0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))"; }}
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              forceMount
              style={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 12px 32px hsl(0 0% 0% / 0.25)",
                minWidth: "230px",
                borderRadius: "var(--radius)",
              }}
            >
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, color: "hsl(var(--foreground))", wordBreak: "break-all" }}>
                        {user.email}
                      </p>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", textTransform: "capitalize" }}>
                        {user.role} access
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: "hsl(var(--border))" }} />

                  <Link href="/favorites">
                    <DropdownMenuItem
                      className="cursor-pointer px-3 py-2"
                      style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "hsl(var(--foreground))" }}
                    >
                      <Heart className="mr-2 h-4 w-4" style={{ color: "hsl(0 70% 60%)" }} />
                      My Favorites
                    </DropdownMenuItem>
                  </Link>

                  {(user.role === "admin" || user.role === "moderator") && (
                    <Link href="/admin">
                      <DropdownMenuItem
                        className="cursor-pointer px-3 py-2"
                        style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "hsl(var(--foreground))" }}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer px-3 py-2"
                    style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "hsl(var(--destructive))" }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="font-normal px-3 py-3">
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                      Not signed in
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: "hsl(var(--border))" }} />
                  <Link href="/auth">
                    <DropdownMenuItem
                      className="cursor-pointer px-3 py-2"
                      style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 500, color: "hsl(var(--primary))" }}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Continue with Google
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
