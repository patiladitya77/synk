"use client";

import { useEffect, useRef } from "react";
import CanvasTopBar from "./CanvasTopBar";
import { TOOLS } from "@/canvas-engine/tools";
import { render } from "@/canvas-engine/renderer";
import { Shape } from "@/canvas-engine/types";
import { pan, zoomAt } from "@/canvas-engine/camera";
import { createSocketConnection } from "@/utils/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/utils/appStore";
import { useParams } from "next/navigation";

export default function Canvas() {
  const selectedShapeRef = useRef<Shape | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeHandleRef = useRef<"tl" | "tr" | "bl" | "br" | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const user = useSelector((store: RootState) => store.user.user);
  const params = useParams() as { slug?: string | string[] };

  const boardId =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : undefined;

  console.log(user);

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
  function setCursor(cursor: string) {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = cursor;
    }
  }

  function hitTest(shape: Shape, x: number, y: number) {
    if (shape.type === "rect") {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    }

    if (shape.type === "circle") {
      const dx = x - shape.cx;
      const dy = y - shape.cy;
      return dx * dx + dy * dy <= shape.r * shape.r;
    }

    return false;
  }

  useEffect(() => {
    if (!user || !boardId) return;

    const socket = createSocketConnection();

    socket.emit("joinboard", {
      name: user.name,
      userId: user.id,
      boardId,
    });

    socket.on("initialstate", (serverShapes: Shape[]) => {
      shapesRef.current = serverShapes;

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
        selectedShape: selectedShapeRef.current,
      });
    });

    socket.on("shapeDrawn", (shape: Shape) => {
      shapesRef.current.push(shape);

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
        selectedShape: selectedShapeRef.current,
      });
    });

    socket.on("shapeUpdated", (updatedShape: Shape) => {
      const index = shapesRef.current.findIndex(
        (s) => s.id === updatedShape.id,
      );

      if (index !== -1) {
        shapesRef.current[index] = updatedShape;
      }

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
        selectedShape: selectedShapeRef.current,
      });
    });

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
        selectedShape: selectedShapeRef.current,
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
      // 1️ check if clicking on existing shape
      let hitAnyShape = false;

      for (let i = shapesRef.current.length - 1; i >= 0; i--) {
        const shape = shapesRef.current[i];
        selectedShapeRef.current = shape;
        isDraggingRef.current = true;
        dragStartRef.current = { x, y };
        setCursor("grabbing");

        if (hitTest(shape, x, y)) {
          selectedShapeRef.current = shape;
          isDraggingRef.current = true;
          dragStartRef.current = { x, y };
          hitAnyShape = true;

          render({
            ctx,
            canvas,
            camera: cameraRef.current,
            shapes: shapesRef.current,
            selectedShape: selectedShapeRef.current,
          });
          return;
        }
      }

      //  CLICKED EMPTY SPACE → UNSELECT
      if (!hitAnyShape) {
        selectedShapeRef.current = null;

        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: null,
        });
      }

      //  Place shape
      if (isPlacingRef.current) {
        const tool = activeToolRef.current;

        const shape = tool.onPointerDown?.({ x, y });

        if (shape) {
          shapesRef.current.push(shape);
          socket.emit("drawShape", {
            boardId,
            shape,
          });
        }

        isPlacingRef.current = false;
        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: selectedShapeRef.current,
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
      let hoveringShape = false;

      // hover detection
      for (let i = shapesRef.current.length - 1; i >= 0; i--) {
        const shape = shapesRef.current[i];
        if (hitTest(shape, x, y)) {
          hoveringShape = true;
          break;
        }
      }
      if (isPanningRef.current) {
        setCursor("move");
      } else if (isDraggingRef.current) {
        setCursor("grabbing");
      } else if (hoveringShape) {
        setCursor("grab");
      } else {
        setCursor("default");
      }

      if (isDraggingRef.current && selectedShapeRef.current) {
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;

        const shape = selectedShapeRef.current;

        if (shape.type === "rect") {
          shape.x += dx;
          shape.y += dy;
        } else {
          shape.cx += dx;
          shape.cy += dy;
        }

        dragStartRef.current = { x, y };
      }

      const tool = activeToolRef.current;
      const previewShape = isPlacingRef.current
        ? (tool.getPreview?.({ x, y }) ?? undefined)
        : undefined;

      render({
        ctx,
        canvas,
        camera: cameraRef.current,
        shapes: shapesRef.current,
        preview: previewShape,
        selectedShape: selectedShapeRef.current,
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
        selectedShape: selectedShapeRef.current,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (selectedShapeRef.current) {
        socket.emit("updateShape", {
          boardId,
          shape: selectedShapeRef.current,
        });
      }
      isPanningRef.current = false;
      isDraggingRef.current = false;
      isResizingRef.current = false;
      resizeHandleRef.current = null;
      setCursor("default");
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
      // socket.disconnect();
    };
  }, [user, boardId]);

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
