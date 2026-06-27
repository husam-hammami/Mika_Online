import { useState, useEffect, type FormEvent } from "react";
import { useCreateAccessRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, CheckCircle2 } from "lucide-react";
import { getListAccessRequestsQueryKey, getGetAccessRequestSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const DOWNLOAD_URL = "#"; // TODO: Swap for real installer later

// Reasonable client-side email shape check (the server is the source of truth).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate() {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const { toast } = useToast();
  const createAccess = useCreateAccessRequest();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionStorage.getItem("mika_unlocked")) {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    createAccess.mutate(
      { data: { email: trimmed } },
      {
        onSuccess: () => {
          setUnlocked(true);
          sessionStorage.setItem("mika_unlocked", "true");
          queryClient.invalidateQueries({ queryKey: getListAccessRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAccessRequestSummaryQueryKey() });
          toast({
            title: "Access granted",
            description: "You can now download MIKA.",
          });
        },
        onError: () => {
          // Note: intentionally do NOT unlock on error — the gate must only open
          // after a successful POST so every download corresponds to a captured email.
          toast({
            title: "Something went wrong",
            description: "We couldn't process your request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (unlocked) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-500 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          <span>Access unlocked</span>
        </div>
        <a
          href={DOWNLOAD_URL}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 py-2 mika-accent-bg text-white hover:bg-[#1a5fe6] shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
        >
          <Download className="mr-2 w-4 h-4" />
          Download MIKA
        </a>
        <p className="text-xs text-muted-foreground mt-2">
          Free for Mac &amp; Windows
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="mika-email" className="sr-only">
            Email address
          </label>
          <Input
            id="mika-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email to download"
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
            {createAccess.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Get Access
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          MIKA is completely free. Your email is only used to send the download link and occasional updates — never shared.
        </p>
      </form>
    </div>
  );
}
