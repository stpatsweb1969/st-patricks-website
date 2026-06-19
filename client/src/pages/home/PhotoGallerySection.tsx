import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Camera, ImageIcon } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";

export function PhotoGallerySection() {
  const { data: photos, isLoading } = trpc.gallery.listPublished.useQuery(undefined);

  if (isLoading) {
    return (
      <div>
        <SectionHeader icon={Camera} title="Photo Gallery" size="sm" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-40 h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div>
        <SectionHeader
          icon={Camera}
          title="Photo Gallery"
          size="sm"
          action={
            <Link href="/gallery" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 pb-1 border-b border-primary/30 hover:border-primary transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <Card className="border-dashed">
          <CardContent className="p-5 flex flex-col items-center text-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-1.5" />
            <p className="text-foreground/60 text-sm">Photos coming soon!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        icon={Camera}
        title="Photo Gallery"
        size="md"
        action={
          <Link href="/gallery" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 pb-1 border-b border-primary/30 hover:border-primary transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href="/gallery"
              className="shrink-0 w-52 sm:w-64 h-40 sm:h-48 rounded-xl overflow-hidden relative group snap-start shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption || photo.title || "Parish photo"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-white text-sm font-medium drop-shadow-sm">{photo.caption}</p>
                </div>
              )}
            </Link>
          ))}
          <Link
            href="/gallery"
            className="shrink-0 w-52 sm:w-64 h-40 sm:h-48 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/[0.03] transition-all snap-start group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Camera className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-base text-primary font-semibold">View All Photos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
