// =============================================
// CONTACTO.JS — Chatbot con sugerencias
// Orthostar — contacto.html
// =============================================

// ── CATÁLOGO GLOBAL — se carga desde el servidor al iniciar ──
var catalogoProductos = [];
var catalogoBanners   = [];

// Carga productos y banners del servidor una sola vez
function cargarCatalogoDesdeServidor() {
  fetch('/api/productos')
    .then(function(res) { return res.json(); })
    .then(function(data) { catalogoProductos = data || []; })
    .catch(function() { catalogoProductos = []; });

  fetch('/api/ofertas')
    .then(function(res) { return res.json(); })
    .then(function(data) { catalogoBanners = data || []; })
    .catch(function() { catalogoBanners = []; });
}

// Filtra productos por categoría desde el catálogo global
function obtenerProductosPorCategoria(categoria) {
  return catalogoProductos.filter(function(p) {
    return p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase();
  });
}

// Filtra productos por marca desde el catálogo global
function obtenerProductosPorMarca(marca) {
  return catalogoProductos.filter(function(p) {
    return p.marca && p.marca.toLowerCase() === marca.toLowerCase();
  });
}

// Devuelve los banners activos desde el catálogo global
function obtenerBannersActivos() {
  return catalogoBanners;
}

// Genera una lista HTML numerada con nombre y precio de cada producto (máx. 5 por defecto)
function generarListaProductos(productos, max) {
  max = max || 5;
  var html = "";
  for (var i = 0; i < productos.length && i < max; i++) {
    var precio = typeof productos[i].precio === "number" ? productos[i].precio.toFixed(2) : String(productos[i].precio || "0");
    html += (i+1) + ". " + productos[i].nombre + " — S/" + precio + "<br>";
  }
  if (productos.length > max) {
    html += "<em>... y " + (productos.length - max) + " más.</em><br>";
  }
  html += "<br>"; // separador antes del texto final
  return html;
}

