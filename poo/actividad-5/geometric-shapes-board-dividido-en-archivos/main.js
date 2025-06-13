import {ShapeController} from "./shapeController.js";
import {CanvasRenderer} from "./canvasRenderer.js";
   
   function main() {
      const canvas = document.getElementById("canvas");
      const renderer = new CanvasRenderer(canvas);
      const controller = new ShapeController(canvas, renderer);

      document.getElementById("drawRectangleBtn").addEventListener("click", () => controller.createShape('rectangle'));
      document.getElementById("drawCircleBtn").addEventListener("click", () => controller.createShape('circle'));
      document.getElementById("drawTriangleBtn").addEventListener("click", () => controller.createShape('triangle'));
      document.getElementById("deleteShapeBtn").addEventListener("click", () => controller.deleteActiveShape());
    }

document.addEventListener("DOMContentLoaded", main);
