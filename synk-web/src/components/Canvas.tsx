"use client";

import { useEffect, useRef } from "react";

type Tool = "rect" | "circle";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
    };

export default function Canvas() {
  const isPlacingRef = useRef(false);
  const previewPosRef = useRef({ x: 0, y: 0 });

  const toolRef = useRef<Tool>("rect");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const isDrawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const DPR = window.devicePixelRatio || 1;

    const drawBackground = () => {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      redraw();
    };

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const drawShape = (shape: Shape) => {
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shape.type === "rect") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }

      if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const redraw = () => {
      drawBackground();
      shapesRef.current.forEach(drawShape);
    };

    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);

      // 🧷 Place shape
      if (isPlacingRef.current) {
        if (toolRef.current === "rect") {
          shapesRef.current.push({
            type: "rect",
            x: x - 50,
            y: y - 30,
            width: 100,
            height: 60,
          });
        }

        if (toolRef.current === "circle") {
          shapesRef.current.push({
            type: "circle",
            cx: x,
            cy: y,
            r: 40,
          });
        }

        isPlacingRef.current = false;
        redraw();
        return;
      }

      // (Optional) fallback to drag logic
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      previewPosRef.current = { x, y };

      redraw();

      // 👻 Ghost preview follows cursor
      if (isPlacingRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.4;

        if (toolRef.current === "rect") {
          drawShape({
            type: "rect",
            x: x - 50,
            y: y - 30,
            width: 100,
            height: 60,
          });
        }

        if (toolRef.current === "circle") {
          drawShape({
            type: "circle",
            cx: x,
            cy: y,
            r: 40,
          });
        }

        ctx.restore();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const { x, y } = getMousePos(e);
      const start = startRef.current;

      if (toolRef.current === "rect") {
        shapesRef.current.push({
          type: "rect",
          x: start.x,
          y: start.y,
          width: x - start.x,
          height: y - start.y,
        });
      }

      if (toolRef.current === "circle") {
        const r = Math.hypot(x - start.x, y - start.y);
        shapesRef.current.push({
          type: "circle",
          cx: start.x,
          cy: start.y,
          r,
        });
      }

      redraw();
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r flex flex-col items-center gap-4 py-4 z-10">
        <button
          onClick={() => {
            toolRef.current = "rect";
            isPlacingRef.current = true;
          }}
          className="w-10 h-10 text-black border rounded hover:bg-gray-100"
          title="Rectangle"
        >
          rect
        </button>

        <button
          onClick={() => {
            toolRef.current = "circle";
            isPlacingRef.current = true;
          }}
          className="w-10 h-10 border text-black  rounded hover:bg-gray-100"
          title="Circle"
        >
          circle
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ marginLeft: 64 }}
      />
    </>
  );
}
