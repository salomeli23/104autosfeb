# PolarizadosYA! - Sistema de Gestión de Servicios Automotrices

## Documento de Requerimientos del Producto (PRD)

### Información General
- **Nombre del Proyecto:** PolarizadosYA!
- **Fecha de Creación:** 30 de Enero de 2026
- **Versión:** 1.0.0
- **Estado:** MVP Completado

---

## Problema Original

Aplicación web responsive para la gestión de agendamiento y operación de servicios técnicos automotrices. 

### Servicios Administrados
- Polarizado
- Nanocerámica
- Autobahn Black CE
- Ultrasecure

### Roles de Usuario
- **Administrador:** Control total del sistema
- **Asesor Comercial:** Gestión de clientes y cotizaciones
- **Técnico:** Ejecución de servicios

---

## User Personas

### 1. Administrador del Taller
- **Necesidades:** Control total, estadísticas, gestión de personal
- **Acceso:** Dashboard completo, configuración, todos los módulos

### 2. Asesor Comercial
- **Necesidades:** Atención al cliente, cotizaciones, agendamiento
- **Acceso:** Citas, vehículos, cotizaciones, órdenes

### 3. Técnico
- **Necesidades:** Ver trabajos asignados, actualizar estados
- **Acceso:** Órdenes asignadas, inspecciones, actualización de estados

---

## Arquitectura Técnica

### Backend (FastAPI + MongoDB)
- **Puerto:** 8001
- **Autenticación:** JWT con bcrypt
- **Base de datos:** MongoDB
- **Notificaciones:** SendGrid (configurado)

### Frontend (React + Tailwind)
- **Puerto:** 3000
- **UI Library:** Shadcn/UI
- **Routing:** React Router DOM
- **Estado Global:** Context API

### Colecciones MongoDB
- users
- vehicles
- appointments
- inspections
- quotes
- service_orders
- notifications

---

## Funcionalidades Implementadas ✅

### 1. Autenticación (100%)
- [x] Login seguro con JWT
- [x] Registro de usuarios con roles
- [x] Protección de rutas por rol
- [x] Logout

### 2. Agendamiento (100%)
- [x] Calendario interactivo
- [x] Franjas horarias configuradas
- [x] Asociación a servicios múltiples
- [x] Vista por día

### 3. Ingreso de Vehículos (100%)
- [x] Registro completo de datos
- [x] Datos del cliente
- [x] Búsqueda por placa

### 4. Revisión 360° (100%)
- [x] Checklist de 20 áreas
- [x] Estados de condición
- [x] Marcado de daños
- [x] Notas generales

### 5. Cotizaciones (100%)
- [x] Generación automática
- [x] Cálculo de IVA
- [x] Aprobación de cliente

### 6. Órdenes de Servicio (100%)
- [x] Creación desde cotización
- [x] Asignación de técnicos
- [x] Vista Kanban

### 7. Seguimiento de Estados (100%)
- [x] Agendado → En Proceso → En Revisión → Terminado
- [x] Actualización en tiempo real
- [x] Tracing beam en órdenes activas

### 8. Notificaciones (100%)
- [x] Notificaciones internas
- [x] Contador de no leídas
- [x] Integración SendGrid (requiere API key)

### 9. Dashboard (100%)
- [x] Estadísticas del día
- [x] Órdenes recientes
- [x] Estado de órdenes
- [x] Personalizado por rol

### 10. UI/UX (100%)
- [x] Tema oscuro/claro con toggle
- [x] Mobile responsive
- [x] Navegación bottom para móvil
- [x] Glassmorphism en headers

---

## Backlog de Funcionalidades

### P0 (Siguiente Iteración)
- [ ] Carga de fotos para revisión 360°
- [ ] Firma digital del cliente en cotizaciones
- [ ] Foto de cédula del cliente
- [ ] WhatsApp notifications (requiere Twilio)

### P1 (Mejoras)
- [ ] Reportes PDF de cotizaciones
- [ ] Historial de servicios por vehículo
- [ ] Dashboard con gráficos
- [ ] Búsqueda avanzada

### P2 (Futuro)
- [ ] Facturación electrónica
- [ ] Inventario de materiales
- [ ] CRM para clientes
- [ ] App móvil nativa

---

## Credenciales de Prueba

### Admin
- Email: admin@polarizadosya.com
- Password: admin123

---

## Variables de Entorno

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET=polarizadosya-secret-key-2024
SENDGRID_API_KEY=<pending>
SENDER_EMAIL=noreply@polarizadosya.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<deployment_url>
```

---

## Próximos Pasos Sugeridos

1. **Configurar SendGrid:** Agregar API key para notificaciones email
2. **Fotos en Revisión 360°:** Implementar carga de imágenes
3. **Firma Digital:** Canvas para firma del cliente
4. **Reportes:** Exportación PDF de cotizaciones
