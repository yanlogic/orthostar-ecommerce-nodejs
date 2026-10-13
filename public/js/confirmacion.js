// =============================================
// CONFIRMACION.JS — Pedido realizado
// Orthostar — confirmacion.html
// =============================================

document.addEventListener("DOMContentLoaded", function() {

  // Leer el pedido guardado en localStorage y mostrar el número de pedido
  var pedidoStr = localStorage.getItem("orthostarPedido");
  if (pedidoStr) {
    var pedido = JSON.parse(pedidoStr);
    document.getElementById("numeroPedido").textContent = pedido.numero;

    // Descontar el stock de cada producto comprado en el servidor
    descontarStock(pedido.items);
  }

  // Mostrar productos similares al finalizar la compra
  pintarSimilares();
});


// Descuenta el stock de cada producto comprado consultando y actualizando el servidor
function descontarStock(items) {
  if (!items || items.length === 0) return;

  for (var i = 0; i < items.length; i++) {
    (function(item) {
      // Leer el stock actual del servidor
      fetch('/api/productos/' + item.id)
        .then(function(res) { return res.json(); })
        .then(function(producto) {
          // Calcular nuevo stock (mínimo 0)
          var nuevoStock = Math.max(0, producto.stock - item.cantidad);
          // Actualizar el stock en el servidor
          return fetch('/api/admin/productos/' + item.id, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ stock: nuevoStock })
          });
        })
        .catch(function() {
          console.warn('No se pudo actualizar el stock del producto ' + item.id);
        });
    })(items[i]);
  }
}

// Obtiene productos del servidor y muestra hasta 6 como sugerencias post-compra
function pintarSimilares() {
  var contenedor = document.getElementById("similaresGrid");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  fetch('/api/productos')
    .then(function(res) { return res.json(); })
    .then(function(products) {
      if (!products || products.length === 0) return;

      // Mostrar máximo 6 productos similares
      for (var i = 0; i < products.length && i < 6; i++) {
        var p   = products[i];
        var div = document.createElement("article");
        div.className = "similar-grid-item";
        div.onclick   = (function(prod) {
          return function() { abrirProducto(prod); };
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