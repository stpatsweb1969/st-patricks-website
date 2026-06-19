/**
 * HomilyArchive — Browse past homilies with audio playback.
 * Admin can upload audio recordings; public visitors can listen and browse by date/topic.
 */
import { useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Search, Calendar, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function HomilyArchive() {
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: homilies, isLoading } = trpc.homilies.list.useQuery();

  const filtered = (homilies ?? []).filter((h) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.title.toLowerCase().includes(q) ||
      (h.celebrant ?? "").toLowerCase().includes(q) ||
      (h.topic ?? "").toLowerCase().includes(q)
    );
  });

  function handlePlay(id: number, audioUrl: string) {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(id);
    }
  }

  return (
    <PageLayout>
      <SEO
        title="Homily Archive | St. Patrick in Armonk"
        description="Listen to past homilies from St. Patrick Church. Browse by date, celebrant, or topic."
      />

      <div className="container max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Homily Archive</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Listen to past homilies from our priests and deacons. New recordings are added weekly.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, celebrant, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Homily list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-20" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {search ? "No homilies match your search." : "No homilies have been uploaded yet. Check back soon!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((homily) => (
              <Card key={homily.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Play button */}
                  {homily.audioUrl ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 rounded-full w-10 h-10"
                      onClick={() => handlePlay(homily.id, homily.audioUrl!)}
                    >
                      {playingId === homily.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </Button>
                  ) : (
                    <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate">{homily.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(homily.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {homily.celebrant && (
                        <>
                          <span className="text-border">|</span>
                          <span>{homily.celebrant}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Topic badge */}
                  {homily.topic && (
                    <Badge variant="secondary" className="hidden sm:inline-flex text-xs shrink-0">
                      {homily.topic}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
