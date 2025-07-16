const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Base de datos simulada de configuraciones (en producción sería MongoDB/PostgreSQL)
const CONFIGURATIONS_DB = new Map();

// Obtener todas las configuraciones de un usuario
router.get('/', (req, res) => {
  try {
    const { userId, propertyId, limit = 20, offset = 0 } = req.query;
    
    let configurations = Array.from(CONFIGURATIONS_DB.values());
    
    // Filtrar por usuario si se proporciona
    if (userId) {
      configurations = configurations.filter(config => config.userId === userId);
    }
    
    // Filtrar por propiedad si se proporciona
    if (propertyId) {
      configurations = configurations.filter(config => config.propertyId === propertyId);
    }
    
    // Ordenar por fecha de modificación (más recientes primero)
    configurations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Paginación
    const total = configurations.length;
    const paginatedConfigs = configurations.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedConfigs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (offset + parseInt(limit)) < total
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuraciones',
      message: error.message
    });
  }
});

// Obtener una configuración específica
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const configuration = CONFIGURATIONS_DB.get(id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }
    
    // Incrementar contador de vistas
    configuration.views = (configuration.views || 0) + 1;
    configuration.lastViewed = new Date().toISOString();
    
    res.json({
      success: true,
      data: configuration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuración',
      message: error.message
    });
  }
});

// Crear nueva configuración
router.post('/', (req, res) => {
  try {
    const {
      name,
      description,
      propertyId,
      userId,
      furniture,
      totalCost,
      room,
      camera,
      lighting,
      materials,
      tags = []
    } = req.body;
    
    // Validaciones básicas
    if (!name || !propertyId || !furniture) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: name, propertyId, furniture'
      });
    }
    
    const configId = uuidv4();
    const now = new Date().toISOString();
    
    const configuration = {
      id: configId,
      name: name.trim(),
      description: description?.trim() || '',
      propertyId,
      userId: userId || 'anonymous',
      
      // Datos de la configuración 3D
      furniture: furniture.map(item => ({
        id: item.id,
        furnitureId: item.furnitureId,
        name: item.name,
        category: item.category,
        price: item.price,
        position: {
          x: parseFloat(item.position?.x || 0),
          y: parseFloat(item.position?.y || 0),
          z: parseFloat(item.position?.z || 0)
        },
        rotation: {
          x: parseFloat(item.rotation?.x || 0),
          y: parseFloat(item.rotation?.y || 0),
          z: parseFloat(item.rotation?.z || 0)
        },
        scale: {
          x: parseFloat(item.scale?.x || 1),
          y: parseFloat(item.scale?.y || 1),
          z: parseFloat(item.scale?.z || 1)
        },
        color: item.color || null,
        material: item.material || null,
        customOptions: item.customOptions || {}
      })),
      
      // Metadatos
      totalCost: parseFloat(totalCost || 0),
      furnitureCount: furniture.length,
      room: room || 'living',
      
      // Configuración de cámara
      camera: camera ? {
        position: camera.position,
        target: camera.target,
        zoom: camera.zoom
      } : null,
      
      // Configuración de iluminación
      lighting: lighting ? {
        ambient: lighting.ambient,
        directional: lighting.directional,
        point: lighting.point
      } : null,
      
      // Materiales personalizados
      materials: materials || {},
      
      // Tags para búsqueda
      tags: Array.isArray(tags) ? tags : [],
      
      // Configuración de vista
      viewMode: 'perspective',
      showGrid: true,
      showMeasurements: false,
      
      // Estado
      status: 'draft', // draft, published, shared
      isPublic: false,
      
      // Estadísticas
      views: 0,
      likes: 0,
      shares: 0,
      
      // Timestamps
      createdAt: now,
      updatedAt: now,
      lastViewed: null,
      
      // Metadata adicional
      clientInfo: {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    };
    
    // Guardar en la base de datos
    CONFIGURATIONS_DB.set(configId, configuration);
    
    res.status(201).json({
      success: true,
      data: configuration,
      message: 'Configuración creada exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creando configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando configuración',
      message: error.message
    });
  }
});

