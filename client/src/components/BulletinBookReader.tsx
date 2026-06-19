/**
 * Bulletin Book Reader — PDF viewer with inline and fullscreen modes.
 * Also handles HTML bulletins (composed in-app) via iframe rendering.
 * Composed from bulletin-reader/ sub-components.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Maximize2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { NavControls, LoadingState, ErrorState } from "./bulletin-reader/ReaderControls";
import { FullscreenOverlay } from "./bulletin-reader/FullscreenOverlay";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BulletinBookReaderProps {
  pdfUrl: string;
  title: string;
  onClose?: () => void;
}

/** Detect if the URL points to an HTML file (composed bulletin) vs a PDF */
function isHtmlBulletin(url: string): boolean {
  // Strip query params and check extension
  const path = url.split("?")[0];
  return path.endsWith(".html") || path.endsWith(".htm");
}

/** HTML Bulletin Viewer — renders composed bulletins in an iframe */
function HtmlBulletinViewer({ pdfUrl, title, onClose }: BulletinBookReaderProps) {
  // Auto-fullscreen on mobile for better reading experience
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const [isFullscreen, setIsFullscreen] = useState(isMobile);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => { document.body.style.overflow = ""; document.body.style.position = ""; document.body.style.width = ""; document.body.style.top = ""; };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  const toggleFullscreen = (e?: React.MouseEvent) => { if (e) { e.preventDefault(); e.stopPropagation(); } setIsFullscreen(!isFullscreen); };

  const iframeContent = (
    <iframe
      src={pdfUrl}
      title={title}
      className="w-full border-0"
      style={{ height: isFullscreen ? "calc(100vh - 56px)" : "500px" }}
      sandbox="allow-same-origin"
    />
  );

  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
          <h3 className="text-white font-serif font-semibold truncate text-sm flex-1 mr-2">{title}</h3>
          <div className="flex items-center gap-1">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 w-8 p-0" title="Open in new tab"><Download className="w-4 h-4" /></Button>
            </a>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)} className="text-white hover:bg-white/10 h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white">
          {iframeContent}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="relative w-full bg-stone-50 rounded-xl overflow-hidden border border-border/40">
      <div className="flex items-center justify-between w-full px-3 sm:px-4 py-2.5 border-b border-border/40 bg-white/80">
        <h3 className="font-serif font-semibold truncate text-foreground text-sm flex-1 mr-2">{title}</h3>
        <div className="flex items-center gap-1">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Open in new tab"><Download className="w-4 h-4" /></Button>
          </a>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} title="Full screen" className="h-8 w-8 p-0"><Maximize2 className="w-4 h-4" /></Button>
          {onClose && <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0"><X className="w-4 h-4" /></Button>}
        </div>
      </div>
      <div className="overflow-hidden">
        {iframeContent}
      </div>
    </div>
  );
}

export default function BulletinBookReader({ pdfUrl, title, onClose }: BulletinBookReaderProps) {
  // Route to HTML viewer for composed bulletins
  if (isHtmlBulletin(pdfUrl)) {
    return <HtmlBulletinViewer pdfUrl={pdfUrl} title={title} onClose={onClose} />;
  }

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [pageWidth, setPageWidth] = useState(350);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const updateWidth = () => {
      if (isFullscreen) setPageWidth(Math.min(window.innerWidth - 32, 900));
      else if (containerRef.current) setPageWidth(containerRef.current.clientWidth - 24);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => { document.body.style.overflow = ""; document.body.style.position = ""; document.body.style.width = ""; document.body.style.top = ""; };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPrev();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") goToNext();
      else if (e.key === "Escape") setIsFullscreen(false);
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen, currentPage, numPages]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => setNumPages(numPages), []);
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3.0));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const resetZoom = () => setZoom(1.0);
  const toggleFullscreen = (e?: React.MouseEvent) => { if (e) { e.preventDefault(); e.stopPropagation(); } setIsFullscreen(!isFullscreen); setZoom(1.0); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => { const diff = touchStartX.current - touchEndX.current; if (Math.abs(diff) > 50) { if (diff > 0) goToNext(); else goToPrev(); } };

  return (
    <>
      {isFullscreen && createPortal(
        <FullscreenOverlay
          pdfUrl={pdfUrl} title={title} numPages={numPages} currentPage={currentPage}
          pageWidth={pageWidth} zoom={zoom} onDocumentLoadSuccess={onDocumentLoadSuccess}
          goToPrev={goToPrev} goToNext={goToNext} zoomIn={zoomIn} zoomOut={zoomOut}
          resetZoom={resetZoom} toggleFullscreen={toggleFullscreen} setIsFullscreen={setIsFullscreen}
          onClose={onClose} handleTouchStart={handleTouchStart} handleTouchMove={handleTouchMove} handleTouchEnd={handleTouchEnd}
        />, document.body
      )}

      <div ref={containerRef} className="relative w-full bg-stone-50 rounded-xl overflow-hidden border border-border/40">
        <div className="flex items-center justify-between w-full px-3 sm:px-4 py-2.5 border-b border-border/40 bg-white/80">
          <h3 className="font-serif font-semibold truncate text-foreground text-sm flex-1 mr-2">{title}</h3>
          <div className="flex items-center gap-1">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF"><Download className="w-4 h-4" /></Button>
            </a>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} title="Full screen" className="h-8 w-8 p-0"><Maximize2 className="w-4 h-4" /></Button>
            {onClose && <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0"><X className="w-4 h-4" /></Button>}
          </div>
        </div>

        <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<LoadingState />} error={<ErrorState pdfUrl={pdfUrl} />}>
            {numPages > 0 && (
              <div className="flex items-center justify-center">
                <Page pageNumber={currentPage} width={pageWidth} renderTextLayer={false} renderAnnotationLayer={false} />
              </div>
            )}
          </Document>
        </div>

        {numPages > 0 && (
          <div className="border-t border-border/40 bg-white/80 px-3 py-2">
            <NavControls currentPage={currentPage} numPages={numPages} goToPrev={goToPrev} goToNext={goToNext} />
            <div className="sm:hidden mt-2">
              <button onClick={toggleFullscreen} className="w-full py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center gap-2 active:bg-primary/20 transition-colors">
                <Maximize2 className="w-4 h-4" /> Open Full Screen Reader
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
