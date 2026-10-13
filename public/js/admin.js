// =============================================
// ADMIN.JS — Panel administrativo
// Orthostar — admin.html
// =============================================

// Variables globales del panel administrativo
var productos       = {};
var banners         = [];
var marcas          = [];
var bannerImgBase64 = "";
var marcaImgBase64  = "";
var prodImgBase64   = "";
var marcaActual     = "";


document.addEventListener("DOMContentLoaded", function() {

  // Redirige al login si no hay sesión activa
  if (sessionStorage.getItem("adminLogueado") !== "true") {
    location.href = "login.html";
    return;
  }

  // Cargar datos desde el servidor al iniciar el dashboard
  cargarProductosDesdeServidor();
  cargarMarcasDesdeServidor();
  cargarBannersDesdeServidor();

  // Preview y validación de imagen de producto
  document.getElementById("prodImagen").addEventListener("change", function() {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        if (img.width < 200 || img.height < 200) {
          mostrarAlerta("⚠️ Imagen muy pequeña (" + img.width + "×" + img.height + "px).\nSe recomienda una imagen cuadrada de mínimo 400×400 px.");
        } else if (img.width > 2000 || img.height > 2000) {
          mostrarAlerta("⚠️ Imagen muy grande (" + img.width + "×" + img.height + "px).\nSe recomienda máximo 800×800 px.");
        } else if (Math.abs(img.width - img.height) > img.width * 0.5) {
          mostrarAlerta("💡 Recomendación: usa una imagen cuadrada para que la tarjeta se vea mejor.");
        }
        prodImgBase64 = e.target.result;
        var prev = document.getElementById("prodPreview");
        prev.src = prodImgBase64;
        prev.classList.remove("d-none");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Preview y compresión de imagen de banner (máx 1535×1024px)
  document.getElementById("bannerImagen").addEventListener("change", function() {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var MAX_W = 1535;
        var MAX_H = 1024;
        var w = img.width;
        var h = img.height;
        // Reducir proporcionalmente si supera el máximo
        if (w > MAX_W || h > MAX_H) {
          var ratio = Math.min(MAX_W / w, MAX_H / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        var canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        bannerImgBase64 = canvas.toDataURL("image/jpeg", 0.92);
        var prev = document.getElementById("bannerPreview");
        prev.src = bannerImgBase64;
        prev.classList.remove("d-none");
        if (img.width < 600 || img.height < 200) {
          mostrarAlerta("⚠️ Imagen pequeña. Recomendamos mínimo 800×300 px.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Preview y validación de imagen de marca
  document.getElementById("marcaImagen").addEventListener("change", function() {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        if (img.width < 100 || img.height < 100) {
          mostrarAlerta("⚠️ Imagen muy pequeña. Mínimo 150×150 px.");
        } else if (Math.abs(img.width - img.height) > img.width * 0.3) {
          mostrarAlerta("💡 Recomendamos una imagen cuadrada para el círculo.");
        }
        marcaImgBase64 = e.target.result;
        var prev = document.getElementById("marcaPreview");
        prev.src = marcaImgBase64;
        prev.classList.remove("d-none");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
});


// ── MENÚ Y SESIÓN ────────────────────────────

// Abre o cierra el menú lateral del dashboard
function toggleMenu() {
  document.getElementById("menuLateral").classList.toggle("abierto");
}

// Elimina la sesión del admin y redirige al login
function cerrarSesion() {
  sessionStorage.removeItem("adminLogueado");
  location.href = "login.html";
}


// ── TABS ─────────────────────────────────────

// Muestra la sección seleccionada y oculta las demás
function cambiarTab(tab) {
  document.getElementById("secProductos").style.display = "none";
  document.getElementById("secOfertas").style.display   = "none";
  document.getElementById("secMarcas").style.display    = "none";
  document.getElementById("tabProductos").classList.remove("active");
  document.getElementById("tabOfertas").classList.remove("active");
  document.getElementById("tabMarcas").classList.remove("active");

  if (tab === "productos") {
    document.getElementById("secProductos").style.display = "block";
    document.getElementById("tabProductos").classList.add("active");
  } else if (tab === "ofertas") {
    document.getElementById("secOfertas").style.display = "block";
    document.getElementById("tabOfertas").classList.add("active");
  } else if (tab === "marcas") {
    document.getElementById("secMarcas").style.display = "block";
    document.getElementById("tabMarcas").classList.add("active");
  }
}


// ══════════════════════════════════════════════
// PRODUCTOS — SERVIDOR
// ══════════════════════════════════════════════

// Obtiene todos los productos del servidor y los agrupa por marca
function cargarProductosDesdeServidor() {
  fetch('/api/productos')
    .then(function(res) { return res.json(); })
    .then(function(lista) {
      // Reconstruir objeto agrupado por marca
      productos = {};
      for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        if (!productos[p.marca]) productos[p.marca] = [];
        productos[p.marca].push({ id: p.id, nombre: p.nombre, stock: p.stock, precio: p.precio });
      }
      sincronizarSelectMarcas();
      sincronizarListaMarcas();
      actualizarContadores();
    })
    .catch(function() {
      mostrarAlerta("No se pudo conectar con el servidor para cargar productos.");
    });
}

// Valida el formulario y envía un nuevo producto al servidor
function agregarProducto() {
  var nombre    = document.getElementById("prodNombre").value.trim();
  var desc      = document.getElementById("prodDescripcion").value.trim();
  var precio    = parseFloat(document.getElementById("prodPrecio").value) || 0;
  var cantidad  = parseInt(document.getElementById("prodCantidad").textContent) || 0;
  var marca     = document.getElementById("prodMarca").value;
  var catSelect = document.getElementById("prodCategoria");
  var categoria = catSelect ? (catSelect.value || "Otros") : "Otros";

  if (!nombre || !marca) {
    mostrarAlerta("Completa el nombre y la marca del producto."); return;
  }
  if (!prodImgBase64) {
    mostrarAlerta("Sube una imagen para el producto."); return;
  }

  var nuevoProd = {
    nombre:      nombre,
    descripcion: desc,
    precio:      precio,
    stock:       cantidad,
    marca:       marca,
    categoria:   categoria,
    imagen:      prodImgBase64
  };

  // Guardar en el servidor via POST
  fetch('/api/admin/productos', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(nuevoProd)
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.ok) { mostrarAlerta("Error al guardar el producto."); return; }

      // Actualizar objeto local con el id que devolvió el servidor
      var prod = data.producto;
      if (!productos[prod.marca]) productos[prod.marca] = [];
      productos[prod.marca].push({ id: prod.id, nombre: prod.nombre, stock: prod.stock, precio: prod.precio });

      actualizarContadores();
      mostrarAlerta("Producto \"" + nombre + "\" agregado correctamente.");

      // Limpiar formulario tras agregar
      document.getElementById("prodNombre").value         = "";
      document.getElementById("prodDescripcion").value    = "";
      document.getElementById("prodPrecio").value         = "";
      document.getElementById("prodCantidad").textContent = "0";
      document.getElementById("prodMarca").value          = "";
      document.getElementById("prodPreview").classList.add("d-none");
      prodImgBase64 = "";
    })
    .catch(function() {
      mostrarAlerta("Error de conexión al guardar el producto.");
    });
}

// Incrementa o decrementa la cantidad en el stepper del formulario
function ajustarCantidadProd(cambio) {
  var span = document.getElementById("prodCantidad");
  var val  = parseInt(span.textContent) + cambio;
  if (val < 0) val = 0;
  span.textContent = val;
}

// Actualiza los contadores de productos por marca en la lista del dashboard
function actualizarContadores() {
  for (var m in productos) {
    var cnt = document.getElementById("cnt-" + m);
    if (cnt) cnt.textContent = productos[m].length;
  }
}

// Muestra la vista de lista de productos de una marca específica
function abrirMarca(marca) {
  marcaActual = marca;
  document.getElementById("vistaFormProductos").style.display  = "none";
  document.getElementById("vistaListaProductos").style.display = "block";
  document.getElementById("marcaActivaNombre").textContent     = marca;
  var lista = productos[marca] || [];
  document.getElementById("marcaActivaTotal").textContent = "Productos: " + lista.length;
  pintarProductosMarca(marca);
}

// Regresa al formulario principal desde la vista de lista de productos
function volverFormProductos() {
  document.getElementById("vistaListaProductos").style.display = "none";
  document.getElementById("vistaFormProductos").style.display  = "block";
}

// Renderiza las tarjetas de productos de una marca en la vista de lista
function pintarProductosMarca(marca) {
  var ul    = document.getElementById("listaProductosMarca");
  var lista = productos[marca] || [];
  ul.innerHTML = "";

  if (lista.length === 0) {
    ul.innerHTML = "<li style='color:#888;font-size:14px;padding:16px 0;'>No hay productos.</li>";
    return;
  }

  for (var i = 0; i < lista.length; i++) {
    var p  = lista[i];
    var li = document.createElement("li");
    li.className = "prod-card";
    li.id        = "prodcard-" + p.id;
    li.innerHTML = `
      <div class='prod-card-top'>
        <p class='prod-card-num'>Producto #${i + 1}</p>
        <span class='prod-card-stock' id='stocktxt-${p.id}'>Stock: ${p.stock}</span>
      </div>
      <p class='prod-card-nombre'>${p.nombre}</p>
      <div class='prod-card-acciones' id='acciones-${p.id}'>
        <button class='btn-editar-stock' onclick='toggleEditar(${p.id})' aria-label='Editar'>Editar stock</button>
        <button class='btn-eliminar-prod' onclick='eliminarProducto(${p.id}, "${marca}")' aria-label='Eliminar'>🗑</button>
      </div>
      <div class='panel-editar' id='panel-${p.id}'>
        <div class='panel-editar-fila'>
          <input type='number' id='inp-precio-${p.id}' class='inp-precio-editar'
            value='${(p.precio || 0).toFixed(2)}' placeholder='S/0.00' min='0' step='0.01' aria-label='Precio'>
          <div class='stepper-editar'>
            <button onclick='ajustarEditar(${p.id}, -1)' aria-label='Reducir'>−</button>
            <input type='number' id='inp-${p.id}' value='${p.stock}' min='0' aria-label='Stock'>
            <button onclick='ajustarEditar(${p.id}, 1)' aria-label='Aumentar'>+</button>
          </div>
        </div>
        <div class='panel-botones-edit panel-botones-centro'>
          <button class='btn-guardar-sm' onclick='guardarStock(${p.id}, "${marca}")'>Guardar</button>
          <button class='btn-cancelar-sm' onclick='toggleEditar(${p.id})'>Cancelar</button>
        </div>
      </div>
    `;
    ul.appendChild(li);
  }
}

// Muestra u oculta el panel de edición de stock de un producto
function toggleEditar(id) {
  var panel    = document.getElementById("panel-" + id);
  var acciones = document.getElementById("acciones-" + id);
  var visible  = panel.classList.contains("visible");
  if (visible) {
    panel.classList.remove("visible");
    if (acciones) acciones.style.display = "flex";
  } else {
    panel.classList.add("visible");
    if (acciones) acciones.style.display = "none";
  }
}

// Incrementa o decrementa el valor del input de stock en el panel de edición
function ajustarEditar(id, cambio) {
  var inp = document.getElementById("inp-" + id);
  var val = parseInt(inp.value) + cambio;
  if (val < 0) val = 0;
  inp.value = val;
}

// Envía los cambios de stock y precio al servidor y actualiza la vista
function guardarStock(id, marca) {
  var nuevoStock  = parseInt(document.getElementById("inp-" + id).value) || 0;
  var nuevoPrecio = parseFloat(document.getElementById("inp-precio-" + id).value) || 0;

  // Actualizar en el servidor via PUT
  fetch('/api/admin/productos/' + id, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ stock: nuevoStock, precio: nuevoPrecio })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.ok) { mostrarAlerta("Error al actualizar."); return; }

      // Actualizar en memoria local
      var lista = productos[marca];
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === id) {
          lista[i].stock  = nuevoStock;
          lista[i].precio = nuevoPrecio;
          break;
        }
      }

      var txt = document.getElementById("stocktxt-" + id);
      if (txt) txt.textContent = "Stock: " + nuevoStock;
      var acciones = document.getElementById("acciones-" + id);
      if (acciones) acciones.style.display = "flex";
      document.getElementById("panel-" + id).classList.remove("visible");
      mostrarAlerta("Actualizado: Stock " + nuevoStock + " | Precio S/" + nuevoPrecio.toFixed(2));
    })
    .catch(function() {
      mostrarAlerta("Error de conexión al actualizar.");
    });
}

// Elimina un producto del servidor con confirmación modal
function eliminarProducto(id, marca) {
  mostrarConfirm("¿Eliminar este producto? No se puede deshacer.", function() {
    fetch('/api/admin/productos/' + id, { method: 'DELETE' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.ok) { mostrarAlerta("Error al eliminar."); return; }
        if (productos[marca]) {
          productos[marca] = productos[marca].filter(function(p) { return p.id !== id; });
        }
        actualizarContadores();
        pintarProductosMarca(marca);
      })
      .catch(function() {
        mostrarAlerta("Error de conexión al eliminar.");
      });
  });
}


