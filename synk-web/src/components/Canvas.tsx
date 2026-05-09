"use client";

import { useEffect, useRef, useState } from "react";
import CanvasTopBar from "./CanvasTopBar";
import { ARROW_TOOL_ID, TOOLS } from "@/canvas-engine/tools";
import { render } from "@/canvas-engine/renderer";
import { Shape } from "@/canvas-engine/types";
import { pan, zoomAt } from "@/canvas-engine/camera";
import { createSocketConnection } from "@/utils/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/utils/appStore";
import { useParams } from "next/navigation";
import { CommandManager } from "@/canvas-engine/commands/CommandManager";
import { MoveShapeCommand } from "@/canvas-engine/commands/MoveShapeCommand";
import { AddShapeCommand } from "@/canvas-engine/commands/AddShapeCommand";
import { DeleteShapeCommand } from "@/canvas-engine/commands/DeleteShapeCommand";
import { ResizeShapeCommand } from "@/canvas-engine/commands/ResizeShapeCommand";
import { ArrowShape } from "@/canvas-engine/types/ArrowShape";
import {
  arrowToolGetPreview,
  arrowToolMouseDown,
  arrowToolMouseUp,
} from "@/canvas-engine/tools/ArrowTool";
import { hitTestArrow } from "@/canvas-engine/Arrow";

