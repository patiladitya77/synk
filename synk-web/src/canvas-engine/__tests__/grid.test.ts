import { buildGrid, worldToCell, cellToWorld, isBlocked, CELL } from "../grid";
import { Shape } from "../types";
import { RectShape } from "../types/ReactangleShape";
import { OvalShape } from "../types/OvalShape";

describe("Grid Construction", () => {
  describe("buildGrid", () => {
    it("should create a grid that covers start and end points", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 100, 100, 200, 200, []);

      expect(grid.cols).toBeGreaterThan(0);
      expect(grid.rows).toBeGreaterThan(0);
      expect(grid.blocked).toBeInstanceOf(Uint8Array);
      expect(grid.blocked.length).toBe(grid.cols * grid.rows);
    });

    it("should mark cells as blocked for rectangle shapes", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };
      const shapes: Shape[] = [rect];
      const grid = buildGrid(shapes, 0, 0, 300, 300, []);

      // Find cells that should be blocked (within the rectangle + padding)
      const rectCell = worldToCell(
        grid,
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      expect(isBlocked(grid, rectCell.col, rectCell.row)).toBe(true);
    });

    it("should mark cells as blocked for oval shapes", () => {
      const oval: OvalShape = {
        id: "oval1",
        type: "oval",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };
      const shapes: Shape[] = [oval];
      const grid = buildGrid(shapes, 0, 0, 300, 300, []);

      // Find cells that should be blocked (within the oval bounding box + padding)
      const ovalCell = worldToCell(
        grid,
        oval.x + oval.width / 2,
        oval.y + oval.height / 2,
      );
      expect(isBlocked(grid, ovalCell.col, ovalCell.row)).toBe(true);
    });

    it("should not block cells for excluded shapes", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };
      const shapes: Shape[] = [rect];
      const grid = buildGrid(shapes, 0, 0, 300, 300, ["rect1"]);

      // The rectangle should be excluded, so its cells should be free
      const rectCell = worldToCell(
        grid,
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      expect(isBlocked(grid, rectCell.col, rectCell.row)).toBe(false);
    });

    it("should handle empty shapes array", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 100, 100, 200, 200, []);

      expect(grid.cols).toBeGreaterThan(0);
      expect(grid.rows).toBeGreaterThan(0);

      // All cells should be free
      for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
          expect(isBlocked(grid, col, row)).toBe(false);
        }
      }
    });

    it("should handle multiple shapes", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };
      const oval: OvalShape = {
        id: "oval1",
        type: "oval",
        x: 200,
        y: 200,
        width: 50,
        height: 50,
      };
      const shapes: Shape[] = [rect, oval];
      const grid = buildGrid(shapes, 0, 0, 400, 400, []);

      // Both shapes should have blocked cells
      const rectCell = worldToCell(
        grid,
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      const ovalCell = worldToCell(
        grid,
        oval.x + oval.width / 2,
        oval.y + oval.height / 2,
      );

      expect(isBlocked(grid, rectCell.col, rectCell.row)).toBe(true);
      expect(isBlocked(grid, ovalCell.col, ovalCell.row)).toBe(true);
    });
  });

  describe("worldToCell", () => {
    it("should convert world coordinates to grid cells", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const cell = worldToCell(grid, grid.originX + CELL, grid.originY + CELL);
      expect(cell.col).toBe(1);
      expect(cell.row).toBe(1);
    });

    it("should handle origin offset", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 100, 100, 200, 200, []);

      const cell = worldToCell(grid, grid.originX, grid.originY);
      expect(cell.col).toBe(0);
      expect(cell.row).toBe(0);
    });
  });

  describe("cellToWorld", () => {
    it("should convert grid cells to world coordinates", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const world = cellToWorld(grid, 1, 1);
      expect(world.x).toBe(grid.originX + CELL);
      expect(world.y).toBe(grid.originY + CELL);
    });

    it("should be inverse of worldToCell", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const originalWorld = {
        x: grid.originX + CELL * 2,
        y: grid.originY + CELL * 3,
      };
      const cell = worldToCell(grid, originalWorld.x, originalWorld.y);
      const backToWorld = cellToWorld(grid, cell.col, cell.row);

      expect(backToWorld.x).toBe(originalWorld.x);
      expect(backToWorld.y).toBe(originalWorld.y);
    });
  });

  describe("isBlocked", () => {
    it("should return true for cells outside grid bounds (negative)", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      expect(isBlocked(grid, -1, 0)).toBe(true);
      expect(isBlocked(grid, 0, -1)).toBe(true);
      expect(isBlocked(grid, -1, -1)).toBe(true);
    });

    it("should return true for cells outside grid bounds (beyond max)", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      expect(isBlocked(grid, grid.cols, 0)).toBe(true);
      expect(isBlocked(grid, 0, grid.rows)).toBe(true);
      expect(isBlocked(grid, grid.cols, grid.rows)).toBe(true);
    });

    it("should return false for free cells within bounds", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      // All cells should be free in an empty grid
      expect(isBlocked(grid, 0, 0)).toBe(false);
      expect(isBlocked(grid, grid.cols - 1, grid.rows - 1)).toBe(false);
    });

    it("should return true for blocked cells", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };
      const shapes: Shape[] = [rect];
      const grid = buildGrid(shapes, 0, 0, 300, 300, []);

      const rectCell = worldToCell(
        grid,
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      expect(isBlocked(grid, rectCell.col, rectCell.row)).toBe(true);
    });
  });
});
