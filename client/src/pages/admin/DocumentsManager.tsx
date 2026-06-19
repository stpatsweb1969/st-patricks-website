import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, Edit, FileText, Upload, Users, Shield } from "lucide-react";

const DOC_CATEGORIES = [
  { value: "baptism", label: "Baptism" },
  { value: "confirmation", label: "Confirmation" },
  { value: "marriage", label: "Marriage" },
  { value: "funeral", label: "Funeral" },
  { value: "ccd", label: "Religious Education (CCD)" },
  { value: "general", label: "General" },
];

export function DocumentsManager() {
  const { data: docs, isLoading } = trpc.documents.all.useQuery();
  const utils = trpc.useUtils();
  const uploadMutation = trpc.documents.upload.useMutation();
  const createMutation = trpc.documents.create.useMutation({
    onSuccess: () => { utils.documents.all.invalidate(); toast.success("Document added"); },
  });
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => { utils.documents.all.invalidate(); toast.success("Document deleted"); },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          contentType: file.type,
        });
        setFileUrl(result.url);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        toast.success("File uploaded");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) { toast.error("Title and file are required"); return; }
    await createMutation.mutateAsync({ title, description, category, fileUrl });
    setTitle(""); setDescription(""); setFileUrl(""); setCategory("general");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Upload New Document</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title" />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
            <div>
              <Label>File</Label>
              {fileUrl ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 truncate flex-1">File uploaded</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFileUrl("")}>Change</Button>
                </div>
              ) : (
                <Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} disabled={uploading} />
              )}
              {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Or paste external URL:</span>
              <Input
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending || !title || !fileUrl}>
              <Plus className="w-4 h-4 mr-1" /> Add Document
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : docs && docs.length > 0 ? (
        <Card>
          <CardHeader><CardTitle>All Documents ({docs.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2">{doc.category}</Badge>
                      {doc.description}
                    </p>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm"><Upload className="w-3 h-3" /></Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: doc.id })}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No documents uploaded yet. Add your first document above.</p>
        </Card>
      )}
    </div>
  );
}