// ══════════════════════════════════════════════
// MARCAS — SERVIDOR
// ══════════════════════════════════════════════

// Obtiene todas las marcas del servidor y actualiza la vista
function cargarMarcasDesdeServidor() {
  fetch('/api/marcas')
    .then(function(res) { return res.json(); })
    .then(function(lista) {
      marcas = lista;
      pintarMarcas();
      sincronizarSelectMarcas();
      sincronizarListaMarcas();
    })
    .catch(function() {
      mostrarAlerta("No se pudo conectar con el servidor para cargar marcas.");
    });
}

// Valida el formulario y envía una nueva marca al servidor
function agregarMarca() {
  var nombre = document.getElementById("marcaNombre").value.trim();
  if (!marcaImgBase64) { mostrarAlerta("Sube una imagen para la marca."); return; }
  if (!nombre)         { mostrarAlerta("Ingresa el nombre de la marca."); return; }

  var nueva = { nombre: nombre, imagen: marcaImgBase64, productos: 0 };

  fetch('/api/admin/marcas', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(nueva)
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.ok) { mostrarAlerta("Error al guardar la marca."); return; }
      marcas.push(data.marca);
      mostrarAlerta("Marca \"" + nombre + "\" agregada correctamente.");
      marcaImgBase64 = "";
      document.getElementById("marcaPreview").classList.add("d-none");
      document.getElementById("marcaImagen").value = "";
      document.getElementById("marcaNombre").value = "";
      sincronizarSelectMarcas();
      sincronizarListaMarcas();
      pintarMarcas();
    })
    .catch(function() {
      mostrarAlerta("Error de conexión al guardar la marca.");
    });
}

