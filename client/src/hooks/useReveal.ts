import { useEffect, useRef } from "react";

/**
 * Hook that adds the 'visible' class to elements with class 'reveal'
 * when they enter the viewport. Uses IntersectionObserver for performance.
 * Also uses MutationObserver to detect dynamically added .reveal elements
 * (e.g., sections that render after async data loads).
 */
export function useReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all current .reveal elements
    const observeAll = () => {
      const elements = container.querySelectorAll(".reveal:not(.visible)");
      elements.forEach((el) => observer.observe(el));
    };

    observeAll();

    // Watch for new .reveal elements added to the DOM (e.g., after data loads)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return containerRef;
}
