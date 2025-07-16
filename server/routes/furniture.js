const express = require('express');
const router = express.Router();

// Importar base de datos de muebles del frontend
// En un entorno real, esto estaría en una base de datos
const FURNITURE_CATEGORIES = {
  sofas: {
    name: 'Sofás y Sillones',
    icon: '🛋️',
    description: 'Sofás modulares, sillones y muebles de sala'
  },
  mesas: {
    name: 'Mesas y Comedor',
    icon: '🍽️',
    description: 'Mesas de comedor, centro y sillas'
  },
  dormitorio: {
    name: 'Dormitorio',
    icon: '🛏️',
    description: 'Camas, veladores y armarios'
  },
  decoracion: {
    name: 'Decoración',
    icon: '🎨',
    description: 'Plantas, cuadros, alfombras y accesorios'
  }
};

// Base de datos simulada de muebles (sincronizada con furniture-data.js)
const FURNITURE_DB = {
  'sofa-modular-vimle': {
    id: 'sofa-modular-vimle',
    name: 'Sofá Modular VIMLE',
    description: 'Sofá modular de 3 plazas con chaise longue, perfecto para espacios modernos',
    price: 899990,
    category: 'sofas',
    subcategory: 'modular',
    brand: 'IKEA',
    dimensions: { width: 281, depth: 98, height: 85 },
    materials: ['Tela', 'Poliuretano', 'Madera'],
    colors: {
      'Gris Oscuro': '#5D4E75',
      'Beige': '#8B7355',
      'Azul Marino': '#2C3E50'
    },
    features: ['Fundas extraíbles y lavables', 'Cojines reversibles'],
    modelUrl: '/assets/models/sofas/vimle-modular.glb',
    thumbnailUrl: '/assets/images/sofas/vimle-modular-thumb.jpg',
    tags: ['modular', 'chaise-longue', 'lavable', 'familiar'],
    rating: 4.5,
    reviews: 234,
    inStock: true,
    deliveryTime: '2-4 semanas',
    weight: 85.5,
    assembly: 'required',
    warranty: '10 años',
    sustainability: {
      recycled: true,
      fscCertified: true,
      localProduction: false
    }
  },
  'mesa-comedor-ekedalen': {
    id: 'mesa-comedor-ekedalen',
    name: 'Mesa Comedor EKEDALEN',
    description: 'Mesa extensible de comedor para 4-6 personas',
    price: 459990,
    category: 'mesas',
    subcategory: 'comedor',
    brand: 'IKEA',
    dimensions: { width: 120, depth: 80, height: 75 },
    materials: ['Madera de abedul', 'Chapa', 'Tinte'],
    colors: {
      'Roble Blanco': '#F5F5DC',
      'Nogal Oscuro': '#5D4037'
    },
    features: ['Extensible de 120 a 180 cm', 'Para 4-6 personas'],
    modelUrl: '/assets/models/mesas/ekedalen-comedor.glb',
    thumbnailUrl: '/assets/images/mesas/ekedalen-thumb.jpg',
    tags: ['extensible', 'comedor', 'familiar'],
    rating: 4.4,
    reviews: 345,
    inStock: true,
    deliveryTime: '2-3 semanas'
  },
  'cama-malm': {
    id: 'cama-malm',
    name: 'Cama MALM',
    description: 'Cama matrimonial con diseño limpio y funcional',
    price: 549990,
    category: 'dormitorio',
    subcategory: 'camas',
    brand: 'IKEA',
    dimensions: { width: 160, depth: 200, height: 38 },
    materials: ['Aglomerado', 'Chapa de roble'],
    colors: {
      'Blanco': '#FFFFFF',
      'Negro-Café': '#3C2415'
    },
    features: ['Cabecero ajustable', 'Base robusta'],
    modelUrl: '/assets/models/dormitorio/malm-cama.glb',
    thumbnailUrl: '/assets/images/dormitorio/malm-thumb.jpg',
    tags: ['matrimonial', 'moderno', 'funcional'],
    rating: 4.5,
    reviews: 456,
    inStock: true,
    deliveryTime: '2-4 semanas'
  }
};

// Obtener todas las categorías
router.get('/categories', (req, res) => {
  try {
    const categories = Object.keys(FURNITURE_CATEGORIES).map(key => ({
      id: key,
      ...FURNITURE_CATEGORIES[key],
      itemCount: Object.values(FURNITURE_DB).filter(item => item.category === key).length
    }));
    
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías',
      message: error.message
    });
  }
});

