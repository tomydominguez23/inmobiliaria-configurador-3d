const express = require('express');
const router = express.Router();

// Configuración para giot hut render 360
const GIOT_HUT_CONFIG = {
  baseUrl: 'https://render360.giothut.com',
  apiKey: process.env.GIOT_HUT_API_KEY || 'demo-key',
  username: 'tomydominguez',
  defaultSettings: {
    autoRotate: true,
    showHotspots: true,
    enableVR: true,
    qualityLevel: 'high'
  }
};

// Base de datos simulada de tours (en producción se conectaría con giot hut)
const TOURS_DB = {
  'property-1': {
    id: 'property-1',
    propertyId: '1',
    title: 'Apartamento Las Condes - Tour 360°',
    description: 'Recorrido virtual completo del apartamento moderno en Las Condes',
    giotHutTourId: 'tour_abc123',
    embedUrl: 'https://render360.giothut.com/embed/tour_abc123',
    scenes: [
      {
        id: 'living-room',
        name: 'Sala de Estar',
        description: 'Amplia sala de estar con vista panorámica',
        imageUrl: '/assets/tours/property-1/living-room.jpg',
        hotspots: [
          {
            id: 'configurator-living',
            type: 'configurator',
            position: { x: 0.5, y: 0.3 },
            title: 'Configurar Muebles',
            description: 'Abre el configurador 3D para esta habitación',
            action: 'openConfigurator',
            room: 'living'
          },
          {
            id: 'goto-kitchen',
            type: 'navigation',
            position: { x: 0.8, y: 0.5 },
            title: 'Ir a Cocina',
            description: 'Navegar a la cocina',
            action: 'gotoScene',
            targetScene: 'kitchen'
          }
        ]
      },
      {
        id: 'kitchen',
        name: 'Cocina',
        description: 'Cocina moderna totalmente equipada',
        imageUrl: '/assets/tours/property-1/kitchen.jpg',
        hotspots: [
          {
            id: 'configurator-kitchen',
            type: 'configurator',
            position: { x: 0.3, y: 0.4 },
            title: 'Configurar Cocina',
            description: 'Personaliza los accesorios de cocina',
            action: 'openConfigurator',
            room: 'kitchen'
          },
          {
            id: 'goto-living',
            type: 'navigation',
            position: { x: 0.1, y: 0.5 },
            title: 'Volver a Sala',
            description: 'Regresar a la sala de estar',
            action: 'gotoScene',
            targetScene: 'living-room'
          }
        ]
      },
      {
        id: 'bedroom-main',
        name: 'Dormitorio Principal',
        description: 'Dormitorio principal con baño en suite',
        imageUrl: '/assets/tours/property-1/bedroom-main.jpg',
        hotspots: [
          {
            id: 'configurator-bedroom',
            type: 'configurator',
            position: { x: 0.6, y: 0.3 },
            title: 'Configurar Dormitorio',
            description: 'Diseña tu dormitorio ideal',
            action: 'openConfigurator',
            room: 'bedroom1'
          }
        ]
      }
    ],
    settings: {
      autoRotate: true,
      autoRotateSpeed: 2,
      showHotspots: true,
      enableVR: true,
      enableFullscreen: true,
      showNavigation: true,
      showThumbnails: true,
      qualityLevel: 'high',
      backgroundColor: '#000000'
    },
    analytics: {
      views: 1247,
      averageTime: 185, // segundos
      hotspotClicks: 89,
      configuratorOpens: 23
    },
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z'
  },
  'property-2': {
    id: 'property-2',
    propertyId: '2',
    title: 'Penthouse Providencia - Tour 360°',
    description: 'Recorrido virtual del exclusivo penthouse en Providencia',
    giotHutTourId: 'tour_def456',
    embedUrl: 'https://render360.giothut.com/embed/tour_def456',
    scenes: [
      {
        id: 'terrace',
        name: 'Terraza',
        description: 'Terraza panorámica con vista a la ciudad',
        imageUrl: '/assets/tours/property-2/terrace.jpg',
        hotspots: [
          {
            id: 'configurator-terrace',
            type: 'configurator',
            position: { x: 0.4, y: 0.6 },
            title: 'Configurar Terraza',
            description: 'Diseña tu espacio exterior',
            action: 'openConfigurator',
            room: 'terrace'
          }
        ]
      }
    ],
    settings: {
      autoRotate: false,
      showHotspots: true,
      enableVR: true,
      qualityLevel: 'ultra'
    },
    analytics: {
      views: 567,
      averageTime: 220,
      hotspotClicks: 34,
      configuratorOpens: 12
    },
    status: 'published',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z'
  }
};

