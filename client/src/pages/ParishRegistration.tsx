import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, CheckCircle, Church } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function ParishRegistration() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    headOfHousehold: "",
    spouseName: "",
    address: "",
    city: "",
    state: "NY",
    zip: "",
    phone: "",
    email: "",
    previousParish: "",
    numChildren: "",
    notes: "",
  });

  const mutation = trpc.parishRegistration.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Registration submitted successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.headOfHousehold || !form.address || !form.phone || !form.email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    mutation.mutate(form);
  };

  if (submitted) {
    return (
      <PageLayout>
        <section className="container py-20 md:py-28">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4 animate-fade-in">
              Welcome to St. Patrick in Armonk!
            </h1>
            <p className="text-muted-foreground text-lg mb-6 animate-fade-up">
              Thank you for registering. Our parish office will be in touch soon to welcome 
              you to our community. We're so glad you're here.
            </p>
            <Button onClick={() => { setSubmitted(false); setForm({ headOfHousehold: "", spouseName: "", address: "", city: "", state: "NY", zip: "", phone: "", email: "", previousParish: "", numChildren: "", notes: "" }); }} variant="outline">
              Submit Another Registration
            </Button>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Page Header — refined */}
      <PageHeader
        eyebrow="Join Our Parish"
        title="New Parishioner Registration"
        description="Welcome! Register to become a member of St. Patrick in Armonk."
      />


      <section className="container py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          {/* Family Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Church className="w-5 h-5 text-primary" />
                Family Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="head">Head of Household *</Label>
                  <Input
                    id="head"
                    placeholder="Full name"
                    value={form.headOfHousehold}
                    onChange={(e) => setForm({ ...form, headOfHousehold: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouse">Spouse Name</Label>
                  <Input
                    id="spouse"
                    placeholder="Full name (if applicable)"
                    value={form.spouseName}
                    onChange={(e) => setForm({ ...form, spouseName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Armonk"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP *</Label>
                  <Input
                    id="zip"
                    placeholder="10504"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(914) 555-0123"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previous">Previous Parish</Label>
                  <Input
                    id="previous"
                    placeholder="Name and city of previous parish"
                    value={form.previousParish}
                    onChange={(e) => setForm({ ...form, previousParish: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Number of Children</Label>
                  <Select value={form.numChildren} onValueChange={(v) => setForm({ ...form, numChildren: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5 or more</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Anything else you'd like us to know?</Label>
                <Textarea
                  id="notes"
                  placeholder="Special interests, ministries you'd like to join, questions for the office..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 press-scale"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Register Our Family"}
            </Button>
          </div>
        </form>
      </section>
    </PageLayout>
  );
}
