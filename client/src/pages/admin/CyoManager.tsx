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

export function CyoManager() {
  const utils = trpc.useUtils();
  const { data: teams, isLoading: teamsLoading } = trpc.cyo.listTeams.useQuery();
  const { data: games, isLoading: gamesLoading } = trpc.cyo.listGames.useQuery();
  const createTeamMutation = trpc.cyo.createTeam.useMutation({ onSuccess: () => { utils.cyo.listTeams.invalidate(); toast.success("Team created!"); setShowTeamForm(false); } });
  const deleteTeamMutation = trpc.cyo.deleteTeam.useMutation({ onSuccess: () => { utils.cyo.listTeams.invalidate(); utils.cyo.listGames.invalidate(); toast.success("Team deleted"); } });
  const createGameMutation = trpc.cyo.createGame.useMutation({ onSuccess: () => { utils.cyo.listGames.invalidate(); toast.success("Game added!"); setShowGameForm(false); } });
  const updateGameMutation = trpc.cyo.updateGame.useMutation({ onSuccess: () => { utils.cyo.listGames.invalidate(); toast.success("Game updated!"); } });
  const deleteGameMutation = trpc.cyo.deleteGame.useMutation({ onSuccess: () => { utils.cyo.listGames.invalidate(); toast.success("Game deleted"); } });

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDivision, setTeamDivision] = useState("");
  const [teamAgeGroup, setTeamAgeGroup] = useState("");
  const [teamSeason, setTeamSeason] = useState("2026-2027");
  const [teamCoach, setTeamCoach] = useState("");

  const [gameTeamId, setGameTeamId] = useState<number | null>(null);
  const [gameOpponent, setGameOpponent] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [gameLocation, setGameLocation] = useState("");
  const [gameHomeAway, setGameHomeAway] = useState<"home" | "away">("home");

  const handleCreateTeam = () => {
    if (!teamName || !teamDivision || !teamAgeGroup) { toast.error("Fill in team name, division, and age group"); return; }
    createTeamMutation.mutate({ name: teamName, division: teamDivision, ageGroup: teamAgeGroup, season: teamSeason, coachName: teamCoach || undefined });
    setTeamName(""); setTeamDivision(""); setTeamAgeGroup(""); setTeamCoach("");
  };

  const handleCreateGame = () => {
    if (!gameTeamId || !gameOpponent || !gameDate || !gameLocation) { toast.error("Fill in all game details"); return; }
    const dateTime = gameTime ? `${gameDate}T${gameTime}` : `${gameDate}T18:00`;
    createGameMutation.mutate({ teamId: gameTeamId, opponent: gameOpponent, gameDate: dateTime, location: gameLocation, homeAway: gameHomeAway });
    setGameOpponent(""); setGameDate(""); setGameTime(""); setGameLocation("");
  };

  const handleUpdateScore = (gameId: number, ourScore: string, theirScore: string) => {
    const our = parseInt(ourScore);
    const their = parseInt(theirScore);
    if (isNaN(our) || isNaN(their)) return;
    updateGameMutation.mutate({ id: gameId, ourScore: our, theirScore: their, status: "completed" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">CYO Basketball</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowTeamForm(!showTeamForm)} className="gap-1">
            <Plus className="w-3 h-3" /> Add Team
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowGameForm(!showGameForm)} className="gap-1">
            <Plus className="w-3 h-3" /> Add Game
          </Button>
        </div>
      </div>

      {showTeamForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium text-sm">New Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Team name" value={teamName} onChange={e => setTeamName(e.target.value)} />
              <Input placeholder="Division (e.g. Boys Varsity)" value={teamDivision} onChange={e => setTeamDivision(e.target.value)} />
              <Input placeholder="Age group (e.g. 5th-6th Grade)" value={teamAgeGroup} onChange={e => setTeamAgeGroup(e.target.value)} />
              <Input placeholder="Season (e.g. 2026-2027)" value={teamSeason} onChange={e => setTeamSeason(e.target.value)} />
              <Input placeholder="Coach name (optional)" value={teamCoach} onChange={e => setTeamCoach(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>Create Team</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTeamForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showGameForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium text-sm">New Game</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className="border rounded-md px-3 py-2 text-sm" value={gameTeamId ?? ""} onChange={e => setGameTeamId(Number(e.target.value))}>
                <option value="">Select team</option>
                {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Input placeholder="Opponent" value={gameOpponent} onChange={e => setGameOpponent(e.target.value)} />
              <Input type="date" value={gameDate} onChange={e => setGameDate(e.target.value)} />
              <Input type="time" value={gameTime} onChange={e => setGameTime(e.target.value)} />
              <Input placeholder="Location (Home: St. Francis Hall)" value={gameLocation} onChange={e => setGameLocation(e.target.value)} />
              <select className="border rounded-md px-3 py-2 text-sm" value={gameHomeAway} onChange={e => setGameHomeAway(e.target.value as "home" | "away")}>
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateGame} disabled={createGameMutation.isPending}>Add Game</Button>
              <Button size="sm" variant="outline" onClick={() => setShowGameForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      <div>
        <h3 className="font-medium mb-3">Teams ({teams?.length ?? 0})</h3>
        {teamsLoading ? (
          <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : teams && teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map(team => (
              <Card key={team.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{team.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{team.division} • {team.ageGroup} • {team.wins}W-{team.losses}L</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => deleteTeamMutation.mutate({ id: team.id })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No teams created yet.</p>
        )}
      </div>

      {/* Games List */}
      <div>
        <h3 className="font-medium mb-3">Games ({games?.length ?? 0})</h3>
        {gamesLoading ? (
          <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : games && games.length > 0 ? (
          <div className="space-y-2">
            {games.map(game => {
              const team = teams?.find(t => t.id === game.teamId);
              return (
                <Card key={game.id} className="p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{team?.name ?? "?"} vs {game.opponent}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(game.gameDate), "MMM d, h:mm a")} • {game.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={game.status === "completed" ? "default" : "secondary"} className="text-xs">{game.status}</Badge>
                      {game.status === "scheduled" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 text-xs">Score</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Enter Score</DialogTitle></DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleUpdateScore(game.id, fd.get("our") as string, fd.get("their") as string); }} className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div><Label>Our Score</Label><Input name="our" type="number" min="0" required /></div>
                                <div><Label>Their Score</Label><Input name="their" type="number" min="0" required /></div>
                              </div>
                              <Button type="submit" className="w-full">Save Score</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                      {game.status === "completed" && (
                        <span className="text-sm font-bold">{game.ourScore}-{game.theirScore}</span>
                      )}
                      <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => deleteGameMutation.mutate({ id: game.id })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No games scheduled yet.</p>
        )}
      </div>
    </div>
  );
}