// Actualizar configuración existente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const configuration = CONFIGURATIONS_DB.get(id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }
    
    // Campos que se pueden actualizar
    const allowedUpdates = [
      'name', 'description', 'furniture', 'totalCost', 'room',
      'camera', 'lighting', 'materials', 'tags', 'viewMode',
      'showGrid', 'showMeasurements', 'status', 'isPublic'
    ];
    
    // Aplicar actualizaciones
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'furniture' && Array.isArray(updates[field])) {
          // Validar y limpiar datos de muebles
          configuration[field] = updates[field].map(item => ({
            id: item.id,
            furnitureId: item.furnitureId,
            name: item.name,
            category: item.category,
            price: item.price,
            position: {
              x: parseFloat(item.position?.x || 0),
              y: parseFloat(item.position?.y || 0),
              z: parseFloat(item.position?.z || 0)
            },
            rotation: {
              x: parseFloat(item.rotation?.x || 0),
              y: parseFloat(item.rotation?.y || 0),
              z: parseFloat(item.rotation?.z || 0)
            },
            scale: {
              x: parseFloat(item.scale?.x || 1),
              y: parseFloat(item.scale?.y || 1),
              z: parseFloat(item.scale?.z || 1)
            },
            color: item.color || null,
            material: item.material || null,
            customOptions: item.customOptions || {}
          }));
          
          // Actualizar contadores
          configuration.furnitureCount = configuration.furniture.length;
          
        } else {
          configuration[field] = updates[field];
        }
      }
    });
    
    // Actualizar timestamp
    configuration.updatedAt = new Date().toISOString();
    
    // Guardar cambios
    CONFIGURATIONS_DB.set(id, configuration);
    
    res.json({
      success: true,
      data: configuration,
      message: 'Configuración actualizada exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error actualizando configuración',
      message: error.message
    });
  }
});

// Duplicar configuración
router.post('/:id/duplicate', (req, res) => {
  try {
    const { id } = req.params;
    const { name, userId } = req.body;
    
    const originalConfig = CONFIGURATIONS_DB.get(id);
    
    if (!originalConfig) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }
    
    const newConfigId = uuidv4();
    const now = new Date().toISOString();
    
    // Crear copia de la configuración
    const duplicatedConfig = {
      ...originalConfig,
      id: newConfigId,
      name: name || `${originalConfig.name} (Copia)`,
      userId: userId || originalConfig.userId,
      status: 'draft',
      isPublic: false,
      views: 0,
      likes: 0,
      shares: 0,
      createdAt: now,
      updatedAt: now,
      lastViewed: null
    };
    
    // Guardar la copia
    CONFIGURATIONS_DB.set(newConfigId, duplicatedConfig);
    
    res.status(201).json({
      success: true,
      data: duplicatedConfig,
      message: 'Configuración duplicada exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error duplicando configuración',
      message: error.message
    });
  }
});

// Compartir configuración
router.post('/:id/share', (req, res) => {
  try {
    const { id } = req.params;
    const { email, message, includePrice = true } = req.body;
    
    const configuration = CONFIGURATIONS_DB.get(id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }
    
    // Incrementar contador de shares
    configuration.shares = (configuration.shares || 0) + 1;
    configuration.updatedAt = new Date().toISOString();
    
    // Generar enlace para compartir
    const shareUrl = `${req.protocol}://${req.get('host')}/configurador/shared/${id}`;
    
    // En un entorno real, aquí enviarías el email
    const shareData = {
      configurationId: id,
      shareUrl,
      email,
      message,
      includePrice,
      sentAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: shareData,
      message: 'Configuración compartida exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error compartiendo configuración',
      message: error.message
    });
  }
});

// Exportar configuración
router.get('/:id/export', (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const configuration = CONFIGURATIONS_DB.get(id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }
    
    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="configuracion-${id}.json"`);
        res.json(configuration);
        break;
        
      case 'csv':
        // Exportar lista de muebles como CSV
        let csv = 'Nombre,Categoría,Precio,Posición X,Posición Y,Posición Z,Color\\n';
        
        configuration.furniture.forEach(item => {
          csv += `"${item.name}","${item.category}","${item.price}","${item.position.x}","${item.position.y}","${item.position.z}","${item.color || 'N/A'}"\\n`;
        });
        
        csv += `\\n"TOTAL","","${configuration.totalCost}","","","",""\\n`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="muebles-${id}.csv"`);
        res.send(csv);
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: 'Formato no soportado. Use: json, csv'
        });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error exportando configuración',
      message: error.message
    });
  }
});

