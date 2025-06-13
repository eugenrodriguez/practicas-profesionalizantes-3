  export class Shape {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
      }

      move(dx, dy) {
        this.x += dx;
        this.y += dy;
      }

      draw(ctx) {}
      isClicked(x, y) { return false; }
    }

  export class Rectangle extends Shape {
      constructor(x, y, color) {
        super(x, y, color);
        this.width = 100;
        this.height = 50;
        this.angle = 3;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
      }

      rotate(angle) {
        this.angle += angle;
      }

      forward(speed) {
        // Determinamos el lado más corto para el "frente"
        // Si el ancho es el lado más corto, el "frente" es a lo largo del eje X.
        // Si la altura es el lado más corto, el "frente" es a lo largo del eje Y.
        // Asumiremos que el "frente" está alineado con la longitud del rectángulo (eje X local)
        // ya que así lo dibuja fillRect(-width/2, -height/2, width, height)
        // y así lo rota translate/rotate.
        // Por lo tanto, el movimiento hacia adelante es a lo largo del eje X local.

        // Componentes de velocidad basadas en el ángulo
        const dx = speed * Math.cos(this.angle);
        const dy = speed * Math.sin(this.angle);

        this.x += dx;
        this.y += dy;
    }

      isClicked(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.abs(dx) <= this.width / 2 && Math.abs(dy) <= this.height / 2;
      }
    }

  export class Circle extends Shape {
      constructor(x, y, color) {
        super(x, y, color);
        this.radius = 30;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      isClicked(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
      }
    }

  export class Triangle extends Shape {
      constructor(x, y, color) {
        super(x, y, color);
        this.size = 60;
      }

      draw(ctx) {
        const h = this.size * Math.sqrt(3) / 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - h / 2);
        ctx.lineTo(this.x - this.size / 2, this.y + h / 2);
        ctx.lineTo(this.x + this.size / 2, this.y + h / 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      isClicked(x, y) {
        const h = this.size * Math.sqrt(3) / 2;
        return (
          x >= this.x - this.size / 2 &&
          x <= this.x + this.size / 2 &&
          y >= this.y - h / 2 &&
          y <= this.y + h / 2
        );
      }
    }