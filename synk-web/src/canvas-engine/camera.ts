import { Camera } from "./types";

export function pan(camera: Camera, dx: number, dy: number): void {
  camera.x += dx;
  camera.y += dy;
}

export function zoomAt(
  camera: Camera,
  factor: number,
  mouseX: number,
  mouseY: number
): void {
  const worldX = (mouseX - camera.x) / camera.zoom;
  const worldY = (mouseY - camera.y) / camera.zoom;

  camera.zoom *= factor;

  camera.x = mouseX - worldX * camera.zoom;
  camera.y = mouseY - worldY * camera.zoom;
}
