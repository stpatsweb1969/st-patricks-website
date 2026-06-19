import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";

export default function CcdRegistration() {
  return (
    <PageLayout>
      <PageHeader
        eyebrow="Faith Formation"
        title="CCD Registration"
        description="Register your child for Religious Education classes at St. Patrick in Armonk."
      />

      <section className="py-10">
        <div className="container max-w-4xl">
          <iframe
            src="https://app.droplet.io/form/y5VX2N"
            title="CCD Registration Form"
            className="w-full border-0 rounded-lg shadow-sm"
            style={{ minHeight: "1200px" }}
            allow="payment"
          />
          <p className="text-xs text-muted-foreground text-center mt-4">
            Having trouble with the form?{" "}
            <a
              href="https://app.droplet.io/form/y5VX2N"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open it in a new tab
            </a>{" "}
            or contact us at{" "}
            <a href="mailto:reled@stpatrickinarmonk.org" className="text-primary hover:underline">
              reled@stpatrickinarmonk.org
            </a>
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