// Obtener todos los tours
router.get('/', (req, res) => {
  try {
    const { propertyId, status = 'published' } = req.query;
    
    let tours = Object.values(TOURS_DB);
    
    // Filtrar por propiedad
    if (propertyId) {
      tours = tours.filter(tour => tour.propertyId === propertyId);
    }
    
    // Filtrar por estado
    if (status) {
      tours = tours.filter(tour => tour.status === status);
    }
    
    // Remover datos sensibles para listados
    const publicTours = tours.map(tour => ({
      id: tour.id,
      propertyId: tour.propertyId,
      title: tour.title,
      description: tour.description,
      embedUrl: tour.embedUrl,
      scenes: tour.scenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        description: scene.description,
        imageUrl: scene.imageUrl
      })),
      analytics: {
        views: tour.analytics.views,
        averageTime: tour.analytics.averageTime
      },
      status: tour.status,
      updatedAt: tour.updatedAt
    }));
    
    res.json({
      success: true,
      data: publicTours,
      total: publicTours.length,
      giotHutConfig: {
        username: GIOT_HUT_CONFIG.username,
        baseUrl: GIOT_HUT_CONFIG.baseUrl
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tours',
      message: error.message
    });
  }
});

// Obtener un tour específico
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // Incrementar contador de vistas
    tour.analytics.views++;
    
    res.json({
      success: true,
      data: tour,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tour',
      message: error.message
    });
  }
});

// Obtener URL de embed personalizada
router.get('/:id/embed', (req, res) => {
  try {
    const { id } = req.params;
    const { 
      autoRotate, 
      showHotspots = true, 
      enableVR = true, 
      quality = 'high',
      customHotspots = false
    } = req.query;
    
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // Construir URL de embed con parámetros personalizados
    const baseEmbedUrl = tour.embedUrl;
    const params = new URLSearchParams();
    
    if (autoRotate !== undefined) params.append('autoRotate', autoRotate);
    if (showHotspots !== undefined) params.append('showHotspots', showHotspots);
    if (enableVR !== undefined) params.append('enableVR', enableVR);
    if (quality) params.append('quality', quality);
    if (customHotspots === 'true') params.append('customHotspots', 'true');
    
    const customEmbedUrl = `${baseEmbedUrl}?${params.toString()}`;
    
    res.json({
      success: true,
      data: {
        tourId: id,
        embedUrl: customEmbedUrl,
        baseUrl: baseEmbedUrl,
        parameters: Object.fromEntries(params),
        iframeCode: `<iframe src="${customEmbedUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error generando embed',
      message: error.message
    });
  }
});

// Integración con configurador 3D
router.post('/:id/configurator', (req, res) => {
  try {
    const { id } = req.params;
    const { sceneId, room, hotspotId, userSession } = req.body;
    
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // Buscar la escena específica
    const scene = tour.scenes.find(s => s.id === sceneId);
    
    if (!scene) {
      return res.status(404).json({
        success: false,
        error: 'Escena no encontrada'
      });
    }
    
    // Incrementar contador de aperturas del configurador
    tour.analytics.configuratorOpens++;
    
    // Generar URL del configurador con contexto
    const configuratorUrl = `/configurador/${tour.propertyId}?` + new URLSearchParams({
      room: room || 'living',
      tour: id,
      scene: sceneId,
      hotspot: hotspotId || '',
      session: userSession || ''
    }).toString();
    
    res.json({
      success: true,
      data: {
        configuratorUrl,
        tourId: id,
        sceneId,
        room,
        propertyId: tour.propertyId,
        context: {
          sceneName: scene.name,
          sceneDescription: scene.description,
          availableRooms: tour.scenes.map(s => ({
            id: s.id,
            name: s.name
          }))
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error integrando configurador',
      message: error.message
    });
  }
});

// Registrar evento de hotspot
router.post('/:id/hotspot-click', (req, res) => {
  try {
    const { id } = req.params;
    const { sceneId, hotspotId, timestamp: eventTime, userSession } = req.body;
    
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // Incrementar contador de clicks en hotspots
    tour.analytics.hotspotClicks++;
    
    // En un entorno real, guardarías este evento en una base de datos
    const event = {
      tourId: id,
      sceneId,
      hotspotId,
      timestamp: eventTime || new Date().toISOString(),
      userSession: userSession || 'anonymous'
    };
    
    console.log('📍 Hotspot click registrado:', event);
    
    res.json({
      success: true,
      data: {
        eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recorded: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error registrando evento',
      message: error.message
    });
  }
});

// Obtener analytics de un tour
router.get('/:id/analytics', (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;
    
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // En un entorno real, calcularías métricas reales según el período
    const analytics = {
      ...tour.analytics,
      period,
      
      // Métricas simuladas adicionales
      engagement: {
        viewsThisPeriod: Math.floor(tour.analytics.views * 0.3),
        averageSessionDuration: tour.analytics.averageTime,
        bounceRate: 25.5, // porcentaje
        completionRate: 78.2 // porcentaje
      },
      
      hotspots: {
        totalClicks: tour.analytics.hotspotClicks,
        clickThroughRate: ((tour.analytics.hotspotClicks / tour.analytics.views) * 100).toFixed(1),
        mostClickedHotspot: 'configurator-living',
        leastClickedHotspot: 'goto-kitchen'
      },
      
      configurator: {
        opens: tour.analytics.configuratorOpens,
        conversionRate: ((tour.analytics.configuratorOpens / tour.analytics.views) * 100).toFixed(1),
        averageDesignTime: 12.3, // minutos
        completedDesigns: Math.floor(tour.analytics.configuratorOpens * 0.65)
      },
      
      devices: {
        desktop: 68.5,
        mobile: 25.2,
        tablet: 6.3
      },
      
      geography: {
        chile: 87.3,
        otros: 12.7
      }
    };
    
    res.json({
      success: true,
      data: analytics,
      period,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo analytics',
      message: error.message
    });
  }
});

// Sincronizar con giot hut render 360
router.post('/:id/sync-giot-hut', (req, res) => {
  try {
    const { id } = req.params;
    const { forceUpdate = false } = req.body;
    
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // En un entorno real, aquí harías una llamada a la API de giot hut
    // const giotHutResponse = await fetch(`${GIOT_HUT_CONFIG.baseUrl}/api/tours/${tour.giotHutTourId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${GIOT_HUT_CONFIG.apiKey}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    // Simular sincronización
    const syncResult = {
      tourId: id,
      giotHutTourId: tour.giotHutTourId,
      lastSync: new Date().toISOString(),
      status: 'success',
      changes: [
        'Hotspots updated',
        'Analytics synchronized',
        'Settings applied'
      ],
      nextSyncScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Actualizar timestamp de sync
    tour.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: syncResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error sincronizando con giot hut',
      message: error.message
    });
  }
});

// Obtener configuración para integración JavaScript
router.get('/:id/js-config', (req, res) => {
  try {
    const { id } = req.params;
    
    const tour = TOURS_DB[id];
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour no encontrado'
      });
    }
    
    // Configuración JavaScript para integrar el tour en el configurador
    const jsConfig = {
      tourId: id,
      embedUrl: tour.embedUrl,
      propertyId: tour.propertyId,
      
      // Configuración de integración
      integration: {
        configuratorBaseUrl: `/configurador/${tour.propertyId}`,
        hotspotCallback: 'window.configurador.onTourHotspotClick',
        sceneChangeCallback: 'window.configurador.onTourSceneChange',
        readyCallback: 'window.configurador.onTourReady'
      },
      
      // Scenes con hotspots de configurador
      scenes: tour.scenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        configuratorHotspots: scene.hotspots.filter(h => h.type === 'configurator')
      })),
      
      // Settings aplicables via JavaScript
      settings: tour.settings,
      
      // Eventos que se pueden escuchar
      events: [
        'tourReady',
        'sceneChange',
        'hotspotClick',
        'configuratorOpen',
        'fullscreenToggle'
      ]
    };
    
    res.json({
      success: true,
      data: jsConfig,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuración JS',
      message: error.message
    });
  }
});

