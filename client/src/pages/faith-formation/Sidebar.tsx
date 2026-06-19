/**
 * Faith Formation sidebar cards.
 */

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Phone, Calendar } from "lucide-react";
import { Link } from "wouter";

export function FaithFormationSidebar() {
  return (
    <div className="reveal space-y-3">
      <Card className="bg-primary text-white shadow-lg border-0">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gold shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Religious Education Office</h3>
              <p className="text-white/80 text-xs">For registration and program inquiries:</p>
            </div>
          </div>
          <a href="tel:9145311759" className="font-bold text-sm mt-1.5 block hover:text-gold transition-colors">(914) 531-1759</a>
          <a href="mailto:parishoffice@stpatricksarmonk.org" className="text-xs text-white/80 hover:text-gold mt-0.5 block transition-colors">parishoffice@stpatricksarmonk.org</a>
        </CardContent>
      </Card>

      <Card className="hover-glow transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">CCD Calendar</h3>
              <p className="text-muted-foreground text-xs">Class schedule, key dates, and special events.</p>
            </div>
          </div>
          <Link href="/calendar?filter=ccd" className="text-xs text-primary hover:underline font-medium mt-2 block">View CCD Calendar →</Link>
        </CardContent>
      </Card>

      <Card className="bg-accent/10 border-accent/20 hover-glow transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-accent shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">FORMED</h3>
              <p className="text-muted-foreground text-xs">Free Catholic content — movies, shows, audiobooks, and more.</p>
            </div>
          </div>
          <a href="https://stpatrickinarmonk.formed.org" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline mt-2 block">Visit FORMED →</a>
        </CardContent>
      </Card>
    </div>
  );
}
