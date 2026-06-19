import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Heart, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function TeenLife() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    teenFirstName: "",
    teenLastName: "",
    grade: "",
    school: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
    interests: "",
    medicalNotes: "",
    emergencyContact: "",
    emergencyPhone: "",
    photoConsent: false,
  });

  const registerMutation = trpc.teenLife.register.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit registration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teenFirstName || !form.teenLastName || !form.grade || !form.parentName || !form.parentEmail || !form.parentPhone) {
      toast.error("Please fill in all required fields");
      return;
    }
    registerMutation.mutate(form);
  };

  return (
    <PageLayout>
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Youth Ministry"
        title="Teen Life"
        description="Programs and community for high school students."
      />


      <section className="py-12">
        <div className="container max-w-5xl">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Build lasting friendships with other Catholic teens in a supportive environment.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Events</h3>
              <p className="text-sm text-muted-foreground">
                Regular gatherings, retreats, service projects, and social events throughout the year.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Service</h3>
              <p className="text-sm text-muted-foreground">
                Opportunities to give back to the community and grow in faith through service.
              </p>
            </Card>
          </div>

          {/* Registration Form */}
          {submitted ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Registration Submitted!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Thank you for registering for Teen Life! The parish youth ministry team will be in touch with more information about upcoming events and meetings.
              </p>
              <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ teenFirstName: "", teenLastName: "", grade: "", school: "", parentName: "", parentEmail: "", parentPhone: "", address: "", interests: "", medicalNotes: "", emergencyContact: "", emergencyPhone: "", photoConsent: false }); }}>
                Register Another Teen
              </Button>
            </Card>
          ) : (
            <Card className="p-6 md:p-8 mb-8">
              <h2 className="font-serif text-2xl text-foreground mb-2">Join Teen Life</h2>
              <p className="text-muted-foreground mb-6">
                Open to all high school students (grades 9–12). Fill out the form below to register.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Teen Information */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border">Teen Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">First Name *</label>
                      <Input value={form.teenFirstName} onChange={(e) => setForm({ ...form, teenFirstName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Last Name *</label>
                      <Input value={form.teenLastName} onChange={(e) => setForm({ ...form, teenLastName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Grade *</label>
                      <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
                        <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">School</label>
                      <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="e.g., Byram Hills High School" />
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border">Parent/Guardian Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Parent/Guardian Name *</label>
                      <Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                      <Input type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Phone *</label>
                      <Input type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
                      <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State, ZIP" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border">Emergency Contact (other than parent)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Emergency Contact Name</label>
                      <Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Emergency Contact Phone</label>
                      <Input type="tel" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Interests & Activities</label>
                      <Textarea value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="What activities or topics interest your teen? (e.g., service projects, retreats, social events, Bible study)" rows={3} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Medical Notes / Allergies</label>
                      <Textarea value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} placeholder="Any medical conditions, allergies, or special needs we should be aware of" rows={2} />
                    </div>
                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="photoConsent"
                        checked={form.photoConsent}
                        onCheckedChange={(checked) => setForm({ ...form, photoConsent: checked === true })}
                      />
                      <label htmlFor="photoConsent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I give permission for my teen's photo to be used in parish publications, social media, and the parish website.
                      </label>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Submitting..." : "Submit Registration"}
                </Button>
              </form>
            </Card>
          )}

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="p-6">
              <h3 className="font-serif text-lg text-foreground mb-3">Meeting Schedule</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Teen Life meets in <strong>St. Francis Hall</strong> (the gym) throughout the school year. Check the parish calendar for upcoming events and gatherings.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/calendar">View Calendar</a>
              </Button>
            </Card>
            <Card className="p-6">
              <h3 className="font-serif text-lg text-foreground mb-3">Contact</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                For questions about Teen Life, contact the parish youth ministry office.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/contact">Contact Us</a>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
