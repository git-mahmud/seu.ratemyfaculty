import { usePyqs, useUploadPyq, useUpdatePyq } from "@/hooks/use-pyqs";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, UploadCloud, HelpCircle, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContributionGuide } from "@/components/ContributionGuide";

export function PyqList({ teacherId, hideUpload = false }: { teacherId: number, hideUpload?: boolean }) {
  const { data: pyqs, isLoading } = usePyqs(teacherId);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showContributionGuide, setShowContributionGuide] = useState(false);
  
  const groupedPyqs = useMemo(() => {
    if (!pyqs) return {};
    return pyqs.reduce((acc: any, pyq) => {
      const code = pyq.courseCode;
      if (!acc[code]) acc[code] = [];
      acc[code].push(pyq);
      return acc;
    }, {});
  }, [pyqs]);

  if (isLoading) return <div className="animate-pulse h-24 bg-muted rounded-lg"></div>;
  if (!pyqs) return null;

  return (
    <>
      <ContributionGuide open={showContributionGuide} onOpenChange={setShowContributionGuide} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Previous Year Questions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowContributionGuide(true)}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Contribute</span>
            </Button>
            {!hideUpload && !!user && (user.role === "admin" || user.email === "2025100000379@seu.edu.bd") && (
              <UploadPyqDialog teacherId={teacherId} open={open} onOpenChange={setOpen} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pyqs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No PYQs uploaded for this teacher yet.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPyqs).map(([courseCode, items]: [string, any]) => (
                <div key={courseCode} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                      Course Code: {courseCode}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    <div style={{
                      background:"rgba(0,200,255,0.06)",
                      border:"1px solid rgba(0,200,255,0.2)",
                      padding:"10px 14px",
                      marginBottom:"12px",
                      display:"flex",
                      alignItems:"flex-start",
                      gap:"8px",
                    }}>
                      <span style={{ fontSize:"0.9rem", flexShrink:0 }}>ℹ️</span>
                      <p style={{
                        fontFamily:"var(--font-mono)",
                        fontSize:"0.68rem",
                        color:"rgba(0,200,255,0.75)",
                        letterSpacing:"0.04em",
                        lineHeight:1.6,
                        margin:0,
                      }}>
                        PYQ files are hosted on Google Drive. Make sure you are signed in with your <strong style={{ color:"rgba(0,200,255,1)" }}>@seu.edu.bd</strong> email in Google to access them.
                      </p>
                    </div>
                    {items.map((pyq: any) => (
                    {items.map((pyq: any) => (
                      <div key={pyq.id} className="relative group/pyq">
                        <a
                          href={pyq.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg border bg-card hover:border-primary/50 hover:bg-accent transition-all group shadow-sm"
                        >
                          <div className="bg-primary/10 p-2 rounded mr-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {pyq.examType} {pyq.year}
                            </p>
                            <p className="text-xs text-muted-foreground">{pyq.semester}</p>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                            <span className="text-xs font-medium hidden sm:inline">Download</span>
                            <Download className="h-4 w-4" />
                          </div>
                        </a>
                        {!!user && (user.role === "admin" || user.role === "moderator" || user.email === "2025100000379@seu.edu.bd") && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/pyq:opacity-100 transition-opacity duration-200">
                            <EditPyqDialog pyq={pyq} teacherId={teacherId} />
                          </div>
                        )}
                      </div>
                    ))} 
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function UploadPyqDialog({ teacherId, open, onOpenChange }: { teacherId: number, open: boolean, onOpenChange: (open: boolean) => void }) {
  const uploadMutation = useUploadPyq();
  const [driveUrl, setDriveUrl] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("Spring");
  const [examType, setExamType] = useState("Mid");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl || !courseCode || !semester || !examType || !year) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    if (!driveUrl.includes("drive.google.com") && !driveUrl.startsWith("http")) {
      toast({ title: "Invalid URL", description: "Please enter a valid Google Drive link", variant: "destructive" });
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        teacherId,
        data: {
          teacherId,
          courseCode,
          semester,
          examType,
          year: Number(year),
          driveUrl,
        }
      });
      onOpenChange(false);
      setDriveUrl("");
      setCourseCode("");
      setSemester("Spring");
      setExamType("Mid");
      setYear(new Date().getFullYear().toString());
    } catch (err) {
      // handled by hook
    }
  };

  return (
    <div className="flex">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Upload PYQ
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add PYQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Course Code With Title</Label>
                <Input 
                  placeholder="e.g. CSE181 [Discrete Mathematics]" 
                  value={courseCode} 
                  onChange={e => setCourseCode(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Fall">Fall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 2024" 
                  value={year} 
                  onChange={e => setYear(e.target.value)} 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Google Drive Link</Label>
                <Input 
                  type="url"
                  placeholder="https://drive.google.com/file/d/..." 
                  value={driveUrl} 
                  onChange={e => setDriveUrl(e.target.value)} 
                />
                <p className="text-xs text-muted-foreground">
                  Upload the PDF to Google Drive, set sharing to "Anyone with link", then paste the link here.
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Saving..." : "Add Question"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EditPyqDialog({ pyq, teacherId }: { pyq: any; teacherId: number }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const updateMutation = useUpdatePyq();
  const [driveUrl, setDriveUrl] = useState(pyq.fileUrl);
  const [courseCode, setCourseCode] = useState(pyq.courseCode);
  const [semester, setSemester] = useState(pyq.semester);
  const [examType, setExamType] = useState(pyq.examType);
  const [year, setYear] = useState(String(pyq.year));
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl || !courseCode || !semester || !examType || !year) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: pyq.id,
        teacherId,
        data: { courseCode, semester, examType, year, driveUrl },
      });
      setOpen(false);
    } catch (err) {
      // handled by hook
    }
  };

  return (
    <>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 4px",
          color: "rgba(0,200,255,0.7)",
        }}
        title="Edit PYQ"
      >
        <Pencil style={{ width: "13px", height: "13px" }} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit PYQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Course Code With Title</Label>
                <Input
                  placeholder="e.g. CSE181 [Discrete Mathematics]"
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Fall">Fall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2024"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Google Drive Link</Label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={driveUrl}
                  onChange={e => setDriveUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload the PDF to Google Drive, set sharing to "Anyone with link", then paste the link here.
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
