# Solución para Problema de Zona Horaria

## Problema
Las fechas almacenadas en la base de datos en formato UTC (ej: `2025-08-14 00:00:00`) se mostraban con una diferencia de 3 horas en el front-end debido a la conversión automática de zona horaria. Esto causaba que una fecha del día 14 se mostrara como día 13 a las 9PM.

## Solución Implementada

### 1. Instalación de Luxon
Se instaló la librería `luxon` para manejo robusto de fechas y zonas horarias:
```bash
npm install luxon @types/luxon
```

### 2. Creación de Utilidades de Fecha
Se creó el archivo `src/utils/dateUtils.ts` con funciones especializadas para:
- Parsear fechas de la DB asumiendo formato UTC
- Convertir a zona horaria de Argentina (UTC-3)
- Formatear fechas en diferentes formatos
- Comparar fechas correctamente

### 3. Funciones Principales

#### `parseDBDateAsLocalFromUTC(dateString: string)`
Convierte una fecha string de la DB a DateTime de luxon, tratando las fechas UTC como si fueran fechas locales. Útil cuando las fechas están guardadas en UTC pero representan fechas locales.

#### `formatDate(dateString: string)`
Formatea una fecha para mostrar solo la fecha (dd/MM/yyyy).

#### `formatTime(dateString: string)`
Formatea una fecha para mostrar solo la hora (HH:mm).

#### `formatDateLong(dateString: string)`
Formatea una fecha en formato largo (ej: "Lunes, 14 de Agosto de 2025").

#### `isSameDay(date1: string, date2: string)`
Compara si dos fechas son del mismo día, útil para filtros y comparaciones.

### 4. Archivos Actualizados

#### Calendar.tsx
- Reemplazadas las funciones de formateo de fecha nativas
- Actualizada la comparación de fechas para eventos
- Mejorado el manejo de nombres de meses y días

#### FlightLogs.tsx
- Actualizado el formateo de fechas en la tabla de vuelos
- Corregido el tipo `any` en el array de pilotos únicos

#### FlightDetailsModal.tsx
- Actualizado el formateo de fecha en el modal de detalles

#### PilotHome.tsx
- Actualizado el formateo de fechas en el dashboard del piloto
- Corregidas las fechas en las listas de vuelos próximos y recientes

### 5. Beneficios

1. **Consistencia**: Todas las fechas se manejan de manera uniforme
2. **Precisión**: Las fechas se muestran exactamente como están en la DB
3. **Mantenibilidad**: Código centralizado para manejo de fechas
4. **Flexibilidad**: Fácil cambio de zona horaria si es necesario
5. **Internacionalización**: Preparado para diferentes formatos de fecha

### 6. Uso

Para usar las utilidades en nuevos componentes:

```typescript
import { formatDate, formatTime, formatDateLong } from "../../utils/dateUtils"

// Formatear fecha simple
const fecha = formatDate("2025-08-14 00:00:00") // "14/08/2025"

// Formatear hora
const hora = formatTime("2025-08-14 15:30:00") // "15:30"

// Formatear fecha larga
const fechaLarga = formatDateLong("2025-08-14 00:00:00") // "Jueves, 14 de Agosto de 2025"
```

### 7. Notas Importantes

- Las fechas UTC (con Z) se tratan como si fueran fechas locales
- Esto resuelve el problema donde fechas como `2025-08-14T00:00:00.000Z` se mostraban como día 13 a las 21:00
- La zona horaria está configurada para Argentina (America/Argentina/Buenos_Aires)
- Para cambiar la zona horaria, modificar la constante `ARGENTINA_ZONE` en `dateUtils.ts`
- Todas las funciones manejan automáticamente la conversión de zona horaria
- Se incluye función de debug `debugDate()` para verificar el procesamiento de fechas
