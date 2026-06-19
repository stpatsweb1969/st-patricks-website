/**
 * Bulletin Subscribe CTA — Email subscription form for weekly bulletins.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Bell, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function BulletinSubscribeCTA() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      toast.success(data.message || "You're subscribed!");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    subscribeMutation.mutate({
      email,
      name: name || undefined,
      subscribedToBulletins: true,
      subscribedToNews: true,
    });
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 sm:p-6 text-center">
        <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
        <h3 className="font-serif text-base font-bold mb-1">You're Subscribed!</h3>
        <p className="text-muted-foreground text-xs">
          You'll receive the weekly bulletin in your inbox every Sunday.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Never Miss a Bulletin</span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 h-9 text-sm"
            required
          />
        </div>
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 text-sm sm:w-40"
        />
        <Button type="submit" size="sm" className="h-9 gap-1.5 text-sm px-4" disabled={subscribeMutation.isPending}>
          {subscribeMutation.isPending ? "..." : "Subscribe"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground/60 mt-2">Unsubscribe anytime.</p>
    </div>
  );
}
