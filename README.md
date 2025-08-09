# Gestión de Almacén — Hotel Marques del Angel

Sistema para **controlar inventarios**, **requisiciones** y **compras** del hotel. Permite gestionar insumos de **cocina, bar, restaurante, housekeeping y mantenimiento**, con trazabilidad de entradas/salidas, niveles mínimos y reportes operativos.

---

## Objetivo
Asegurar disponibilidad de insumos con **menor merma**, compras oportunas y **visibilidad diaria** del consumo por área.

---

## Funcionalidades clave
- **Catálogo de productos**
  - Categorías, unidad de medida, costo, proveedor favorito, **mínimos/máximos**.
  - Lotes y **caducidad** (opcional), conversión de unidades (caja → pieza → gr).
- **Requisiciones internas**
  - Crear requisiciones multi-producto por área.
  - Flujo: *Borrador → Aprobación → Preparación → Entregado*.
  - Adjuntos y comentarios.
- **Compras y recepción**
  - Órdenes de compra desde sugeridos por **punto de reorden**.
  - Recepción con **precio real**, expiración.
- **Movimientos de almacén**
  - Entradas, salidas a áreas, ajustes por inventario físico.
- **Inventarios físicos**
  - Conteos cíclicos, conciliación vs. stock del sistema.
- **Seguridad y auditoría**
  - Roles: *Administrador, Compras, Almacén, Área solicitante, Consulta*.
  - Bitácora de cambios y usuario responsable en cada movimiento.

---

## Arquitectura (sugerida)
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL

