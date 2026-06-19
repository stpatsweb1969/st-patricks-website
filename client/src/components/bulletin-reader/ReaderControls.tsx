/**
 * Shared controls for the Bulletin Book Reader — navigation, zoom, loading/error states.
 */

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavControlsProps {
  dark?: boolean;
  currentPage: number;
  numPages: number;
  goToPrev: () => void;
  goToNext: () => void;
}

export function NavControls({ dark = false, currentPage, numPages, goToPrev, goToNext }: NavControlsProps) {
  return (
    <div className={`flex items-center justify-between gap-2 ${dark ? "text-white" : "text-foreground"}`}>
      <Button variant="ghost" size="sm" onClick={goToPrev} disabled={currentPage <= 1}
        className={`h-9 w-9 p-0 shrink-0 ${dark ? "text-white hover:bg-white/10 disabled:opacity-20" : "disabled:opacity-30"}`}>
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <span className={`text-sm tabular-nums ${dark ? "text-white/80" : "text-muted-foreground"}`}>
        Page {currentPage} of {numPages || "..."}
      </span>
      <Button variant="ghost" size="sm" onClick={goToNext} disabled={currentPage >= numPages}
        className={`h-9 w-9 p-0 shrink-0 ${dark ? "text-white hover:bg-white/10 disabled:opacity-20" : "disabled:opacity-30"}`}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}

interface ToolbarProps {
  pdfUrl: string;
  title: string;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleFullscreen: (e?: React.MouseEvent) => void;
  onClose?: () => void;
  setIsFullscreen: (v: boolean) => void;
}

export function FullscreenToolbar({ pdfUrl, title, zoom, zoomIn, zoomOut, resetZoom, toggleFullscreen, onClose, setIsFullscreen }: ToolbarProps) {
  const zoomPercent = Math.round(zoom * 100);
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-black/80 backdrop-blur-sm border-b border-white/10 shrink-0 safe-area-top">
      <h3 className="font-serif font-semibold truncate text-white text-sm flex-1 mr-3">{title}</h3>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={zoomOut} disabled={zoom <= 0.5}
          className="text-white hover:bg-white/10 disabled:opacity-30 h-8 w-8 p-0" title="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <button onClick={resetZoom} className="text-xs text-white/70 hover:text-white tabular-nums min-w-[2.5rem] text-center">
          {zoomPercent}%
        </button>
        <Button variant="ghost" size="sm" onClick={zoomIn} disabled={zoom >= 3.0}
          className="text-white hover:bg-white/10 disabled:opacity-30 h-8 w-8 p-0" title="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 w-8 p-0" title="Download PDF">
            <Download className="w-4 h-4" />
          </Button>
        </a>
        <Button variant="ghost" size="sm" onClick={toggleFullscreen}
          className="text-white hover:bg-white/10 h-8 w-8 p-0" title="Exit full screen">
          <Minimize2 className="w-4 h-4" />
        </Button>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={() => { setIsFullscreen(false); onClose(); }}
            className="text-white hover:bg-white/10 h-8 w-8 p-0" title="Close">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function LoadingState({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <div className="text-center">
        <div className={`w-8 h-8 border-2 ${dark ? "border-white border-t-transparent" : "border-primary border-t-transparent"} rounded-full animate-spin mx-auto mb-2`} />
        <p className={`text-sm ${dark ? "text-white/70" : "text-muted-foreground"}`}>Loading bulletin...</p>
      </div>
    </div>
  );
}

export function ErrorState({ dark = false, pdfUrl }: { dark?: boolean; pdfUrl: string }) {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <div className="text-center">
        <p className={`text-sm ${dark ? "text-white/70" : "text-muted-foreground"}`}>Unable to load PDF.</p>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline mt-2 inline-block">
          Download instead
        </a>
      </div>
    </div>
  );
}