// Eliminar configuración
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const configuration = CONFIGURATIONS_DB.get(id);
    
    if (!configuration) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }
    
    // Verificar permisos (en un entorno real, usarías autenticación JWT)
    if (userId && configuration.userId !== userId && configuration.userId !== 'anonymous') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar esta configuración'
      });
    }
    
    // Eliminar configuración
    CONFIGURATIONS_DB.delete(id);
    
    res.json({
      success: true,
      message: 'Configuración eliminada exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error eliminando configuración',
      message: error.message
    });
  }
});

// Obtener estadísticas de configuraciones
router.get('/stats/summary', (req, res) => {
  try {
    const configurations = Array.from(CONFIGURATIONS_DB.values());
    
    const stats = {
      total: configurations.length,
      byStatus: {},
      byRoom: {},
      avgCost: 0,
      avgFurnitureCount: 0,
      totalViews: 0,
      totalShares: 0,
      mostPopular: null,
      recentActivity: configurations
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(config => ({
          id: config.id,
          name: config.name,
          updatedAt: config.updatedAt,
          views: config.views
        }))
    };
    
    // Calcular estadísticas
    configurations.forEach(config => {
      // Por estado
      stats.byStatus[config.status] = (stats.byStatus[config.status] || 0) + 1;
      
      // Por habitación
      stats.byRoom[config.room] = (stats.byRoom[config.room] || 0) + 1;
      
      // Sumas para promedios
      stats.avgCost += config.totalCost;
      stats.avgFurnitureCount += config.furnitureCount;
      stats.totalViews += config.views || 0;
      stats.totalShares += config.shares || 0;
    });
    
    // Calcular promedios
    if (configurations.length > 0) {
      stats.avgCost = Math.round(stats.avgCost / configurations.length);
      stats.avgFurnitureCount = Math.round(stats.avgFurnitureCount / configurations.length);
    }
    
    // Configuración más popular
    const mostViewed = configurations
      .filter(config => config.views > 0)
      .sort((a, b) => b.views - a.views)[0];
    
    if (mostViewed) {
      stats.mostPopular = {
        id: mostViewed.id,
        name: mostViewed.name,
        views: mostViewed.views,
        shares: mostViewed.shares
      };
    }
    
    res.json({
      success: true,
      data: stats,
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

// Buscar configuraciones
router.post('/search', (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    let configurations = Array.from(CONFIGURATIONS_DB.values());
    
    // Búsqueda por texto
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      configurations = configurations.filter(config =>
        config.name.toLowerCase().includes(searchQuery) ||
        config.description.toLowerCase().includes(searchQuery) ||
        config.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // Aplicar filtros
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      switch (key) {
        case 'propertyId':
          configurations = configurations.filter(config => config.propertyId === value);
          break;
        case 'userId':
          configurations = configurations.filter(config => config.userId === value);
          break;
        case 'room':
          configurations = configurations.filter(config => config.room === value);
          break;
        case 'status':
          configurations = configurations.filter(config => config.status === value);
          break;
        case 'isPublic':
          configurations = configurations.filter(config => config.isPublic === value);
          break;
        case 'minCost':
          configurations = configurations.filter(config => config.totalCost >= value);
          break;
        case 'maxCost':
          configurations = configurations.filter(config => config.totalCost <= value);
          break;
        case 'tags':
          if (Array.isArray(value)) {
            configurations = configurations.filter(config =>
              value.some(tag => config.tags.includes(tag))
            );
          }
          break;
      }
    });
    
    // Ordenar por relevancia/fecha
    configurations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json({
      success: true,
      data: configurations,
      total: configurations.length,
      query,
      filters,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en búsqueda',
      message: error.message
    });
  }
});

module.exports = router;