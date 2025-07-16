# 🏠 Configurador 3D Inmobiliario

> **Configurador 3D interactivo para propiedades inmobiliarias con tour 360 integrado**

Revoluciona la experiencia de compra inmobiliaria permitiendo a tus clientes visualizar y personalizar completamente las propiedades antes de comprarlas, con tecnología 3D de última generación y integración seamless con tour 360.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Three.js](https://img.shields.io/badge/Three.js-r128-orange.svg)

---

## ✨ Características Principales

### 🎨 **Configurador 3D Interactivo**
- **Drag & Drop** de muebles estilo IKEA
- **Personalización completa** de colores, materiales y dimensiones
- **Vista 3D en tiempo real** con iluminación realista
- **Detección de colisiones** y medidas automáticas

### 🔄 **Integración Tour 360°**
- **Transición fluida** entre tour virtual y configuración 3D
- **Hotspots interactivos** que abren el configurador
- **Compatibilidad completa** con giot hut render 360
- **Sincronización automática** de datos

### 💰 **Calculadora de Costos Inteligente**
- **Precios en tiempo real** de retailers integrados
- **Estimación automática** de envío e instalación
- **Opciones de financiamiento** dinámicas
- **Exportación de listas** en múltiples formatos

### 📱 **Experiencia Multiplataforma**
- **Responsive design** optimizado para móvil
- **Realidad aumentada** nativa en dispositivos compatibles
- **Progressive Web App** (PWA) con funcionalidad offline
- **Rendimiento optimizado** para todos los dispositivos

---

## 🚀 Demo en Vivo

🌐 **[Ver Demo](https://tomydominguez23.github.io/inmobiliaria-configurador-3d)**

### Propiedades de Ejemplo:
- 🏢 **Apartamento Las Condes** - [Configurar](https://tomydominguez23.github.io/inmobiliaria-configurador-3d/configurador/1)
- 🏙️ **Penthouse Providencia** - [Configurar](https://tomydominguez23.github.io/inmobiliaria-configurador-3d/configurador/2)

---

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Uso Rápido](#-uso-rápido)
- [Características Detalladas](#-características-detalladas)
- [Configuración](#-configuración)
- [API Reference](#-api-reference)
- [Integración](#-integración)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🛠 Instalación

### Requisitos Previos
- **Node.js** ≥ 16.0.0
- **npm** ≥ 8.0.0
- **Navegador moderno** con soporte WebGL

### Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/tomydominguez23/inmobiliaria-configurador-3d.git
cd inmobiliaria-configurador-3d

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### Docker (Recomendado para Producción)

```bash
# Construir imagen
npm run docker:build

# Ejecutar contenedor
npm run docker:run
```

### Verificación de Instalación

```bash
# Ejecutar tests
npm test

# Verificar linting
npm run lint

# Construir para producción
npm run build
```

---

## ⚡ Uso Rápido

### 1. Configuración Básica

```javascript
// Inicializar configurador
const configurador = new Configurador3D();

// Configurar callbacks
configurador.onConfigurationChanged = (state) => {
    console.log('Configuración actualizada:', state);
};

configurador.onCostUpdated = (total, breakdown) => {
    console.log('Costo total:', total);
};
```

### 2. Integración con Tour 360

```html
<!-- Embed del tour con hotspots del configurador -->
<iframe 
    src="https://render360.giothut.com/embed/tour_abc123?customHotspots=true"
    width="100%" 
    height="500"
    id="tour360">
</iframe>

<script>
// Manejar eventos del tour
window.addEventListener('message', (event) => {
    if (event.data.type === 'hotspotClick' && event.data.action === 'openConfigurator') {
        configurador.switchMode('configurador');
        configurador.changeRoom(event.data.room);
    }
});
</script>
```

### 3. Agregar Muebles Programáticamente

```javascript
// Agregar mueble a la escena
await configurador.addFurnitureToScene('sofa-modular-vimle', {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 45, z: 0 },
    color: '#8B7355'
});

// Personalizar mueble existente
configurador.customizeFurniture(0, {
    color: '#2C3E50',
    material: 'leather',
    scale: 1.2
});
```

---

## 🎯 Características Detalladas

### Motor 3D (Three.js)

```javascript
const engine3D = new Engine3D(container);

// Características avanzadas
engine3D.enableShadows = true;
engine3D.enablePostProcessing = true;
engine3D.setQuality('ultra'); // low, medium, high, ultra

// Eventos del motor
engine3D.onObjectSelected = (object) => {
    // Objeto seleccionado
};

engine3D.onSceneUpdated = () => {
    // Escena actualizada
};
```

### Sistema de Muebles

```javascript
// Buscar muebles
const results = FurnitureData.search('sofá modular');

// Filtrar por categoría
const sofas = FurnitureData.getByCategory('sofas');

// Obtener recomendaciones
const similar = FurnitureData.getRecommendations('sofa-modular-vimle');

// Estadísticas del catálogo
const stats = FurnitureData.getStats();
```

### Calculadora de Costos

```javascript
// Configurar calculadora
const calculator = new CostCalculator({
    currency: 'CLP',
    includeShipping: true,
    includeTaxes: true,
    shippingRates: {
        standard: 29990,
        express: 49990,
        free: 500000 // Envío gratis sobre este monto
    }
});

// Calcular costos
const breakdown = calculator.calculate(selectedFurniture);
console.log(breakdown);
// {
//   subtotal: 1500000,
//   shipping: 29990,
//   taxes: 285000,
//   total: 1814990
// }
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/inmobiliaria_3d

# Integración giot hut render 360
GIOT_HUT_API_KEY=tu_api_key
GIOT_HUT_USERNAME=tomydominguez

# AWS S3 (para modelos 3D)
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_BUCKET_NAME=inmobiliaria-3d-assets

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

### Configuración del Configurador

```javascript
const config = {
    // Motor 3D
    engine: {
        antialias: true,
        shadows: true,
        quality: 'high', // low, medium, high, ultra
        maxObjects: 50
    },
    
    // Integración Tour 360
    tour360: {
        provider: 'giot-hut',
        autoSync: true,
        hotspotIntegration: true
    },
    
    // Características
    features: {
        dragDrop: true,
        colorCustomization: true,
        materialCustomization: true,
        dimensionAdjustment: true,
        arView: true,
        collaboration: true
    },
    
    // UI
    interface: {
        theme: 'modern', // modern, classic, minimal
        language: 'es-CL',
        currency: 'CLP',
        measurementUnit: 'metric'
    }
};
```

---

## 📡 API Reference

### Endpoints Principales

#### Propiedades
```bash
GET    /api/properties              # Listar propiedades
GET    /api/properties/:id          # Obtener propiedad específica
GET    /api/properties/:id/rooms    # Obtener habitaciones
POST   /api/properties/search       # Buscar propiedades
```

#### Muebles
```bash
GET    /api/furniture               # Catálogo de muebles
GET    /api/furniture/:id           # Mueble específico
GET    /api/furniture/categories    # Categorías
POST   /api/furniture/search        # Buscar muebles
GET    /api/furniture/:id/colors    # Colores disponibles
```

#### Configuraciones
```bash
GET    /api/configurations          # Listar configuraciones
POST   /api/configurations          # Crear configuración
PUT    /api/configurations/:id      # Actualizar configuración
DELETE /api/configurations/:id      # Eliminar configuración
POST   /api/configurations/:id/share # Compartir configuración
```

#### Tours 360
```bash
GET    /api/tours                   # Listar tours
GET    /api/tours/:id               # Tour específico
GET    /api/tours/:id/embed         # URL de embed personalizada
POST   /api/tours/:id/configurator  # Integración con configurador
```

### Ejemplo de Uso de API

```javascript
// Obtener propiedades
const properties = await fetch('/api/properties').then(r => r.json());

// Crear configuración
const config = await fetch('/api/configurations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Mi Diseño',
        propertyId: '1',
        furniture: selectedFurniture,
        totalCost: 1500000
    })
}).then(r => r.json());

// Compartir configuración
const shareUrl = await fetch(`/api/configurations/${config.data.id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'cliente@email.com',
        message: 'Mira mi diseño!'
    })
}).then(r => r.json());
```

---

## 🔗 Integración

### Con giot hut render 360

```javascript
// Configuración del tour
const tourConfig = {
    tourId: 'property-1',
    embedUrl: 'https://render360.giothut.com/embed/tour_abc123',
    customHotspots: true,
    events: {
        onHotspotClick: (hotspot) => {
            if (hotspot.action === 'openConfigurator') {
                configurador.openRoom(hotspot.room);
            }
        }
    }
};

// Sincronizar hotspots
await fetch('/api/tours/property-1/sync-giot-hut', {
    method: 'POST'
});
```

### Con Sistemas CRM

```javascript
// Webhook para integración con CRM
app.post('/webhooks/configuration-saved', (req, res) => {
    const { configurationId, clientEmail, totalCost } = req.body;
    
    // Enviar a CRM (Salesforce, HubSpot, etc.)
    crm.createLead({
        email: clientEmail,
        source: 'configurador-3d',
        value: totalCost,
        configurationUrl: `/configurador/shared/${configurationId}`
    });
});
```

### Con E-commerce

```javascript
// Integrar con tienda online
const cartItems = configurador.getFurnitureList().map(item => ({
    id: item.furnitureId,
    name: item.name,
    price: item.price,
    color: item.color,
    quantity: 1,
    customizations: item.customOptions
}));

// Enviar al carrito
shopify.cart.add(cartItems);
```

---

## 💻 Desarrollo

### Estructura del Proyecto

```
inmobiliaria-configurador-3d/
├── 📁 client/                    # Frontend
│   ├── 📁 css/                   # Estilos
│   ├── 📁 js/                    # Scripts del configurador
│   │   ├── 3d-engine.js          # Motor 3D principal
│   │   ├── configurador.js       # Lógica principal
│   │   ├── furniture-data.js     # Base de datos de muebles
│   │   └── utils.js              # Utilidades
│   └── index.html                # Página principal
├── 📁 server/                    # Backend API
│   ├── 📁 routes/                # Rutas de la API
│   │   ├── properties.js         # Gestión de propiedades
│   │   ├── furniture.js          # Catálogo de muebles
│   │   ├── configurations.js     # Configuraciones
│   │   └── tours.js              # Tours 360
│   └── 📁 models/                # Modelos de datos
├── 📁 assets/                    # Assets estáticos
│   ├── 📁 models/                # Modelos 3D (.glb/.gltf)
│   ├── 📁 images/                # Imágenes y texturas
│   └── 📁 tours/                 # Assets de tours 360
├── 📁 docs/                      # Documentación
├── 📁 tests/                     # Tests automatizados
└── server.js                     # Servidor principal
```

### Scripts de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor con hot-reload
npm run build            # Build para producción
npm run serve            # Servidor estático

# Testing
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Coverage de tests

# Linting y formato
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
npm run format           # Formatear código

# Docker
npm run docker:build     # Construir imagen
npm run docker:run       # Ejecutar contenedor
```

### Workflow de Desarrollo

```bash
# 1. Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y probar
npm run dev
npm test

# 3. Verificar calidad de código
npm run lint
npm run format

# 4. Commit y push
git add .
git commit -m "✨ feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request
gh pr create --title "Nueva funcionalidad" --body "Descripción detallada"
```

---

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

### Opción 2: Docker

```dockerfile
# Dockerfile incluido en el proyecto
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Desplegar con Docker
docker build -t configurador-3d .
docker run -p 3000:3000 -e NODE_ENV=production configurador-3d
```

### Opción 3: VPS/Servidor Dedicado

```bash
# En el servidor
git clone https://github.com/tomydominguez23/inmobiliaria-configurador-3d.git
cd inmobiliaria-configurador-3d
npm install --production
npm run build

# Configurar PM2
npm install -g pm2
pm2 start server.js --name "configurador-3d"
pm2 startup
pm2 save

# Configurar Nginx
sudo nano /etc/nginx/sites-available/configurador-3d
# [Configuración de Nginx incluida en docs/]
```

### Variables de Producción

```bash
# .env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod
GIOT_HUT_API_KEY=prod_api_key
AWS_BUCKET_NAME=prod-3d-assets
REDIS_URL=redis://prod-redis:6379
```

---

## 📊 Analytics y Métricas

### Métricas Integradas

```javascript
// Analytics automáticos
const analytics = {
    // Engagement
    viewsPerProperty: 1247,
    averageSessionTime: 185, // segundos
    configuratorConversion: 18.5, // %
    
    // Uso del configurador
    furnitureAdded: 892,
    colorsChanged: 234,
    designsCompleted: 156,
    designsShared: 67,
    
    // Performance
    loadTime: 2.3, // segundos
    errorRate: 0.1, // %
    mobileUsage: 68.5 // %
};

// Eventos personalizados
configurador.track('furniture_added', {
    furnitureId: 'sofa-modular-vimle',
    room: 'living',
    price: 899990
});

configurador.track('design_completed', {
    totalItems: 12,
    totalCost: 2450000,
    timeSpent: 420 // segundos
});
```

### Dashboard de Analytics

Accede al dashboard completo en: `/admin/analytics`

---

## 🤝 Contribuir

### Cómo Contribuir

1. **Fork** el proyecto
2. **Crea** tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Convenciones de Commit

```bash
✨ feat: nueva funcionalidad
🐛 fix: corrección de bug
📚 docs: actualización de documentación
🎨 style: cambios de formato
♻️ refactor: refactorización de código
⚡ perf: mejora de rendimiento
✅ test: agregar o corregir tests
🔧 chore: tareas de mantenimiento
```

### Areas donde Contribuir

- 🎨 **UI/UX**: Mejorar la interfaz y experiencia de usuario
- 🛋️ **Catálogo**: Agregar más muebles y categorías
- 🌐 **Integraciónes**: Conectar con más plataformas
- 📱 **Mobile**: Optimizaciones para dispositivos móviles
- 🧪 **Testing**: Ampliar cobertura de tests
- 📖 **Documentación**: Mejorar guías y ejemplos

---

## 🆘 Soporte

### Reportar Problemas

🐛 **[Crear Issue](https://github.com/tomydominguez23/inmobiliaria-configurador-3d/issues/new)**

### Canales de Soporte

- 📧 **Email**: tomasdominguezcarrizo.23@gmail.com
- 💬 **Discord**: [Únete a la comunidad](https://discord.gg/inmobiliaria3d)
- 📱 **WhatsApp**: +56 9 1234 5678
- 🐦 **Twitter**: [@tomydominguez23](https://twitter.com/tomydominguez23)

### FAQ

**P: ¿Es compatible con todas las versiones de giot hut render 360?**
R: Sí, es compatible con todas las versiones actuales. La integración se actualiza automáticamente.

**P: ¿Puedo personalizar los muebles del catálogo?**
R: Absolutamente. Puedes agregar/modificar muebles en `client/js/furniture-data.js` o via API.

**P: ¿Funciona en dispositivos móviles?**
R: Sí, está completamente optimizado para móviles con soporte AR nativo.

**P: ¿Cómo integro con mi CRM existente?**
R: Ofrecemos webhooks y APIs para integrar con cualquier CRM. Ver documentación de integración.

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para detalles.

### Uso Comercial

✅ **Permitido para uso comercial**  
✅ **Modificación permitida**  
✅ **Distribución permitida**  
✅ **Uso privado permitido**  

⚠️ **Se requiere incluir aviso de copyright**  
⚠️ **Se proporciona sin garantías**  

---

## 🙏 Agradecimientos

- **Three.js** - Motor 3D
- **IKEA** - Inspiración para el sistema de configuración
- **giot hut render 360** - Plataforma de tours 360
- **Comunidad Open Source** - Por las increíbles herramientas

---

## 🌟 Reconocimientos

⭐ **¡Si te gusta este proyecto, dale una estrella!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/tomydominguez23/inmobiliaria-configurador-3d.svg?style=social&label=Star)](https://github.com/tomydominguez23/inmobiliaria-configurador-3d)
[![GitHub forks](https://img.shields.io/github/forks/tomydominguez23/inmobiliaria-configurador-3d.svg?style=social&label=Fork)](https://github.com/tomydominguez23/inmobiliaria-configurador-3d/fork)

---

<div align="center">

**Desarrollado con ❤️ por [Tomás Domínguez](https://github.com/tomydominguez23)**

**Revolucionando la experiencia inmobiliaria con tecnología 3D**

[🌐 Demo](https://tomydominguez23.github.io/inmobiliaria-configurador-3d) • 
[📚 Docs](https://github.com/tomydominguez23/inmobiliaria-configurador-3d/wiki) • 
[🐛 Issues](https://github.com/tomydominguez23/inmobiliaria-configurador-3d/issues) • 
[💬 Discussions](https://github.com/tomydominguez23/inmobiliaria-configurador-3d/discussions)

</div>