// Reconstruye la lista de marcas en la sección "Consultar productos"
function sincronizarListaMarcas() {
  var lista = document.getElementById("dash-lista-marcas-ul");
  if (!lista) return;
  lista.innerHTML = "";

  for (var i = 0; i < marcas.length; i++) {
    var li = document.createElement("li");
    li.onclick = (function(n) { return function() { abrirMarca(n); }; })(marcas[i].nombre);
    li.innerHTML = marcas[i].nombre + " <span>Productos: <span id='cnt-" + marcas[i].nombre + "'>0</span> ›</span>";
    lista.appendChild(li);
  }
  actualizarContadores();
}

// Reconstruye el select de marcas en el formulario de producto
function sincronizarSelectMarcas() {
  var select = document.getElementById("prodMarca");
  if (!select) return;
  select.innerHTML = "<option value=''>Seleccionar marca</option>";
  for (var i = 0; i < marcas.length; i++) {
    var opt = document.createElement("option");
    opt.value = marcas[i].nombre;
    opt.textContent = marcas[i].nombre;
    select.appendChild(opt);
  }
}

// Renderiza las tarjetas de marcas en la sección de gestión
function pintarMarcas() {
  var cont = document.getElementById("listadoMarcas");
  cont.innerHTML = "";
  for (var i = 0; i < marcas.length; i++) {
    var m   = marcas[i];
    var div = document.createElement("div");
    div.className = "marca-card";
    div.id        = "marcacard-" + m.id;
    div.innerHTML =
      "<img src='" + m.imagen + "' alt='" + m.nombre + "' id='marcaimg-" + m.id + "'>" +
      "<div class='marca-card-info'>" +
        "<b id='marcatxt-" + m.id + "'>" + m.nombre + "</b>" +
        "<span>Productos: " + (m.productos || 0) + "</span>" +
      "</div>" +
      "<div class='prod-card-acciones'>" +
        "<button class='btn-editar-stock' onclick='toggleEditarMarca(" + m.id + ")' aria-label='Editar'>✏ Editar</button>" +
        "<button class='btn-eliminar-prod' onclick='eliminarMarca(" + m.id + ")' aria-label='Eliminar'>🗑</button>" +
      "</div>" +
      "<div class='panel-editar-marca d-none' id='editmarca-" + m.id + "'>" +
        "<label class='edit-marca-label' for='editnombre-" + m.id + "'>Nombre:</label>" +
        "<input type='text' id='editnombre-" + m.id + "' class='edit-marca-input' value='" + m.nombre + "' placeholder='Nombre de la marca'>" +
        "<label class='edit-marca-label'>Imagen (cuadrada, mín. 150×150 px):</label>" +
        "<img id='prevEditMarca-" + m.id + "' style='display:none;width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px;' alt='Preview'>" +
        "<label class='upload-area upload-area-sm' for='editimg-" + m.id + "'>" +
          "<span class='upload-icono' aria-hidden='true'>⬆</span>" +
          "<span>Cambiar imagen</span>" +
          "<input type='file' id='editimg-" + m.id + "' accept='image/*' style='display:none' onchange='previewEditMarca(" + m.id + ", this)'>" +
        "</label>" +
        "<div class='panel-botones'>" +
          "<button class='btn-guardar' onclick='guardarEditMarca(" + m.id + ")'>Guardar</button>" +
          "<button class='btn-cancelar-edit' onclick='toggleEditarMarca(" + m.id + ")'>Cancelar</button>" +
        "</div>" +
      "</div>";
    cont.appendChild(div);
  }
}

