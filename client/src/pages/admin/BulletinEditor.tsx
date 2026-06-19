import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { ArrowLeft, Save, FileText, Send, Loader2, Upload, LayoutTemplate } from "lucide-react";
import { bulletinTemplates } from "@shared/bulletinTemplates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BulletinEditorProps = {
  bulletinId?: number;
  onBack: () => void;
};

export function BulletinEditor({ bulletinId, onBack }: BulletinEditorProps) {
  const utils = trpc.useUtils();
  const { data: bulletin } = trpc.bulletins.getById.useQuery(
    { id: bulletinId! },
    { enabled: !!bulletinId }
  );

  const [title, setTitle] = useState("");
  const [weekDate, setWeekDate] = useState("");
  const [description, setDescription] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isNewBulletin, setIsNewBulletin] = useState(!bulletinId);
  const [createdId, setCreatedId] = useState<number | null>(bulletinId ?? null);
  const [published, setPublished] = useState(false);

  const createMutation = trpc.bulletins.create.useMutation();
  const uploadMutation = trpc.bulletins.uploadPdf.useMutation();
  const saveDraftMutation = trpc.bulletinCompose.saveDraft.useMutation();
  const generatePdfMutation = trpc.bulletinCompose.generatePdf.useMutation();
  const publishMutation = trpc.bulletinCompose.publishAndBroadcast.useMutation();

  // Initialize form when bulletin data loads
  const initialized = useRef(false);
  if (bulletin && !initialized.current) {
    initialized.current = true;
    setTitle(bulletin.title);
    setWeekDate(bulletin.weekDate ? new Date(bulletin.weekDate).toISOString().split("T")[0] : "");
    setDescription(bulletin.description || "");
    setEditorContent(bulletin.sourceHtml || "");
    setPublished(bulletin.published);
  }

  const handleWeekDateChange = (dateStr: string) => {
    setWeekDate(dateStr);
    if (dateStr && !title) {
      const d = new Date(dateStr + "T12:00:00");
      const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      setTitle(`Bulletin — ${formatted}`);
    }
  };

  const handleCreateAndSave = useCallback(async () => {
    if (!title || !weekDate) {
      toast.error("Title and week date are required");
      return;
    }
    try {
      if (isNewBulletin) {
        // Create a placeholder bulletin first, then save content
        const placeholder = "placeholder";
        const result = await createMutation.mutateAsync({
          title, description: description || undefined,
          pdfUrl: placeholder, pdfKey: placeholder,
          weekDate, published: false,
        });
        setCreatedId(result.id);
        setIsNewBulletin(false);
        // Now save the editor content
        if (editorContent) {
          await saveDraftMutation.mutateAsync({ id: result.id, sourceHtml: editorContent });
        }
        toast.success("Bulletin created! Content saved as draft.");
      } else if (createdId) {
        await saveDraftMutation.mutateAsync({ id: createdId, sourceHtml: editorContent });
        toast.success("Draft saved!");
      }
      utils.bulletins.listAll.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  }, [title, weekDate, description, editorContent, isNewBulletin, createdId]);

  const handleGeneratePdf = useCallback(async () => {
    if (!createdId) { toast.error("Save the bulletin first"); return; }
    try {
      // Save latest content first
      await saveDraftMutation.mutateAsync({ id: createdId, sourceHtml: editorContent });
      const result = await generatePdfMutation.mutateAsync({ id: createdId });
      toast.success("PDF generated successfully!");
      utils.bulletins.listAll.invalidate();
    } catch (err: any) {
      toast.error(err.message || "PDF generation failed");
    }
  }, [createdId, editorContent]);

  const handlePublish = useCallback(async () => {
    if (!createdId) { toast.error("Save the bulletin first"); return; }
    try {
      await publishMutation.mutateAsync({ id: createdId });
      setPublished(true);
      toast.success("Bulletin published! Subscribers have been notified.");
      utils.bulletins.listAll.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Publish failed");
    }
  }, [createdId]);

  const isSaving = createMutation.isPending || saveDraftMutation.isPending;
  const isGenerating = generatePdfMutation.isPending;
  const isPublishing = publishMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-xl font-semibold">
          {isNewBulletin ? "Compose New Bulletin" : `Editing: ${title}`}
        </h2>
        {published && <Badge>Published</Badge>}
        {!published && createdId && <Badge variant="secondary">Draft</Badge>}
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Week Date (Sunday)</Label>
              <Input type="date" value={weekDate} onChange={(e) => handleWeekDateChange(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Auto-generated from date" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Description (optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary for the bulletin list" />
          </div>
        </CardContent>
      </Card>

      {/* Template Selector + Rich Text Editor */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-medium">Bulletin Content</Label>
            {isNewBulletin && !editorContent && (
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                <Select onValueChange={(templateId) => {
                  const tmpl = bulletinTemplates.find(t => t.id === templateId);
                  if (tmpl) setEditorContent(tmpl.html);
                }}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue placeholder="Start from template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bulletinTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="font-medium">{t.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <RichTextEditor
            content={editorContent}
            onChange={setEditorContent}
            placeholder="Start writing your bulletin... Add announcements, Mass intentions, upcoming events, and parish news."
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCreateAndSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isNewBulletin ? "Create & Save Draft" : "Save Draft"}
        </Button>
        <Button variant="outline" onClick={handleGeneratePdf} disabled={isGenerating || !createdId}>
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          Generate PDF
        </Button>
        {!published && (
          <Button variant="default" className="bg-primary" onClick={handlePublish} disabled={isPublishing || !createdId}>
            {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Publish & Notify Subscribers
          </Button>
        )}
      </div>
    </div>
  );
}
