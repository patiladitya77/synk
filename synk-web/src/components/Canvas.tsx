"use client";

import { useEffect, useRef } from "react";
import CanvasTopBar from "./CanvasTopBar";
import { TOOLS } from "@/canvas-engine/tools";
import { render } from "@/canvas-engine/renderer";
import { Shape } from "@/canvas-engine/types";
import { pan, zoomAt } from "@/canvas-engine/camera";

export default function Canvas() {
  const activeToolRef = useRef(TOOLS.rect);

  const cameraRef = useRef({
    x: 0, // pan X
    y: 0, // pan Y
    zoom: 1, // scale
  });

  const isPlacingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
      });
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
        const tool = activeToolRef.current;

        const shape = tool.onPointerDown?.({ x, y });

        if (shape) {
          shapesRef.current.push(shape);
        }

        isPlacingRef.current = false;
        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
        });

        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastPanRef.current.x;
        const dy = e.clientY - lastPanRef.current.y;

        pan(cameraRef.current, dx, dy);
        lastPanRef.current = { x: e.clientX, y: e.clientY };
      }

      const { x, y } = getWorldPos(e);

      const tool = activeToolRef.current;
      const previewShape = isPlacingRef.current
        ? tool.getPreview?.({ x, y }) ?? undefined
        : undefined;

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
        preview: previewShape,
      });
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
        zoomAt(cameraRef.current, clampedZoom / camera.zoom, mouseX, mouseY);
      } else {
        //  TRACKPAD PAN
        camera.x -= e.deltaX;
        camera.y -= e.deltaY;
      }

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
      });
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
          activeToolRef.current = TOOLS.rect;
          isPlacingRef.current = true;
        }}
        onSelectCircle={() => {
          activeToolRef.current = TOOLS.circle;
          isPlacingRef.current = true;
        }}
      />

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0" />
    </>
  );
}
