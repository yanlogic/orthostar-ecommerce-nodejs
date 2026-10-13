// =============================================
// CARRITO.JS — Lógica del carrito
// Orthostar — carrito.html
// =============================================


document.addEventListener("DOMContentLoaded", function() {
  pintarCarrito();
});


// PINTAR LISTA
// Renderiza todos los ítems del carrito en pantalla
function pintarCarrito() {

  var carrito  = obtenerCarrito();
  var listado  = document.getElementById("listadoCarrito");
  var vacio    = document.getElementById("carritoVacio");
  var btn      = document.getElementById("btnComprar");

  listado.innerHTML = "";

  if (carrito.length === 0) {
    listado.style.display = "none";
    vacio.style.display = "block";
    btn.style.display = "none";
    return;
  }

  listado.style.display = "block";
  vacio.style.display = "none";
  btn.style.display = "block";

  for (var i = 0; i < carrito.length; i++) {
    var item = carrito[i];
    var subtotal = item.precio * item.cantidad;

    var div = document.createElement("article");
    div.className = "item-carrito";

    div.innerHTML =
      "<img src='" + item.imagen + "' alt='" + item.nombre + "'>" +

      "<div class='item-info'>" +
        "<p class='item-marca'>" + item.marca + "</p>" +
        "<p class='item-nombre'>" + item.nombre + "</p>" +
        "<p class='item-cantidad'>Cantidad: " + item.cantidad + "</p>" +
      "</div>" +

      "<div class='item-derecha'>" +
        "<p class='item-precio'>" + formatearPrecio(subtotal) + "</p>" +
        "<button class='btn-eliminar' onclick='quitarItem(" + item.id + ")' aria-label='Eliminar producto'>🗑</button>" +
      "</div>";

    listado.appendChild(div);
  }

  var total = calcularTotal();
  btn.textContent = "Comprar ahora (" + formatearPrecio(total) + ")";
}


// QUITAR ITEM
// Elimina un producto del carrito con confirmación modal
function quitarItem(idProducto) {
  mostrarConfirm("¿Quitar este producto del carrito?", function() {
    eliminarDelCarrito(idProducto);
    pintarCarrito();
  });
}

// IR AL CHECKOUT
// Redirige al checkout si el carrito no está vacío
function irACheckout() {
  if (obtenerCarrito().length === 0) {
    mostrarAviso("Tu carrito está vacío.", "Carrito vacío");
    return;
  }
  location.href = "checkout.html";
}