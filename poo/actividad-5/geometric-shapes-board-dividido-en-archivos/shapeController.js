import { Rectangle, Circle, Triangle } from "./shapes.js";
import { ShapeManager } from "./shapeManager.js";
import { UIManager } from "./uiManager.js";

export class ShapeController {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.shapeManager = new ShapeManager();
        this.uiManager = new UIManager();
        this.keys = {};
        this.speed = 5;

        this.initListeners();
        this.animate();
    }

    initListeners() {
        this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
        window.addEventListener("keydown", (e) => this.keys[e.key] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedShape = this.shapeManager.findShapeAt(x, y);
        this.setActiveShape(clickedShape);
    }

    createShape(type) {
        try {
            const color = this.uiManager.getColorPickerValue();
            const { x, y } = this.uiManager.promptForCoordinates(type);
            const validatedCoords = this.uiManager.validateCoordinates(x, y, this.canvas.width, this.canvas.height);
            const shapeId = this.uiManager.promptForShapeId(type);

            const shape = this.shapeManager.createShape(type, validatedCoords.x, validatedCoords.y, color, shapeId);
            this.renderer.addShape(shape);
            this.setActiveShape(shape);
            this.updateUI();
        } catch (error) {
            this.uiManager.showError(error.message);
        }
    }

    deleteActiveShape() {
        const activeShape = this.shapeManager.getActiveShape();
        if (activeShape) {
            const confirmDelete = this.uiManager.showConfirmation(
                `¿Estás seguro de que quieres eliminar la figura ${activeShape.id}?`
            );
            if (confirmDelete) {
                this.shapeManager.removeShape(activeShape.id);
                this.renderer.removeShape(activeShape);
                this.updateUI();
            }
        } else {
            this.uiManager.showError("No hay ninguna figura activa para eliminar.");
        }
    }

    setActiveShape(shape) {
        this.shapeManager.setActiveShape(shape);
        this.updateUI();
    }

    updateUI() {
        const activeShape = this.shapeManager.getActiveShape();
        this.uiManager.updateActiveShapeLabel(activeShape?.id);
        this.uiManager.updateShapeTable(this.shapeManager.getAllShapes());
        this.uiManager.updateTableHighlight(activeShape?.id);
    }

    handleKeys() {
        const activeShape = this.shapeManager.getActiveShape();
        if (!activeShape) return;

        const s = this.speed;
        if (activeShape instanceof Rectangle) {
            if (this.keys["ArrowUp"]) activeShape.forward(s);
            if (this.keys["ArrowDown"]) activeShape.forward(-s);
            if (this.keys["ArrowLeft"]) this.shapeManager.rotateActiveShape(-0.05);
            if (this.keys["ArrowRight"]) this.shapeManager.rotateActiveShape(0.05);
        } else {
            if (this.keys["ArrowUp"]) this.shapeManager.moveActiveShape(0, -s);
            if (this.keys["ArrowDown"]) this.shapeManager.moveActiveShape(0, s);
            if (this.keys["ArrowLeft"]) this.shapeManager.moveActiveShape(-s, 0);
            if (this.keys["ArrowRight"]) this.shapeManager.moveActiveShape(s, 0);
        }
    }

    animate() {
        this.handleKeys();
        this.renderer.render();
        requestAnimationFrame(() => this.animate());
    }
}