const express = require('express');
const router = express.Router();

// Base de datos simulada de propiedades (en producción sería una BD real)
const PROPERTIES_DB = {
  '1': {
    id: '1',
    title: 'Apartamento Moderno Las Condes',
    description: 'Hermoso apartamento de 2 dormitorios y 2 baños en el corazón de Las Condes',
    address: 'Av. Apoquindo 1234, Las Condes, Santiago',
    price: 185000000,
    currency: 'CLP',
    area: 85,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    storage: true,
    floors: [
      {
        id: 'main',
        name: 'Planta Principal',
        area: 85,
        rooms: [
          {
            id: 'living',
            name: 'Sala de Estar',
            area: 25,
            dimensions: { width: 5, length: 5, height: 2.8 }
          },
          {
            id: 'dining',
            name: 'Comedor',
            area: 15,
            dimensions: { width: 4, length: 3.75, height: 2.8 }
          },
          {
            id: 'kitchen',
            name: 'Cocina',
            area: 10,
            dimensions: { width: 3, length: 3.33, height: 2.8 }
          },
          {
            id: 'bedroom1',
            name: 'Dormitorio Principal',
            area: 18,
            dimensions: { width: 4, length: 4.5, height: 2.8 }
          },
          {
            id: 'bedroom2',
            name: 'Dormitorio 2',
            area: 12,
            dimensions: { width: 3, length: 4, height: 2.8 }
          },
          {
            id: 'bathroom1',
            name: 'Baño Principal',
            area: 5,
            dimensions: { width: 2, length: 2.5, height: 2.8 }
          }
        ]
      }
    ],
    images: [
      '/assets/images/properties/prop1/exterior.jpg',
      '/assets/images/properties/prop1/living.jpg',
      '/assets/images/properties/prop1/kitchen.jpg',
      '/assets/images/properties/prop1/bedroom.jpg'
    ],
    tour360Url: 'https://render360.giothut.com/tour/property-1',
    floorPlanUrl: '/assets/images/properties/prop1/floorplan.jpg',
    modelUrl: '/assets/models/properties/prop1/apartment.glb',
    amenities: [
      'Gimnasio',
      'Piscina',
      'Quincho',
      'Sala de eventos',
      'Seguridad 24/7',
      'Estacionamiento de visitas'
    ],
    features: [
      'Pisos de madera',
      'Cocina amoblada',
      'Closets empotrados',
      'Balcón con vista',
      'Calefacción central',
      'Doble vidriado'
    ],
    location: {
      latitude: -33.4172,
      longitude: -70.5476,
      neighborhood: 'Las Condes',
      commune: 'Las Condes',
      region: 'Metropolitana'
    },
    contact: {
      agent: 'Tomás Domínguez',
      phone: '+56912345678',
      email: 'tomas@inmobiliaria.cl',
      company: 'Inmobiliaria Domínguez'
    },
    status: 'available',
    createdAt: '2024-01-15',
    updatedAt: '2024-07-15'
  },
  '2': {
    id: '2',
    title: 'Penthouse Providencia Premium',
    description: 'Exclusivo penthouse con terraza panorámica en Providencia',
    address: 'Av. Providencia 2876, Providencia, Santiago',
    price: 280000000,
    currency: 'CLP',
    area: 120,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    storage: true,
    floors: [
      {
        id: 'main',
        name: 'Planta Principal',
        area: 90,
        rooms: [
          {
            id: 'living',
            name: 'Sala de Estar',
            area: 35,
            dimensions: { width: 7, length: 5, height: 3.2 }
          },
          {
            id: 'dining',
            name: 'Comedor',
            area: 20,
            dimensions: { width: 5, length: 4, height: 3.2 }
          },
          {
            id: 'kitchen',
            name: 'Cocina',
            area: 15,
            dimensions: { width: 4, length: 3.75, height: 3.2 }
          },
          {
            id: 'bedroom1',
            name: 'Dormitorio Principal',
            area: 25,
            dimensions: { width: 5, length: 5, height: 3.2 }
          }
        ]
      },
      {
        id: 'terrace',
        name: 'Terraza',
        area: 30,
        rooms: [
          {
            id: 'terrace',
            name: 'Terraza Principal',
            area: 30,
            dimensions: { width: 6, length: 5, height: 0 }
          }
        ]
      }
    ],
    images: [
      '/assets/images/properties/prop2/exterior.jpg',
      '/assets/images/properties/prop2/living.jpg',
      '/assets/images/properties/prop2/terrace.jpg'
    ],
    tour360Url: 'https://render360.giothut.com/tour/property-2',
    floorPlanUrl: '/assets/images/properties/prop2/floorplan.jpg',
    modelUrl: '/assets/models/properties/prop2/penthouse.glb',
    status: 'available',
    createdAt: '2024-02-20',
    updatedAt: '2024-07-15'
  }
};

// Obtener todas las propiedades
router.get('/', (req, res) => {
  try {
    const properties = Object.values(PROPERTIES_DB);
    
    // Filtros opcionales
    const { status, minPrice, maxPrice, bedrooms, area } = req.query;
    
    let filtered = properties;
    
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
    }
    
    if (bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(bedrooms));
    }
    
    if (area) {
      filtered = filtered.filter(p => p.area >= parseInt(area));
    }
    
    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo propiedades',
      message: error.message
    });
  }
});

// Obtener una propiedad específica
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const property = PROPERTIES_DB[id];
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: property,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo propiedad',
      message: error.message
    });
  }
});

// Obtener habitaciones de una propiedad
router.get('/:id/rooms', (req, res) => {
  try {
    const { id } = req.params;
    const property = PROPERTIES_DB[id];
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Propiedad no encontrada'
      });
    }
    
    // Compilar todas las habitaciones de todos los pisos
    const allRooms = [];
    
    property.floors.forEach(floor => {
      floor.rooms.forEach(room => {
        allRooms.push({
          ...room,
          floorId: floor.id,
          floorName: floor.name
        });
      });
    });
    
    res.json({
      success: true,
      data: allRooms,
      total: allRooms.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo habitaciones',
      message: error.message
    });
  }
});

// Obtener estadísticas de propiedades
router.get('/stats/summary', (req, res) => {
  try {
    const properties = Object.values(PROPERTIES_DB);
    
    const stats = {
      total: properties.length,
      available: properties.filter(p => p.status === 'available').length,
      sold: properties.filter(p => p.status === 'sold').length,
      averagePrice: Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length),
      averageArea: Math.round(properties.reduce((sum, p) => sum + p.area, 0) / properties.length),
      priceRange: {
        min: Math.min(...properties.map(p => p.price)),
        max: Math.max(...properties.map(p => p.price))
      },
      areaRange: {
        min: Math.min(...properties.map(p => p.area)),
        max: Math.max(...properties.map(p => p.area))
      },
      bedroomDistribution: {},
      locationDistribution: {}
    };
    
    // Distribución por dormitorios
    properties.forEach(p => {
      const bedrooms = p.bedrooms;
      stats.bedroomDistribution[bedrooms] = (stats.bedroomDistribution[bedrooms] || 0) + 1;
    });
    
    // Distribución por ubicación
    properties.forEach(p => {
      const location = p.location?.commune || 'Otro';
      stats.locationDistribution[location] = (stats.locationDistribution[location] || 0) + 1;
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

// Buscar propiedades
router.post('/search', (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    const properties = Object.values(PROPERTIES_DB);
    
    let results = properties;
    
    // Búsqueda por texto
    if (query && query.trim()) {
      const searchQuery = query.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery) ||
        p.address.toLowerCase().includes(searchQuery) ||
        (p.location?.neighborhood && p.location.neighborhood.toLowerCase().includes(searchQuery))
      );
    }
    
    // Aplicar filtros
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      switch (key) {
        case 'priceMin':
          results = results.filter(p => p.price >= value);
          break;
        case 'priceMax':
          results = results.filter(p => p.price <= value);
          break;
        case 'areaMin':
          results = results.filter(p => p.area >= value);
          break;
        case 'areaMax':
          results = results.filter(p => p.area <= value);
          break;
        case 'bedrooms':
          results = results.filter(p => p.bedrooms >= value);
          break;
        case 'bathrooms':
          results = results.filter(p => p.bathrooms >= value);
          break;
        case 'status':
          results = results.filter(p => p.status === value);
          break;
        case 'commune':
          results = results.filter(p => p.location?.commune === value);
          break;
      }
    });
    
    res.json({
      success: true,
      data: results,
      total: results.length,
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