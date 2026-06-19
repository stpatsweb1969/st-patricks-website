/**
 * Photo Grid — Displays gallery photos with hover actions and edit dialog.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Edit, Eye, EyeOff, Upload, Image as ImageIcon } from "lucide-react";

interface PhotoGridProps {
  photos: any[] | undefined;
  isLoading: boolean;
  filterAlbum: string | null;
  onShowUpload: () => void;
}

export function PhotoGrid({ photos, isLoading, filterAlbum, onShowUpload }: PhotoGridProps) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => { utils.gallery.listAll.invalidate(); toast.success("Photo updated"); },
  });
  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => { utils.gallery.listAll.invalidate(); utils.gallery.albums.invalidate(); toast.success("Photo deleted"); },
  });

  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editAlbum, setEditAlbum] = useState("");

  const startEdit = (photo: any) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title || "");
    setEditCaption(photo.caption || "");
    setEditAlbum(photo.album || "");
  };

  const handleEdit = async () => {
    if (!editingPhoto) return;
    await updateMutation.mutateAsync({
      id: editingPhoto.id,
      title: editTitle || undefined,
      caption: editCaption || undefined,
      album: editAlbum || undefined,
      published: editingPhoto.published,
    });
    setEditingPhoto(null);
  };

  const filteredPhotos = filterAlbum ? photos?.filter((p) => p.album === filterAlbum) : photos;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (!filteredPhotos || filteredPhotos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No photos yet</p>
        <p className="text-sm text-muted-foreground mt-1">Upload your first photo to get started.</p>
        <Button className="mt-4" onClick={onShowUpload}>
          <Upload className="w-4 h-4 mr-2" /> Upload Photo
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="group overflow-hidden">
            <div className="relative aspect-square">
              <img src={photo.imageUrl} alt={photo.title || "Gallery photo"} className="w-full h-full object-cover" />
              {!photo.published && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs"><EyeOff className="w-3 h-3 mr-1" /> Hidden</Badge>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => startEdit(photo)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => updateMutation.mutate({ id: photo.id, published: !photo.published })}>
                  {photo.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => { if (confirm("Delete this photo?")) deleteMutation.mutate({ id: photo.id }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate">{photo.title || "Untitled"}</p>
              <div className="flex items-center gap-2 mt-1">
                {photo.album && <Badge variant="outline" className="text-xs">{photo.album}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={(open) => { if (!open) setEditingPhoto(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Photo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {editingPhoto && (
              <img src={editingPhoto.imageUrl} alt={editingPhoto.title || "Photo"} className="w-full max-h-48 object-contain rounded-lg bg-muted" />
            )}
            <div><Label>Title</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Photo title" /></div>
            <div><Label>Caption</Label><Input value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Caption" /></div>
            <div><Label>Album</Label><Input value={editAlbum} onChange={(e) => setEditAlbum(e.target.value)} placeholder="Album name" /></div>
            <div className="flex items-center gap-3">
              <Switch checked={editingPhoto?.published ?? true} onCheckedChange={(checked) => setEditingPhoto({ ...editingPhoto, published: checked })} />
              <Label>Published (visible on gallery page)</Label>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save Changes"}</Button>
              <Button variant="outline" onClick={() => setEditingPhoto(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
