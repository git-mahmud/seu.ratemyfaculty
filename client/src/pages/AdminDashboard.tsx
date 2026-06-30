import { useAuth } from "@/hooks/use-auth";
import { useTeachers } from "@/hooks/use-teachers";
import { Navbar } from "@/components/Navbar";
import { TeacherForm } from "@/components/TeacherForm";
import { useLocation } from "wouter";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, LayoutDashboard, Users, Shield, Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const panelStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  position: "relative" as const,
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.teachers.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete teacher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teachers.list.path] });
      queryClient.refetchQueries({ queryKey: [api.teachers.list.path] });
      toast({ title: "Teacher deleted" });
    },
  });

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: "hsl(var(--background))" }}>
      <Loader2 className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
    </div>
  );

  if (!user || (!isAdmin && !isModerator)) {
    setLocation("/");
    return null;
  }

  const filteredTeachers = [...(teachers ?? [])]
    .filter(t => t.fullName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Navbar />

      <main className="container mx-auto px-4 py-8" style={{ maxWidth: "1300px" }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          {/* LEFT: ICON AND TITLE GROUP */}
          <div className="flex items-center gap-4">
            <div style={{
              width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
              background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.3)",
              borderRadius: "14px",
            }}>
              <LayoutDashboard style={{ width: "22px", height: "22px", color: "hsl(var(--primary))" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", marginBottom: "2px", fontWeight: 600 }}>
                Control Panel
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, color: "hsl(var(--foreground))" }}>
                Dashboard
              </h1>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "hsl(var(--muted-foreground))" }}>
                Manage faculty and platform content
              </p>
            </div>
          </div>

          {/* CENTER: FACULTY COUNT PILL */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "10px 20px", borderRadius: "14px",
            background: "hsl(var(--primary) / 0.06)",
            border: "1px solid hsl(var(--primary) / 0.18)",
          }}>
            <Users style={{ width: "20px", height: "20px", color: "hsl(var(--primary))" }} />
            <div className="flex flex-col">
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
                Total Faculty
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: "hsl(var(--foreground))", lineHeight: 1 }}>
                {teachersLoading ? "--" : String(teachers?.length).padStart(3, '0')}
              </span>
            </div>
          </div>

          {/* RIGHT: ACTION BUTTON */}
          <TeacherForm />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList style={{
            background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))",
            borderRadius: "12px", padding: "4px", gap: "4px",
          }}>
            <TabsTrigger
              value="teachers"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, borderRadius: "8px" }}
            >
              Faculty
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="roles"
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, borderRadius: "8px" }}
              >
                User Roles
              </TabsTrigger>
            )}
          </TabsList>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">

            {/* Search bar */}
            <div className="relative" style={{ maxWidth: "420px" }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                type="text"
                placeholder="Search faculty by name to edit or delete"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  paddingTop: "11px",
                  paddingBottom: "11px",
                  fontSize: "0.85rem",
                  borderRadius: "12px",
                }}
              />
            </div>

            <div style={panelStyle}>
              <Table>
                <TableHeader>
                  <TableRow style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    {["Name", "Department", "University", "Reviews", "Actions"].map((h, i) => (
                      <TableHead key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", fontWeight: 700, padding: "14px 16px" }}>
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: "hsl(var(--primary))" }} />
                      </TableCell>
                    </TableRow>
                  ) : filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12" style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "hsl(var(--muted-foreground))" }}>
                        {search ? "No faculty matches your search" : "No faculty found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <TableRow
                        key={teacher.id}
                        style={{ borderBottom: "1px solid hsl(var(--border))", transition: "background 0.2s ease" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary) / 0.04)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <TableCell style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.85rem", color: "hsl(var(--foreground))", padding: "12px 16px" }}>
                          {teacher.fullName}
                        </TableCell>
                        <TableCell style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "hsl(var(--muted-foreground))", padding: "12px 16px" }}>
                          {teacher.department}
                        </TableCell>
                        <TableCell style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "hsl(var(--muted-foreground))", padding: "12px 16px" }}>
                          {teacher.university}
                        </TableCell>
                        <TableCell style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
                            color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.1)",
                            border: "1px solid hsl(var(--primary) / 0.2)", borderRadius: "999px", padding: "3px 12px",
                          }}>
                            {teacher.reviewCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1" style={{ padding: "12px 16px" }}>
                          <TeacherForm
                            teacher={teacher}
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                              </Button>
                            }
                          />
                          {isAdmin && (
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this teacher?")) {
                                  deleteMutation.mutate(teacher.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" style={{ color: "hsl(var(--destructive))" }} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          {isAdmin && (
            <TabsContent value="roles">
              <UserRolesPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

function UserRolesPanel() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("student");
  const { toast } = useToast();

  const roleMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update role");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Role updated successfully" });
      setEmail("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div style={{ ...panelStyle, maxWidth: "480px", padding: "24px" }}>
      <div className="flex items-center gap-3 mb-6">
        <Users style={{ width: "18px", height: "18px", color: "hsl(var(--primary))" }} />
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", letterSpacing: "0.08em", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", fontWeight: 600 }}>
            Access Control
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>
            User Roles
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
            User Email
          </Label>
          <Input
            id="user-email"
            placeholder="student@seu.edu.bd"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
            Role
          </Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full gap-2"
          disabled={roleMutation.isPending || !email}
          onClick={() => roleMutation.mutate({ email, role })}
        >
          <Shield style={{ width: "14px", height: "14px" }} />
          {roleMutation.isPending ? "Updating..." : "Save Role"}
        </Button>
      </div>
    </div>
  );
}
