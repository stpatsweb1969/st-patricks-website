/**
 * Gallery Manager — Admin page for managing parish photo gallery.
 * Composed from UploadForm and PhotoGrid sub-components.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { UploadForm } from "./gallery/UploadForm";
import { PhotoGrid } from "./gallery/PhotoGrid";

export default function GalleryManager() {
  const { data: photos, isLoading } = trpc.gallery.listAll.useQuery();
  const { data: albums } = trpc.gallery.albums.useQuery();
  const [showUpload, setShowUpload] = useState(false);
  const [filterAlbum, setFilterAlbum] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Photo Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage parish photos and albums. {photos?.length || 0} photos total.
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Upload Photo
        </Button>
      </div>

      {/* Album Filter */}
      {albums && albums.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filterAlbum === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterAlbum(null)}
          >
            All ({photos?.length || 0})
          </Badge>
          {albums.map((a) => (
            <Badge
              key={a.album}
              variant={filterAlbum === a.album ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterAlbum(a.album)}
            >
              {a.album} ({a.count})
            </Badge>
          ))}
        </div>
      )}

      {/* Upload Form */}
      {showUpload && <UploadForm albums={albums} onClose={() => setShowUpload(false)} />}

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos}
        isLoading={isLoading}
        filterAlbum={filterAlbum}
        onShowUpload={() => setShowUpload(true)}
      />
    </div>
  );
}
