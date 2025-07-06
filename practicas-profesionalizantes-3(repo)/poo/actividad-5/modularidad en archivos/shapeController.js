class ShapeController {
      constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.shapes = [];
        this.activeShape = null;
        this.keys = {};
        this.speed = 5;

        this.initListeners();
        this.animate();
      }

      initListeners() {
        this.canvas.addEventListener("click", (e) => this.selectShape(e));
        window.addEventListener("keydown", (e) => this.keys[e.key] = true);
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);
      }

      createShape(type) {
        const color = document.getElementById("colorPicker").value;
        let x, y;
        let shape;

        let inputX = prompt(`Ingrese la coordenada X para la figura ${type}:`);
        if (inputX === null || inputX.trim() === "" || isNaN(inputX)) {
          alert("Coordenada X inválida. No se creará la figura.");
          return;
        }
        x = parseInt(inputX);

        let inputY = prompt(`Ingrese la coordenada Y para la figura ${type}:`);
        if (inputY === null || inputY.trim() === "" || isNaN(inputY)) {
          alert("Coordenada Y inválida. No se creará la figura.");
          return;
        }
        y = parseInt(inputY);

        if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
            alert(`Las coordenadas (${x}, ${y}) están fuera del canvas. Se ajustarán al rango.`);
            x = Math.max(0, Math.min(x, this.canvas.width));
            y = Math.max(0, Math.min(y, this.canvas.height));
        }

        let shapeId = prompt(`Ingrese un ID para la figura ${type}:`);
        if (shapeId === null || shapeId.trim() === "") {
          alert("El ID de la figura no puede estar vacío. No se creará la figura.");
          return;
        }
        shapeId = shapeId.trim();

        if (this.shapes.some(s => s.id === shapeId)) {
          alert(`Ya existe una figura con el ID "${shapeId}". Por favor, elige otro.`);
          return;
        }

        switch (type) {
          case "rectangle": shape = new Rectangle(x, y, color); break;
          case "circle": shape = new Circle(x, y, color); break;
          case "triangle": shape = new Triangle(x, y, color); break;
        }

        shape.id = shapeId;
        this.addShape(shape);
      }

      deleteActiveShape() {
        if (this.activeShape) {
          const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la figura ${this.activeShape.id}?`);
          if (confirmDelete) {
            this.removeShape(this.activeShape);
          }
        } else {
          alert("No hay ninguna figura activa para eliminar.");
        }
      }

      addShape(shape) {
        if (this.shapes.some(s => s.id === shape.id)) {
          alert(`Ya existe una figura con el ID "${shape.id}". Por favor, elige otro.`);
          return;
        }
        this.shapes.push(shape);
        this.renderer.addShape(shape);
        this.setActiveShape(shape);
        this.updateTable();
      }

      removeShape(shapeToRemove) {
        this.shapes = this.shapes.filter(shape => shape.id !== shapeToRemove.id);
        this.renderer.removeShape(shapeToRemove);
        if (this.activeShape && this.activeShape.id === shapeToRemove.id) {
          this.setActiveShape(null);
        }
        this.updateTable();
      }

      setActiveShape(shape) {
        this.activeShape = shape;
        document.getElementById("activeShapeLabel").textContent = shape ? shape.id : "Ninguna";
        this.updateTableHighlight();
      }

      selectShape(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (let i = this.shapes.length - 1; i >= 0; i--) {
          if (this.shapes[i].isClicked(x, y)) {
            this.setActiveShape(this.shapes[i]);
            return;
          }
        }
        this.setActiveShape(null);
      }

      updateTable() {
        const tbody = document.getElementById("shapeTable");
        tbody.innerHTML = "";
        this.shapes.forEach((shape) => {
          const tr = document.createElement("tr");
          tr.dataset.shapeId = shape.id;
          tr.innerHTML = `
            <td>${shape.constructor.name}</td>
            <td>${shape.id}</td>
            <td><button class="select-button" data-shape-id="${shape.id}">Seleccionar</button></td>
          `;
          const selectButton = tr.querySelector('.select-button');
          selectButton.addEventListener('click', () => {
              const selectedShapeId = selectButton.dataset.shapeId;
              const selectedShape = this.shapes.find(s => s.id === selectedShapeId);
              if (selectedShape) {
                  this.setActiveShape(selectedShape);
              }
          });
          tbody.appendChild(tr);
        });
        this.updateTableHighlight();
      }

      updateTableHighlight() {
        const tbody = document.getElementById("shapeTable");
        Array.from(tbody.children).forEach(row => {
          if (this.activeShape && row.dataset.shapeId === this.activeShape.id) {
            row.classList.add('active-row');
          } else {
            row.classList.remove('active-row');
          }
        });
      }

      handleKeys() {
        if (!this.activeShape) return;
        const s = this.speed;

        if (this.keys["ArrowUp"]) this.activeShape.move(0, -s);
        if (this.keys["ArrowDown"]) this.activeShape.move(0, s);
        if (this.keys["ArrowLeft"]) this.activeShape.move(-s, 0);
        if (this.keys["ArrowRight"]) this.activeShape.move(s, 0);

        if (this.activeShape instanceof Rectangle) {
          if (this.keys["a"]) this.activeShape.rotate(-0.05);
          if (this.keys["d"]) this.activeShape.rotate(0.05);
        }
      }

      animate() {
        this.handleKeys();
        this.renderer.render();
        requestAnimationFrame(() => this.animate());
      }
    }