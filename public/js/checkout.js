// =============================================
// CHECKOUT.JS — Lógica de la pantalla de pago
// Orthostar — checkout.html
// Cálculo de envío dinámico:
//   - Total >= S/100 → envío gratis
//   - Total >= S/50  → envío S/3
//   - Total <  S/50  → envío S/5
// =============================================

// Costo de envío calculado al cargar la página
var costoEnvio = 0;


document.addEventListener("DOMContentLoaded", function() {

  // Redirige al carrito si no hay productos
  if (obtenerCarrito().length === 0) {
    mostrarAlerta("No hay productos en tu carrito.");
    location.href = "carrito.html";
    return;
  }

  pintarResumen();
});


// Calcula el costo de envío según el subtotal del carrito
function calcularEnvio(subtotal) {
  if (subtotal >= 100) {
    return 0; // envío gratis para pedidos mayores a S/100
  } else if (subtotal >= 50) {
    return 3; // envío reducido para pedidos entre S/50 y S/100
  } else {
    return 5; // envío estándar para pedidos menores a S/50
  }
}

// Renderiza el resumen del pedido con ítems, subtotal, envío y total
function pintarResumen() {

  var carrito = obtenerCarrito();
  var listado = document.getElementById("listadoCheckout");
  listado.innerHTML = "";

  var subtotal   = 0;
  var totalItems = 0;

  for (var i = 0; i < carrito.length; i++) {
    var item = carrito[i];
    var precioItem = item.precio * item.cantidad;
    subtotal   += precioItem;
    totalItems += item.cantidad;

    var div = document.createElement("article");
    div.className = "resumen-item";

    div.innerHTML =
      "<img src='" + item.imagen + "' alt='" + item.nombre + "'>" +
      "<div class='item-info'>" +
        "<p class='item-marca'>" + item.marca + "</p>" +
        "<p class='item-nombre'>" + item.nombre + "</p>" +
        "<p class='item-descripcion'>" + (item.descripcion || "") + "</p>" +
        "<p class='item-cantidad'>Cantidad: " + item.cantidad + "</p>" +
      "</div>" +
      "<p class='item-precio'>" + formatearPrecio(precioItem) + "</p>";

    listado.appendChild(div);
  }

  // Calcular envío y total final
  costoEnvio = calcularEnvio(subtotal);
  var totalFinal = subtotal + costoEnvio;

  // Actualizar texto de entrega según si es gratis o no
  var entregaInfo = document.getElementById("entregaInfo");
  if (costoEnvio === 0) {
    entregaInfo.innerHTML =
      "<strong>Entrega gratis</strong><br>" +
      "<span class='text-muted'>Estándar | 3-4 días</span>";
  } else {
    entregaInfo.innerHTML =
      "Costo: <strong>" + formatearPrecio(costoEnvio) + "</strong><br>" +
      "<span class='text-muted'>Estándar | 3-4 días</span>";
  }

  // Actualizar contadores y totales en el DOM
  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("subtotal").textContent   = formatearPrecio(subtotal);
  document.getElementById("costoEnvio").textContent = costoEnvio === 0 ? "Gratis" : formatearPrecio(costoEnvio);
  document.getElementById("totalFinal").textContent = formatearPrecio(totalFinal);
}

// Valida el formulario, genera el pedido y redirige a confirmación
function realizarPago() {

  var direccion = document.getElementById("direccionEnvio").value.trim();
  var telefono  = document.getElementById("telefono").value.trim();
  var correo    = document.getElementById("correo").value.trim();
  var metodo    = document.getElementById("metodoPago").value;

  // Validar campos obligatorios
  if (direccion === "") { mostrarAlerta("Por favor agrega una dirección de envío."); return; }
  if (telefono === "")  { mostrarAlerta("Por favor ingresa un número de teléfono."); return; }
  if (correo === "")    { mostrarAlerta("Por favor ingresa tu correo electrónico."); return; }
  if (metodo === "")    { mostrarAlerta("Por favor selecciona un método de pago."); return; }

  // Validar formato de correo
  if (correo.indexOf("@") === -1 || correo.indexOf(".") === -1) {
    mostrarAlerta("El correo electrónico no parece ser válido."); return;
  }

  // Validar formato de teléfono (solo números, mínimo 7 dígitos)
  var soloNumeros = telefono.replace(/\s/g, "");
  if (isNaN(soloNumeros) || soloNumeros.length < 7) {
    mostrarAlerta("El número de teléfono no es válido."); return;
  }

  // Generar número de pedido aleatorio con formato #00000
  var numeroPedido = Math.floor(Math.random() * 99999) + 1;
  var pedidoStr = "#" + numeroPedido.toString().padStart(5, "0");

  // Construir objeto del pedido con todos los datos
  var pedido = {
    numero:     pedidoStr,
    direccion:  direccion,
    telefono:   telefono,
    correo:     correo,
    metodo:     metodo,
    items:      obtenerCarrito(),
    subtotal:   calcularTotal(),
    envio:      costoEnvio,
    total:      calcularTotal() + costoEnvio
  };

  // Guardar en localStorage para que confirmacion.js lo lea al redirigir
  localStorage.setItem("orthostarPedido", JSON.stringify(pedido));

  // Guardar también en el servidor para persistencia
  fetch('/api/pedidos', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(pedido)
  }).catch(function() {
    console.warn('No se pudo guardar el pedido en el servidor.');
  });

  vaciarCarrito();
  location.href = "confirmacion.html";
}