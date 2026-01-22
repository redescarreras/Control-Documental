# Redes Carreras SL - PWA Control de Materiales

## Descripción

Aplicación web progresiva (PWA) para la gestión de materiales y documentos con control de fechas de caducidad. Diseñada específicamente para **Redes Carreras SL**, permite gestionar de forma sencilla equipos de seguridad, extintores, explosímetros, seguros, documentos y cualquier material que requiera seguimiento de caducidad.

## Características principales

- **Gestión de materiales por categorías**: Equipos de escape, extintores, explosímetros, seguros RC, EPIs, vehículos, herramientas, documentos y otros.
- **Control de caducidades**: Seguimiento automático de fechas de caducidad con alertas visuales.
- **Notificaciones**: Recordatorios automáticos 30 días, 15 días y 2 días antes de la caducidad.
- **Responsable y ubicación**: Asociación de materiales a trabajadores responsables y furgonetas.
- **Exportación a PDF**: Generación de informes detallados con el estado de todos los materiales.
- **100% offline**: Funciona sin conexión a internet gracias al Service Worker.
- **Instalable**: Se puede instalar como aplicación nativa en Windows, Android e iOS.
- **Datos locales**: Toda la información se almacena en el navegador del dispositivo.

## Categorías disponibles

1. Extintores
2. Equipos de Escape
3. Explosímetros
4. Seguros RC
5. EPIs
6. Vehículos
7. Herramientas
8. Documentos
9. Otros

## Instalación

### Requisitos previos

- Navegador web moderno (Chrome, Edge, Firefox, Safari)
- Servidor web local o hosting (para funcionar como PWA)

### Opción 1: Instalación local con Python

```bash
# Navegar a la carpeta del proyecto
cd redes-carreras-pwa

# Iniciar servidor HTTP con Python
python3 -m http.server 8000

# Abrir en el navegador
# http://localhost:8000
```

### Opción 2: Usar VS Code Live Server

1. Abrir la carpeta del proyecto en VS Code
2. Instalar la extensión "Live Server"
3. Clic derecho en `index.html` y seleccionar "Open with Live Server"

### Opción 3: Hosting estático

Subir todos los archivos a cualquier servicio de hosting estático:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## Instalación como aplicación

### Windows

1. Abrir la aplicación en Chrome o Edge
2. Verás el icono de instalación en la barra de direcciones
3. Clic en el icono y seleccionar "Instalar"
4. La aplicación se abrirá en su propia ventana

### Android

1. Abrir en Chrome para Android
2. Menú > "Añadir a pantalla de inicio" o "Instalar aplicación"

### iOS

1. Abrir en Safari
2. Compartir > "Añadir a pantalla de inicio"

## Estructura del proyecto

```
redes-carreras-pwa/
├── index.html              # Página principal
├── styles.css              # Estilos de la aplicación
├── app.js                  # Lógica principal de la aplicación
├── sw.js                   # Service Worker para offline
├── manifest.json           # Configuración PWA
├── README.md               # Este archivo
├── assets/
│   ├── icon.svg            # Icono principal (SVG)
│   ├── icon-192.svg        # Icono 192x192
│   └── icon-512.svg        # Icono 512x512
└── libs/
    └── jspdf.umd.min.js    # Librería jsPDF (descargar)
```

## Configuración de jsPDF

Para la generación de PDFs, necesitas descargar la librería jsPDF:

1. Visitar: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
2. Descargar el archivo y guardarlo en `libs/jspdf.umd.min.js`

O usar el script de descarga incluido:

```bash
# Script de descarga (requiere curl)
./download-jspdf.sh
```

## Subir a GitHub

```bash
# Inicializar repositorio
git init

# Añadir archivos
git add .

# Crear commit
git commit -m "Initial commit: Redes Carreras SL PWA"

# Crear repositorio en GitHub y seguir las instrucciones
git remote add origin https://github.com/TU_USUARIO/redes-carreras-pwa.git
git push -u origin main
```

### Activar GitHub Pages

1. Ir a Settings > Pages
2. En "Source" seleccionar "main" o "master"
3. Guardar cambios
4. La app estará disponible en: `https://TU_USUARIO.github.io/redes-carreras-pwa`

## Uso de la aplicación

### Añadir un material

1. Clic en el botón flotante "+" en la esquina inferior derecha
2. Seleccionar la categoría
3. Introducir el nombre del material
4. Indicar la fecha de certificación (inicio)
5. Indicar la fecha de caducidad
6. Opcional: asignar responsable y furgoneta
7. Opcional: añadir notas
8. Guardar

### Filtrar y buscar

- Usar el campo de búsqueda para encontrar por nombre, responsable o furgoneta
- Usar el desplegable para filtrar por categoría

### Ver detalles

- Clic en cualquier tarjeta de material para ver los detalles completos
- Desde los detalles se puede editar o eliminar el material

### Exportar PDF

- Clic en el botón "PDF" del header
- Se descargará un informe con todos los materiales y su estado

## Notificaciones

La aplicación muestra notificaciones cuando:
- Un material está a punto de caducar (30 días)
- Un material caduca pronto (15 días)
- Un material requiere acción inmediata (2 días)
- Un material ya ha caducado

## Tecnologías utilizadas

- HTML5
- CSS3 (CSS Grid, Flexbox, Variables CSS)
- JavaScript ES6+
- LocalStorage para persistencia
- Service Worker para PWA
- Web App Manifest
- jsPDF para generación de PDFs

## Personalización

### Colores corporativos

Modificar en `styles.css`:
```css
:root {
    --primary-color: #0056b3;  /* Color principal */
    /* ... otros colores */
}
```

### Categorías

Modificar en `app.js`:
```javascript
const CONFIG = {
    CATEGORIES: [
        { id: 'nueva_categoria', name: 'Nueva Categoría', icon: 'icono' },
        // ... otras categorías
    ]
};
```

## Licencia

Este proyecto es propiedad de Redes Carreras SL. Todos los derechos reservados.

## Soporte

Para problemas o sugerencias, contactar con el equipo de desarrollo.

---

Desarrollado por MiniMax Agent