// ── BASE DE RESPUESTAS ────────────────────────
// Cada entrada tiene:
//   palabras:     activan la respuesta
//   respuesta:    texto del bot
//   sugerencias:  tarjetitas que aparecen DESPUÉS de esta respuesta
var respuestas = [
  {
    palabras:    ["hola", "buenas", "buenos", "buen", "hey", "hi", "saludos", "inicio"],
    respuesta:   "¡Hola! 👋 Gracias por comunicarte con Orthostar. ¿En qué puedo ayudarte hoy?",
    sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Dónde están ubicados?"]
  },
  {
    palabras:    ["precio", "costo", "cuánto", "cuanto", "vale", "valor", "cobran"],
    respuesta:   "Puedes consultar los precios en nuestro catálogo. Así mismo, estos son negociables según el volumen del pedido. Puedes solicitar una cotización personalizada por WhatsApp o desde nuestra tienda. 📋",
    sugerencias: ["¿Hacen delivery?", "¿Qué marcas manejan?", "¿Cómo puedo pagar?", "¿Dónde están ubicados?"]
  },
  {
    palabras:    ["stock", "disponible", "disponibilidad", "hay", "tienen", "quedan"],
    respuesta:   "Puedes revisar la disponibilidad en nuestro catálogo. Si necesitas confirmar stock de un producto específico, escríbenos. 📦",
    sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Tienen garantía?"]
  },
  {
    palabras:    ["delivery", "envío", "envio", "entrega", "despacho", "llega", "traslado"],
    respuesta:   "Ofrecemos delivery en Lima. El envío es gratis en pedidos mayores a S/100. Para montos menores, el costo es de S/3 a S/5. 🚚",
    sugerencias: ["¿Cuáles son sus precios?", "¿Cómo puedo pagar?", "¿Tienen garantía?", "¿Dónde están ubicados?"]
  },
  {
    palabras:    ["garantía", "garantia", "devolver", "cambio", "falla"],
    respuesta:   "Nuestros equipos incluyen garantía del fabricante. Los materiales de consumo (brackets, arcos) son de calidad certificada. ✅",
    sugerencias: ["¿Qué marcas manejan?", "¿Hacen delivery?", "¿Cuáles son sus precios?", "¿Dónde están ubicados?"]
  },
  {
    palabras:    ["marca", "marcas", "morelli", "orthometric", "bestpli", "bgs", "woodpecker", "eighteeth", "nsk"],
    respuesta:   "Trabajamos con Morelli, Orthometric, Bestpli y BGS en materiales, y Woodpecker, Eighteeth y NSK en equipos. 🦷",
    sugerencias: ["¿Cuáles son sus precios?", "¿Tienen stock disponible?", "¿Tienen garantía?", "¿Hacen delivery?"]
  },
  {
    palabras:    ["ubicación", "ubicacion", "dirección", "direccion", "dónde", "donde", "local", "tienda"],
    respuesta:   "Nos encontramos en Av Emancipación 271, Tienda 100, Cercado de Lima, Lima, Perú 📍",
    sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Cómo puedo pagar?"]
  },
  {
    palabras:    ["whatsapp", "numero", "número", "teléfono", "telefono", "llamar"],
    respuesta:   "Puedes contactarnos por WhatsApp para atención personalizada y cotizaciones grandes. Un asesor te responderá a la brevedad. 📱",
    sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Dónde están ubicados?", "¿Tienen garantía?"]
  },
  {
    palabras:    ["pago", "pagar", "yape", "transferencia", "efectivo", "tarjeta"],
    respuesta:   "Aceptamos: Efectivo, Transferencia bancaria, Tarjeta, Yape y Coordinar con asesor para pedidos grandes. 💳",
    sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Tienen stock disponible?", "¿Dónde están ubicados?"]
  },
  {
    palabras:    ["bracket", "brackets", "arco", "arcos", "alicate", "alicates", "banda", "bandas", "tubo", "tubos"],
    respuesta:   "Contamos con brackets, arcos, alicates, bandas, tubos y más materiales de ortodoncia. Revisa nuestro catálogo. 🔧",
    sugerencias: ["¿Cuáles son sus precios?", "¿Tienen stock disponible?", "¿Qué marcas manejan?", "¿Hacen delivery?"]
  },
  {
    palabras:    ["equipo", "equipos", "lampara", "lámpara", "ultrasonido", "rayos"],
    respuesta:   "Manejamos lámparas de fotocurado, ultrasonidos y equipos de rayos X de las mejores marcas. Solicita una cotización. 💡",
    sugerencias: ["¿Cuáles son sus precios?", "¿Tienen garantía?", "¿Hacen delivery?", "¿Qué marcas manejan?"]
  },
  {
    palabras:    ["gracias", "perfecto", "listo", "genial", "ok", "okay", "bien"],
    respuesta:   "¡Con mucho gusto! 😊 Si tienes otra consulta, aquí estamos. ¡Que tengas un excelente día!",
    sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Dónde están ubicados?"]
  },
  {
    palabras:    ["pedido", "pedir", "comprar", "orden"],
    respuesta:   "Para pedidos pequeños usa nuestro formulario en la tienda. Para pedidos grandes, contáctanos por WhatsApp. 🛒",
    sugerencias: ["¿Cuáles son sus precios?", "¿Cómo puedo pagar?", "¿Hacen delivery?", "¿Tienen stock disponible?"]
  }
];

var respuestaDefault = {
  respuesta:   "Mmm, no entendí bien tu consulta. 🤔 ¿Puedes reformularla? Puedo ayudarte con precios, stock, delivery, garantías, marcas y ubicación.",
  sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Dónde están ubicados?"]
};


// ══════════════════════════════════════════════
// AL CARGAR LA PÁGINA
// ══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", function() {

  // Cargar catálogo desde el servidor
  cargarCatalogoDesdeServidor();

  // Mensaje de bienvenida automático
  setTimeout(function() {
    mostrarRespuestaBot(
      "¡Hola! 👋 Bienvenido al soporte de Orthostar. ¿En qué puedo ayudarte hoy?",
      ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Dónde están ubicados?"]
    );
  }, 500);

  // Enter para enviar
  document.getElementById("inputMensaje").addEventListener("keydown", function(e) {
    if (e.key === "Enter") enviarMensaje();
  });
});

// ══════════════════════════════════════════════
// ENVIAR MENSAJE DEL USUARIO
// ══════════════════════════════════════════════
function enviarMensaje() {
  var input = document.getElementById("inputMensaje");
  var texto = input.value.trim();
  if (texto === "") return;

  // Eliminar sugerencias anteriores antes de agregar nuevo mensaje
  eliminarSugerencias();

  agregarBurbuja(texto, "usuario");
  input.value = "";

  var idEscribiendo = mostrarEscribiendo();

  setTimeout(function() {
    quitarEscribiendo(idEscribiendo);
    var resultado = buscarRespuesta(texto);
    mostrarRespuestaBot(resultado.respuesta, resultado.sugerencias);
  }, 1000);
}


