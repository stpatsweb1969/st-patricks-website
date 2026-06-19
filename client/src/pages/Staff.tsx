import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useReveal } from "@/hooks/useReveal";
import { Phone, Mail, Users, Cross, BookOpen, Heart } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  category: string;
  phone?: string | null;
  email?: string | null;
  sortOrder: number;
}

const categoryMeta: Record<string, { label: string; icon: typeof Cross; description: string }> = {
  clergy: { label: "Clergy", icon: Cross, description: "Our priests and deacons" },
  staff: { label: "Parish Staff", icon: Users, description: "Dedicated team serving the parish" },
  leadership: { label: "Parish Leadership", icon: Users, description: "Council and trustees" },
  ministry_leader: { label: "Ministry Leaders", icon: Heart, description: "Coordinators of parish ministries" },
  emeritus: { label: "In Memoriam", icon: BookOpen, description: "Those who served before us" },
};

const categoryOrder = ["clergy", "staff", "leadership", "ministry_leader", "emeritus"];

function StaffRow({ member }: { member: StaffMember }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-border/50 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 sm:flex-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-serif font-bold text-xs">
            {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-foreground">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 ml-11 sm:ml-0">
        {member.phone && (
          <a href={`tel:${member.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Phone className="w-3 h-3" />
            {member.phone}
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Mail className="w-3 h-3" />
            <span className="break-all">{member.email}</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default function Staff() {
  const revealRef = useReveal();
  const { data: staffList, isLoading } = trpc.staff.list.useQuery();

  const grouped = useMemo(() => {
    if (!staffList) return {};
    const map: Record<string, StaffMember[]> = {};
    for (const m of staffList) {
      if (!map[m.category]) map[m.category] = [];
      map[m.category].push(m);
    }
    return map;
  }, [staffList]);

  return (
    <PageLayout>
      <SEO
        title="Our Staff"
        path="/staff"
        description="Meet the clergy and staff of St. Patrick Church, Armonk NY. Our dedicated team serves the parish community with faith and compassion."
      />
      <PageHeader
        eyebrow="Our Team"
        title="Staff & Directory"
        description="The dedicated people who serve our parish community every day."
      />

      <div ref={revealRef}>
        <section className="container py-6 sm:py-10 max-w-4xl">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}><CardContent className="py-6"><Skeleton className="h-6 w-48 mb-4" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={["clergy", "staff", "leadership"]} className="space-y-2.5">
              {categoryOrder.filter(cat => grouped[cat]?.length).map(cat => {
                const meta = categoryMeta[cat] || { label: cat, icon: Users, description: "" };
                const Icon = meta.icon;
                return (
                  <AccordionItem key={cat} value={cat} className="reveal border border-border/50 rounded-xl px-4 sm:px-5 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <span className="font-serif text-lg font-bold text-foreground">{meta.label}</span>
                          <p className="text-xs text-muted-foreground font-normal">{meta.description}</p>
                        </div>
                        {cat !== "emeritus" && grouped[cat] && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{grouped[cat]!.length}</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      {cat === "emeritus" ? (
                        <div className="space-y-2">
                          {grouped[cat]!.map(m => (
                            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-b-0">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{m.name}</p>
                                <p className="text-xs text-muted-foreground italic">{m.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        grouped[cat]!.map(m => <StaffRow key={m.id} member={m} />)
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}

              {/* Department Directory */}
              <AccordionItem value="directory" className="reveal border border-primary/20 rounded-xl px-4 sm:px-5 bg-primary/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-serif text-lg font-bold text-foreground">Department Directory</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <DepartmentContacts />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Office Hours Banner */}
          <div className="reveal mt-8">
            <Card className="bg-primary/[0.04] border border-primary/15 rounded-xl">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Office Hours</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <p className="text-sm text-muted-foreground">Monday – Thursday, 9:00 AM – 5:00 PM</p>
                  <a href="tel:9142739724" className="text-sm font-medium text-primary hover:underline sm:ml-auto">
                    (914) 273-9724
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

function DepartmentContacts() {
  const contacts = [
    { department: "Parish Office", phone: "(914) 273-9724", email: "office@stpatrickinarmonk.org" },
    { department: "Pastor", phone: "(914) 531-1760", email: "Pastor.stpats@outlook.com" },
    { department: "Deacon", phone: "(914) 531-1760", email: "john.erickson@stpatrickinarmonk.org" },
    { department: "Religious Education", phone: "(914) 531-1759", email: "reled@stpatrickinarmonk.org" },
    { department: "Bulletin", phone: "(914) 531-1760", email: "bulletin.editor@stpatrickinarmonk.org" },
    { department: "Music Ministry", email: "MusicAtStPats@gmail.com" },
    { department: "Youth Ministry (Teen Life)", email: "teenlife@stpatrickinarmonk.org" },
    { department: "Parish Council", email: "ParishCouncilPresident@stpatrickinarmonk.org" },
    { department: "Food Pantry", email: "FoodPantry@stpatrickinarmonk.org" },
    { department: "St. Francis Hall / Gym", phone: "(914) 468-5938", email: "gym@stpatrickinarmonk.org" },
    { department: "Walking with Purpose", phone: "(914) 273-9483" },
    { department: "Contemplative Prayer", phone: "(914) 767-9096", email: "ContemplativePrayer@stpatrickinarmonk.org" },
    { department: "Project Embrace", email: "projectembrace@parishmail.com" },
  ];

  return (
    <div className="space-y-0">
      <p className="text-sm text-muted-foreground mb-4">Quick reference for all parish department contacts.</p>
      {contacts.map(c => (
        <div key={c.department} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-border/50 last:border-b-0">
          <p className="font-medium text-sm text-foreground sm:w-48 shrink-0">{c.department}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {c.phone && (
              <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Phone className="w-3 h-3" />{c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Mail className="w-3 h-3" /><span className="break-all">{c.email}</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
