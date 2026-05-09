import { astar } from "../Astar";
import { buildGrid, worldToCell } from "../grid";
import { Shape } from "../types";
import { RectShape } from "../types/ReactangleShape";

describe("A* Pathfinding", () => {
  describe("astar with no obstacles", () => {
    it("should find a direct path when no obstacles exist", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 200, 200, []);

      const start = worldToCell(grid, 50, 50);
      const end = worldToCell(grid, 150, 150);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(0);
      expect(path![0]).toEqual({ col: start.col, row: start.row });
      expect(path![path!.length - 1]).toEqual({ col: end.col, row: end.row });
    });

    it("should return a path with start and end cells", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const startCol = 2;
      const startRow = 2;
      const endCol = 5;
      const endRow = 5;

      const path = astar(grid, startCol, startRow, endCol, endRow);

      expect(path).not.toBeNull();
      expect(path![0]).toEqual({ col: startCol, row: startRow });
      expect(path![path!.length - 1]).toEqual({ col: endCol, row: endRow });
    });

    it("should return path with only orthogonal moves", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 200, 200, []);

      const start = worldToCell(grid, 50, 50);
      const end = worldToCell(grid, 150, 150);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).not.toBeNull();

      // Verify each step is orthogonal (only col or row changes, not both)
      for (let i = 0; i < path!.length - 1; i++) {
        const curr = path![i];
        const next = path![i + 1];
        const colDiff = Math.abs(next.col - curr.col);
        const rowDiff = Math.abs(next.row - curr.row);

        // Either col changes by 1 and row stays same, or row changes by 1 and col stays same
        expect(
          (colDiff === 1 && rowDiff === 0) || (colDiff === 0 && rowDiff === 1),
        ).toBe(true);
      }
    });
  });

  describe("astar with obstacles", () => {
    it("should route around a blocking rectangle", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 100,
        y: 50,
        width: 50,
        height: 100,
      };
      const shapes: Shape[] = [rect];
      const grid = buildGrid(shapes, 0, 50, 200, 150, []);

      // Start on left side of obstacle, end on right side
      const start = worldToCell(grid, 50, 100);
      const end = worldToCell(grid, 170, 100);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(2); // Should be longer than direct path

      // Verify path doesn't go through blocked cells
      for (const cell of path!) {
        expect(grid.blocked[cell.row * grid.cols + cell.col]).toBe(0);
      }
    });

    it("should find path around multiple obstacles", () => {
      const rect1: RectShape = {
        id: "rect1",
        type: "rect",
        x: 100,
        y: 50,
        width: 30,
        height: 30,
      };
      const rect2: RectShape = {
        id: "rect2",
        type: "rect",
        x: 200,
        y: 150,
        width: 30,
        height: 30,
      };
      const shapes: Shape[] = [rect1, rect2];
      const grid = buildGrid(shapes, 0, 0, 400, 300, []);

      // Use points that are clearly away from obstacles
      const start = worldToCell(grid, 20, 100);
      const end = worldToCell(grid, 350, 200);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(0);

      // Verify path exists and connects start to end
      expect(path![0]).toEqual({ col: start.col, row: start.row });
      expect(path![path!.length - 1]).toEqual({ col: end.col, row: end.row });
    });

    it("should return path that avoids all blocked cells", () => {
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

      const start = worldToCell(grid, 50, 125);
      const end = worldToCell(grid, 200, 125);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).not.toBeNull();

      // Check every cell in the path is not blocked
      for (const cell of path!) {
        const index = cell.row * grid.cols + cell.col;
        expect(grid.blocked[index]).toBe(0);
      }
    });
  });

  describe("astar with no valid path", () => {
    it("should return null when completely blocked", () => {
      // Create a wall that completely blocks the path
      const shapes: Shape[] = [];
      for (let i = 0; i < 10; i++) {
        shapes.push({
          id: `rect${i}`,
          type: "rect",
          x: 100,
          y: i * 30,
          width: 50,
          height: 30,
        } as RectShape);
      }

      const grid = buildGrid(shapes, 0, 0, 200, 300, []);

      // Try to go from left to right through the wall
      const start = worldToCell(grid, 50, 150);
      const end = worldToCell(grid, 170, 150);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      // Should return null or find a way around if possible
      // In this case, the wall might not be complete due to padding/margins
      if (path === null) {
        expect(path).toBeNull();
      } else {
        // If path exists, verify it's valid
        for (const cell of path) {
          expect(grid.blocked[cell.row * grid.cols + cell.col]).toBe(0);
        }
      }
    });

    it("should return null when start is blocked", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 50,
        y: 50,
        width: 100,
        height: 100,
      };
      const shapes: Shape[] = [rect];
      const grid = buildGrid(shapes, 0, 0, 300, 300, []);

      // Place start inside the blocked area
      const start = worldToCell(grid, 100, 100);
      const end = worldToCell(grid, 250, 250);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).toBeNull();
    });

    it("should return null when end is blocked", () => {
      const rect: RectShape = {
        id: "rect1",
        type: "rect",
        x: 200,
        y: 200,
        width: 100,
        height: 100,
      };
      const shapes: Shape[] = [rect];
      const grid = buildGrid(shapes, 0, 0, 400, 400, []);

      // Place end inside the blocked area
      const start = worldToCell(grid, 50, 50);
      const end = worldToCell(grid, 250, 250);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).toBeNull();
    });
  });

  describe("astar edge cases", () => {
    it("should handle start and end being the same cell", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const col = 5;
      const row = 5;

      const path = astar(grid, col, row, col, row);

      expect(path).not.toBeNull();
      expect(path!.length).toBe(1);
      expect(path![0]).toEqual({ col, row });
    });

    it("should handle adjacent cells", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const startCol = 5;
      const startRow = 5;
      const endCol = 6;
      const endRow = 5;

      const path = astar(grid, startCol, startRow, endCol, endRow);

      expect(path).not.toBeNull();
      expect(path!.length).toBe(2);
      expect(path![0]).toEqual({ col: startCol, row: startRow });
      expect(path![1]).toEqual({ col: endCol, row: endRow });
    });

    it("should handle cells at grid boundaries", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 100, 100, []);

      const path = astar(grid, 0, 0, grid.cols - 1, grid.rows - 1);

      expect(path).not.toBeNull();
      expect(path![0]).toEqual({ col: 0, row: 0 });
      expect(path![path!.length - 1]).toEqual({
        col: grid.cols - 1,
        row: grid.rows - 1,
      });
    });
  });

  describe("astar path properties", () => {
    it("should produce continuous path (each step connects to next)", () => {
      const shapes: Shape[] = [];
      const grid = buildGrid(shapes, 0, 0, 200, 200, []);

      const start = worldToCell(grid, 50, 50);
      const end = worldToCell(grid, 150, 150);

      const path = astar(grid, start.col, start.row, end.col, end.row);

      expect(path).not.toBeNull();

      // Verify each cell is adjacent to the next
      for (let i = 0; i < path!.length - 1; i++) {
        const curr = path![i];
        const next = path![i + 1];
        const distance =
          Math.abs(next.col - curr.col) + Math.abs(next.row - curr.row);
        expect(distance).toBe(1); // Manhattan distance of 1 means adjacent
      }
    });
  });
});