// Obtener todos los muebles
router.get('/', (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      brand, 
      minPrice, 
      maxPrice, 
      inStock, 
      sortBy = 'name', 
      order = 'asc',
      limit = 50,
      offset = 0
    } = req.query;
    
    let furniture = Object.values(FURNITURE_DB);
    
    // Aplicar filtros
    if (category) {
      furniture = furniture.filter(item => item.category === category);
    }
    
    if (subcategory) {
      furniture = furniture.filter(item => item.subcategory === subcategory);
    }
    
    if (brand) {
      furniture = furniture.filter(item => item.brand.toLowerCase() === brand.toLowerCase());
    }
    
    if (minPrice) {
      furniture = furniture.filter(item => item.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      furniture = furniture.filter(item => item.price <= parseInt(maxPrice));
    }
    
    if (inStock !== undefined) {
      furniture = furniture.filter(item => item.inStock === (inStock === 'true'));
    }
    
    // Ordenamiento
    furniture.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
    
    // Paginación
    const total = furniture.length;
    const paginatedItems = furniture.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      },
      filters: { category, subcategory, brand, minPrice, maxPrice, inStock },
      sorting: { sortBy, order },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo muebles',
      message: error.message
    });
  }
});

// Obtener un mueble específico
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const furniture = FURNITURE_DB[id];
    
    if (!furniture) {
      return res.status(404).json({
        success: false,
        error: 'Mueble no encontrado'
      });
    }
    
    // Obtener recomendaciones basadas en categoría y tags
    const recommendations = Object.values(FURNITURE_DB)
      .filter(item => item.id !== id && (
        item.category === furniture.category ||
        item.tags.some(tag => furniture.tags.includes(tag))
      ))
      .slice(0, 3);
    
    res.json({
      success: true,
      data: {
        ...furniture,
        recommendations
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo mueble',
      message: error.message
    });
  }
});

// Buscar muebles
router.post('/search', (req, res) => {
  try {
    const { query, filters = {}, pagination = {} } = req.body;
    let furniture = Object.values(FURNITURE_DB);
    
    // Búsqueda por texto
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      furniture = furniture.filter(item =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.brand.toLowerCase().includes(searchQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
        item.features.some(feature => feature.toLowerCase().includes(searchQuery))
      );
    }
    
    // Aplicar filtros avanzados
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      switch (key) {
        case 'categories':
          if (Array.isArray(value)) {
            furniture = furniture.filter(item => value.includes(item.category));
          }
          break;
        case 'brands':
          if (Array.isArray(value)) {
            furniture = furniture.filter(item => value.includes(item.brand));
          }
          break;
        case 'materials':
          if (Array.isArray(value)) {
            furniture = furniture.filter(item =>
              value.some(material => item.materials.includes(material))
            );
          }
          break;
        case 'tags':
          if (Array.isArray(value)) {
            furniture = furniture.filter(item =>
              value.some(tag => item.tags.includes(tag))
            );
          }
          break;
        case 'rating':
          furniture = furniture.filter(item => item.rating >= value);
          break;
        case 'dimensions':
          if (value.maxWidth) {
            furniture = furniture.filter(item => item.dimensions.width <= value.maxWidth);
          }
          if (value.maxDepth) {
            furniture = furniture.filter(item => item.dimensions.depth <= value.maxDepth);
          }
          if (value.maxHeight) {
            furniture = furniture.filter(item => item.dimensions.height <= value.maxHeight);
          }
          break;
      }
    });
    
    // Ordenamiento por relevancia si hay búsqueda
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      furniture.sort((a, b) => {
        // Dar mayor peso a coincidencias en el nombre
        const aNameMatch = a.name.toLowerCase().includes(searchQuery) ? 10 : 0;
        const bNameMatch = b.name.toLowerCase().includes(searchQuery) ? 10 : 0;
        
        // Peso por rating
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        
        const aScore = aNameMatch + aRating;
        const bScore = bNameMatch + bRating;
        
        return bScore - aScore;
      });
    }
    
    // Paginación
    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;
    const total = furniture.length;
    const paginatedItems = furniture.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        total,
        limit,
        offset,
        hasMore: (offset + limit) < total
      },
      searchQuery: query,
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

// Obtener estadísticas de muebles
router.get('/stats/summary', (req, res) => {
  try {
    const furniture = Object.values(FURNITURE_DB);
    
    const stats = {
      total: furniture.length,
      inStock: furniture.filter(item => item.inStock).length,
      outOfStock: furniture.filter(item => !item.inStock).length,
      
      byCategory: {},
      byBrand: {},
      byMaterial: {},
      
      priceRange: {
        min: Math.min(...furniture.map(item => item.price)),
        max: Math.max(...furniture.map(item => item.price)),
        average: Math.round(furniture.reduce((sum, item) => sum + item.price, 0) / furniture.length)
      },
      
      ratingStats: {
        average: (furniture.reduce((sum, item) => sum + (item.rating || 0), 0) / furniture.length).toFixed(1),
        distribution: {}
      },
      
      popularTags: {},
      deliveryTimes: {},
      
      mostPopular: furniture
        .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          name: item.name,
          rating: item.rating,
          reviews: item.reviews,
          price: item.price
        }))
    };
    
    // Calcular distribuciones
    furniture.forEach(item => {
      // Por categoría
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      
      // Por marca
      stats.byBrand[item.brand] = (stats.byBrand[item.brand] || 0) + 1;
      
      // Por material
      item.materials.forEach(material => {
        stats.byMaterial[material] = (stats.byMaterial[material] || 0) + 1;
      });
      
      // Rating distribution
      const ratingFloor = Math.floor(item.rating || 0);
      stats.ratingStats.distribution[ratingFloor] = (stats.ratingStats.distribution[ratingFloor] || 0) + 1;
      
      // Tags populares
      item.tags.forEach(tag => {
        stats.popularTags[tag] = (stats.popularTags[tag] || 0) + 1;
      });
      
      // Tiempos de entrega
      const deliveryTime = item.deliveryTime || 'No especificado';
      stats.deliveryTimes[deliveryTime] = (stats.deliveryTimes[deliveryTime] || 0) + 1;
    });
    
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