// Muestra u oculta el panel de edición de una marca
function toggleEditarMarca(id) {
  document.getElementById("editmarca-" + id).classList.toggle("d-none");
}

// Muestra el preview de la nueva imagen de marca al seleccionarla
function previewEditMarca(id, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    input.dataset.base64 = e.target.result;
    var imgCard = document.getElementById("marcaimg-" + id);
    if (imgCard) imgCard.src = e.target.result;
    var prevEdit = document.getElementById("prevEditMarca-" + id);
    if (prevEdit) { prevEdit.src = e.target.result; prevEdit.style.display = "block"; }
    var img = new Image();
    img.onload = function() {
      if (img.width < 100 || img.height < 100) {
        mostrarAlerta("⚠️ Imagen pequeña. Mínimo 150×150 px.");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Guarda los cambios de nombre e imagen de una marca en el servidor
function guardarEditMarca(id) {
  var nuevoNombre = document.getElementById("editnombre-" + id).value.trim();
  var editInput   = document.getElementById("editimg-" + id);
  var nuevaImg    = editInput.dataset.base64 || null;

  if (!nuevoNombre) { mostrarAlerta("El nombre no puede estar vacío."); return; }

  var body = { nombre: nuevoNombre };
  if (nuevaImg) body.imagen = nuevaImg;

  fetch('/api/admin/marcas/' + id, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.ok) { mostrarAlerta("Error al actualizar la marca."); return; }
      for (var i = 0; i < marcas.length; i++) {
        if (marcas[i].id === id) {
          marcas[i].nombre = nuevoNombre;
          if (nuevaImg) marcas[i].imagen = nuevaImg;
          break;
        }
      }
      var txt = document.getElementById("marcatxt-" + id);
      if (txt) txt.textContent = nuevoNombre;
      if (nuevaImg) {
        var imgEl = document.getElementById("marcaimg-" + id);
        if (imgEl) imgEl.src = nuevaImg;
      }
      toggleEditarMarca(id);
      sincronizarSelectMarcas();
      mostrarAlerta("Marca actualizada correctamente.");
    })
    .catch(function() {
      mostrarAlerta("Error de conexión al actualizar la marca.");
    });
}

// Elimina una marca y todos sus productos del servidor con confirmación
function eliminarMarca(id) {
  mostrarConfirm("¿Eliminar esta marca y todos sus productos?", function() {

    // 1. Buscar el nombre de la marca antes de eliminarla
    var marcaObj = marcas.find ? marcas.find(function(m) { return m.id === id; })
                               : (function() { for (var i=0;i<marcas.length;i++) { if (marcas[i].id===id) return marcas[i]; } })();
    var nombreMarca = marcaObj ? marcaObj.nombre : null;

    // 2. Eliminar la marca del servidor
    fetch('/api/admin/marcas/' + id, { method: 'DELETE' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.ok) { mostrarAlerta("Error al eliminar la marca."); return; }

        marcas = marcas.filter(function(m) { return m.id !== id; });
        sincronizarSelectMarcas();
        sincronizarListaMarcas();
        pintarMarcas();

        // 3. Eliminar todos los productos de esa marca en el servidor
        if (!nombreMarca) return;
        fetch('/api/admin/productos/marca/' + encodeURIComponent(nombreMarca), { method: 'DELETE' })
          .then(function() {
            cargarProductosDesdeServidor();
          })
          .catch(function() {
            console.warn('No se pudieron eliminar los productos de la marca ' + nombreMarca);
          });
      })
      .catch(function() {
        mostrarAlerta("Error de conexión al eliminar la marca.");
      });
  });
}


