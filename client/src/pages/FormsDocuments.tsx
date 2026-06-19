import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Download, ExternalLink, Loader2, Droplets, Cross, Heart, Church, BookOpen, FolderOpen } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const CATEGORIES = [
  { id: "baptism", label: "Baptism", icon: Droplets, description: "Registration and sponsor forms for Baptism" },
  { id: "confirmation", label: "Confirmation", icon: Cross, description: "Sponsor certificates, service forms, and preparation materials" },
  { id: "marriage", label: "Marriage", icon: Heart, description: "Wedding guidelines for parishioners and non-parishioners" },
  { id: "funeral", label: "Funeral", icon: Church, description: "Funeral preparation and planning forms" },
  { id: "ccd", label: "Religious Education (CCD)", icon: BookOpen, description: "Registration, calendars, bus forms, and volunteer sign-ups" },
  { id: "general", label: "General Parish Forms", icon: FolderOpen, description: "Other parish forms and documents" },
];

function CategorySection({ category }: { category: typeof CATEGORIES[number] }) {
  const { data: docs, isLoading } = trpc.documents.byCategory.useQuery({ category: category.id });
  const Icon = category.icon;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-foreground">{category.label}</h2>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      </Card>
    );
  }

  if (!docs || docs.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl text-foreground">{category.label}</h2>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
      </div>
      <div className="space-y-2">
        {docs.map((doc) => (
          <a
            key={doc.id}
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{doc.title}</p>
              {doc.description && <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>}
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
          </a>
        ))}
      </div>
    </Card>
  );
}

export default function FormsDocuments() {
  return (
    <PageLayout>
      <SEO
        title="Forms & Documents"
        path="/forms-documents"
        description="Download parish forms and documents — baptism registration, sponsor certificates, marriage inquiry, and other sacramental paperwork."
      />
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Resources"
        title="Forms & Documents"
        description="Download forms and reference documents for parish programs."
      />


      <section className="py-12">
        <div className="container max-w-4xl space-y-6">
          {CATEGORIES.map((cat) => (
            <CategorySection key={cat.id} category={cat} />
          ))}

          {/* Digital Forms Banner */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-serif text-lg text-foreground mb-2">Complete Forms Online</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Most parish forms are now available to complete digitally — no printing or scanning needed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <a href="/baptism-form" className="text-sm font-medium text-primary hover:underline">→ Baptism Registration</a>
              <a href="/sponsor-form" className="text-sm font-medium text-primary hover:underline">→ Sponsor Certificate</a>
              <a href="/marriage-form" className="text-sm font-medium text-primary hover:underline">→ Marriage Inquiry</a>
              <a href="/funeral-form" className="text-sm font-medium text-primary hover:underline">→ Funeral Planning</a>
              <a href="/ccd-registration" className="text-sm font-medium text-primary hover:underline">→ CCD Registration</a>
              <a href="/ccd-permissions" className="text-sm font-medium text-primary hover:underline">→ CCD Permission & Release</a>
              <a href="/serve" className="text-sm font-medium text-primary hover:underline">→ Volunteer Sign-Up</a>
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}
