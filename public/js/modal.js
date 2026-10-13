// =============================================
// MODAL.JS — Sistema de alertas personalizadas
// Orthostar
// =============================================

// Crear el modal INMEDIATAMENTE (sin esperar DOMContentLoaded)
// para que esté disponible cuando cualquier función lo llame
// Crea el overlay y la caja del modal en el DOM si aún no existen
function _crearModal() {
  if (document.getElementById("orthoModal")) return;

  // Overlay
  var overlay = document.createElement("div");
  overlay.id = "orthoOverlay";
  overlay.onclick = function() { modalCancelar(); };
  document.body.appendChild(overlay);

  // Modal
  var modal = document.createElement("div");
  modal.id = "orthoModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  // Caja interior
  var inner = document.createElement("div");
  inner.id = "orthoModalInner";

  // Mensaje
  var mensaje = document.createElement("p");
  mensaje.id = "modalMensaje";

  // Botones
  var botones = document.createElement("div");
  botones.id = "modalBotones";

  var btnAceptar = document.createElement("button");
  btnAceptar.id          = "modalBtnAceptar";
  btnAceptar.textContent = "Aceptar";
  btnAceptar.onclick     = function() { modalAceptar(); };

  var btnCancelar = document.createElement("button");
  btnCancelar.id          = "modalBtnCancelar";
  btnCancelar.textContent = "Cancelar";
  btnCancelar.onclick     = function() { modalCancelar(); };

  botones.appendChild(btnAceptar);
  botones.appendChild(btnCancelar);
  inner.appendChild(mensaje);
  inner.appendChild(botones);
  modal.appendChild(inner);
  document.body.appendChild(modal);
}

// Si el body ya existe, crear el modal ahora mismo
// Si no, esperar al DOMContentLoaded
if (document.body) {
  _crearModal();
} else {
  document.addEventListener("DOMContentLoaded", _crearModal);
}

// ── Variables de callback ────────────────────
var _modalCallback       = null;
var _modalCancelCallback = null;


// ── ALERTA SIMPLE (reemplaza alert) ──────────
// Muestra una alerta simple con un botón Aceptar (reemplaza alert())
function mostrarAlerta(mensaje, callback) {
  _crearModal(); // por si acaso aún no existe

  _modalCallback       = callback || null;
  _modalCancelCallback = null;

  document.getElementById("modalMensaje").innerHTML         = mensaje;
  document.getElementById("modalBtnCancelar").style.display = "none";
  document.getElementById("modalBtnAceptar").textContent    = "Aceptar";

  abrirModal();
}


// ── CONFIRMACIÓN (reemplaza confirm) ─────────
// Muestra un diálogo de confirmación con botones Aceptar y Cancelar (reemplaza confirm())
function mostrarConfirm(mensaje, onAceptar, onCancelar) {
  _crearModal(); // por si acaso aún no existe

  _modalCallback       = onAceptar  || null;
  _modalCancelCallback = onCancelar || null;

  document.getElementById("modalMensaje").innerHTML         = mensaje;
  document.getElementById("modalBtnCancelar").style.display = "inline-block";
  document.getElementById("modalBtnAceptar").textContent    = "Aceptar";
  document.getElementById("modalBtnCancelar").textContent   = "Cancelar";

  abrirModal();
}


// ── ABRIR / CERRAR ────────────────────────────
// Activa el overlay y la animación de entrada del modal
function abrirModal() {
  _crearModal(); // seguridad extra

  var overlay = document.getElementById("orthoOverlay");
  var modal   = document.getElementById("orthoModal");
  var inner   = document.getElementById("orthoModalInner");

  if (!overlay || !modal || !inner) return;

  overlay.classList.add("activo");
  modal.classList.add("activo");

  // Animación pop-in
  inner.style.animation = "none";
  inner.offsetHeight; // forzar reflow
  inner.style.animation = "modalPopIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards";
}

// Oculta el overlay y el modal
function cerrarModal() {
  var overlay = document.getElementById("orthoOverlay");
  var modal   = document.getElementById("orthoModal");
  if (overlay) overlay.classList.remove("activo");
  if (modal)   modal.classList.remove("activo");
}

// Cierra el modal al hacer click en el overlay (sin ejecutar callback)
function cerrarModalOverlay() { modalCancelar(); }

// Ejecuta el callback de aceptar y cierra el modal
function modalAceptar() {
  cerrarModal();
  if (_modalCallback) _modalCallback();
}

// Ejecuta el callback de cancelar y cierra el modal
function modalCancelar() {
  cerrarModal();
  if (_modalCancelCallback) _modalCancelCallback();
}