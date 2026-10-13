// =============================================
// LOGIN.JS — Validación del acceso administrativo
// Orthostar
//
// ✅ = lógica que YA TENÍAS, se respetó
// 🆕 = línea NUEVA o mejorada
// =============================================

// 🆕 Credenciales (simulación para el curso)
var USUARIO    = "admin";
var CONTRASENA = "orthostar123";

document.addEventListener("DOMContentLoaded", function() {

  // Obtenemos los elementos del HTML
  var btnContinuar = document.getElementById("btnContinuar");
  var btnVolver    = document.getElementById("btnVolver");
  var inputUsuario = document.getElementById("inputUsuario");
  var inputClave   = document.getElementById("inputClave");
  var mensajeError = document.getElementById("mensajeError");

  // ==============================================
  // ✅ YA TENÍAS: ir al dashboard al hacer click
  // 🆕 MEJORADO: ahora valida usuario y contraseña antes
  // ==============================================
  btnContinuar.addEventListener("click", function() {

    var usuario = inputUsuario.value;
    var clave   = inputClave.value;

    // 🆕 Validación: campos vacíos
    if (usuario === "" || clave === "") {
      mensajeError.style.display = "block";
      mensajeError.textContent   = "Completa todos los campos.";
      return;
    }

    // 🆕 Validación: credenciales correctas
    if (usuario !== USUARIO || clave !== CONTRASENA) {
      mensajeError.style.display = "block";
      mensajeError.textContent   = "Usuario o contraseña incorrectos.";
      inputClave.value = "";
      return;
    }

    // 🆕 Si todo está bien, guardamos la sesión y redirigimos
    sessionStorage.setItem("adminLogueado", "true");
    location.href = "admin.html";
  });

  // ✅ YA TENÍAS: volver a la tienda — se mantiene igual
  btnVolver.addEventListener("click", function() {
    location.href = "index.html";
  });

});