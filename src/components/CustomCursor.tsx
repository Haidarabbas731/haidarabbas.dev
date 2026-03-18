import { useEffect, useRef } from "react";

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.transform = `translate(${trailX - 20}px, ${trailY - 20}px)`;
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    animate();

    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{ background: "hsl(var(--primary))", boxShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
      />
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] hidden md:block"
        style={{ border: "1px solid hsl(var(--primary) / 0.3)", background: "hsl(var(--primary) / 0.05)" }}
      />
    </>
  );
};

export default CustomCursor;