// ══════════════════════════════════════════════
// BANNERS — SERVIDOR
// ══════════════════════════════════════════════

// Obtiene todos los banners del servidor y actualiza la vista
function cargarBannersDesdeServidor() {
  fetch('/api/ofertas')
    .then(function(res) { return res.json(); })
    .then(function(lista) {
      banners = lista;
      pintarBanners();
    })
    .catch(function() {
      mostrarAlerta("No se pudo conectar con el servidor para cargar banners.");
    });
}

// Convierte una fecha día/mes/año a número comparable para validación
function fechaANumero(dia, mes, anio) {
  var meses = { "Ene":1,"Feb":2,"Mar":3,"Abr":4,"May":5,"Jun":6,
                "Jul":7,"Ago":8,"Sep":9,"Oct":10,"Nov":11,"Dic":12 };
  return parseInt(anio)*10000 + (meses[mes]||0)*100 + parseInt(dia);
}

// Valida las fechas y envía un nuevo banner al servidor
function agregarBanner() {
  if (!bannerImgBase64) { mostrarAlerta("Sube una imagen para el banner."); return; }

  var diaI = document.getElementById("diaInicio").value;
  var mesI = document.getElementById("mesInicio").value;
  var aniI = document.getElementById("anioInicio").value;
  var diaF = document.getElementById("diaFin").value;
  var mesF = document.getElementById("mesFin").value;
  var aniF = document.getElementById("anioFin").value;

  if (fechaANumero(diaI, mesI, aniI) >= fechaANumero(diaF, mesF, aniF)) {
    mostrarAlerta("La fecha de inicio debe ser anterior a la fecha de fin."); return;
  }

  var banner = {
    imagen: bannerImgBase64,
    inicio: diaI + " " + mesI + " " + aniI,
    fin:    diaF + " " + mesF + " " + aniF
  };

  fetch('/api/admin/ofertas', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(banner)
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.ok) { mostrarAlerta("Error al guardar el banner."); return; }
      banners.push(data.oferta);
      mostrarAlerta("Banner agregado correctamente.");
      bannerImgBase64 = "";
      document.getElementById("bannerPreview").classList.add("d-none");
      document.getElementById("bannerImagen").value = "";
      pintarBanners();
    })
    .catch(function() {
      mostrarAlerta("Error de conexión al guardar el banner.");
    });
}