// Estadísticas generales de todos los tours
router.get('/stats/overview', (req, res) => {
  try {
    const tours = Object.values(TOURS_DB);
    
    const stats = {
      totalTours: tours.length,
      totalViews: tours.reduce((sum, tour) => sum + tour.analytics.views, 0),
      totalConfiguratorOpens: tours.reduce((sum, tour) => sum + tour.analytics.configuratorOpens, 0),
      
      averageEngagement: {
        viewsPerTour: Math.round(tours.reduce((sum, tour) => sum + tour.analytics.views, 0) / tours.length),
        averageTime: Math.round(tours.reduce((sum, tour) => sum + tour.analytics.averageTime, 0) / tours.length),
        conversionRate: ((tours.reduce((sum, tour) => sum + tour.analytics.configuratorOpens, 0) / 
                         tours.reduce((sum, tour) => sum + tour.analytics.views, 0)) * 100).toFixed(1)
      },
      
      topPerformingTours: tours
        .sort((a, b) => b.analytics.views - a.analytics.views)
        .slice(0, 3)
        .map(tour => ({
          id: tour.id,
          title: tour.title,
          views: tour.analytics.views,
          configuratorOpens: tour.analytics.configuratorOpens
        })),
      
      byProperty: {},
      recentActivity: tours
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(tour => ({
          id: tour.id,
          title: tour.title,
          updatedAt: tour.updatedAt,
          views: tour.analytics.views
        }))
    };
    
    // Agrupar por propiedad
    tours.forEach(tour => {
      const propId = tour.propertyId;
      if (!stats.byProperty[propId]) {
        stats.byProperty[propId] = {
          tours: 0,
          totalViews: 0,
          configuratorOpens: 0
        };
      }
      
      stats.byProperty[propId].tours++;
      stats.byProperty[propId].totalViews += tour.analytics.views;
      stats.byProperty[propId].configuratorOpens += tour.analytics.configuratorOpens;
    });
    
    res.json({
      success: true,
      data: stats,
      giotHutIntegration: {
        status: 'connected',
        username: GIOT_HUT_CONFIG.username,
        lastSync: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
});

module.exports = router;