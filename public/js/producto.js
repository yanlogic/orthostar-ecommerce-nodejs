// =============================================
// PRODUCTO.JS — Detalle de producto
// Orthostar — producto.html
// =============================================

var productoMostrado = null;

document.addEventListener("DOMContentLoaded", function() {
  productoMostrado = obtenerProductoActual();
  if (!productoMostrado) {
    location.href = "index.html";
    return;
  }

  // Releer el stock actualizado desde el servidor
  fetch('/api/productos/' + productoMostrado.id)
    .then(function(res) { return res.json(); })
    .then(function(prod) {
      if (prod && prod.stock !== undefined) {
        productoMostrado.stock = prod.stock;
      }
      mostrarProducto();
      pintarSimilares();
    })
    .catch(function() {
      mostrarProducto();
      pintarSimilares();
    });
});

// Rellena el DOM con los datos del producto actual (nombre, precio, stock, imagen)
function mostrarProducto() {
  document.getElementById("nombreHeader").textContent        = productoMostrado.nombre;
  document.getElementById("nombreProducto").textContent      = productoMostrado.nombre;
  document.getElementById("marcaProducto").textContent       = productoMostrado.marca;
  document.getElementById("categoriaProducto").textContent   = productoMostrado.categoria;
  document.getElementById("descripcionProducto").textContent = productoMostrado.descripcion;
  document.getElementById("precioProducto").textContent      = formatearPrecio(productoMostrado.precio);
  document.getElementById("stockProducto").textContent       = "Stock: " + productoMostrado.stock;
  var img = document.getElementById("imagenProducto");
  img.src = productoMostrado.imagen;
  img.alt = "Imagen de " + productoMostrado.nombre;
}

// Incrementa o decrementa la cantidad seleccionada respetando el stock disponible
function ajustarCantidad(cambio) {
  var span  = document.getElementById("cantidad");
  var valor = parseInt(span.textContent) + cambio;
  if (valor < 0) valor = 0;
  if (valor > productoMostrado.stock) {
    mostrarAlerta("Stock insuficiente. Solo hay " + productoMostrado.stock + " unidades disponibles.");
    return;
  }
  span.textContent = valor;
}

// Agrega el producto al carrito con la cantidad seleccionada y muestra confirmación
function agregarAlCarritoActual() {
  var cantidad = parseInt(document.getElementById("cantidad").textContent);
  if (cantidad === 0) {
    mostrarAlerta("Selecciona al menos 1 unidad.");
    return;
  }
  var item = {
    id:          productoMostrado.id,
    nombre:      productoMostrado.nombre,
    marca:       productoMostrado.marca,
    precio:      productoMostrado.precio,
    imagen:      productoMostrado.imagen,
    descripcion: productoMostrado.descripcion,
    cantidad:    cantidad
  };
  agregarAlCarrito(item);
  var mensaje = document.getElementById("mensajeAgregado");
  mensaje.style.display = "block";
  document.getElementById("cantidad").textContent = "0";
  setTimeout(function() { mensaje.style.display = "none"; }, 2500);
}

// ── PRODUCTOS SIMILARES ──────────────────────
// Lee el catálogo del servidor y muestra otros productos
function pintarSimilares() {
  var contenedor = document.getElementById("similaresContainer");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  fetch('/api/productos')
    .then(function(res) { return res.json(); })
    .then(function(products) {
      if (!products || products.length === 0) return;

      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        if (p.id === productoMostrado.id) continue; // saltar el actual

        var div = document.createElement("article");
        div.className = "similar-item";
        div.onclick   = (function(prod) {
          return function() { abrirProductoSimilar(prod); };
        })(p);

        div.innerHTML =
          "<img src='" + (p.imagen || "") + "' alt='" + p.nombre + "'>" +
          "<p class='s-marca'>" + p.marca + "</p>" +
          "<p>" + p.nombre + "</p>" +
          "<p class='s-precio'>" + formatearPrecio(p.precio) + "</p>";

        contenedor.appendChild(div);
      }
    })
    .catch(function() {
      console.warn('No se pudieron cargar productos similares.');
    });
}

// Guarda el producto similar en localStorage y recarga la página para mostrarlo
function abrirProductoSimilar(producto) {
  guardarProductoActual(producto);
  location.reload();
}