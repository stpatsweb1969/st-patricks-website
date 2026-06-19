import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import PageHeader from "@/components/PageHeader";

export default function Contact() {
  const revealRef = useReveal();

  return (
    <PageLayout>
      <SEO
        title="Contact Us"
        path="/contact"
        description="Contact St. Patrick Church, Armonk NY. Phone: (914) 273-9724. Address: 29 Cox Avenue, Armonk, NY 10504. Office hours and directions."
      />
      {/* Page Header */}
      <PageHeader
        eyebrow="Get in Touch"
        title="Contact Us"
        description="We'd love to hear from you. Reach out to our parish office."
      />

      <div ref={revealRef}>
        <section className="container py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {/* Contact Info */}
            <div className="reveal space-y-4">
              <Card className="border border-border/50 border-t-3 border-t-primary shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                <CardContent className="p-5 sm:p-6 space-y-5">
                  <h2 className="font-serif text-xl font-bold">Parish Office</h2>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-primary/8 p-2 rounded-lg shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">Address</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        St. Patrick in Armonk<br />
                        29 Cox Ave, Armonk NY 10504<br />
                        P.O. Box 6
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-primary/8 p-2 rounded-lg shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">Phone</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Parish Office: <a href="tel:9142739724" className="text-primary hover:underline font-medium">(914) 273-9724</a><br />
                        Cell: <a href="tel:9145311760" className="text-primary hover:underline font-medium">(914) 531-1760</a><br />
                        Religious Ed: <a href="tel:9145311759" className="text-primary hover:underline font-medium">(914) 531-1759</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-primary/8 p-2 rounded-lg shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">Office Hours</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Monday – Thursday: 9:00 AM – 5:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-primary/8 p-2 rounded-lg shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">Stay Connected</h3>
                      <p className="text-sm text-muted-foreground">
                        <a href="https://stpatarmonk.flocknote.com/home" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                          Join us on Flocknote
                        </a>{" "}
                        for parish communications.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Directions */}
              <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-1.5">Directions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    St. Patrick in Armonk is located on Cox Avenue in Armonk, NY.
                    The church is easily accessible from Route 22 and I-684.
                  </p>
                  <a
                    href="https://maps.app.goo.gl/pJurvjFAJpURmvmMA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    Get Directions →
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Map — Google Maps Embed */}
            <div className="reveal rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border/50" style={{ height: "320px" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2719.6433430905527!2d-73.69853192447971!3d41.12789521205174!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2bc8b797bbe9b%3A0xe385674ce65dcc3b!2sSt%20Patrick&#39;s%20Church!5e1!3m2!1sen!2sus!4v1781836245699!5m2!1sen!2sus"
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="St. Patrick in Armonk — Google Maps"
              />
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
