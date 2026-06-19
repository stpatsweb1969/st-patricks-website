/**
 * Fullscreen overlay for the Bulletin Book Reader.
 */

import { Document, Page } from "react-pdf";
import { NavControls, FullscreenToolbar, LoadingState, ErrorState } from "./ReaderControls";

interface FullscreenOverlayProps {
  pdfUrl: string;
  title: string;
  numPages: number;
  currentPage: number;
  pageWidth: number;
  zoom: number;
  onDocumentLoadSuccess: (result: { numPages: number }) => void;
  goToPrev: () => void;
  goToNext: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleFullscreen: (e?: React.MouseEvent) => void;
  setIsFullscreen: (v: boolean) => void;
  onClose?: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

export function FullscreenOverlay({
  pdfUrl, title, numPages, currentPage, pageWidth, zoom,
  onDocumentLoadSuccess, goToPrev, goToNext, zoomIn, zoomOut, resetZoom,
  toggleFullscreen, setIsFullscreen, onClose,
  handleTouchStart, handleTouchMove, handleTouchEnd,
}: FullscreenOverlayProps) {
  return (
    <div className="fixed inset-0 bg-neutral-900 flex flex-col" style={{ zIndex: 99999 }}>
      <FullscreenToolbar
        pdfUrl={pdfUrl}
        title={title}
        zoom={zoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        toggleFullscreen={toggleFullscreen}
        onClose={onClose}
        setIsFullscreen={setIsFullscreen}
      />

      <div
        className="flex-1 overflow-auto flex items-start justify-center py-4 px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<LoadingState dark />}
          error={<ErrorState dark pdfUrl={pdfUrl} />}
        >
          {numPages > 0 && (
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}>
              <Page
                pageNumber={currentPage}
                width={pageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </div>
          )}
        </Document>
      </div>

      <div className="shrink-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-2 safe-area-bottom">
        <NavControls dark currentPage={currentPage} numPages={numPages} goToPrev={goToPrev} goToNext={goToNext} />
      </div>
    </div>
  );
}
