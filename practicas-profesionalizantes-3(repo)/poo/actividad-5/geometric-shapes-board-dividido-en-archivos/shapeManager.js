import { Rectangle, Circle, Triangle } from "./shapes.js";

export class ShapeManager {
    constructor() {
        this.shapes = [];
        this.activeShape = null;
    }

    addShape(shape) {
        if (this.shapes.some(s => s.id === shape.id)) {
            throw new Error(`Ya existe una figura con el ID "${shape.id}". Por favor, elige otro.`);
        }
        this.shapes.push(shape);
        return shape;
    }

    removeShape(shapeId) {
        const shapeToRemove = this.shapes.find(s => s.id === shapeId);
        if (shapeToRemove) {
            this.shapes = this.shapes.filter(shape => shape.id !== shapeId);
            if (this.activeShape && this.activeShape.id === shapeId) {
                this.setActiveShape(null);
            }
            return true;
        }
        return false;
    }

    setActiveShape(shape) {
        this.activeShape = shape;
        return shape;
    }

    getActiveShape() {
        return this.activeShape;
    }

    getAllShapes() {
        return [...this.shapes];
    }

    findShapeAt(x, y) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.shapes[i].isClicked(x, y)) {
                return this.shapes[i];
            }
        }
        return null;
    }

    createShape(type, x, y, color, id) {
        let shape;
        switch (type) {
            case "rectangle": shape = new Rectangle(x, y, color); break;
            case "circle": shape = new Circle(x, y, color); break;
            case "triangle": shape = new Triangle(x, y, color); break;
            default: throw new Error(`Tipo de figura "${type}" no válido`);
        }
        shape.id = id;
        return this.addShape(shape);
    }

    moveActiveShape(dx, dy) {
        if (this.activeShape) {
            this.activeShape.move(dx, dy);
            return true;
        }
        return false;
    }

    rotateActiveShape(angle) {
        if (this.activeShape instanceof Rectangle) {
            this.activeShape.rotate(angle);
            return true;
        }
        return false;
    }
} 