// Renderiza las tarjetas de banners en la sección de ofertas
function pintarBanners() {
  var cont = document.getElementById("listadoBanners");
  cont.innerHTML = "";
  for (var i = 0; i < banners.length; i++) {
    var b   = banners[i];
    var div = document.createElement("div");
    div.className = "banner-card";
    div.id        = "bannercard-" + b.id;
    div.innerHTML =
      "<img src='" + b.imagen + "' alt='Banner oferta' id='bannerimg-" + b.id + "'>" +
      "<div class='banner-card-info'>" +
        "<p>De: " + b.inicio + "</p>" +
        "<p>Hasta: " + b.fin + "</p>" +
      "</div>" +
      "<div class='prod-card-acciones'>" +
        "<button class='btn-editar-stock' onclick='toggleEditarBanner(" + b.id + ")' aria-label='Editar'>✏ Editar foto</button>" +
        "<button class='btn-eliminar-prod' onclick='eliminarBanner(" + b.id + ")' aria-label='Eliminar'>🗑</button>" +
      "</div>" +
      "<div class='panel-editar-marca d-none' id='editbanner-" + b.id + "'>" +
        "<label class='edit-marca-label'>Nueva imagen (800×300 px recomendado):</label>" +
        "<img id='prevEditBanner-" + b.id + "' style='display:none;width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px;' alt='Preview banner'>" +
        "<label class='upload-area upload-area-sm' for='editbannerimg-" + b.id + "'>" +
          "<span class='upload-icono' aria-hidden='true'>⬆</span>" +
          "<span>Cambiar imagen del banner</span>" +
          "<input type='file' id='editbannerimg-" + b.id + "' accept='image/*' style='display:none' onchange='previewEditBanner(" + b.id + ", this)'>" +
        "</label>" +
        "<div class='panel-botones'>" +
          "<button class='btn-guardar' onclick='guardarEditBanner(" + b.id + ")'>Guardar</button>" +
          "<button class='btn-cancelar-edit' onclick='toggleEditarBanner(" + b.id + ")'>Cancelar</button>" +
        "</div>" +
      "</div>";
    cont.appendChild(div);
  }
}

