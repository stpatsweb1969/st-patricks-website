/**
 * Latest News Editorial — Featured news article + secondary articles grid.
 */

import { Link } from "wouter";
import { ArrowRight, Newspaper } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

function readTime(content: string): number {
  const words = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.round(words / 200));
}

export function LatestNewsEditorial({ newsItems }: { newsItems: any[] | undefined }) {
  if (!newsItems || newsItems.length === 0) {
    return (
      <Card className="rounded-xl border border-border/60 shadow-sm overflow-hidden card-interactive">
        <CardContent className="p-0">
          <Link href="/news" className="group block">
            <div className="px-4 py-3 flex items-center gap-3 hover:bg-primary/[0.03] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Newspaper className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Latest News</p>
                <p className="font-semibold text-foreground text-base">News & Announcements</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const featured = newsItems[0];
  const secondary = newsItems.slice(1, 3);

  return (
    <div>
      <SectionHeader
        icon={Newspaper}
        title="Latest News"
        label="Parish Life"
        size="lg"
        action={
          <Link href="/news" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 pb-1 border-b border-primary/30 hover:border-primary transition-colors">
            All News <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link href="/news" className="lg:col-span-2 group">
          <article className="rounded-xl border border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-200 hover:-translate-y-0.5 h-full">
            {featured.imageUrl && (
              <div className="relative overflow-hidden aspect-[16/9] bg-muted">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary text-white text-xs font-semibold tracking-wide">
                    Featured
                  </span>
                </div>
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {featured.publishedAt && <time>{format(new Date(featured.publishedAt), "MMM d, yyyy")}</time>}
                <span>·</span>
                <span>{readTime(featured.content || featured.excerpt || '')} min read</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                {featured.title}
              </h3>
              {(featured.excerpt || featured.content) && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {featured.excerpt || featured.content?.substring(0, 160)}
                </p>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-200 pt-1">
                Read article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        </Link>

        <div className="flex flex-col gap-4">
          {secondary.map((post, i) => (
            <Link key={post.id || i} href="/news" className="group">
              <article className="flex gap-3 rounded-xl border border-border/50 p-3 hover:border-primary/20 transition-all duration-200 hover:-translate-y-0.5">
                {post.imageUrl && (
                  <div className="relative overflow-hidden rounded-lg flex-shrink-0 w-20 h-20 bg-muted">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center gap-1.5 min-w-0 flex-1">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {post.publishedAt && <time>{format(new Date(post.publishedAt), "MMM d")}</time>}
                    <span>·</span>
                    <span>{readTime(post.content || post.excerpt || '')} min</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
          {secondary.length < 2 && (
            <Link href="/news" className="group">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/20 p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all">
                <Newspaper className="w-5 h-5 text-primary/50" />
                <span className="text-sm font-medium text-primary">View All News</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
