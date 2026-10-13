// =============================================
// INDEX.JS — Home de Orthostar
// =============================================

// Array global de productos — se llena desde el servidor
var productos = [];

var marcaFiltroActual = null;
var textoBusqueda     = "";


// ══════════════════════════════════════════════
// AL CARGAR LA PÁGINA
// ══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function() {

  fetch('/api/productos')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      productos = data || [];
      inicializarPagina();
    })
    .catch(function() {
      console.warn('No se pudo conectar al servidor para cargar productos.');
      productos = [];
      inicializarPagina();
    });
});


// ══════════════════════════════════════════════
// INICIALIZAR PÁGINA
// Se llama después de cargar los productos
// ══════════════════════════════════════════════
// Carga productos del servidor, inicializa banners, marcas y eventos al cargar la página
function inicializarPagina() {

  // Leer banners del servidor y agregarlos al carrusel
  fetch('/api/ofertas')
    .then(function(res) { return res.json(); })
    .then(function(bannersServidor) {
      var slider   = document.getElementById("sliderOfertas");
      var dotsWrap = document.getElementById("sliderDots");

      // Renderizar slides
      for (var b = 0; b < bannersServidor.length; b++) {
        var slide = document.createElement("article");
        slide.className = "slide";
        slide.innerHTML = "<img src='" + bannersServidor[b].imagen + "' alt='Oferta del mes' style='width:100%;height:100%;object-fit:cover;border-radius:15px;'>";
        slider.appendChild(slide);
      }

      var total = bannersServidor.length;
      if (total < 2) return; // con 1 o 0 imágenes no hace falta autoplay ni dots

      // Crear dots
      var dots = [];
      for (var d = 0; d < total; d++) {
        var dot = document.createElement("span");
        dot.className = "slider-dot" + (d === 0 ? " activo" : "");
        dot.setAttribute("role", "button");
        dot.setAttribute("aria-label", "Ir a imagen " + (d + 1));
        (function(idx) {
          dot.addEventListener("click", function() {
            pausarAutoplay(6000);
            irASlide(idx);
          });
        })(d);
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }

      var indiceActual = 0;
      var autoplayTimer = null;
      var pausaTimeout  = null;

      function irASlide(idx) {
        indiceActual = (idx + total) % total;
        // Calcular el ancho de un slide + gap y hacer scroll
        var slides = slider.querySelectorAll(".slide");
        if (slides.length === 0) return;
        var slideW  = slides[0].offsetWidth;
        var gapPx   = parseInt(window.getComputedStyle(slider).gap) || 12;
        slider.scrollTo({ left: indiceActual * (slideW + gapPx), behavior: "smooth" });
        // Actualizar dot activo
        dots.forEach(function(dot, i) {
          dot.classList.toggle("activo", i === indiceActual);
        });
      }

      function iniciarAutoplay() {
        if (autoplayTimer) return;
        autoplayTimer = setInterval(function() {
          irASlide(indiceActual + 1);
        }, 3000);
      }

      function pausarAutoplay(msPausa) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        clearTimeout(pausaTimeout);
        // Reanudar después del tiempo de pausa (por defecto 5 seg tras interacción)
        pausaTimeout = setTimeout(iniciarAutoplay, msPausa || 5000);
      }

      // Detectar scroll manual (drag o touch) → pausar y reanudar
      slider.addEventListener("scroll", function() {
        // Calcular cuál slide está más visible para sincronizar dots
        var slides2 = slider.querySelectorAll(".slide");
        var slideW2 = slides2[0] ? slides2[0].offsetWidth : 0;
        var gapPx2  = parseInt(window.getComputedStyle(slider).gap) || 12;
        var idx2    = Math.round(slider.scrollLeft / (slideW2 + gapPx2));
        idx2 = Math.max(0, Math.min(idx2, total - 1));
        if (idx2 !== indiceActual) {
          indiceActual = idx2;
          dots.forEach(function(dot, i) {
            dot.classList.toggle("activo", i === indiceActual);
          });
        }
      }, { passive: true });

      slider.addEventListener("mousedown",  function() { pausarAutoplay(6000); });
      slider.addEventListener("touchstart", function() { pausarAutoplay(6000); }, { passive: true });

      // Arrancar
      iniciarAutoplay();

      // Exponer helpers para que el lightbox pueda pausar/reanudar
      window._pausarCarrusel  = pausarAutoplay;
      window._reanudarCarrusel = iniciarAutoplay;
    });

  // Leer marcas del servidor y agregarlas al carrusel
  fetch('/api/marcas')
    .then(function(res) { return res.json(); })
    .then(function(marcasServidor) {
      var marcasScroll = document.getElementById("marcasScroll");
      for (var m = 0; m < marcasServidor.length; m++) {
        var ma  = marcasServidor[m];
        var art = document.createElement("article");
        art.className = "marca-item";
        art.onclick = (function(nombre) {
          return function() { filtrarMarca(nombre); };
        })(ma.nombre);
        art.innerHTML =
          "<div class='marca-circulo' style='overflow:hidden;'>" +
            "<img src='" + ma.imagen + "' alt='" + ma.nombre + "' style='width:100%;height:100%;object-fit:cover;border-radius:50%;'>" +
          "</div>" +
          "<span>" + ma.nombre.toUpperCase() + "</span>";
        marcasScroll.appendChild(art);
      }
    });

  // Pintamos productos agrupados por categoría
  pintarPorCategorias();

  // Búsqueda en tiempo real
  document.getElementById("inputBusqueda").addEventListener("input", function() {
    textoBusqueda = this.value.toLowerCase();
    pintarPorCategorias();
  });

  // Drag scroll de Caleb
  activarDragScroll(document.querySelector(".categorias"));
  activarDragScroll(document.querySelector(".slider"));
  activarDragScroll(document.querySelector(".marcas-scroll-wrapper"));
}


