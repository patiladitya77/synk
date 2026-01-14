"use client";

import { useEffect, useRef } from "react";
import CanvasTopBar from "./CanvasTopBar";

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
  const cameraRef = useRef({
    x: 0, // pan X
    y: 0, // pan Y
    zoom: 1, // scale
  });

  const isPlacingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const previewPosRef = useRef({ x: 0, y: 0 });

  const toolRef = useRef<Tool>("rect");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
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
      drawGrid();
      redraw();
    };

    const getWorldPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const { x, y, zoom } = cameraRef.current;

      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      return {
        x: (screenX - x) / zoom,
        y: (screenY - y) / zoom,
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
      drawGrid();
      ctx.save();

      const { x, y, zoom } = cameraRef.current;

      // world => screen transform
      ctx.translate(x, y);
      ctx.scale(zoom, zoom);

      shapesRef.current.forEach(drawShape);

      ctx.restore();
    };

    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = getWorldPos(e);
      if (e.button === 1) {
        // middle mouse
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      //  Place shape
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
    };
    const drawGrid = () => {
      const { x, y, zoom } = cameraRef.current;
      const gridSize = 50;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // visible world bounds
      const left = -x / zoom;
      const right = left + width / zoom;
      const top = -y / zoom;
      const bottom = top + height / zoom;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(zoom, zoom);

      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1 / zoom;

      // vertical lines
      for (
        let gx = Math.floor(left / gridSize) * gridSize;
        gx <= right;
        gx += gridSize
      ) {
        ctx.beginPath();
        ctx.moveTo(gx, top);
        ctx.lineTo(gx, bottom);
        ctx.stroke();
      }

      // horizontal lines
      for (
        let gy = Math.floor(top / gridSize) * gridSize;
        gy <= bottom;
        gy += gridSize
      ) {
        ctx.beginPath();
        ctx.moveTo(left, gy);
        ctx.lineTo(right, gy);
        ctx.stroke();
      }

      ctx.restore();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastPanRef.current.x;
        const dy = e.clientY - lastPanRef.current.y;

        cameraRef.current.x += dx;
        cameraRef.current.y += dy;

        lastPanRef.current = { x: e.clientX, y: e.clientY };
      }

      const { x, y } = getWorldPos(e);
      previewPosRef.current = { x, y };

      redraw();

      if (isPlacingRef.current) {
        ctx.save();

        const { x: cx, y: cy, zoom } = cameraRef.current;
        ctx.translate(cx, cy);
        ctx.scale(zoom, zoom);

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

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const camera = cameraRef.current;

      const isZoomGesture = e.ctrlKey || e.metaKey;

      if (isZoomGesture) {
        //  ZOOM TO CURSOR
        const ZOOM_SENSITIVITY = 0.004;

        const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY;
        const newZoom = camera.zoom * Math.exp(zoomDelta);

        const clampedZoom = Math.min(Math.max(newZoom, 0.2), 5);

        // world position before zoom
        const worldX = (mouseX - camera.x) / camera.zoom;
        const worldY = (mouseY - camera.y) / camera.zoom;

        // update zoom
        camera.zoom = clampedZoom;

        // adjust camera so cursor stays fixed
        camera.x = mouseX - worldX * camera.zoom;
        camera.y = mouseY - worldY * camera.zoom;
      } else {
        //  TRACKPAD PAN
        camera.x -= e.deltaX;
        camera.y -= e.deltaY;
      }

      redraw();
    };

    const onMouseUp = (e: MouseEvent) => {
      isPanningRef.current = false;
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <>
      {/* TopBar */}
      <CanvasTopBar
        onSelectRect={() => {
          toolRef.current = "rect";
          isPlacingRef.current = true;
        }}
        onSelectCircle={() => {
          toolRef.current = "circle";
          isPlacingRef.current = true;
        }}
      />

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0" />
    </>
  );
}
