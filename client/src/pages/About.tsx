import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useReveal } from "@/hooks/useReveal";
import { Church, Users, Heart, Cross, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function About() {
  const revealRef = useReveal();

  return (
    <PageLayout>
      <SEO
        title="About Our Parish"
        path="/about"
        description="Learn about St. Patrick Church in Armonk, NY — our history, mission, and vibrant Catholic community serving Westchester County since 1852."
      />
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Est. 1924"
        title="Our Parish"
        description="For a century, St. Patrick in Armonk has been a spiritual home for the Catholic community of northern Westchester."
      />

      <div ref={revealRef}>
        {/* Parish Story */}
        <section className="container py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="reveal grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 sm:gap-12 items-start">
              <div className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-2xl inline-block">
                  <Church className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-foreground">Our History</h2>
              </div>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  The Church of St. Patrick in Armonk was established in <strong className="text-foreground">1924</strong> to serve 
                  the growing Catholic community in northern Westchester County. What began as a small mission church 
                  has grown into a vibrant parish of over 1,500 families.
                </p>
                <p>
                  Our parish has been blessed with dedicated pastors, religious, and lay leaders who have guided 
                  the community through decades of growth and change. The current church building, located at 
                  <strong className="text-foreground"> 29 Cox Avenue</strong>, stands as a testament to the faith and 
                  generosity of generations of parishioners.
                </p>
                <p>
                  Today, St. Patrick in Armonk continues to be a welcoming community rooted in the traditions of the 
                  Catholic faith while embracing the needs of modern families. Our parish is part of the 
                  <a href="https://archny.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium"> Archdiocese of New York</a>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Armonk Cross */}
        <section className="bg-muted/30 py-8 sm:py-12">
          <div className="container">
            <div className="reveal max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 sm:gap-12 items-start">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Cross className="w-6 h-6 text-primary" />
                    <h2 className="font-serif text-3xl font-bold text-foreground">The Armonk Cross</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    In the aftermath of the September 11, 2001 attacks, a steel cross beam was recovered from 
                    the wreckage of the World Trade Center. This cross — forged in the fires of that tragic day — 
                    was brought to St. Patrick's in Armonk as a memorial to the lives lost, including members 
                    of our own parish community.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The Armonk Cross stands on our parish grounds as a powerful symbol of faith, hope, and 
                    resilience. It reminds us that even in the darkest moments, God's love endures. The cross 
                    has become a place of prayer and reflection for parishioners and visitors alike.
                  </p>
                  <blockquote className="border-l-4 border-gold pl-4 italic text-foreground/80">
                    "We will never forget. In this cross, we find hope."
                  </blockquote>
                </div>
                <div className="bg-primary/5 rounded-2xl p-8 text-center">
                  <Cross className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg font-semibold text-foreground">September 11 Memorial</p>
                  <p className="text-sm text-muted-foreground mt-2">Parish Grounds</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Facilities */}
        <section className="container py-8 sm:py-12">
          <div className="reveal max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground text-center mb-6 sm:mb-10">Our Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-border/50 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">Wallace Hall</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The parish hall for community and ministry gatherings, religious education classes, receptions, and group meetings. Named in honor of our founding pastor, Rev. Msgr. John J. Wallace.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/50 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">St. Francis Hall</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our gymnasium and youth activity center. Home to Teen Life events, CYO basketball, and youth gatherings. Contact: <a href="mailto:gym@stpatrickinarmonk.org" className="text-primary hover:underline">gym@stpatrickinarmonk.org</a> or (914) 468-5938.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="container py-8 sm:py-12">
          <h2 className="reveal font-serif text-2xl sm:text-3xl font-bold text-foreground text-center mb-6 sm:mb-10">
            Get to Know Us
          </h2>
          <div className="reveal grid grid-cols-3 gap-2 sm:gap-6 max-w-4xl mx-auto">
            <Link href="/staff">
              <Card className="cursor-pointer h-full border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <CardContent className="p-3 sm:p-8 text-center">
                  <Users className="w-6 h-6 sm:w-10 sm:h-10 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-semibold text-xs sm:text-lg mb-0.5 sm:mb-2">Staff</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-4 hidden sm:block">
                    Meet our pastor, staff, and parish council members.
                  </p>
                  <span className="text-xs sm:text-sm text-primary font-medium inline-flex items-center gap-0.5">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/parish-registration">
              <Card className="cursor-pointer h-full border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <CardContent className="p-3 sm:p-8 text-center">
                  <Heart className="w-6 h-6 sm:w-10 sm:h-10 text-accent mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-semibold text-xs sm:text-lg mb-0.5 sm:mb-2">Register</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-4 hidden sm:block">
                    Welcome! Register to become part of our parish family.
                  </p>
                  <span className="text-xs sm:text-sm text-primary font-medium inline-flex items-center gap-0.5">
                    Join <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/contact">
              <Card className="cursor-pointer h-full border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <CardContent className="p-3 sm:p-8 text-center">
                  <Church className="w-6 h-6 sm:w-10 sm:h-10 text-primary mx-auto mb-2 sm:mb-4" />
                  <h3 className="font-semibold text-xs sm:text-lg mb-0.5 sm:mb-2">Visit</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-4 hidden sm:block">
                    29 Cox Ave, Armonk NY 10504. All are welcome.
                  </p>
                  <span className="text-xs sm:text-sm text-primary font-medium inline-flex items-center gap-0.5">
                    Map <ArrowRight className="w-3 h-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
