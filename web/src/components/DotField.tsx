import { useEffect, useRef } from "react";
export function DotField({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let pointer = { x: -1000, y: -1000 };
    let w = 0,
      h = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let y = 12; y < h; y += 22)
        for (let x = 12; x < w; x += 22) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          const center = Math.hypot((x - w * 0.65) / 1.15, y - h * 0.5);
          const orb = Math.max(0, 1 - Math.abs(center - 180) / 100);
          const proximity = reduced ? 0 : Math.max(0, 1 - d / 140);
          ctx.fillStyle = `rgba(${proximity > 0.1 ? "215,25,33" : "200,200,200"},${0.06 + orb * 0.11 + proximity * 0.45})`;
          ctx.beginPath();
          ctx.arc(x, y, 1 + proximity * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      frame = 0;
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const ratio = Math.min(devicePixelRatio, 2);
      c.width = w * ratio;
      c.height = h * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      request();
    };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      request();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(c);
    if (!reduced)
      window.addEventListener("pointermove", move, { passive: true });
    resize();
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);
  return <canvas className="dot-field" ref={ref} aria-hidden="true" />;
}
