import { useState, type FormEvent } from "react";
import { useCreateAccessRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

// Client-side shape check only; the server is the source of truth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const { toast } = useToast();
  const createAccess = useCreateAccessRequest();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fn = firstName.trim();
    const em = email.trim();
    const pr = profession.trim();

    if (!fn) {
      toast({ title: "Name required", description: "Please enter your first name.", variant: "destructive" });
      return;
    }
    if (!EMAIL_RE.test(em)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!pr) {
      toast({ title: "Profession required", description: "Please tell us your profession.", variant: "destructive" });
      return;
    }

    createAccess.mutate(
      { data: { firstName: fn, email: em, profession: pr } },
      {
        onSuccess: () => {
          setSubmittedName(fn);
          setSubmitted(true);
        },
        onError: () => {
          // Do NOT show success on error — only a stored request should confirm.
          toast({
            title: "Something went wrong",
            description: "We couldn't submit your request. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-3 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-500 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          <span>Request received</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Thanks{submittedName ? `, ${submittedName}` : ""} — we'll review your request and email you a
          download link for MIKA.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="mika-firstname" className="sr-only">First name</label>
          <Input
            id="mika-firstname"
            type="text"
            name="firstName"
            autoComplete="given-name"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={50}
            className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus-visible:ring-[#1e6bff]"
            required
            disabled={createAccess.isPending}
          />
          <label htmlFor="mika-profession" className="sr-only">Profession</label>
          <Input
            id="mika-profession"
            type="text"
            name="profession"
            autoComplete="organization-title"
            placeholder="Profession (e.g. radiologist)"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            maxLength={100}
            className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus-visible:ring-[#1e6bff]"
            required
            disabled={createAccess.isPending}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="mika-email" className="sr-only">Email address</label>
          <Input
            id="mika-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-white/50 backdrop-blur-sm border-gray-200 focus-visible:ring-[#1e6bff]"
            required
            disabled={createAccess.isPending}
          />
          <Button
            type="submit"
            className="h-12 px-8 mika-accent-bg hover:bg-[#1a5fe6] text-white font-medium shadow-md transition-all"
            disabled={createAccess.isPending}
          >
            {createAccess.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Request access
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          MIKA is completely free. We review each request and email you a download link. Your details are
          only used to send the link and occasional updates — never shared.
        </p>
      </form>
    </div>
  );
}
