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
import { UpdateShapeCommand } from "@/canvas-engine/commands/UpdateShapeCommand";
import { ArrowShape } from "@/canvas-engine/types/ArrowShape";
import { TextShape } from "@/canvas-engine/types/TextShape";
import { calculateTextDimensions, LINE_HEIGHT_MULTIPLIER } from "@/canvas-engine/textUtils";
import { Socket } from "socket.io-client";
import {
  ArrowDraft,
  createArrow,
  createArrowDraft,
  getArrowPreview,
} from "@/canvas-engine/tools/ArrowTool";
import {
  findShapeAt,
  getResizeHandle,
  hitTestShape,
  ResizeHandle,
  resizeShape,
  resizeTextShapeProportional,
} from "@/canvas-engine/geometry";
import { RESIZE_CURSORS, screenToWorld } from "@/canvas-engine/interaction";

export default function Canvas() {
  // Add these refs at the top of Canvas()
  const commandManagerRef = useRef(new CommandManager());
  const dragStartShapeSnapshotRef = useRef<Shape | null>(null); // shape state BEFORE drag

  const selectedShapeRef = useRef<Shape | null>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  const resizeHandleRef = useRef<ResizeHandle | null>(null);
  const resizeStartShapeSnapshotRef = useRef<Shape | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const socketRef = useRef<Socket | null>(null);
  const editingStartSnapshotRef = useRef<TextShape | null>(null);
  const editingTextShapeRef = useRef<TextShape | null>(null);
  const [editingTextShape, setEditingTextShape] = useState<TextShape | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editingTextShape && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingTextShape]);
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
    | typeof TOOLS.rect
    | typeof TOOLS.oval
    | typeof TOOLS.diamond
    | typeof TOOLS.text
    | typeof ARROW_TOOL_ID
  >(TOOLS.rect);
  const [activeTool, setActiveTool] = useState<
    "rect" | "oval" | "arrow" | "diamond" | "text"
  >("rect");

  const cameraRef = useRef({
    x: 0, // pan X
    y: 0, // pan Y
    zoom: 1, // scale
  });

  const isPlacingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);

  const isDrawingArrowRef = useRef(false);
  const arrowDraftRef = useRef<ArrowDraft | null>(null);
  const arrowPreviewRef = useRef<ArrowShape | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  function setCursor(cursor: string) {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = cursor;
    }
  }



  useEffect(() => {
    if (!user || !boardId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }
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
      const { x, y } = screenToWorld(e, canvas, cameraRef.current);
      if (e.button === 1) {
        // middle mouse
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (activeToolRef.current === ARROW_TOOL_ID) {
        arrowDraftRef.current = createArrowDraft(x, y, shapesRef.current);
        isDrawingArrowRef.current = true;
        selectedShapeRef.current = null; // deselect anything
        return;
      }

      if (selectedShapeRef.current) {
        const handle = getResizeHandle(
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
      const hitShape = findShapeAt(shapesRef.current, x, y);
      if (hitShape) {
        selectedShapeRef.current = hitShape;
        isDraggingRef.current = true;
        dragStartRef.current = { x, y };
        dragStartShapeSnapshotRef.current = { ...hitShape };
        setCursor("grabbing");

        render({
          ctx,
          canvas,
          camera: cameraRef.current,
          shapes: shapesRef.current,
          selectedShape: selectedShapeRef.current,
        });
        return;
      }

      //  CLICKED EMPTY SPACE → UNSELECT
      if (!hitShape) {
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
          selectedShapeRef.current = shape;
          const cmd = new AddShapeCommand(
            shapesRef,
            boardId!,
            socket,
            shape,
            user.id,
          );
          commandManagerRef.current.execute(cmd);

          if (shape.type === "text") {
            startEditingText(shape as TextShape);
          }
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

      const { x, y } = screenToWorld(e, canvas, cameraRef.current);

      if (isDrawingArrowRef.current && arrowDraftRef.current) {
        setCursor("crosshair");
        const preview = getArrowPreview(
          arrowDraftRef.current,
          x,
          y,
          shapesRef.current,
        );
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
        const handle = getResizeHandle(
          selectedShapeRef.current,
          x,
          y,
          cameraRef.current.zoom,
        );
        if (handle) {
          setCursor(RESIZE_CURSORS[handle]);
        } else if (
          hitTestShape(selectedShapeRef.current, x, y, shapesRef.current)
        ) {
          // Hovering the shape body → 4-way move cursor
          setCursor("move");
        } else {
          setCursor("default");
        }
      } else {
        // No selection — check if hovering any shape
        const hoverShape = findShapeAt(shapesRef.current, x, y);
        setCursor(hoverShape ? "grab" : "default");
      }

      if (
        isResizingRef.current &&
        selectedShapeRef.current &&
        resizeHandleRef.current
      ) {
        const handle = resizeHandleRef.current;
        const selected = selectedShapeRef.current;

        if (
          selected.type === "text" &&
          resizeStartShapeSnapshotRef.current &&
          (handle === "tl" || handle === "tr" || handle === "br" || handle === "bl")
        ) {
          const totalDx = x - dragStartRef.current.x;
          const totalDy = y - dragStartRef.current.y;
          resizeTextShapeProportional(
            selected as TextShape,
            resizeStartShapeSnapshotRef.current as TextShape,
            handle,
            totalDx,
            totalDy,
          );
        } else {
          const dx = x - dragStartRef.current.x;
          const dy = y - dragStartRef.current.y;
          dragStartRef.current = { x, y };

          resizeShape(selected, handle, dx, dy);
        }
      }

      if (isDraggingRef.current && selectedShapeRef.current) {
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;

        const shape = selectedShapeRef.current;

        if (
          shape.type === "rect" ||
          shape.type === "oval" ||
          shape.type === "diamond" ||
          shape.type === "text"
        ) {
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
      const { x, y } = screenToWorld(e, canvas, cameraRef.current);

      if (isDrawingArrowRef.current) {
        isDrawingArrowRef.current = false;
        const draft = arrowDraftRef.current;
        arrowDraftRef.current = null;

        if (draft) {
          const arrow = createArrow(
            draft,
            x,
            y,
            shapesRef.current,
            () => crypto.randomUUID(),
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
          (after.type === "rect" ||
            after.type === "oval" ||
            after.type === "diamond" ||
            after.type === "text") &&
          (before.type === "rect" ||
            before.type === "oval" ||
            before.type === "diamond" ||
            before.type === "text")
        ) {
          didMove = before.x !== after.x || before.y !== after.y;
        } else if (after.type === "arrow") {
          //  check arrow endpoints moved
          didMove =
            (before as ArrowShape).x1 !== after.x1 ||
            (before as ArrowShape).y1 !== after.y1;
        }

        if (didMove) {
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
      }

      isPanningRef.current = false;
      isDraggingRef.current = false;
      isResizingRef.current = false;
      resizeHandleRef.current = null;
      dragStartShapeSnapshotRef.current = null;
      resizeStartShapeSnapshotRef.current = null;
      setCursor("default");
    };

    const startEditingText = (shape: TextShape) => {
      editingStartSnapshotRef.current = { ...shape };
      editingTextShapeRef.current = shape;
      setEditingTextShape({ ...shape });
    };

    const onDblClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const { x, y } = screenToWorld(e, canvas, cameraRef.current);
      const hitShape = findShapeAt(shapesRef.current, x, y);

      if (hitShape) {
        if (hitShape.type === "text") {
          selectedShapeRef.current = hitShape;
          startEditingText(hitShape as TextShape);
          render({
            ctx,
            canvas,
            camera: cameraRef.current,
            shapes: shapesRef.current,
            selectedShape: selectedShapeRef.current,
          });
        }
      } else {
        if (!isPlacingRef.current && activeToolRef.current !== ARROW_TOOL_ID) {
          const textShape: TextShape = {
            type: "text",
            id: "",
            x,
            y,
            width: 200,
            height: 40,
            text: "",
            fontSize: 16,
            fontFamily: "Arial",
          };

          selectedShapeRef.current = textShape;
          const cmd = new AddShapeCommand(
            shapesRef,
            boardId!,
            socket,
            textShape,
            user.id,
          );
          commandManagerRef.current.execute(cmd);

          startEditingText(textShape);
          render({
            ctx,
            canvas,
            camera: cameraRef.current,
            shapes: shapesRef.current,
            selectedShape: selectedShapeRef.current,
          });
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("dblclick", onDblClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("dblclick", onDblClick);
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
        onSelectDiamond={() => {
          activeToolRef.current = TOOLS.diamond;
          isPlacingRef.current = true;
          setActiveTool("diamond");
        }}
        onSelectText={() => {
          activeToolRef.current = TOOLS.text;
          isPlacingRef.current = true;
          setActiveTool("text");
        }}
        activeTool={activeTool}
      />

      {/* Editing Textarea */}
      {editingTextShape && (
        <textarea
          ref={textareaRef}
          value={editingTextShape.text}
          onChange={(e) => {
            const newText = e.target.value;
            const dims = calculateTextDimensions(
              newText,
              editingTextShape.fontSize,
              editingTextShape.fontFamily,
            );

            editingTextShape.text = newText;
            editingTextShape.width = dims.width;
            editingTextShape.height = dims.height;

            if (editingTextShapeRef.current) {
              editingTextShapeRef.current.text = newText;
              editingTextShapeRef.current.width = dims.width;
              editingTextShapeRef.current.height = dims.height;
            }

            setEditingTextShape({ ...editingTextShape });

            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                render({
                  ctx,
                  canvas: canvasRef.current,
                  camera: cameraRef.current,
                  shapes: shapesRef.current,
                  selectedShape: selectedShapeRef.current,
                });
              }
            }
          }}
          onBlur={() => {
            if (!editingTextShapeRef.current) return;
            const target = editingTextShapeRef.current;
            const startSnapshot = editingStartSnapshotRef.current;
            const socket = socketRef.current;

            editingTextShapeRef.current = null;
            editingStartSnapshotRef.current = null;
            setEditingTextShape(null);

            if (!target.text || target.text.trim() === "") {
              if (selectedShapeRef.current === target) {
                selectedShapeRef.current = null;
              }
              if (socket) {
                const deleteCmd = new DeleteShapeCommand(
                  shapesRef,
                  boardId!,
                  socket,
                  target,
                  user?.id || "",
                );
                deleteCmd.execute();
              } else {
                shapesRef.current = shapesRef.current.filter(
                  (s) => s.id !== target.id && s !== target,
                );
              }
            } else {
              if (startSnapshot && socket) {
                const updateCmd = new UpdateShapeCommand(
                  shapesRef,
                  boardId!,
                  socket,
                  startSnapshot,
                  { ...target },
                );
                commandManagerRef.current.record(updateCmd);
                socket.emit("updateShape", { boardId, shape: target });
              }
            }

            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                render({
                  ctx,
                  canvas: canvasRef.current,
                  camera: cameraRef.current,
                  shapes: shapesRef.current,
                  selectedShape: selectedShapeRef.current,
                });
              }
            }
          }}
          style={{
            position: "fixed",
            left: `${cameraRef.current.x + editingTextShape.x * cameraRef.current.zoom}px`,
            top: `${cameraRef.current.y + editingTextShape.y * cameraRef.current.zoom}px`,
            width: `${editingTextShape.width * cameraRef.current.zoom}px`,
            height: `${editingTextShape.height * cameraRef.current.zoom}px`,
            fontSize: `${editingTextShape.fontSize * cameraRef.current.zoom}px`,
            fontFamily: editingTextShape.fontFamily,
            lineHeight: LINE_HEIGHT_MULTIPLIER,
            color: editingTextShape.fill || "#0f172a",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            whiteSpace: "pre",
            overflow: "hidden",
            padding: "0px",
            margin: 0,
            zIndex: 20,
          }}
        />
      )}

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0" />
    </>
  );
}