// ══════════════════════════════════════════════
// ENVIAR SUGERENCIA (click en tarjetita)
// ══════════════════════════════════════════════
function enviarSugerencia(texto) {
  // Eliminar todas las sugerencias
  eliminarSugerencias();

  // Agregar burbuja del usuario con el texto de la sugerencia
  agregarBurbuja(texto, "usuario");

  var idEscribiendo = mostrarEscribiendo();

  setTimeout(function() {
    quitarEscribiendo(idEscribiendo);
    var resultado = buscarRespuesta(texto);
    mostrarRespuestaBot(resultado.respuesta, resultado.sugerencias);
  }, 1000);
}


// ══════════════════════════════════════════════
// MOSTRAR RESPUESTA DEL BOT + SUGERENCIAS
// ══════════════════════════════════════════════
function mostrarRespuestaBot(texto, sugerencias) {
  agregarBurbuja(texto, "bot");

  // Agregar tarjetitas de sugerencias después de la burbuja del bot
  if (sugerencias && sugerencias.length > 0) {
    var contenedor = document.getElementById("chatMensajes");

    var divSugs = document.createElement("div");
    divSugs.className = "sugerencias-container";
    divSugs.id        = "sugerencias-actuales";

    for (var i = 0; i < sugerencias.length; i++) {
      var btn = document.createElement("button");
      btn.className   = "btn-sugerencia";
      btn.textContent = sugerencias[i];
      btn.onclick     = (function(texto) {
        return function() { enviarSugerencia(texto); };
      })(sugerencias[i]);
      divSugs.appendChild(btn);
    }

    contenedor.appendChild(divSugs);
    contenedor.scrollTop = contenedor.scrollHeight;
  }
}


// ══════════════════════════════════════════════
// ELIMINAR SUGERENCIAS ANTERIORES
// ══════════════════════════════════════════════
function eliminarSugerencias() {
  var sugs = document.getElementById("sugerencias-actuales");
  if (sugs) sugs.remove();
}


