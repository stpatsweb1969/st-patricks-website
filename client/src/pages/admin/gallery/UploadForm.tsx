/**
 * Gallery Upload Form — File selection, metadata input, and upload action.
 */

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, Upload } from "lucide-react";

interface UploadFormProps {
  albums: { album: string; count: number }[] | undefined;
  onClose: () => void;
}

export function UploadForm({ albums, onClose }: UploadFormProps) {
  const utils = trpc.useUtils();
  const uploadImageMutation = trpc.gallery.uploadImage.useMutation();
  const uploadMutation = trpc.gallery.upload.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      utils.gallery.albums.invalidate();
      toast.success("Photo added to gallery!");
    },
  });

  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [album, setAlbum] = useState("");
  const [newAlbum, setNewAlbum] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<{ name: string; data: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setPendingFile({ name: file.name, data: base64, type: file.type });
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) { toast.error("Please select an image"); return; }
    setUploading(true);
    try {
      const { url, key } = await uploadImageMutation.mutateAsync({
        fileName: pendingFile.name,
        fileData: pendingFile.data,
        contentType: pendingFile.type,
      });
      const selectedAlbum = newAlbum || album || undefined;
      await uploadMutation.mutateAsync({
        title: title || undefined,
        caption: caption || undefined,
        album: selectedAlbum,
        imageUrl: url,
        imageKey: key,
      });
      resetForm();
      onClose();
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setCaption(""); setAlbum(""); setNewAlbum("");
    setPreviewUrl(""); setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload New Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            previewUrl ? "border-primary/30 bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <div className="space-y-3">
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              <p className="text-sm text-muted-foreground">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Camera className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Click to select an image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 10MB</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Photo title" />
          </div>
          <div>
            <Label>Album</Label>
            <div className="flex gap-2">
              {albums && albums.length > 0 && (
                <select
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                >
                  <option value="">Select album...</option>
                  {albums.map((a) => (
                    <option key={a.album} value={a.album}>{a.album}</option>
                  ))}
                </select>
              )}
              <Input value={newAlbum} onChange={(e) => setNewAlbum(e.target.value)} placeholder="Or new album name" className="flex-1" />
            </div>
          </div>
        </div>
        <div>
          <Label>Caption (optional)</Label>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Brief description of the photo" />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleUpload} disabled={uploading || !pendingFile}>
            {uploading ? "Uploading..." : "Upload & Save"}
          </Button>
          <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