// ══════════════════════════════════════════════
// PINTAR PRODUCTOS AGRUPADOS POR CATEGORÍA
// ══════════════════════════════════════════════
// Agrupa y renderiza los productos por categoría aplicando filtros activos
function pintarPorCategorias() {

  var contenedor = document.getElementById("seccionesProductos");
  contenedor.innerHTML = "";

  var categorias = ["Brackets", "Tubos", "Arcos", "Alicates", "Bandas", "Equipos", "Rayos-x"];
  var hayAlgo    = false;

  for (var c = 0; c < categorias.length; c++) {
    var cat = categorias[c];

    // Filtrar productos de esta categoría
    var productosCat = [];
    for (var i = 0; i < productos.length; i++) {
      var p = productos[i];

      // Filtro por marca
      if (marcaFiltroActual !== null && p.marca !== marcaFiltroActual) continue;

      // Filtro por búsqueda
      if (textoBusqueda !== "") {
        var nombre = p.nombre.toLowerCase();
        var marca  = p.marca.toLowerCase();
        if (nombre.indexOf(textoBusqueda) === -1 && marca.indexOf(textoBusqueda) === -1) continue;
      }

      // Solo los de esta categoría
      var categoriaProd = p.categoria || "General";
      if (categoriaProd !== cat) continue;

      productosCat.push(p);
    }

    if (productosCat.length === 0) continue;

    hayAlgo = true;

    // Creamos la sección de la categoría
    var seccion   = document.createElement("section");
    seccion.className = "seccion-categoria";
    seccion.id        = "cat-" + cat.toLowerCase();

    // Encabezado de la categoría
    var header = document.createElement("div");
    header.className = "cat-header";
    header.innerHTML =
      "<span class='cat-titulo'>" + cat + "</span>" +
      "<span class='cat-ver-mas' onclick='scrollGrid(this)' style='cursor:pointer;'>›</span>";
    seccion.appendChild(header);

    // Grid horizontal de productos
    var grid = document.createElement("div");
    grid.className = "cat-grid";

    for (var j = 0; j < productosCat.length; j++) {
      var prod = productosCat[j];
      var card = document.createElement("article");
      card.className = "tarjeta-producto";
      card.onclick = (function(producto) {
        return function() { abrirProducto(producto); };
      })(prod);

      card.innerHTML =
        "<img src='" + prod.imagen + "' alt='" + prod.nombre + "'>" +
        "<div class='info-producto'>" +
          "<p class='marca-texto'>" + prod.marca + "</p>" +
          "<p class='nombre-texto'>" + prod.nombre + "</p>" +
          "<p class='precio-texto'>" + formatearPrecio(prod.precio) + "</p>" +
        "</div>";

      grid.appendChild(card);
    }

    seccion.appendChild(grid);
    contenedor.appendChild(seccion);
  }

  // Mensaje si no hay resultados
  var sinResultados = document.getElementById("sinResultados");
  sinResultados.style.display = hayAlgo ? "none" : "block";
}


