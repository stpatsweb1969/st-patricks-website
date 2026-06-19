import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper, Bell, Mail, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useReveal } from "@/hooks/useReveal";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

const accentColors = [
  "border-l-[oklch(0.54_0.12_160)]",
  "border-l-[oklch(0.75_0.15_85)]",
  "border-l-[oklch(0.5_0.12_250)]",
  "border-l-[oklch(0.55_0.15_25)]",
];

function NewsSubscribeCTA() {
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
      subscribedToNews: true,
      subscribedToBulletins: false,
    });
  };

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-8 sm:p-10">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-bold mb-2">You're Subscribed!</h3>
          <p className="text-muted-foreground text-sm">
            You'll receive email notifications when new parish news is posted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-8 sm:p-10">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Bell className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Stay Updated</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">Get News Delivered to Your Inbox</h3>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Subscribe to receive parish news and announcements by email — no account needed.
          </p>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[340px]">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            <Button
              type="submit"
              className="w-full h-11 gap-2 font-medium"
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? (
                "Subscribing..."
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Subscribe to News Updates
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground/70 text-center">
              Unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewsEvents() {
  const { data: news, isLoading: newsLoading } = trpc.news.listPublished.useQuery();
  const revealRef = useReveal();

  return (
    <PageLayout>
      <SEO
        title="News & Events"
        path="/news-events"
        description="Latest news, announcements, and upcoming events from St. Patrick Church, Armonk NY. Stay connected with our parish community."
      />
      <PageHeader
        eyebrow="Parish Life"
        title="News & Announcements"
        description="Stay up to date with what's happening in our parish community."
      />

      <div ref={revealRef}>
        <section className="container py-6 sm:py-10">
          {newsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-3/4 mb-3" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="space-y-4">
              {news.map((post, idx) => (
                <Card key={post.id} className={`reveal overflow-hidden border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-xl border-l-3 ${accentColors[idx % accentColors.length]}`}>
                  <CardContent className="p-6 flex gap-5">
                    {post.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {idx === 0 && <Badge className="bg-primary/10 text-primary border-0 text-xs px-1.5 py-0">Latest</Badge>}
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {post.publishedAt ? format(new Date(post.publishedAt), "MMMM d, yyyy") : ""}
                        </p>
                      </div>
                      <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {post.excerpt || post.content.substring(0, 200)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 bg-secondary/20">
              <Newspaper className="w-10 h-10 text-primary/30 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Parish News Coming Soon</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-3">
                Announcements, event recaps, and community updates will appear here. Stay tuned!
              </p>
              <a href="https://stpatricksarmonk.flocknote.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Follow us on Flocknote →
              </a>
            </Card>
          )}
        </section>
      </div>

      {/* Subscribe to News CTA */}
      <section className="container pb-12 sm:pb-16">
        <NewsSubscribeCTA />
      </section>
    </PageLayout>
  );
}
