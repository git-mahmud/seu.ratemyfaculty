import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { type InsertReview, api, buildUrl } from "@shared/routes";
import { useCreateReview } from "@/hooks/use-reviews";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MessageSquarePlus, ScrollText, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface ReviewFormProps {
  teacherId: number;
  teacherName: string;
  coursesTaught: string[];
  review?: any; // For edit mode
  trigger?: React.ReactNode;
}

export function ReviewForm({ teacherId, teacherName, coursesTaught, review, trigger }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateReview();
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildUrl(api.reviews.update.path, { id: review.id }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reviews.list.path, teacherId] });
      toast({ title: "Review updated" });
      setOpen(false);
    },
  });

  const isEditing = !!review;

  const form = useForm<Omit<InsertReview, "studentId">>({
    resolver: zodResolver(insertReviewSchema.omit({ studentId: true })),
    defaultValues: review || {
      teacherId,
      personality: "Neutral",
      bestFor: "Average Students",
      courseTaken: "",
      markingStyle: "Average",
      questionDifficulty: "Medium",
      comment: "",
      termsAccepted: true,
    },
  });

  const onSubmit = async (data: Omit<InsertReview, "studentId">) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      if (!data.termsAccepted && !isEditing) {
        toast({
          title: "Agreement Required",
          description: "You must agree to the Terms & Conditions before submitting.",
          variant: "destructive"
        });
        return;
      }
      if (isEditing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
        setOpen(false);
      }
      form.reset();
      setAgreed(false);
    } catch (error: any) {
      if (error.message === "Conflict" || error.status === 409) {
        toast({
          title: "Submission Blocked",
          description: "You have already submitted a review for this faculty in this course.",
          variant: "destructive"
        });
      }
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !user) {
      setShowLoginPrompt(true);
      return;
    }
    if (isOpen && !isEditing) {
      setShowTerms(true);
      return;
    }
    setOpen(isOpen);
  };

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname + window.location.search;
    setLocation(`/auth?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleAgree = () => {
    form.setValue("termsAccepted", true);
    setAgreed(true);
    setShowTerms(false);
    setOpen(true);
  };

  return (
    <>
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              You haven't signed in. Sign in to write a review.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoginRedirect}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              Review Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Please read and agree to our guidelines before sharing your experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/50 rounded-lg p-4 max-h-[300px] overflow-y-auto text-sm space-y-3 border">
            <p className="font-semibold">By submitting a review, you agree to the following:</p>
            <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
              <li>Reviews must be respectful and professional.</li>
              <li>No personal attacks, abusive language, or defamation.</li>
              <li>No false information or misleading statements.</li>
              <li>No hate speech or discrimination of any kind.</li>
              <li>Reviews must be based on your actual personal academic experience.</li>
              <li>The platform reserves the right to remove inappropriate reviews.</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox 
              id="terms" 
              checked={agreed} 
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I have read and agree to the Review Guidelines and Terms & Conditions.
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTerms(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAgree} 
              disabled={!agreed}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Agree & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {trigger ? (
        <span onClick={() => { handleOpenChange(true); }} style={{ cursor: "pointer" }}>
          {trigger}
        </span>
      ) : (
        <Button 
          size="lg" 
          className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          onClick={() => handleOpenChange(true)}
        >
          <MessageSquarePlus className="mr-2 h-5 w-5" />
          Write a Review
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Review" : `Review ${teacherName}`}</DialogTitle>
            <DialogDescription>
              Share your experience. Reviews are anonymous to the public.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseTaken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Taken</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {coursesTaught.map((course) => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select personality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Friendly">Friendly</SelectItem>
                          <SelectItem value="Neutral">Neutral</SelectItem>
                          <SelectItem value="Strict">Strict</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="markingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marking Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Open-minded">Open-minded</SelectItem>
                          <SelectItem value="Average">Average</SelectItem>
                          <SelectItem value="Strict">Strict</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionDifficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bestFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Best For</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Strong Students">Strong Students</SelectItem>
                          <SelectItem value="Average Students">Average Students</SelectItem>
                          <SelectItem value="Weak Students">Weak Students</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Experience</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What was it like taking a class with this teacher?"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Submitting..." : (isEditing ? "Update Review" : "Submit Review")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
