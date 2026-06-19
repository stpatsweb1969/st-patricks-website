import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

const FORM_TYPES = [
  { value: "baptism", label: "Baptism Registrations" },
  { value: "sponsor", label: "Sponsor Certificates" },
  { value: "marriage", label: "Marriage Inquiries" },
  { value: "funeral", label: "Funeral Pre-Planning" },
  { value: "teenLife", label: "Teen Life Registrations" },
  { value: "parishRegistration", label: "Parish Registrations" },
  { value: "ccdRegistration", label: "CCD Registrations" },
] as const;

type FormType = typeof FORM_TYPES[number]["value"];

export function FormExport() {
  const [selectedType, setSelectedType] = useState<FormType>("baptism");
  const exportMutation = trpc.formExport.exportCsv.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({ type: selectedType });
      if (result.rowCount === 0) {
        toast.info("No submissions found for this form type.");
        return;
      }
      // Download as CSV file
      const blob = new Blob([result.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedType}-submissions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.rowCount} submissions as CSV`);
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Form Submissions Export</h2>
        <Badge variant="outline"><FileSpreadsheet className="w-3 h-3 mr-1" /> CSV / Google Sheets</Badge>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Export form submissions as CSV files. You can import these directly into Google Sheets, Excel, or any spreadsheet application.
          </p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Form Type</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as FormType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORM_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} disabled={exportMutation.isPending} className="gap-2">
              {exportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-medium mb-2">Google Sheets Integration</h3>
          <p className="text-sm text-muted-foreground">
            To automatically push submissions to Google Sheets, ask the Manus agent to set up the integration.
            The agent can create a dedicated spreadsheet and configure automatic exports using the Google Sheets API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
