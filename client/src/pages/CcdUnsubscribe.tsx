import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function CcdUnsubscribe() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`/api/ccd-unsubscribe?token=${encodeURIComponent(token)}`)
      .then(res => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <PageLayout>
      <section className="py-20">
        <div className="container max-w-lg">
          <Card className="p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h1 className="font-serif text-2xl text-foreground mb-2">Processing...</h1>
                <p className="text-muted-foreground">Please wait while we update your preferences.</p>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h1 className="font-serif text-2xl text-foreground mb-2">Unsubscribed Successfully</h1>
                <p className="text-muted-foreground mb-6">
                  You will no longer receive CCD class reminder emails. If you change your mind, please contact the Religious Education office.
                </p>
                <Link href="/">
                  <Button>Return to Homepage</Button>
                </Link>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h1 className="font-serif text-2xl text-foreground mb-2">Something Went Wrong</h1>
                <p className="text-muted-foreground mb-6">
                  We couldn't process your unsubscribe request. The link may be invalid or expired. Please contact the parish office for assistance.
                </p>
                <Link href="/contact">
                  <Button>Contact Us</Button>
                </Link>
              </>
            )}
          </Card>
        </div>
      </section>
    </PageLayout>
  );
}