export default function Canvas() {
  // Add these refs at the top of Canvas()
  const commandManagerRef = useRef(new CommandManager());
  const dragStartShapeSnapshotRef = useRef<Shape | null>(null); // shape state BEFORE drag

  const selectedShapeRef = useRef<Shape | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  const resizeHandleRef = useRef<
    "tl" | "tm" | "tr" | "mr" | "br" | "bm" | "bl" | "ml" | null
  >(null);
  const resizeStartShapeSnapshotRef = useRef<Shape | null>(null);
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

  const activeToolRef = useRef<
    typeof TOOLS.rect | typeof TOOLS.oval | typeof ARROW_TOOL_ID
  >(TOOLS.rect);
  const [activeTool, setActiveTool] = useState<"rect" | "oval" | "arrow">(
    "rect",
  );

  const cameraRef = useRef({
    x: 0, // pan X
    y: 0, // pan Y
    zoom: 1, // scale
  });

  const isPlacingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);

  const isDrawingArrowRef = useRef(false);
  const arrowPreviewRef = useRef<ArrowShape | null>(null);

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
    if (shape.type === "oval") {
      // Point-in-ellipse test using bounding box
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const rx = shape.width / 2;
      const ry = shape.height / 2;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      return dx * dx + dy * dy <= 1;
    }
    if (shape.type === "arrow") {
      //delegate to the segment-distance hit test
      return hitTestArrow(shape, x, y, shapesRef.current);
    }

    return false;
  }
  function getHandleAtPos(shape: Shape, x: number, y: number, zoom: number) {
    if (shape.type === "arrow") return null;
    const HANDLE_SIZE = 8 / zoom;
    const H = HANDLE_SIZE / 2;

    let bx: number, by: number, bw: number, bh: number;
    if (shape.type === "rect") {
      bx = shape.x;
      by = shape.y;
      bw = shape.width;
      bh = shape.height;
    } else {
      bx = shape.x;
      by = shape.y;
      bw = shape.width;
      bh = shape.height;
    }

    const handles = [
      { id: "tl", x: bx, y: by },
      { id: "tm", x: bx + bw / 2, y: by },
      { id: "tr", x: bx + bw, y: by },
      { id: "mr", x: bx + bw, y: by + bh / 2 },
      { id: "br", x: bx + bw, y: by + bh },
      { id: "bm", x: bx + bw / 2, y: by + bh },
      { id: "bl", x: bx, y: by + bh },
      { id: "ml", x: bx, y: by + bh / 2 },
    ] as const;

    for (const h of handles) {
      if (x >= h.x - H && x <= h.x + H && y >= h.y - H && y <= h.y + H) {
        return h.id;
      }
    }
    return null;
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

    socket.on("shapeDeleted", ({ shapeId }: { shapeId: string }) => {
      shapesRef.current = shapesRef.current.filter((s) => s.id !== shapeId);
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

    const RESIZE_CURSORS: Record<string, string> = {
      tl: "nwse-resize",
      tm: "ns-resize",
      tr: "nesw-resize",
      mr: "ew-resize",
      br: "nwse-resize",
      bm: "ns-resize",
      bl: "nesw-resize",
      ml: "ew-resize",
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

    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      //delete selectd shape
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedShapeRef.current
      ) {
        const cmd = new DeleteShapeCommand(
          shapesRef,
          boardId!,
          socket,
          { ...selectedShapeRef.current }, // snapshot before deleting
          user.id,
        );
        commandManagerRef.current.execute(cmd);
        selectedShapeRef.current = null;

        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: null,
        });
      }

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        commandManagerRef.current.undo();
        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: selectedShapeRef.current,
        });
      }

      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        commandManagerRef.current.redo();
        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: selectedShapeRef.current,
        });
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = getWorldPos(e);
      if (e.button === 1) {
        // middle mouse
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (activeToolRef.current === ARROW_TOOL_ID) {
        arrowToolMouseDown(x, y, shapesRef.current);
        isDrawingArrowRef.current = true;
        selectedShapeRef.current = null; // deselect anything
        return;
      }

      if (selectedShapeRef.current) {
        const handle = getHandleAtPos(
          selectedShapeRef.current,
          x,
          y,
          cameraRef.current.zoom,
        );
        if (handle) {
          isResizingRef.current = true;
          resizeHandleRef.current = handle;
          dragStartRef.current = { x, y };
          resizeStartShapeSnapshotRef.current = { ...selectedShapeRef.current };
          return; // don't fall through to drag/place
        }
      }
      // 1️ check if clicking on existing shape
      let hitAnyShape = false;

      for (let i = shapesRef.current.length - 1; i >= 0; i--) {
        const shape = shapesRef.current[i];

        if (hitTest(shape, x, y)) {
          selectedShapeRef.current = shape;
          isDraggingRef.current = true;
          dragStartRef.current = { x, y };
          dragStartShapeSnapshotRef.current = { ...shape };
          setCursor("grabbing");
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

        // In onMouseDown, replace the raw socket.emit with:
        if (shape) {
          const cmd = new AddShapeCommand(
            shapesRef,
            boardId!,
            socket,
            shape,
            user.id,
          );
          commandManagerRef.current.execute(cmd);
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

      if (isDrawingArrowRef.current) {
        setCursor("crosshair");
        const preview = arrowToolGetPreview(x, y, shapesRef.current);
        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          preview,
          selectedShape: null,
        });
        return; // skip all other cursor/drag logic while drawing arrow
      }

      // ── CURSOR PRIORITY (highest → lowest) ──────────────────────
      if (isPanningRef.current) {
        setCursor("move");
      } else if (isResizingRef.current && resizeHandleRef.current) {
        // Keep showing resize cursor while actively resizing
        setCursor(RESIZE_CURSORS[resizeHandleRef.current]);
      } else if (isDraggingRef.current) {
        setCursor("grabbing");
      } else if (selectedShapeRef.current) {
        // Check if hovering a resize handle on the selected shape
        const handle = getHandleAtPos(
          selectedShapeRef.current,
          x,
          y,
          cameraRef.current.zoom,
        );
        if (handle) {
          setCursor(RESIZE_CURSORS[handle]);
        } else if (hitTest(selectedShapeRef.current, x, y)) {
          // Hovering the shape body → 4-way move cursor
          setCursor("move");
        } else {
          setCursor("default");
        }
      } else {
        // No selection — check if hovering any shape
        let hoveringShape = false;
        for (let i = shapesRef.current.length - 1; i >= 0; i--) {
          if (hitTest(shapesRef.current[i], x, y)) {
            hoveringShape = true;
            break;
          }
        }
        setCursor(hoveringShape ? "grab" : "default");
      }
      let hoveringShape = false;

      if (
        isResizingRef.current &&
        selectedShapeRef.current &&
        resizeHandleRef.current
      ) {
        const handle = resizeHandleRef.current;
        const shape = selectedShapeRef.current;
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;
        dragStartRef.current = { x, y };

        // Both rect and oval use identical bounding-box resize logic now
        if (shape.type === "rect" || shape.type === "oval") {
          if (handle === "tl") {
            shape.x += dx;
            shape.y += dy;
            shape.width -= dx;
            shape.height -= dy;
          }
          if (handle === "tm") {
            shape.y += dy;
            shape.height -= dy;
          }
          if (handle === "tr") {
            shape.y += dy;
            shape.width += dx;
            shape.height -= dy;
          }
          if (handle === "mr") {
            shape.width += dx;
          }
          if (handle === "br") {
            shape.width += dx;
            shape.height += dy;
          }
          if (handle === "bm") {
            shape.height += dy;
          }
          if (handle === "bl") {
            shape.x += dx;
            shape.width -= dx;
            shape.height += dy;
          }
          if (handle === "ml") {
            shape.x += dx;
            shape.width -= dx;
          }

          shape.width = Math.max(10, shape.width);
          shape.height = Math.max(10, shape.height);
        }
      }

      // hover detection (used only for render, cursor already set above)
      for (let i = shapesRef.current.length - 1; i >= 0; i--) {
        const shape = shapesRef.current[i];
        if (hitTest(shape, x, y)) {
          hoveringShape = true;
          break;
        }
      }

      if (isDraggingRef.current && selectedShapeRef.current) {
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;

        const shape = selectedShapeRef.current;

        if (shape.type === "rect" || shape.type === "oval") {
          shape.x += dx;
          shape.y += dy;
        } else if (shape.type === "arrow") {
          // CHANGED: move both endpoints of a free-floating arrow
          shape.x1 += dx;
          shape.y1 += dy;
          shape.x2 += dx;
          shape.y2 += dy;
        }

        dragStartRef.current = { x, y };
      }

      const tool = activeToolRef.current;
      const previewShape =
        isPlacingRef.current && activeToolRef.current !== ARROW_TOOL_ID
          ? (activeToolRef.current.getPreview?.({ x, y }) ?? undefined)
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
      const { x, y } = getWorldPos(e);

      if (isDrawingArrowRef.current) {
        isDrawingArrowRef.current = false;
        const arrow = arrowToolMouseUp(x, y, shapesRef.current, () =>
          crypto.randomUUID(),
        );
        if (arrow) {
          const cmd = new AddShapeCommand(
            shapesRef,
            boardId!,
            socket,
            arrow,
            user.id,
          );
          commandManagerRef.current.execute(cmd);
        }
        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: null,
        });
        return;
      }

      if (
        isDraggingRef.current &&
        selectedShapeRef.current &&
        dragStartShapeSnapshotRef.current
      ) {
        const before = dragStartShapeSnapshotRef.current;
        const after = selectedShapeRef.current;

        // Only record if the shape actually moved
        let didMove = false;
        if (
          (after.type === "rect" || after.type === "oval") &&
          (before.type === "rect" || before.type === "oval")
        ) {
          didMove = before.x !== after.x || before.y !== after.y;
        } else if (after.type === "arrow") {
          //  check arrow endpoints moved
          didMove =
            (before as ArrowShape).x1 !== after.x1 ||
            (before as ArrowShape).y1 !== after.y1;
        }

        if (didMove) {
          const cmd = new MoveShapeCommand(
            shapesRef,
            boardId!,
            socket,
            before,
            { ...after },
          );
          // Don't call cmd.execute() — the move already happened visually.
          // Just push it into history so undo works.
          // commandManagerRef.current["history"] = [
          //   ...commandManagerRef.current["history"].slice(
          //     0,
          //     commandManagerRef.current["pointer"] + 1,
          //   ),
          //   cmd,
          // ];
          // commandManagerRef.current["pointer"]++;
          // // Now sync to server
          // socket.emit("updateShape", { boardId, shape: after });
          commandManagerRef.current.record(
            new MoveShapeCommand(shapesRef, boardId!, socket, before, {
              ...after,
            }),
          );
          socket.emit("updateShape", { boardId, shape: after });
        }
      }
      if (
        isResizingRef.current &&
        selectedShapeRef.current &&
        resizeStartShapeSnapshotRef.current
      ) {
        commandManagerRef.current.record(
          new ResizeShapeCommand(
            shapesRef,
            boardId!,
            socket,
            resizeStartShapeSnapshotRef.current,
            { ...selectedShapeRef.current },
          ),
        );
        socket.emit("updateShape", {
          boardId,
          shape: selectedShapeRef.current,
        });
        resizeStartShapeSnapshotRef.current = null;
      }

      isResizingRef.current = false;
      resizeHandleRef.current = null;

      dragStartShapeSnapshotRef.current = null;
      isPanningRef.current = false;
      isDraggingRef.current = false;
      isResizingRef.current = false;
      setCursor("default");
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
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
          setActiveTool("rect");
        }}
        onSelectCircle={() => {
          activeToolRef.current = TOOLS.oval;
          isPlacingRef.current = true;
          setActiveTool("oval");
        }}
        onSelectArrow={() => {
          activeToolRef.current = ARROW_TOOL_ID;
          isPlacingRef.current = false; // arrow doesn't use isPlacing
          isDrawingArrowRef.current = false;
          setActiveTool("arrow");
        }}
        activeTool={activeTool}
      />

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0" />
    </>
  );
}
