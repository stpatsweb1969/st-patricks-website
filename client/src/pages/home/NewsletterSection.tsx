import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Successfully subscribed to parish updates!");
      setEmail("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <section className="reveal section-dark py-10 sm:py-14 -mx-4 px-4 sm:-mx-0 sm:px-0">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-14 max-w-4xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-gold text-sm font-medium uppercase tracking-wider mb-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Stay Connected
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFeatureSettings: '"ss01"' }}>
              Subscribe to Parish Updates
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed">
              Weekly bulletins and parish news, delivered to your inbox.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) subscribeMutation.mutate({ email });
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-w-[260px] focus:border-gold/60 focus:ring-gold/30 rounded-full px-5 py-2.5 text-base"
                required
              />
              <Button
                type="submit"
                className="bg-gold text-parish-green-dark hover:bg-gold/90 font-bold whitespace-nowrap rounded-full px-7 py-2.5 shadow-lg shadow-gold/20 active:scale-[0.97] transition-all"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <p className="text-white/50 text-sm mt-4 text-center sm:text-left">
              Or join us on{" "}
              <a href="https://stpatarmonk.flocknote.com/home" target="_blank" rel="noopener noreferrer" className="text-gold/90 underline underline-offset-2 hover:text-gold transition-colors">
                Flocknote
              </a>{" "}
              for text and email updates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
