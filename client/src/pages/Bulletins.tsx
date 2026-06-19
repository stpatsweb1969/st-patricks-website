/**
 * Bulletins Page — Latest bulletin reader, subscribe CTA, and archive.
 */

import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Calendar, ChevronLeft, Mail, Share2, Link2, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import BulletinBookReader from "@/components/BulletinBookReader";
import PageHeader from "@/components/PageHeader";
import { BulletinSubscribeCTA } from "./bulletins/BulletinSubscribeCTA";
import { BulletinArchive } from "./bulletins/BulletinArchive";
import { PushNotificationBanner } from "@/components/PushNotificationBanner";

export default function Bulletins() {
  const { data: bulletins, isLoading } = trpc.bulletins.listPublished.useQuery();
  const [viewingBulletin, setViewingBulletin] = useState<typeof bulletins extends (infer T)[] | undefined ? T | null : null>(null);

  const latestBulletin = bulletins?.[0];
  const archiveBulletins = bulletins?.slice(1) || [];
  const activeBulletin = viewingBulletin || latestBulletin;

  return (
    <PageLayout>
      <SEO
        title="Weekly Bulletins"
        path="/bulletins"
        description="Read the latest weekly parish bulletin from St. Patrick Church, Armonk. Download current and past bulletins in PDF format."
      />
      <PageHeader
        eyebrow="Weekly Bulletin"
        title="Parish Bulletin"
        description="Read the latest weekly bulletin or browse our archive."
      />

      <section className="container py-6 sm:py-10">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : latestBulletin ? (
          <div className="space-y-6">
            {/* Active Bulletin — Inline Reader */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {!viewingBulletin && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">This Week</span>}
                  {viewingBulletin && (
                    <button onClick={() => setViewingBulletin(null)} className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1 hover:bg-muted/80">
                      <ChevronLeft className="w-2.5 h-2.5" /> Back to Latest
                    </button>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(activeBulletin!.weekDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <a href={activeBulletin!.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs px-2">
                      <Download className="w-3 h-3" /> PDF
                    </Button>
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-xs px-2">
                        <Share2 className="w-3 h-3" /> Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(activeBulletin!.pdfUrl.startsWith("http") ? activeBulletin!.pdfUrl : window.location.origin + activeBulletin!.pdfUrl);
                          toast.success("Link copied");
                        }}
                      >
                        <Link2 className="w-3.5 h-3.5 mr-2" /> Copy PDF Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const pdfLink = activeBulletin!.pdfUrl.startsWith("http") ? activeBulletin!.pdfUrl : window.location.origin + activeBulletin!.pdfUrl;
                          const subject = encodeURIComponent(`${activeBulletin!.title} — St. Patrick in Armonk`);
                          const body = encodeURIComponent(`Parish bulletin:\n${pdfLink}`);
                          window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
                        }}
                      >
                        <Mail className="w-3.5 h-3.5 mr-2" /> Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + "/bulletins");
                          toast.success("Page link copied");
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-2" /> Copy Page Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Inline Book Reader */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <BulletinBookReader pdfUrl={activeBulletin!.pdfUrl} title={activeBulletin!.title} />
              </Card>
            </div>

            {/* Push Notification Opt-in */}
            <PushNotificationBanner />

            {/* Subscribe CTA */}
            <BulletinSubscribeCTA />

            {/* Archive */}
            {archiveBulletins.length > 0 && (
              <BulletinArchive
                bulletins={archiveBulletins}
                onViewBulletin={(b) => setViewingBulletin(b as any)}
              />
            )}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-base mb-1">Bulletin Coming Soon</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-3">
              The weekly parish bulletin will be posted here each Sunday.
            </p>
            <a href="https://stpatarmonk.flocknote.com/home" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
              Visit Flocknote for Updates →
            </a>
          </Card>
        )}
      </section>
    </PageLayout>
  );
}