// Muestra u oculta el panel de edición de imagen de un banner
function toggleEditarBanner(id) {
  document.getElementById("editbanner-" + id).classList.toggle("d-none");
}

// Comprime y muestra el preview de la nueva imagen del banner
function previewEditBanner(id, input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var MAX_W = 1535;
      var MAX_H = 1024;
      var w = img.width;
      var h = img.height;
      // Reducir proporcionalmente si supera el máximo
      if (w > MAX_W || h > MAX_H) {
        var ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      var canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      var base64 = canvas.toDataURL("image/jpeg", 0.92);
      input.dataset.base64 = base64;
      var prevPanel = document.getElementById("prevEditBanner-" + id);
      if (prevPanel) { prevPanel.src = base64; prevPanel.style.display = "block"; }
      var imgCard = document.getElementById("bannerimg-" + id);
      if (imgCard) imgCard.src = base64;
      if (img.width < 600 || img.height < 200) {
        mostrarAlerta("⚠️ Imagen pequeña. Recomendamos mínimo 800×300 px.");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Envía la nueva imagen del banner al servidor y actualiza la vista
function guardarEditBanner(id) {
  var editInput = document.getElementById("editbannerimg-" + id);
  var nuevaImg  = editInput.dataset.base64 || null;
  if (!nuevaImg) { mostrarAlerta("Selecciona una nueva imagen primero."); return; }

  fetch('/api/admin/ofertas/' + id, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ imagen: nuevaImg })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.ok) { mostrarAlerta("Error al actualizar el banner."); return; }
      for (var i = 0; i < banners.length; i++) {
        if (banners[i].id === id) { banners[i].imagen = nuevaImg; break; }
      }
      var imgEl = document.getElementById("bannerimg-" + id);
      if (imgEl) imgEl.src = nuevaImg;
      toggleEditarBanner(id);
      mostrarAlerta("Imagen del banner actualizada.");
    })
    .catch(function() {
      mostrarAlerta("Error de conexión al actualizar el banner.");
    });
}

// Elimina un banner del servidor con confirmación modal
function eliminarBanner(id) {
  mostrarConfirm("¿Eliminar este banner?", function() {
    fetch('/api/admin/ofertas/' + id, { method: 'DELETE' })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.ok) { mostrarAlerta("Error al eliminar el banner."); return; }
        banners = banners.filter(function(b) { return b.id !== id; });
        pintarBanners();
      })
      .catch(function() {
        mostrarAlerta("Error de conexión al eliminar el banner.");
      });
  });
}