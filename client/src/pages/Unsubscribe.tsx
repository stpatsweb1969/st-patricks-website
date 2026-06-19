import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { MailX, CheckCircle } from "lucide-react";

export default function Unsubscribe() {
  const { token } = useParams<{ token: string }>();
  const [done, setDone] = useState(false);
  const mutation = trpc.subscriptions.unsubscribe.useMutation({
    onSuccess: () => {
      setDone(true);
      toast.success("You have been unsubscribed.");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <PageLayout>
      <section className="container py-24 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            {done ? (
              <>
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">Unsubscribed</h2>
                <p className="text-muted-foreground">
                  You have been successfully unsubscribed from parish email updates.
                </p>
              </>
            ) : (
              <>
                <MailX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">Unsubscribe</h2>
                <p className="text-muted-foreground mb-6">
                  Click the button below to unsubscribe from parish email notifications.
                </p>
                <Button
                  onClick={() => token && mutation.mutate({ token })}
                  disabled={mutation.isPending}
                  variant="destructive"
                >
                  {mutation.isPending ? "Processing..." : "Confirm Unsubscribe"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </PageLayout>
  );
}
