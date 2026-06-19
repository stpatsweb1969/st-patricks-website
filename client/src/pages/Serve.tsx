/**
 * Serve — /serve page.
 * Merges Volunteer Opportunities + Volunteer Needs Board into one unified page.
 * Urgent needs shown first, then ongoing volunteer opportunities.
 */
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Heart, Calendar, Clock, Users, AlertTriangle, HandHeart, MapPin } from "lucide-react";
import { format } from "date-fns";

const urgencyColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

const urgencyLabels = {
  low: "Flexible",
  medium: "Needed Soon",
  high: "Urgent",
};

export default function Serve() {
  const { data: needs, isLoading: needsLoading } = trpc.volunteerNeeds.list.useQuery();
  const { data: opportunities, isLoading: oppsLoading, refetch: refetchOpps } = trpc.volunteer.listOpportunities.useQuery();

  const urgentNeeds = (needs ?? []).filter(n => n.urgency === "high");
  const otherNeeds = (needs ?? []).filter(n => n.urgency !== "high");

  return (
    <PageLayout>
      <SEO
        title="Serve & Volunteer"
        path="/serve"
        description="Find ways to serve at St. Patrick in Armonk. See urgent needs, sign up for volunteer opportunities, and share your time and talents with our parish community."
      />
      <PageHeader
        eyebrow="Get Involved"
        title="Serve & Volunteer"
        description="Your parish needs you. Browse urgent needs, find ongoing opportunities, and share your gifts with our community."
      />

      <section className="py-10">
        <div className="container max-w-5xl">
          {/* Urgent Needs Banner */}
          {urgentNeeds.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="font-serif text-xl text-foreground font-semibold">Urgent Needs</h2>
                <Badge className="bg-red-100 text-red-800 ml-2">{urgentNeeds.length}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {urgentNeeds.map(need => (
                  <NeedCard key={need.id} need={need} />
                ))}
              </div>
            </div>
          )}

          {/* Tabs: Needs Board + Opportunities */}
          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="opportunities" className="flex-1">Opportunities</TabsTrigger>
              <TabsTrigger value="needs" className="flex-1">Needs Board</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="mt-6">
              {oppsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : !opportunities || opportunities.length === 0 ? (
                <Card className="p-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-foreground mb-2">No Opportunities Listed</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    There are no volunteer opportunities posted at this time. Check back soon, or contact the parish office to learn about ways to serve.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {opportunities.map(opp => (
                    <OpportunityCard key={opp.id} opportunity={opp} onSuccess={() => refetchOpps()} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="needs" className="mt-6">
              {needsLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse"><CardContent className="h-40" /></Card>
                  ))}
                </div>
              ) : !otherNeeds || otherNeeds.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <HandHeart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      No additional volunteer needs right now. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {otherNeeds.map(need => (
                    <NeedCard key={need.id} need={need} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* General Volunteer Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-green-50/50">
              <h3 className="font-serif text-lg text-foreground mb-3">Ways to Serve</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Liturgical Ministries (Lectors, Eucharistic Ministers, Altar Servers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>CCD Catechist or Classroom Aide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Parish Events (Fundraisers, Dinners, Festivals)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Outreach and Community Service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>CYO Coaching and Team Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Music Ministry and Choir</span>
                </li>
              </ul>
            </Card>
            <Card className="p-6 bg-green-50/50">
              <h3 className="font-serif text-lg text-foreground mb-3">Contact Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Interested in volunteering but don't see the right opportunity? Contact the parish office and we'll help you find the perfect way to serve.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Phone:</strong> <a href="tel:9142739724" className="text-primary hover:underline">(914) 273-9724</a></p>
                <p><strong>Email:</strong> <a href="mailto:office@stpatrickinarmonk.org" className="text-primary hover:underline">office@stpatrickinarmonk.org</a></p>
              </div>
              <div className="mt-4">
                <a href="https://stpatarmonk.flocknote.com/home" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">Join Flocknote for Updates</Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

/* ─── Opportunity Card (from old Volunteer page) ─── */
function OpportunityCard({ opportunity, onSuccess }: { opportunity: any; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const signupMutation = trpc.volunteer.signup.useMutation({
    onSuccess: () => {
      toast.success("You're signed up! Thank you for volunteering.");
      setOpen(false);
      setName(""); setEmail(""); setPhone(""); setNotes("");
      onSuccess();
    },
    onError: (err) => toast.error(err.message || "Failed to sign up"),
  });

  const spotsLeft = opportunity.spotsAvailable - opportunity.spotsFilled;

  return (
    <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-foreground text-lg">{opportunity.title}</h3>
          {opportunity.ministry && (
            <Badge variant="secondary" className="shrink-0 ml-2">{opportunity.ministry}</Badge>
          )}
        </div>
        {opportunity.description && (
          <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          {opportunity.eventDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(opportunity.eventDate), "MMM d, yyyy")}
            </span>
          )}
          {opportunity.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {opportunity.startTime}{opportunity.endTime ? ` – ${opportunity.endTime}` : ""}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {opportunity.spotsFilled}/{opportunity.spotsAvailable} volunteers signed up
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={spotsLeft <= 0}>
              {spotsLeft <= 0 ? "Full" : "Sign Up"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Volunteer for: {opportunity.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!name || !email) { toast.error("Please provide your name and email"); return; }
              signupMutation.mutate({ opportunityId: opportunity.id, name, email, phone: phone || undefined, notes: notes || undefined });
            }} className="space-y-4 mt-4">
              <div><Label htmlFor="vol-name">Your Name *</Label><Input id="vol-name" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div><Label htmlFor="vol-email">Email *</Label><Input id="vol-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div><Label htmlFor="vol-phone">Phone (optional)</Label><Input id="vol-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><Label htmlFor="vol-notes">Notes (optional)</Label><Textarea id="vol-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any relevant experience or availability notes..." rows={3} /></div>
              <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? "Signing up..." : "Confirm Sign-Up"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

/* ─── Need Card (from old VolunteerNeeds page) ─── */
function NeedCard({ need }: { need: any }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const utils = trpc.useUtils();
  const respond = trpc.volunteerNeeds.respond.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Your response has been recorded.");
      setOpen(false);
      setName(""); setEmail(""); setPhone(""); setMessage("");
      utils.volunteerNeeds.list.invalidate();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const spotsRemaining = need.spotsNeeded - need.spotsFilled;
  const isFull = spotsRemaining <= 0;

  return (
    <Card className="relative overflow-hidden">
      {need.urgency === "high" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{need.title}</CardTitle>
          <Badge className={urgencyColors[need.urgency as keyof typeof urgencyColors]} variant="secondary">
            {need.urgency === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
            {urgencyLabels[need.urgency as keyof typeof urgencyLabels]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {need.description && (
          <p className="text-sm text-muted-foreground">{need.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {need.neededBy && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              By {new Date(need.neededBy).toLocaleDateString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {isFull ? "Full" : `${spotsRemaining} spot${spotsRemaining !== 1 ? "s" : ""} left`}
          </span>
        </div>
        {need.category && (
          <Badge variant="outline" className="text-xs">{need.category}</Badge>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-2" disabled={isFull} size="sm">
              <HandHeart className="w-4 h-4 mr-2" />
              {isFull ? "All Spots Filled" : "I Can Help"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Up to Help: {need.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              respond.mutate({ needId: need.id, name, email, phone: phone || undefined, message: message || undefined });
            }} className="space-y-4">
              <div><label className="text-sm font-medium">Name *</label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Email *</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Message (optional)</label><Textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} /></div>
              <Button type="submit" className="w-full" disabled={respond.isPending}>
                {respond.isPending ? "Submitting..." : "Confirm Sign Up"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
