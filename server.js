const express = require('express');
const fs      = require('fs');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Archivos de datos
const productosFile = './data/productos.json';
const marcasFile    = './data/marcas.json';
const ofertasFile   = './data/ofertas.json';
const pedidosFile   = './data/pedidos.json';

// Helpers
function leer(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf8');
  return contenido.trim() === '' ? [] : JSON.parse(contenido);
}

function guardar(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
}

// Arrancar servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});

// ── GET — Leer datos ───────────────────────

app.get('/api/productos', (req, res) => {
  res.json(leer(productosFile));
});

app.get('/api/productos/:id', (req, res) => {
  const productos = leer(productosFile);
  const id        = Number(req.params.id);
  const producto  = productos.find(p => p.id === id);
  if (!producto) return res.status(404).json({ ok: false, error: 'No encontrado' });
  res.json(producto);
});

app.get('/api/marcas', (req, res) => {
  res.json(leer(marcasFile));
});

app.get('/api/ofertas', (req, res) => {
  res.json(leer(ofertasFile));
});

app.get('/api/pedidos', (req, res) => {
  res.json(leer(pedidosFile));
});

// ── POST — Guardar pedido (desde checkout) ─

app.post('/api/pedidos', (req, res) => {
  const pedidos = leer(pedidosFile);
  const nuevo   = { id: Date.now(), ...req.body, fecha: new Date().toISOString() };
  pedidos.push(nuevo);
  guardar(pedidosFile, pedidos);
  res.json({ ok: true, pedido: nuevo });
});

// ── POST — Guardar contacto ────────────────

app.post('/api/contacto', (req, res) => {
  const pedidos = leer(pedidosFile);
  const nuevo   = { id: Date.now(), tipo: 'contacto', ...req.body, fecha: new Date().toISOString() };
  pedidos.push(nuevo);
  guardar(pedidosFile, pedidos);
  res.json({ ok: true });
});

// ── ADMIN — CRUD Productos ─────────────────

app.post('/api/admin/productos', (req, res) => {
  const productos = leer(productosFile);
  const nuevo     = { id: Date.now(), ...req.body };
  productos.push(nuevo);
  guardar(productosFile, productos);
  res.json({ ok: true, producto: nuevo });
});

app.put('/api/admin/productos/:id', (req, res) => {
  let productos = leer(productosFile);
  const id      = Number(req.params.id);
  productos     = productos.map(p => p.id === id ? { ...p, ...req.body } : p);
  guardar(productosFile, productos);
  res.json({ ok: true });
});

app.delete('/api/admin/productos/:id', (req, res) => {
  let productos = leer(productosFile);
  const id      = Number(req.params.id);
  productos     = productos.filter(p => p.id !== id);
  guardar(productosFile, productos);
  res.json({ ok: true });
});

// Eliminar todos los productos de una marca
app.delete('/api/admin/productos/marca/:nombre', (req, res) => {
  let productos   = leer(productosFile);
  const nombre    = req.params.nombre;
  productos       = productos.filter(p => p.marca !== nombre);
  guardar(productosFile, productos);
  res.json({ ok: true });
});

// ── ADMIN — CRUD Marcas ────────────────────

app.post('/api/admin/marcas', (req, res) => {
  const marcas = leer(marcasFile);
  const nueva  = { id: Date.now(), ...req.body };
  marcas.push(nueva);
  guardar(marcasFile, marcas);
  res.json({ ok: true, marca: nueva });
});

app.put('/api/admin/marcas/:id', (req, res) => {
  let marcas = leer(marcasFile);
  const id   = Number(req.params.id);
  marcas     = marcas.map(m => m.id === id ? { ...m, ...req.body } : m);
  guardar(marcasFile, marcas);
  res.json({ ok: true });
});

app.delete('/api/admin/marcas/:id', (req, res) => {
  let marcas = leer(marcasFile);
  const id   = Number(req.params.id);
  marcas     = marcas.filter(m => m.id !== id);
  guardar(marcasFile, marcas);
  res.json({ ok: true });
});

// ── ADMIN — CRUD Ofertas ───────────────────

app.post('/api/admin/ofertas', (req, res) => {
  const ofertas = leer(ofertasFile);
  const nueva   = { id: Date.now(), ...req.body };
  ofertas.push(nueva);
  guardar(ofertasFile, ofertas);
  res.json({ ok: true, oferta: nueva });
});

app.put('/api/admin/ofertas/:id', (req, res) => {
  let ofertas = leer(ofertasFile);
  const id    = Number(req.params.id);
  ofertas     = ofertas.map(o => o.id === id ? { ...o, ...req.body } : o);
  guardar(ofertasFile, ofertas);
  res.json({ ok: true });
});

app.delete('/api/admin/ofertas/:id', (req, res) => {
  let ofertas = leer(ofertasFile);
  const id    = Number(req.params.id);
  ofertas     = ofertas.filter(o => o.id !== id);
  guardar(ofertasFile, ofertas);
  res.json({ ok: true });
});