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

export function NewsManager() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.news.listAll.useQuery();
  const createMutation = trpc.news.create.useMutation({ onSuccess: () => { utils.news.listAll.invalidate(); toast.success("News post created!"); } });
  const deleteMutation = trpc.news.delete.useMutation({ onSuccess: () => { utils.news.listAll.invalidate(); toast.success("Post deleted"); } });
  const updateMutation = trpc.news.update.useMutation({ onSuccess: () => { utils.news.listAll.invalidate(); toast.success("Post updated"); setEditingPost(null); } });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [published, setPublished] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");

  const startEdit = (post: any) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditExcerpt(post.excerpt || "");
  };

  const handleEdit = () => {
    if (!editTitle || !editContent) { toast.error("Title and content required"); return; }
    updateMutation.mutate({ id: editingPost.id, title: editTitle, content: editContent, excerpt: editExcerpt || undefined });
  };

  const handleCreate = () => {
    if (!title || !content) { toast.error("Title and content required"); return; }
    createMutation.mutate({ title, content, excerpt: excerpt || undefined, published });
    setTitle(""); setContent(""); setExcerpt(""); setPublished(false); setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">News & Announcements</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Short excerpt (optional)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            <Textarea placeholder="Full content..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
            <div className="flex items-center gap-3">
              <Switch checked={published} onCheckedChange={setPublished} id="publish-news" />
              <Label htmlFor="publish-news">Publish immediately (sends notifications to subscribers)</Label>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!post.published && (
                    <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: post.id, published: true })}>
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => startEdit(post)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate({ id: post.id })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No news posts yet. Create your first one above.</p>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => { if (!open) setEditingPost(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit News Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Post title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Input placeholder="Short excerpt (optional)" value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} />
            <Textarea placeholder="Full content..." value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} />
            <div className="flex gap-3">
              <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

