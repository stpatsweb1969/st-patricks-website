/**
 * Bulletin Archive — Filterable, paginated list of past bulletins.
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, ChevronLeft, ChevronRight, X, Search, Eye } from "lucide-react";
import { format } from "date-fns";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ITEMS_PER_PAGE = 20;

interface BulletinItem {
  id: number;
  title: string;
  description?: string | null;
  weekDate: string | Date;
  pdfUrl: string;
  [key: string]: any;
}

interface BulletinArchiveProps {
  bulletins: BulletinItem[];
  onViewBulletin: (bulletin: BulletinItem) => void;
}

export function BulletinArchive({ bulletins, onViewBulletin }: BulletinArchiveProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    bulletins.forEach((b) => years.add(new Date(b.weekDate).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [bulletins]);

  const availableMonths = useMemo(() => {
    if (selectedYear === "all") return Array.from({ length: 12 }, (_, i) => i);
    const months = new Set<number>();
    bulletins.forEach((b) => {
      const d = new Date(b.weekDate);
      if (d.getFullYear() === Number(selectedYear)) months.add(d.getMonth());
    });
    return Array.from(months).sort((a, b) => b - a);
  }, [bulletins, selectedYear]);

  const filteredBulletins = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return bulletins.filter((b) => {
      const d = new Date(b.weekDate);
      if (selectedYear !== "all" && d.getFullYear() !== Number(selectedYear)) return false;
      if (selectedMonth !== "all" && d.getMonth() !== Number(selectedMonth)) return false;
      if (query) {
        const titleMatch = b.title?.toLowerCase().includes(query);
        const descMatch = b.description?.toLowerCase().includes(query);
        const dateStr = format(d, "MMMM d, yyyy").toLowerCase();
        const dateMatch = dateStr.includes(query);
        if (!titleMatch && !descMatch && !dateMatch) return false;
      }
      return true;
    });
  }, [bulletins, selectedYear, selectedMonth, searchQuery]);

  const hasActiveFilter = selectedYear !== "all" || selectedMonth !== "all" || searchQuery.trim() !== "";
  const totalPages = Math.ceil(filteredBulletins.length / ITEMS_PER_PAGE);
  const paginatedBulletins = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBulletins.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBulletins, currentPage]);

  const clearFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <h3 className="font-serif text-lg font-bold text-foreground">Past Bulletins</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setSelectedMonth("all"); setCurrentPage(1); }}>
            <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((month) => <SelectItem key={month} value={String(month)}>{MONTH_NAMES[month]}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasActiveFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground">
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
        <Input
          type="text"
          placeholder="Search bulletins..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="pl-9 h-8 text-sm"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {hasActiveFilter && (
        <p className="text-xs text-muted-foreground mb-3">
          {filteredBulletins.length} bulletin{filteredBulletins.length !== 1 ? "s" : ""} found
        </p>
      )}

      {filteredBulletins.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No bulletins found.</p>
          <Button variant="link" size="sm" onClick={clearFilters} className="mt-1 text-xs">Clear filters</Button>
        </div>
      ) : (
        <div>
          <div className="divide-y divide-border/50 border rounded-lg overflow-hidden">
            {paginatedBulletins.map((bulletin) => {
              const weekDate = new Date(bulletin.weekDate);
              return (
                <div key={bulletin.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors group">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-xs font-bold uppercase text-muted-foreground leading-none">{format(weekDate, "MMM")}</p>
                    <p className="text-lg font-bold text-foreground leading-tight">{format(weekDate, "d")}</p>
                    <p className="text-xs text-muted-foreground leading-none">{format(weekDate, "yyyy")}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {bulletin.title || `Bulletin — ${format(weekDate, "MMMM d, yyyy")}`}
                    </p>
                    {bulletin.description && <p className="text-sm text-muted-foreground truncate">{bulletin.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" onClick={() => onViewBulletin(bulletin)} title="Read inline">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <a href={bulletin.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" title="Download PDF">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-3">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 px-2 text-xs">
                <ChevronLeft className="w-3 h-3 mr-1" /> Newer
              </Button>
              <span className="text-xs text-muted-foreground">{currentPage} / {totalPages}</span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 px-2 text-xs">
                Older <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
