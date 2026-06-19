import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Download } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BulletinBookReader from "@/components/BulletinBookReader";
import { useState } from "react";
import { format } from "date-fns";

export function ThisWeeksBulletin() {
  const { data: bulletins, isLoading } = trpc.bulletins.listPublished.useQuery();
  const [showReader, setShowReader] = useState(false);

  const latestBulletin = bulletins?.[0];

  if (isLoading) {
    return (
      <section className="reveal container mb-6 sm:mb-8">
        <div className="animate-pulse">
          <div className="h-5 w-40 bg-muted rounded mb-3" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      </section>
    );
  }

  if (!latestBulletin) return null;

  const weekDate = new Date(latestBulletin.weekDate);

  return (
    <section className="reveal container mb-6 sm:mb-8">
      <SectionHeader
        icon={BookOpen}
        title="This Week's Bulletin"
        size="sm"
        action={
          <Link href="/bulletins" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 pb-1 border-b border-primary/30 hover:border-primary transition-colors">
            All Bulletins <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {showReader ? (
        <BulletinBookReader
          pdfUrl={latestBulletin.pdfUrl}
          title={latestBulletin.title}
          onClose={() => setShowReader(false)}
        />
      ) : (
        <Card
          className="overflow-hidden border-0 shadow-lg cursor-pointer group card-interactive bg-gradient-to-r from-primary/[0.03] via-transparent to-gold/[0.03]"
          onClick={() => setShowReader(true)}
        >
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="w-1 bg-gradient-to-b from-primary to-gold shrink-0 rounded-l-xl" />
              <div className="flex-1 p-3 sm:p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-parish-green-dark flex items-center justify-center shrink-0 shadow-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                    Week of {format(weekDate, "MMM d, yyyy")}
                  </span>
                  <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                    {latestBulletin.title}
                  </h3>
                </div>
                <a
                  href={latestBulletin.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 press-scale">
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
