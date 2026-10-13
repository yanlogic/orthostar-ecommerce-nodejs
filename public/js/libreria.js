// =============================================
// LIBRERIA.JS — Funciones compartidas del proyecto
// Orthostar
//
// Este archivo se carga en TODAS las páginas
// que necesitan acceder al carrito o al catálogo.
// =============================================

// =============================================
// (Nota: Los productos ahora se leen del servidor
// vía /api/productos. Esta variable se mantiene
// solo para compatibilidad con código antiguo.)
// =============================================
var CATALOGO_PRODUCTOS = [];

// =============================================
// CARRITO — guardar / leer / actualizar
// =============================================

// Lee el carrito desde localStorage
function obtenerCarrito() {
  var carrito = localStorage.getItem("orthostarCarrito");
  if (carrito === null) {
    return [];
  }
  return JSON.parse(carrito);
}

// Guarda el carrito en localStorage
function guardarCarrito(carrito) {
  localStorage.setItem("orthostarCarrito", JSON.stringify(carrito));
}

// Agrega un producto al carrito
function agregarAlCarrito(producto) {
  var carrito = obtenerCarrito();

  var existe = false;
  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === producto.id) {
      carrito[i].cantidad += producto.cantidad;
      existe = true;
      break;
    }
  }

  if (!existe) {
    carrito.push(producto);
  }

  guardarCarrito(carrito);
}

// Elimina un producto del carrito
function eliminarDelCarrito(idProducto) {
  var carrito = obtenerCarrito();

  for (var i = 0; i < carrito.length; i++) {
    if (carrito[i].id === idProducto) {
      carrito.splice(i, 1);
      break;
    }
  }

  guardarCarrito(carrito);
}

// Calcula el total del carrito
function calcularTotal() {
  var carrito = obtenerCarrito();
  var total = 0;
  for (var i = 0; i < carrito.length; i++) {
    total += carrito[i].precio * carrito[i].cantidad;
  }
  return total;
}

// Cuenta cuántos ítems hay en el carrito
function contarItems() {
  var carrito = obtenerCarrito();
  var total = 0;
  for (var i = 0; i < carrito.length; i++) {
    total += carrito[i].cantidad;
  }
  return total;
}

// Vacía el carrito completo
function vaciarCarrito() {
  localStorage.removeItem("orthostarCarrito");
}


// =============================================
// PRODUCTO ACTUAL — para pasar entre páginas
// =============================================
// Guarda el producto actual en localStorage para pasar su info entre páginas
function guardarProductoActual(producto) {
  localStorage.setItem("orthostarProductoActual", JSON.stringify(producto));
}

// Recupera el producto actual guardado en localStorage
function obtenerProductoActual() {
  var producto = localStorage.getItem("orthostarProductoActual");
  if (producto === null) {
    return null;
  }
  return JSON.parse(producto);
}


// =============================================
// FORMATEAR PRECIOS
// =============================================
// Formatea un número como precio en soles (ej: S/45.00)
function formatearPrecio(numero) {
  return "S/" + numero.toFixed(2);
}

// =============================================
// 🆕 TOAST (notificación temporal)
// Muestra un mensaje pequeño que desaparece solo
// =============================================
// Muestra una notificación temporal en pantalla que desaparece sola
function mostrarToast(mensaje) {
  // Eliminamos cualquier toast previo
  var anterior = document.querySelector(".toast-mensaje");
  if (anterior) anterior.remove();

  // Creamos el nuevo toast
  var toast = document.createElement("div");
  toast.className = "toast-mensaje";
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  // Lo mostramos con animación
  setTimeout(function() {
    toast.classList.add("visible");
  }, 10);

  // Lo ocultamos después de 2.5 segundos
  setTimeout(function() {
    toast.classList.remove("visible");
    setTimeout(function() {
      toast.remove();
    }, 300);
  }, 2500);
}

// ══════════════════════════════════════════════
// NAVEGACIÓN A PRODUCTO — función compartida
// Usada por index.js, confirmacion.js y cualquier
// otra página que necesite abrir el detalle.
// ══════════════════════════════════════════════
function abrirProducto(producto) {
  producto.categoria   = producto.categoria   || "General";
  producto.descripcion = producto.descripcion || "Producto profesional para ortodoncia.";
  producto.stock       = producto.stock       || 20;
  guardarProductoActual(producto);
  location.href = "producto.html";
}