// Obtener colores disponibles para un mueble
router.get('/:id/colors', (req, res) => {
  try {
    const { id } = req.params;
    const furniture = FURNITURE_DB[id];
    
    if (!furniture) {
      return res.status(404).json({
        success: false,
        error: 'Mueble no encontrado'
      });
    }
    
    const colors = Object.keys(furniture.colors || {}).map(colorName => ({
      name: colorName,
      hex: furniture.colors[colorName],
      available: true,
      additionalCost: 0 // En el futuro podría haber colores premium
    }));
    
    res.json({
      success: true,
      data: colors,
      furnitureId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo colores',
      message: error.message
    });
  }
});

// Obtener variaciones de un mueble (tamaños, configuraciones)
router.get('/:id/variations', (req, res) => {
  try {
    const { id } = req.params;
    const furniture = FURNITURE_DB[id];
    
    if (!furniture) {
      return res.status(404).json({
        success: false,
        error: 'Mueble no encontrado'
      });
    }
    
    // Simular variaciones (en un sistema real, estas estarían en la BD)
    const variations = [];
    
    // Variaciones de tamaño para mesas extensibles
    if (furniture.subcategory === 'comedor' && furniture.features.some(f => f.includes('extensible'))) {
      variations.push({
        id: `${id}-compact`,
        name: `${furniture.name} (Compacta)`,
        dimensions: { ...furniture.dimensions, width: furniture.dimensions.width - 30 },
        price: furniture.price - 50000,
        description: 'Versión compacta para espacios reducidos'
      });
    }
    
    // Variaciones modulares para sofás
    if (furniture.category === 'sofas' && furniture.tags.includes('modular')) {
      variations.push({
        id: `${id}-2-plazas`,
        name: `${furniture.name} (2 Plazas)`,
        dimensions: { ...furniture.dimensions, width: furniture.dimensions.width - 80 },
        price: furniture.price - 200000,
        description: 'Configuración de 2 plazas sin chaise longue'
      });
    }
    
    res.json({
      success: true,
      data: variations,
      furnitureId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo variaciones',
      message: error.message
    });
  }
});

// Obtener información de compatibilidad con espacios
router.get('/:id/compatibility', (req, res) => {
  try {
    const { id } = req.params;
    const { roomWidth, roomLength, roomHeight } = req.query;
    
    const furniture = FURNITURE_DB[id];
    
    if (!furniture) {
      return res.status(404).json({
        success: false,
        error: 'Mueble no encontrado'
      });
    }
    
    const compatibility = {
      fits: true,
      warnings: [],
      recommendations: [],
      spaceUtilization: 0
    };
    
    if (roomWidth && roomLength && roomHeight) {
      const roomW = parseFloat(roomWidth);
      const roomL = parseFloat(roomLength);
      const roomH = parseFloat(roomHeight);
      
      const furnitureW = furniture.dimensions.width / 100; // convertir cm a m
      const furnitureL = furniture.dimensions.depth / 100;
      const furnitureH = furniture.dimensions.height / 100;
      
      // Verificar si cabe físicamente
      if (furnitureW > roomW || furnitureL > roomL || furnitureH > roomH) {
        compatibility.fits = false;
        compatibility.warnings.push('El mueble no cabe en las dimensiones especificadas');
      }
      
      // Calcular utilización del espacio
      const furnitureArea = furnitureW * furnitureL;
      const roomArea = roomW * roomL;
      compatibility.spaceUtilization = (furnitureArea / roomArea * 100).toFixed(1);
      
      // Recomendaciones basadas en utilización del espacio
      if (compatibility.spaceUtilization > 40) {
        compatibility.warnings.push('El mueble ocupará más del 40% del espacio disponible');
      }
      
      if (compatibility.spaceUtilization < 15) {
        compatibility.recommendations.push('Considera añadir muebles complementarios para optimizar el espacio');
      }
      
      // Recomendaciones específicas por categoría
      if (furniture.category === 'sofas') {
        if (roomW - furnitureW < 1.5) {
          compatibility.warnings.push('Espacio limitado para circulación alrededor del sofá');
        }
      }
      
      if (furniture.category === 'mesas') {
        if (roomW - furnitureW < 1.2 || roomL - furnitureL < 1.2) {
          compatibility.warnings.push('Espacio insuficiente para sillas alrededor de la mesa');
        }
      }
    }
    
    res.json({
      success: true,
      data: compatibility,
      furnitureId: id,
      roomDimensions: { roomWidth, roomLength, roomHeight },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error verificando compatibilidad',
      message: error.message
    });
  }
});

module.exports = router;