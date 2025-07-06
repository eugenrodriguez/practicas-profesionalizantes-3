   class CanvasRenderer {
      constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.shapes = [];
      }

      addShape(shape) {
        this.shapes.push(shape);
      }

      removeShape(shapeToRemove) {
        this.shapes = this.shapes.filter(shape => shape.id !== shapeToRemove.id);
      }

      render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const shape of this.shapes) {
          shape.draw(this.ctx);
        }
      }
    }