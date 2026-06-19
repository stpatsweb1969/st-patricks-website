/**
 * SacramentProgress — Public-facing sacrament preparation progress tracker.
 * Shows families the steps required for Baptism, First Communion, Confirmation.
 * No login required — informational page with checklists.
 */
import { useState } from "react";
import { SEO } from "@/components/SEO";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, BookOpen, Heart, Cross, Baby } from "lucide-react";

interface Step {
  title: string;
  description: string;
  required: boolean;
}

const SACRAMENT_TRACKS: Record<string, { icon: React.ReactNode; color: string; steps: Step[] }> = {
  baptism: {
    icon: <Baby className="w-5 h-5" />,
    color: "text-blue-600",
    steps: [
      { title: "Submit Registration Form", description: "Complete the online Baptism registration form with child and parent details.", required: true },
      { title: "Meet with Parish Office", description: "Schedule and attend an initial meeting to discuss the ceremony and requirements.", required: true },
      { title: "Attend Preparation Class", description: "Parents attend a Baptism preparation class (held monthly, ~2 hours).", required: true },
      { title: "Choose Godparents", description: "Select godparents who are confirmed, practicing Catholics. Submit sponsor certificates.", required: true },
      { title: "Select Ceremony Date", description: "Choose from available Baptism dates (typically Sundays after 12:00 PM Mass).", required: true },
      { title: "Gather Documents", description: "Bring child's birth certificate and godparents' sponsor certificates to the office.", required: true },
      { title: "Rehearsal (if needed)", description: "Brief walkthrough of the ceremony, typically the day before or morning of.", required: false },
    ],
  },
  firstCommunion: {
    icon: <Heart className="w-5 h-5" />,
    color: "text-amber-600",
    steps: [
      { title: "CCD Enrollment (Grade 1)", description: "Child must be enrolled in CCD religious education starting in 1st grade.", required: true },
      { title: "Complete Year 1 of CCD", description: "Attend all CCD classes in the first year of preparation.", required: true },
      { title: "CCD Enrollment (Grade 2)", description: "Continue CCD enrollment in 2nd grade for sacrament preparation year.", required: true },
      { title: "First Reconciliation", description: "Child receives the Sacrament of Reconciliation (Confession) before First Communion.", required: true },
      { title: "Parent Meeting", description: "Attend the mandatory parent information meeting for First Communion families.", required: true },
      { title: "Retreat Day", description: "Child attends the First Communion retreat day with their class.", required: true },
      { title: "Rehearsal", description: "Attend the First Communion rehearsal at the church.", required: true },
      { title: "First Communion Ceremony", description: "Celebrate the Sacrament of First Communion (typically May).", required: true },
    ],
  },
  confirmation: {
    icon: <Cross className="w-5 h-5" />,
    color: "text-red-600",
    steps: [
      { title: "CCD Enrollment (through Grade 8)", description: "Continuous enrollment in CCD from grades 1-8 or equivalent preparation.", required: true },
      { title: "Confirmation Year Registration", description: "Register for the Confirmation preparation program (typically 9th/10th grade).", required: true },
      { title: "Attend Preparation Classes", description: "Complete all Confirmation preparation sessions over the program year.", required: true },
      { title: "Choose a Confirmation Name", description: "Select a saint's name that inspires your faith journey.", required: true },
      { title: "Choose a Sponsor", description: "Select a confirmed Catholic sponsor (not a parent) and submit sponsor certificate.", required: true },
      { title: "Service Hours", description: "Complete required community service hours (varies by year).", required: true },
      { title: "Confirmation Retreat", description: "Attend the Confirmation retreat with your class.", required: true },
      { title: "Letter to the Bishop", description: "Write a letter to the Bishop expressing your desire to be confirmed.", required: true },
      { title: "Interview with Priest/Deacon", description: "Meet with a priest or deacon to discuss your readiness.", required: false },
      { title: "Rehearsal", description: "Attend the Confirmation rehearsal at the church.", required: true },
      { title: "Confirmation Ceremony", description: "Receive the Sacrament of Confirmation from the Bishop.", required: true },
    ],
  },
};

export default function SacramentProgress() {
  const [activeTab, setActiveTab] = useState("baptism");

  return (
    <PageLayout>
      <SEO
        title="Sacrament Preparation | St. Patrick in Armonk"
        description="Track your family's sacrament preparation progress — Baptism, First Communion, and Confirmation steps at St. Patrick Church."
      />

      <div className="container max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Sacrament Preparation</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Follow the steps below to prepare for each sacrament. Contact the parish office if you have questions about your family's progress.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="baptism" className="text-xs sm:text-sm">
              <Baby className="w-4 h-4 mr-1.5 hidden sm:inline" /> Baptism
            </TabsTrigger>
            <TabsTrigger value="firstCommunion" className="text-xs sm:text-sm">
              <Heart className="w-4 h-4 mr-1.5 hidden sm:inline" /> First Communion
            </TabsTrigger>
            <TabsTrigger value="confirmation" className="text-xs sm:text-sm">
              <Cross className="w-4 h-4 mr-1.5 hidden sm:inline" /> Confirmation
            </TabsTrigger>
          </TabsList>

          {Object.entries(SACRAMENT_TRACKS).map(([key, track]) => (
            <TabsContent key={key} value={key}>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className={track.color}>{track.icon}</span>
                    {key === "baptism" ? "Baptism" : key === "firstCommunion" ? "First Holy Communion" : "Confirmation"} Preparation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {track.steps.map((step, idx) => (
                      <StepItem key={idx} step={step} index={idx} total={track.steps.length} color={track.color} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="mt-6 bg-muted/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact the parish office at <a href="tel:9142739724" className="text-primary font-medium">(914) 273-9724</a> or email for guidance on your family's sacrament preparation journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

function StepItem({ step, index, total, color }: { step: Step; index: number; total: number; color: string }) {
  return (
    <div className="flex gap-3 relative">
      {/* Vertical line connector */}
      {index < total - 1 && (
        <div className="absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-8px)] bg-border" />
      )}
      {/* Step circle */}
      <div className="shrink-0 mt-1">
        <Circle className={`w-[22px] h-[22px] ${color} opacity-40`} />
      </div>
      {/* Step content */}
      <div className="pb-5 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground">{step.title}</span>
          {step.required && <Badge variant="secondary" className="text-xs px-1.5 py-0">Required</Badge>}
          {!step.required && <Badge variant="outline" className="text-xs px-1.5 py-0">Optional</Badge>}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}