// ══════════════════════════════════════════════
// BUSCAR RESPUESTA POR PALABRAS CLAVE
// (versión inteligente con datos reales)
// ══════════════════════════════════════════════
function buscarRespuesta(textoUsuario) {
  var textoLower = quitarTildes(textoUsuario.toLowerCase());

  // ── Detectar categoría específica en la pregunta ──
  var categoriaDetectada = null;
  var categorias = ["bracket","brackets","tubo","tubos","arco","arcos","alicate","alicates","equipo","equipos","lampara","ultrasonido"];
  var categoriasMap = {
    "bracket":"Brackets","brackets":"Brackets",
    "tubo":"Tubos","tubos":"Tubos",
    "arco":"Arcos","arcos":"Arcos",
    "alicate":"Alicates","alicates":"Alicates",
    "equipo":"Equipos","equipos":"Equipos",
    "lampara":"Equipos","ultrasonido":"Equipos"
  };
  for (var c = 0; c < categorias.length; c++) {
    if (textoLower.indexOf(categorias[c]) !== -1) {
      categoriaDetectada = categoriasMap[categorias[c]];
      break;
    }
  }

  // ── Detectar marca específica en la pregunta ──
  var marcaDetectada = null;
  var marcasMap = {
    "morelli":"Morelli","orthometric":"Orthometric",
    "bestpli":"Bestpli","bgs":"BGS",
    "woodpecker":"Woodpecker","eighteeth":"Eighteeth","nsk":"NSK"
  };
  for (var mk in marcasMap) {
    if (textoLower.indexOf(mk) !== -1) {
      marcaDetectada = marcasMap[mk];
      break;
    }
  }

  // ── Pregunta sobre precios con categoría específica ──
  var esPreguntaPrecio = (textoLower.indexOf("precio") !== -1 || textoLower.indexOf("cuanto") !== -1 || textoLower.indexOf("costo") !== -1 || textoLower.indexOf("vale") !== -1);

  if (esPreguntaPrecio && categoriaDetectada) {
    var prods = obtenerProductosPorCategoria(categoriaDetectada);
    if (prods.length > 0) {
      var lista = generarListaProductos(prods, 6);
      return {
        respuesta: "Estos son nuestros " + categoriaDetectada + " con sus precios referenciales:" + lista + "\n\nRecuerda que los precios son negociables según el volumen. 📋",
        sugerencias: ["¿Hacen delivery?", "¿Qué marcas manejan?", "¿Tienen garantía?", "¿Cómo puedo pagar?"]
      };
    }
  }

  // ── Pregunta sobre productos de una marca específica ──
  var esPreguntaMarca = (textoLower.indexOf("producto") !== -1 || textoLower.indexOf("tienen") !== -1 || textoLower.indexOf("venden") !== -1 || esPreguntaPrecio);

  if (marcaDetectada && esPreguntaMarca) {
    var prodsMarca = obtenerProductosPorMarca(marcaDetectada);
    if (prodsMarca.length > 0) {
      var listaMarca = generarListaProductos(prodsMarca, 5);
      return {
        respuesta: "html:Productos de <b>" + marcaDetectada + "</b> que manejamos:<br><br>" + listaMarca + "Para cotizaciones escríbenos por WhatsApp. 🦷",
        sugerencias: ["¿Cuáles son sus precios?", "¿Tienen stock disponible?", "¿Hacen delivery?", "¿Tienen garantía?"]
      };
    }
  }

  // ── Pregunta sobre ofertas ──
  if (textoLower.indexOf("oferta") !== -1 || textoLower.indexOf("descuento") !== -1 || textoLower.indexOf("promocion") !== -1) {
    var banners = obtenerBannersActivos();
    if (banners.length > 0) {
      var textoOfertas = "Tenemos " + banners.length + " oferta(s) activa(s) en este momento:\n";
      for (var b = 0; b < banners.length; b++) {
        textoOfertas += "\n  " + (b+1) + ". Disponible hasta: " + banners[b].fin;
      }
      textoOfertas += "\n\nVisita nuestra tienda para ver las imágenes de cada oferta. 🎉";
      return {
        respuesta: textoOfertas,
        sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Cómo puedo pagar?"]
      };
    } else {
      return {
        respuesta: "En este momento no tenemos ofertas activas, pero puedes revisar nuestro catálogo para ver los precios regulares. 🛒",
        sugerencias: ["¿Cuáles son sus precios?", "¿Hacen delivery?", "¿Qué marcas manejan?", "¿Dónde están ubicados?"]
      };
    }
  }

  // ── Búsqueda normal por palabras clave ──
  for (var i = 0; i < respuestas.length; i++) {
    var entrada = respuestas[i];
    for (var j = 0; j < entrada.palabras.length; j++) {
      var palabra = quitarTildes(entrada.palabras[j].toLowerCase());
      if (textoLower.indexOf(palabra) !== -1) {
        return { respuesta: entrada.respuesta, sugerencias: entrada.sugerencias };
      }
    }
  }

  return respuestaDefault;
}


// ══════════════════════════════════════════════
// AGREGAR BURBUJA AL CHAT
// ══════════════════════════════════════════════
function agregarBurbuja(texto, tipo) {
  var contenedor = document.getElementById("chatMensajes");

  var div = document.createElement("div");
  div.className = tipo === "bot" ? "burbuja burbuja-bot" : "burbuja burbuja-usuario";

  // Si el texto empieza con "html:" lo renderizamos como HTML
  if (tipo === "bot" && texto.indexOf("html:") === 0) {
    div.innerHTML = texto.substring(5); // quita el prefijo "html:"
  } else {
    div.textContent = texto;
  }

  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}


// ══════════════════════════════════════════════
// ANIMACIÓN "ESCRIBIENDO..."
// ══════════════════════════════════════════════
function mostrarEscribiendo() {
  var contenedor = document.getElementById("chatMensajes");
  var id         = "escribiendo-" + Date.now();

  var div       = document.createElement("div");
  div.className = "burbuja burbuja-escribiendo";
  div.id        = id;
  div.innerHTML = "<div class='puntos-escribiendo'><span></span><span></span><span></span></div>";

  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
  return id;
}

// Elimina la burbuja de "escribiendo..." del chat por su ID
function quitarEscribiendo(id) {
  var elem = document.getElementById(id);
  if (elem) elem.remove();
}


// ══════════════════════════════════════════════
// QUITAR TILDES
// ══════════════════════════════════════════════
function quitarTildes(texto) {
  return texto
    .replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i")
    .replace(/ó/g,"o").replace(/ú/g,"u").replace(/ü/g,"u").replace(/ñ/g,"n");
}