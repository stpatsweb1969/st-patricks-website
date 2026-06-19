import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}

export default function PhotoGallery() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | undefined>(undefined);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: albums } = trpc.gallery.albums.useQuery();
  const { data: photos, isLoading } = trpc.gallery.listPublished.useQuery(
    selectedAlbum ? { album: selectedAlbum } : undefined
  );

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => {
    if (lightboxIndex !== null && photos) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };
  const prevPhoto = () => {
    if (lightboxIndex !== null && photos) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <PageLayout>
      <SEO
        title="Photo Gallery"
        path="/photo-gallery"
        description="Browse photos from St. Patrick Church events, celebrations, and community life in Armonk, NY."
      />
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Parish Life"
        title="Photo Gallery"
        description="Moments from our parish community."
      />


      <div className="container py-6 sm:py-10">

        {/* Album Filter Tabs */}
        {albums && albums.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button
              variant={selectedAlbum === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAlbum(undefined)}
              className="rounded-full text-xs"
            >
              All Photos
            </Button>
            {albums.map((a) => (
              <Button
                key={a.album}
                variant={selectedAlbum === a.album ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAlbum(a.album)}
                className="rounded-full text-xs"
              >
                {a.album} ({a.count})
              </Button>
            ))}
          </div>
        )}

        {/* Photo Grid */}
        {isLoading ? (
          <GallerySkeleton />
        ) : !photos || photos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              {selectedAlbum ? `No photos in "${selectedAlbum}" yet.` : "Photos coming soon! Check back after our next parish event."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || photo.caption || "Parish photo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                  {(photo.title || photo.caption) && (
                    <div className="w-full p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {photo.title && (
                        <p className="text-white text-xs font-medium line-clamp-1">{photo.title}</p>
                      )}
                      {photo.caption && (
                        <p className="text-white/80 text-xs line-clamp-1 mt-0.5">{photo.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && photos && photos[lightboxIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={photos[lightboxIndex].imageUrl}
                alt={photos[lightboxIndex].title || ""}
                className="max-w-full max-h-[75vh] object-contain rounded"
              />
              {/* Caption */}
              {(photos[lightboxIndex].title || photos[lightboxIndex].caption) && (
                <div className="mt-3 text-center px-4">
                  {photos[lightboxIndex].title && (
                    <p className="text-white text-sm font-medium">{photos[lightboxIndex].title}</p>
                  )}
                  {photos[lightboxIndex].caption && (
                    <p className="text-white/70 text-xs mt-1">{photos[lightboxIndex].caption}</p>
                  )}
                </div>
              )}
              {/* Counter */}
              <p className="text-white/50 text-xs mt-2">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
