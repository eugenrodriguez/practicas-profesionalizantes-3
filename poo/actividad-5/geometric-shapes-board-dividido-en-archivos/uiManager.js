export class UIManager {
    constructor() {
        this.activeShapeLabel = document.getElementById("activeShapeLabel");
        this.shapeTable = document.getElementById("shapeTable");
        this.colorPicker = document.getElementById("colorPicker");
        this.onShapeSelect = null;  // Callback para cuando se selecciona una forma
    }

    setShapeSelectCallback(callback) {
        this.onShapeSelect = callback;
    }

    updateActiveShapeLabel(shapeId) {
        this.activeShapeLabel.textContent = shapeId || "Ninguna";
    }

    updateShapeTable(shapes) {
        const tbody = this.shapeTable;
        tbody.innerHTML = "";
        
        shapes.forEach((shape) => {
            const tr = document.createElement("tr");
            tr.dataset.shapeId = shape.id;
            tr.innerHTML = `
                <td>${shape.constructor.name}</td>
                <td>${shape.id}</td>
                <td><button class="select-button" data-shape-id="${shape.id}">Seleccionar</button></td>
            `;
            tbody.appendChild(tr);

            const selectButton = tr.querySelector('.select-button');
            selectButton.addEventListener('click', () => {
                if (this.onShapeSelect) {
                    this.onShapeSelect(shape.id);
                }
            });
        });
    }

    updateTableHighlight(activeShapeId) {
        const rows = this.shapeTable.getElementsByTagName("tr");
        Array.from(rows).forEach(row => {
            if (activeShapeId && row.dataset.shapeId === activeShapeId) {
                row.classList.add('active-row');
            } else {
                row.classList.remove('active-row');
            }
        });
    }

    getColorPickerValue() {
        return this.colorPicker.value;
    }

    promptForCoordinates(type) {
        const x = prompt(`Ingrese la coordenada X para la figura ${type}:`);
        if (x === null || x.trim() === "" || isNaN(x)) {
            throw new Error("Coordenada X inválida");
        }

        const y = prompt(`Ingrese la coordenada Y para la figura ${type}:`);
        if (y === null || y.trim() === "" || isNaN(y)) {
            throw new Error("Coordenada Y inválida");
        }

        return {
            x: parseInt(x),
            y: parseInt(y)
        };
    }

    promptForShapeId(type) {
        const shapeId = prompt(`Ingrese un ID para la figura ${type}:`);
        if (shapeId === null || shapeId.trim() === "") {
            throw new Error("El ID de la figura no puede estar vacío");
        }
        return shapeId.trim();
    }

    showError(message) {
        alert(message);
    }

    showConfirmation(message) {
        return confirm(message);
    }

    validateCoordinates(x, y, canvasWidth, canvasHeight) {
        if (x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
            this.showError(`Las coordenadas (${x}, ${y}) están fuera del canvas. Se ajustarán al rango.`);
            return {
                x: Math.max(0, Math.min(x, canvasWidth)),
                y: Math.max(0, Math.min(y, canvasHeight))
            };
        }
        return { x, y };
    }
} 