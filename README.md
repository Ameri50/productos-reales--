# Productos Reales · Tienda web

Tienda web completa para el catálogo Apple de **Productos Reales** (Perú), conectada al mismo
proyecto Firebase (`miapp-4a216`) que la app iOS y el panel de administración.

Explora el catálogo, arma tu carrito, **reserva el stock 24 horas** y confirma la compra por
WhatsApp. Las reservas y los pedidos aparecen al instante en la app iOS y en el panel.

## Funcionalidades

- **Catálogo sincronizado** con Firestore: 300+ productos, categorías, colores, capacidades y
  stock real.
- **Búsqueda y filtros** por categoría, además de orden por precio o nombre.
- **Detalle de producto** con selector de color, capacidad (con recargo por almacenamiento) y
  cantidad limitada al stock disponible.
- **Carrito persistente** (localStorage) con reserva temporal de unidades mientras están en el
  carrito.
- **Checkout por WhatsApp**: crea la reserva `orders/{código}` con estado `reserved`, expiración
  a las 24 h y abre el chat con el detalle completo del pedido.
- **Cuenta con Firebase Auth** (correo y contraseña) y perfil sincronizado en `users/{uid}`.
- **Historial** con pestañas *Reservaciones / Pedidos / Todas*, cuenta regresiva de 24 h,
  cancelación y eliminación de registros propios, y reenvío del pedido a WhatsApp.
- **Modo claro y oscuro**, diseño responsive con navegación inferior tipo app en móvil.
- Páginas de **Soporte**, **Nosotros**, **Perfil** y estados vacíos/errores.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Firebase (Firestore + Auth)
- React Router (HashRouter: funciona en GitHub Pages, Vercel o cualquier subcarpeta)
- lucide-react (iconografía)

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

```bash
npm run build     # compila y valida TypeScript
npm run preview   # sirve el build
```

## Despliegue

### GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica en cada push a `main`.
Solo hay que habilitar **Settings → Pages → Source: GitHub Actions**.
El chat usa la función de Vercel indicada abajo; GitHub Pages no ejecuta funciones de servidor.

### Vercel

Importa el repositorio como proyecto Vite (framework preset *Vite*). La configuración pública de
Firebase vive en `src/lib/firebase.ts`. Para el chat:

1. Crea una clave nueva de Gemini en Google AI Studio.
2. En Vercel, añade `GEMINI_API_KEY` en **Settings → Environment Variables** para Production.
   No uses el prefijo `VITE_` ni guardes la clave en el repositorio.
3. Vuelve a desplegar en Vercel. Tanto Vercel como GitHub Pages usan
   `https://productos-reales.vercel.app/api/chat`.

La función limita los orígenes permitidos para navegadores, pero esto no impide llamadas directas.
Configura límites de consumo y protección contra abuso antes de usar el chat en producción.
Para probar la función localmente se necesita el entorno de funciones de Vercel; `npm run dev`
solo inicia el frontend y usa la función desplegada.

## Modelo de datos (compartido con la app iOS)

| Colección | Documento | Campos relevantes |
|---|---|---|
| `products` | id autogenerado | `name`, `price`, `category`, `image_url`, `description`, `stock`, `colorOptions[]`, `storageOptions[]` |
| `orders` | código `ORD-YYYYMMDD-XXX` | `code`, `userUid`, `userEmail`, `createdAt`, `expiresAt`, `status` (`reserved`/`confirmed`/`cancelled`), `total`, `imageSource`, `source: "web"`, `items[]` |
| `users` | uid de Auth | `nombre`, `apellido`, `telefono`, `direccion`, `edad`, `email`, `isAdmin` |

La reserva mantiene el mismo esquema que `OrderHistoryStore.swift`, por lo que el panel y la app
la leen sin cambios (`source` distingue el origen).

## Requisitos en Firebase

- **Auth → Sign-in method → Email/Password** habilitado.
- **Reglas de Firestore** publicadas desde el repositorio del panel (`firestore.rules`):
  lectura pública de `products`, lectura/escritura de `users/{uid}` por su dueño y
  `orders` por dueño (`request.resource.data.userUid == request.auth.uid`). Sin esas reglas
  el catálogo se ve, pero el historial y las reservas fallan por permisos.
- Dominios autorizados de Auth: `localhost`, el dominio de Pages y el de Vercel.

## Contacto

WhatsApp: [+51 997 609 045](https://wa.me/51997609045)