// ══════════════════════════════════════════════
// FILTRAR POR CATEGORÍA (scroll suave a sección)
// ══════════════════════════════════════════════
// Activa el filtro de categoría y hace scroll suave a esa sección
function filtrarCategoria(cat) {

  var botones = document.querySelectorAll(".cat-btn");
  for (var i = 0; i < botones.length; i++) {
    botones[i].classList.remove("activa");
    if (botones[i].textContent === cat) {
      botones[i].classList.add("activa");
    }
  }

  if (cat === "Todos") {
    pintarPorCategorias();
    return;
  }

  pintarPorCategorias();

  setTimeout(function() {
    var seccion = document.getElementById("cat-" + cat.toLowerCase());
    if (seccion) {
      seccion.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
}


// ══════════════════════════════════════════════
// FILTRAR POR MARCA
// ══════════════════════════════════════════════
// Activa o desactiva el filtro por marca (toggle)
function filtrarMarca(marca) {

  if (marcaFiltroActual === marca) {
    marcaFiltroActual = null;
  } else {
    marcaFiltroActual = marca;
  }

  var botones = document.querySelectorAll(".cat-btn");
  for (var i = 0; i < botones.length; i++) {
    botones[i].classList.remove("activa");
    if (botones[i].textContent === "Todos") {
      botones[i].classList.add("activa");
    }
  }

  pintarPorCategorias();
}


// ══════════════════════════════════════════════
// MENÚ LATERAL
// ══════════════════════════════════════════════
// Abre o cierra el menú lateral
function toggleMenu() {
  document.getElementById("menuLateral").classList.toggle("abierto");
}


// ══════════════════════════════════════════════
// DRAG SCROLL (✅ CALEB)
// ══════════════════════════════════════════════
// Habilita el scroll horizontal con drag del mouse en un contenedor
function activarDragScroll(container) {
  if (!container) return;

  var isDown = false, startX = 0, scrollLeft = 0;

  container.addEventListener("mousedown",  function(e) { isDown = true; startX = e.pageX; scrollLeft = container.scrollLeft; });
  container.addEventListener("mouseup",    function()  { isDown = false; });
  container.addEventListener("mouseleave", function()  { isDown = false; });
  container.addEventListener("mousemove",  function(e) {
    if (!isDown) return;
    e.preventDefault();
    container.scrollLeft = scrollLeft - (e.pageX - startX) * 1.5;
  });
}

// ══════════════════════════════════════════════
// SCROLL HORIZONTAL DEL GRID AL HACER CLICK EN ›
// ══════════════════════════════════════════════
// Hace scroll horizontal dentro del grid de productos al hacer click en ›
function scrollGrid(boton) {
  // Sube al encabezado de la sección y busca el grid hermano
  var header = boton.parentElement;
  var grid   = header.nextElementSibling;
  if (grid && grid.classList.contains("cat-grid")) {
    grid.scrollBy({ left: 300, behavior: "smooth" });
  }
}

// ══════════════════════════════════════════════
// LIGHTBOX DE BANNERS/OFERTAS
// ══════════════════════════════════════════════
(function() {
  var overlay = document.getElementById("lightboxOverlay");
  var img     = document.getElementById("lightboxImg");
  var btnClose = document.getElementById("lightboxClose");

  function abrirLightbox(src) {
    img.src = src;
    overlay.classList.add("activo");
    document.body.style.overflow = "hidden";
    // Pausar autoplay mientras el lightbox está abierto
    if (typeof window._pausarCarrusel === "function") window._pausarCarrusel(30000);
  }

  function cerrarLightbox() {
    overlay.classList.remove("activo");
    document.body.style.overflow = "";
    setTimeout(function() { img.src = ""; }, 300);
    // Reanudar autoplay al cerrar
    if (typeof window._reanudarCarrusel === "function") window._reanudarCarrusel();
  }

  // Cerrar al hacer click en el overlay (fuera de la imagen)
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) cerrarLightbox();
  });

  // Cerrar con botón X
  btnClose.addEventListener("click", cerrarLightbox);

  // Cerrar con ESC
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && overlay.classList.contains("activo")) cerrarLightbox();
  });

  // La imagen en sí no cierra (permite ver bien sin cerrar accidentalmente)
  img.addEventListener("click", function(e) { e.stopPropagation(); });

  // Delegación de eventos: detecta clicks en slides del carrusel de ofertas
  // Usamos un pequeño truco: si el drag fue corto (< 5px) lo consideramos click
  var sliderEl = document.getElementById("sliderOfertas");
  var dragMovido = false;

  if (sliderEl) {
    sliderEl.addEventListener("mousedown",  function() { dragMovido = false; });
    sliderEl.addEventListener("mousemove",  function() { dragMovido = true; });
    sliderEl.addEventListener("touchstart", function() { dragMovido = false; }, { passive: true });
    sliderEl.addEventListener("touchmove",  function() { dragMovido = true;  }, { passive: true });

    sliderEl.addEventListener("click", function(e) {
      if (dragMovido) return; // fue drag, no click
      var slideEl = e.target.closest(".slide");
      if (!slideEl) return;
      var imgEl = slideEl.querySelector("img");
      if (imgEl) abrirLightbox(imgEl.src);
    });

    sliderEl.addEventListener("touchend", function(e) {
      if (dragMovido) return;
      var slideEl = e.target.closest(".slide");
      if (!slideEl) return;
      var imgEl = slideEl.querySelector("img");
      if (imgEl) abrirLightbox(imgEl.src);
    });
  }
})();
