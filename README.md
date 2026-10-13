# Orthostar · Tienda en línea de insumos de ortodoncia

Proyecto final del curso **Programación Web** (Universidad Privada del Norte, 2026). Es una tienda en línea para una empresa de insumos de ortodoncia, con un panel de administración y una API REST propia hecha con Node.js y Express.

## Qué incluye

- **Tienda:** inicio con productos por marca, ofertas, página de detalle del producto, carrito, pago (checkout), confirmación del pedido y formulario de contacto.
- **Panel de administración** (con inicio de sesión simulado): alta, edición y eliminación de productos, marcas y banners/ofertas. Los cambios se ven de inmediato en la tienda.
- **API REST** en Node.js con Express. Los datos se guardan en archivos JSON.

## Tecnologías

HTML · CSS · JavaScript (`fetch`) · Node.js · Express 5 · JSON

## Cómo ejecutarlo

1. Instala [Node.js](https://nodejs.org/).
2. En la carpeta del proyecto, instala las dependencias:
   ```
   npm install
   ```
3. Inicia el servidor:
   ```
   npm start
   ```
4. Abre `http://localhost:3000` en el navegador. El proyecto se ejecuta en un servidor local (puerto 3000) y no está publicado en internet.

Para entrar al panel de administración, usa la página de **Login**. El acceso es una simulación hecha para el curso: usuario `admin` y contraseña `orthostar123`.

## API REST

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/productos` | Lista los productos |
| GET | `/api/productos/:id` | Devuelve un producto |
| GET | `/api/marcas` | Lista las marcas |
| GET | `/api/ofertas` | Lista las ofertas |
| GET | `/api/pedidos` | Lista los pedidos |
| POST | `/api/pedidos` | Guarda un pedido desde el checkout |
| POST | `/api/contacto` | Guarda un mensaje de contacto |
| POST · PUT · DELETE | `/api/admin/productos` · `/api/admin/productos/:id` | Crea, edita y elimina productos |
| DELETE | `/api/admin/productos/marca/:nombre` | Elimina todos los productos de una marca |
| POST · PUT · DELETE | `/api/admin/marcas` · `/api/admin/marcas/:id` | Crea, edita y elimina marcas |
| POST · PUT · DELETE | `/api/admin/ofertas` · `/api/admin/ofertas/:id` | Crea, edita y elimina ofertas |

## Estructura

```
├── server.js          # Servidor Express y API REST
├── package.json
├── data/              # Productos, marcas, ofertas y pedidos en JSON
└── public/            # Páginas HTML, estilos (styles/), scripts (js/) y recursos (assets/)
```

## Limitaciones

- Los datos se guardan en archivos JSON, no en una base de datos.
- El inicio de sesión del panel es simulado y no es seguro para producción.

## Mi aporte (Yanela Acori)

- Desarrollé el **panel de administración**: gestión de productos, marcas y banners, conectada a la API REST con `fetch` (GET, POST, PUT y DELETE).
- Conecté los productos para que lo que se carga en el panel aparezca en la pantalla principal de la tienda.
- Puse el proyecto en marcha en un servidor local con Node.js y Express (puerto 3000).
- Realicé mejoras de diseño y corregí errores en distintas partes del proyecto.

## Equipo

Trabajo grupal del curso Programación Web: Caleb, Cris, Dani y Yanela.
