/**
 * BASE DE DATOS DE MUEBLES
 * 
 * Catálogo completo de muebles disponibles para el configurador 3D
 * Incluye información de precios, dimensiones, materiales y modelos 3D
 */

const FURNITURE_DATABASE = {
    // ==========================================================================
    // SOFÁS Y SILLONES
    // ==========================================================================
    sofas: {
        category: 'Sofás y Sillones',
        icon: '🛋️',
        items: {
            'sofa-modular-vimle': {
                id: 'sofa-modular-vimle',
                name: 'Sofá Modular VIMLE',
                description: 'Sofá modular de 3 plazas con chaise longue, perfecto para espacios modernos',
                price: 899990,
                category: 'sofas',
                subcategory: 'modular',
                brand: 'IKEA',
                dimensions: {
                    width: 281,  // cm
                    depth: 98,   // cm
                    height: 85   // cm
                },
                materials: ['Tela', 'Poliuretano', 'Madera'],
                colors: {
                    'Gris Oscuro': '#5D4E75',
                    'Beige': '#8B7355',
                    'Azul Marino': '#2C3E50',
                    'Verde Oliva': '#7F8471',
                    'Terracota': '#A0522D'
                },
                features: [
                    'Fundas extraíbles y lavables',
                    'Cojines de respaldo reversibles',
                    'Estructura resistente de madera',
                    'Espuma de alta calidad'
                ],
                modelUrl: '/assets/models/sofas/vimle-modular.glb',
                thumbnailUrl: '/assets/images/sofas/vimle-modular-thumb.jpg',
                imageUrls: [
                    '/assets/images/sofas/vimle-modular-1.jpg',
                    '/assets/images/sofas/vimle-modular-2.jpg',
                    '/assets/images/sofas/vimle-modular-3.jpg'
                ],
                tags: ['modular', 'chaise-longue', 'lavable', 'familiar'],
                rating: 4.5,
                reviews: 234,
                inStock: true,
                deliveryTime: '2-4 semanas'
            },
            'sofa-3-plazas-kivik': {
                id: 'sofa-3-plazas-kivik',
                name: 'Sofá 3 Plazas KIVIK',
                description: 'Sofá clásico de 3 plazas con asientos profundos y cómodos',
                price: 649990,
                category: 'sofas',
                subcategory: 'tradicional',
                brand: 'IKEA',
                dimensions: {
                    width: 228,
                    depth: 95,
                    height: 83
                },
                materials: ['Tela', 'Espuma', 'Madera contrachapada'],
                colors: {
                    'Gris Claro': '#A0A0A0',
                    'Azul Denim': '#4A69BD',
                    'Beige Natural': '#D2B48C',
                    'Verde Bosque': '#355E3B'
                },
                features: [
                    'Asientos extra profundos',
                    'Fundas lavables en máquina',
                    'Cojines de plumas y poliuretano',
                    'Patas de madera maciza'
                ],
                modelUrl: '/assets/models/sofas/kivik-3-plazas.glb',
                thumbnailUrl: '/assets/images/sofas/kivik-3-plazas-thumb.jpg',
                tags: ['clásico', 'cómodo', 'lavable'],
                rating: 4.3,
                reviews: 567,
                inStock: true,
                deliveryTime: '1-3 semanas'
            },
            'sillon-strandmon': {
                id: 'sillon-strandmon',
                name: 'Sillón STRANDMON',
                description: 'Sillón orejero clásico con respaldo alto y reposabrazos amplios',
                price: 299990,
                category: 'sofas',
                subcategory: 'sillon',
                brand: 'IKEA',
                dimensions: {
                    width: 82,
                    depth: 96,
                    height: 101
                },
                materials: ['Tela', 'Espuma', 'Madera'],
                colors: {
                    'Verde Esmeralda': '#50C878',
                    'Azul Profundo': '#1B4F72',
                    'Gris Carbón': '#36454F',
                    'Mostaza': '#FFDB58'
                },
                features: [
                    'Respaldo alto y envolvente',
                    'Perfecto para lectura',
                    'Estructura robusta',
                    'Diseño atemporal'
                ],
                modelUrl: '/assets/models/sofas/strandmon-sillon.glb',
                thumbnailUrl: '/assets/images/sofas/strandmon-thumb.jpg',
                tags: ['orejero', 'lectura', 'clásico'],
                rating: 4.7,
                reviews: 892,
                inStock: true,
                deliveryTime: '1-2 semanas'
            }
        }
    },

    // ==========================================================================
    // MESAS Y COMEDOR
    // ==========================================================================
    mesas: {
        category: 'Mesas y Comedor',
        icon: '🍽️',
        items: {
            'mesa-comedor-ekedalen': {
                id: 'mesa-comedor-ekedalen',
                name: 'Mesa Comedor EKEDALEN',
                description: 'Mesa extensible de comedor para 4-6 personas',
                price: 459990,
                category: 'mesas',
                subcategory: 'comedor',
                brand: 'IKEA',
                dimensions: {
                    width: 120,  // extensible a 180
                    depth: 80,
                    height: 75
                },
                materials: ['Madera de abedul', 'Chapa', 'Tinte'],
                colors: {
                    'Roble Blanco': '#F5F5DC',
                    'Nogal Oscuro': '#5D4037',
                    'Natural': '#DEB887'
                },
                features: [
                    'Extensible de 120 a 180 cm',
                    'Para 4-6 personas',
                    'Madera sostenible',
                    'Fácil de montar'
                ],
                modelUrl: '/assets/models/mesas/ekedalen-comedor.glb',
                thumbnailUrl: '/assets/images/mesas/ekedalen-thumb.jpg',
                tags: ['extensible', 'comedor', 'familiar'],
                rating: 4.4,
                reviews: 345,
                inStock: true,
                deliveryTime: '2-3 semanas'
            },
            'silla-comedor-tobias': {
                id: 'silla-comedor-tobias',
                name: 'Silla Comedor TOBIAS',
                description: 'Silla transparente moderna, perfecta para cualquier decoración',
                price: 89990,
                category: 'mesas',
                subcategory: 'sillas',
                brand: 'IKEA',
                dimensions: {
                    width: 55,
                    depth: 56,
                    height: 84
                },
                materials: ['Policarbonato', 'Acero cromado'],
                colors: {
                    'Transparente': '#FFFFFF',
                    'Gris Humo': '#708090',
                    'Azul Cristal': '#87CEEB'
                },
                features: [
                    'Material transparente',
                    'Fácil de limpiar',
                    'Apilable',
                    'Resistente a rayones'
                ],
                modelUrl: '/assets/models/mesas/tobias-silla.glb',
                thumbnailUrl: '/assets/images/mesas/tobias-thumb.jpg',
                tags: ['transparente', 'moderna', 'apilable'],
                rating: 4.2,
                reviews: 678,
                inStock: true,
                deliveryTime: '1 semana'
            },
            'mesa-centro-lack': {
                id: 'mesa-centro-lack',
                name: 'Mesa Centro LACK',
                description: 'Mesa de centro minimalista y funcional',
                price: 199990,
                category: 'mesas',
                subcategory: 'centro',
                brand: 'IKEA',
                dimensions: {
                    width: 90,
                    depth: 55,
                    height: 45
                },
                materials: ['Aglomerado', 'Papel de fibra', 'Plástico ABS'],
                colors: {
                    'Blanco': '#FFFFFF',
                    'Negro-Café': '#3C2415',
                    'Efecto Roble': '#8B7355'
                },
                features: [
                    'Ligera pero estable',
                    'Fácil de montar',
                    'Acabado resistente',
                    'Diseño atemporal'
                ],
                modelUrl: '/assets/models/mesas/lack-centro.glb',
                thumbnailUrl: '/assets/images/mesas/lack-thumb.jpg',
                tags: ['minimalista', 'ligera', 'funcional'],
                rating: 4.0,
                reviews: 1234,
                inStock: true,
                deliveryTime: '3-5 días'
            }
        }
    },

    // ==========================================================================
    // DORMITORIO
    // ==========================================================================
    dormitorio: {
        category: 'Dormitorio',
        icon: '🛏️',
        items: {
            'cama-malm': {
                id: 'cama-malm',
                name: 'Cama MALM',
                description: 'Cama matrimonial con diseño limpio y funcional',
                price: 549990,
                category: 'dormitorio',
                subcategory: 'camas',
                brand: 'IKEA',
                dimensions: {
                    width: 160,
                    depth: 200,
                    height: 38
                },
                materials: ['Aglomerado', 'Chapa de roble', 'Tinte acrílico'],
                colors: {
                    'Blanco': '#FFFFFF',
                    'Negro-Café': '#3C2415',
                    'Gris': '#808080'
                },
                features: [
                    'Cabecero ajustable',
                    'Base robusta',
                    'Líneas limpias',
                    'Fácil montaje'
                ],
                modelUrl: '/assets/models/dormitorio/malm-cama.glb',
                thumbnailUrl: '/assets/images/dormitorio/malm-thumb.jpg',
                tags: ['matrimonial', 'moderno', 'funcional'],
                rating: 4.5,
                reviews: 456,
                inStock: true,
                deliveryTime: '2-4 semanas'
            },
            'velador-hemnes': {
                id: 'velador-hemnes',
                name: 'Velador HEMNES',
                description: 'Mesa de noche con cajón y estante abierto',
                price: 129990,
                category: 'dormitorio',
                subcategory: 'veladores',
                brand: 'IKEA',
                dimensions: {
                    width: 46,
                    depth: 35,
                    height: 70
                },
                materials: ['Madera maciza de pino', 'Tinte'],
                colors: {
                    'Blanco': '#FFFFFF',
                    'Gris-Café': '#696969',
                    'Natural': '#DEB887'
                },
                features: [
                    'Un cajón y estante',
                    'Madera maciza',
                    'Herrajes suaves',
                    'Acabado duradero'
                ],
                modelUrl: '/assets/models/dormitorio/hemnes-velador.glb',
                thumbnailUrl: '/assets/images/dormitorio/hemnes-thumb.jpg',
                tags: ['cajón', 'madera', 'funcional'],
                rating: 4.3,
                reviews: 234,
                inStock: true,
                deliveryTime: '1-2 semanas'
            },
            'armario-pax': {
                id: 'armario-pax',
                name: 'Armario PAX',
                description: 'Sistema de armario modular personalizable',
                price: 899990,
                category: 'dormitorio',
                subcategory: 'armarios',
                brand: 'IKEA',
                dimensions: {
                    width: 200,
                    depth: 58,
                    height: 236
                },
                materials: ['Aglomerado', 'Chapa', 'Plástico'],
                colors: {
                    'Blanco': '#FFFFFF',
                    'Negro-Café': '#3C2415',
                    'Efecto Roble': '#8B7355'
                },
                features: [
                    'Sistema modular',
                    'Puertas soft-closing',
                    'Interior personalizable',
                    'Garantía 10 años'
                ],
                modelUrl: '/assets/models/dormitorio/pax-armario.glb',
                thumbnailUrl: '/assets/images/dormitorio/pax-thumb.jpg',
                tags: ['modular', 'personalizable', 'amplio'],
                rating: 4.6,
                reviews: 789,
                inStock: true,
                deliveryTime: '3-5 semanas'
            }
        }
    },

    // ==========================================================================
    // DECORACIÓN
    // ==========================================================================
    decoracion: {
        category: 'Decoración',
        icon: '🎨',
        items: {
            'planta-monstera': {
                id: 'planta-monstera',
                name: 'Planta Monstera',
                description: 'Planta artificial Monstera Deliciosa en maceta decorativa',
                price: 45990,
                category: 'decoracion',
                subcategory: 'plantas',
                brand: 'FEJKA',
                dimensions: {
                    width: 40,
                    depth: 40,
                    height: 90
                },
                materials: ['Plástico', 'Alambre', 'Cerámica'],
                colors: {
                    'Verde Natural': '#228B22',
                    'Verde Oscuro': '#006400'
                },
                features: [
                    'No requiere cuidados',
                    'Aspecto realista',
                    'Maceta incluida',
                    'Resistente al polvo'
                ],
                modelUrl: '/assets/models/decoracion/monstera-planta.glb',
                thumbnailUrl: '/assets/images/decoracion/monstera-thumb.jpg',
                tags: ['artificial', 'verde', 'decorativa'],
                rating: 4.1,
                reviews: 123,
                inStock: true,
                deliveryTime: '3-7 días'
            },
            'lampara-foto': {
                id: 'lampara-foto',
                name: 'Lámpara de Pie FOTO',
                description: 'Lámpara de pie moderna con pantalla de papel',
                price: 189990,
                category: 'decoracion',
                subcategory: 'iluminacion',
                brand: 'IKEA',
                dimensions: {
                    width: 47,
                    depth: 47,
                    height: 164
                },
                materials: ['Acero', 'Papel', 'Polipropileno'],
                colors: {
                    'Blanco': '#FFFFFF',
                    'Natural': '#F5F5DC'
                },
                features: [
                    'Luz difusa y suave',
                    'Base estable',
                    'Pantalla de papel',
                    'Interruptor en cable'
                ],
                modelUrl: '/assets/models/decoracion/foto-lampara.glb',
                thumbnailUrl: '/assets/images/decoracion/foto-thumb.jpg',
                tags: ['iluminación', 'moderna', 'papel'],
                rating: 4.4,
                reviews: 345,
                inStock: true,
                deliveryTime: '1-2 semanas'
            },
            'cuadros-tvilling': {
                id: 'cuadros-tvilling',
                name: 'Set Cuadros TVILLING',
                description: 'Set de 3 cuadros con marcos modernos',
                price: 79990,
                category: 'decoracion',
                subcategory: 'arte',
                brand: 'IKEA',
                dimensions: {
                    width: 50,
                    depth: 2,
                    height: 70
                },
                materials: ['Papel', 'Madera', 'Vidrio'],
                colors: {
                    'Marco Negro': '#000000',
                    'Marco Blanco': '#FFFFFF',
                    'Marco Natural': '#DEB887'
                },
                features: [
                    'Set de 3 cuadros',
                    'Marcos incluidos',
                    'Fácil instalación',
                    'Diseño contemporáneo'
                ],
                modelUrl: '/assets/models/decoracion/tvilling-cuadros.glb',
                thumbnailUrl: '/assets/images/decoracion/tvilling-thumb.jpg',
                tags: ['arte', 'moderno', 'set'],
                rating: 4.2,
                reviews: 178,
                inStock: true,
                deliveryTime: '1 semana'
            },
            'alfombra-stoense': {
                id: 'alfombra-stoense',
                name: 'Alfombra STOENSE',
                description: 'Alfombra de pelo corto resistente y cómoda',
                price: 159990,
                category: 'decoracion',
                subcategory: 'alfombras',
                brand: 'IKEA',
                dimensions: {
                    width: 170,
                    depth: 240,
                    height: 1.8
                },
                materials: ['Polipropileno', 'Respaldo de látex'],
                colors: {
                    'Gris Medio': '#808080',
                    'Beige': '#F5F5DC',
                    'Azul Oscuro': '#191970'
                },
                features: [
                    'Pelo corto 18mm',
                    'Resistente a manchas',
                    'Base antideslizante',
                    'Fácil mantenimiento'
                ],
                modelUrl: '/assets/models/decoracion/stoense-alfombra.glb',
                thumbnailUrl: '/assets/images/decoracion/stoense-thumb.jpg',
                tags: ['pelo-corto', 'resistente', 'cómoda'],
                rating: 4.3,
                reviews: 267,
                inStock: true,
                deliveryTime: '2-3 semanas'
            }
        }
    }
};

/**
 * FUNCIONES AUXILIARES PARA MANEJO DE DATOS
 */

const FurnitureData = {
    /**
     * Obtener todos los muebles de una categoría
     */
    getByCategory(category) {
        return FURNITURE_DATABASE[category]?.items || {};
    },

    /**
     * Obtener un mueble específico por ID
     */
    getById(furnitureId) {
        for (const category of Object.values(FURNITURE_DATABASE)) {
            if (category.items && category.items[furnitureId]) {
                return category.items[furnitureId];
            }
        }
        return null;
    },

    /**
     * Buscar muebles por texto
     */
    search(query) {
        const results = [];
        const searchQuery = query.toLowerCase();

        for (const category of Object.values(FURNITURE_DATABASE)) {
            if (category.items) {
                for (const item of Object.values(category.items)) {
                    if (
                        item.name.toLowerCase().includes(searchQuery) ||
                        item.description.toLowerCase().includes(searchQuery) ||
                        item.tags.some(tag => tag.toLowerCase().includes(searchQuery))
                    ) {
                        results.push(item);
                    }
                }
            }
        }

        return results;
    },

    /**
     * Filtrar muebles por precio
     */
    filterByPrice(minPrice, maxPrice) {
        const results = [];

        for (const category of Object.values(FURNITURE_DATABASE)) {
            if (category.items) {
                for (const item of Object.values(category.items)) {
                    if (item.price >= minPrice && item.price <= maxPrice) {
                        results.push(item);
                    }
                }
            }
        }

        return results;
    },

    /**
     * Obtener muebles por etiquetas
     */
    getByTags(tags) {
        const results = [];
        const searchTags = Array.isArray(tags) ? tags : [tags];

        for (const category of Object.values(FURNITURE_DATABASE)) {
            if (category.items) {
                for (const item of Object.values(category.items)) {
                    if (searchTags.some(tag => item.tags.includes(tag))) {
                        results.push(item);
                    }
                }
            }
        }

        return results;
    },

    /**
     * Obtener todas las categorías
     */
    getCategories() {
        return Object.keys(FURNITURE_DATABASE).map(key => ({
            id: key,
            name: FURNITURE_DATABASE[key].category,
            icon: FURNITURE_DATABASE[key].icon,
            itemCount: Object.keys(FURNITURE_DATABASE[key].items).length
        }));
    },

    /**
     * Obtener estadísticas del catálogo
     */
    getStats() {
        let totalItems = 0;
        let totalValue = 0;
        let avgRating = 0;
        let totalReviews = 0;

        for (const category of Object.values(FURNITURE_DATABASE)) {
            if (category.items) {
                const items = Object.values(category.items);
                totalItems += items.length;
                totalValue += items.reduce((sum, item) => sum + item.price, 0);
                totalReviews += items.reduce((sum, item) => sum + item.reviews, 0);
                avgRating += items.reduce((sum, item) => sum + item.rating, 0);
            }
        }

        return {
            totalItems,
            totalValue,
            averagePrice: Math.round(totalValue / totalItems),
            averageRating: (avgRating / totalItems).toFixed(1),
            totalReviews
        };
    },

    /**
     * Obtener recomendaciones basadas en un mueble
     */
    getRecommendations(furnitureId, limit = 3) {
        const furniture = this.getById(furnitureId);
        if (!furniture) return [];

        // Buscar muebles similares por categoría y tags
        const similar = [];
        
        for (const category of Object.values(FURNITURE_DATABASE)) {
            if (category.items) {
                for (const item of Object.values(category.items)) {
                    if (item.id !== furnitureId) {
                        // Calcular similitud basada en categoría y tags
                        let similarity = 0;
                        
                        if (item.category === furniture.category) {
                            similarity += 0.5;
                        }
                        
                        const commonTags = item.tags.filter(tag => furniture.tags.includes(tag));
                        similarity += (commonTags.length / furniture.tags.length) * 0.5;
                        
                        if (similarity > 0) {
                            similar.push({ item, similarity });
                        }
                    }
                }
            }
        }

        // Ordenar por similitud y devolver los mejores
        return similar
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(s => s.item);
    }
};

// Exportar para uso global
window.FURNITURE_DATABASE = FURNITURE_DATABASE;
window.FurnitureData = FurnitureData;

// Datos adicionales para configuración
const MATERIAL_TYPES = {
    'Madera': {
        name: 'Madera',
        icon: '🪵',
        properties: ['Natural', 'Duradero', 'Cálido']
    },
    'Tela': {
        name: 'Tela',
        icon: '🧵',
        properties: ['Suave', 'Cómodo', 'Lavable']
    },
    'Cuero': {
        name: 'Cuero',
        icon: '🐄',
        properties: ['Elegante', 'Duradero', 'Premium']
    },
    'Metal': {
        name: 'Metal',
        icon: '⚙️',
        properties: ['Moderno', 'Resistente', 'Industrial']
    },
    'Vidrio': {
        name: 'Vidrio',
        icon: '🔍',
        properties: ['Transparente', 'Limpio', 'Moderno']
    }
};

const COLOR_PALETTES = {
    'Naturales': ['#DEB887', '#8B7355', '#A0522D', '#CD853F', '#F5DEB3'],
    'Grises': ['#808080', '#A0A0A0', '#696969', '#2F4F4F', '#708090'],
    'Azules': ['#4169E1', '#1E90FF', '#87CEEB', '#4682B4', '#191970'],
    'Verdes': ['#228B22', '#32CD32', '#9ACD32', '#6B8E23', '#008B8B'],
    'Cálidos': ['#CD5C5C', '#F4A460', '#DDA0DD', '#DA70D6', '#FF69B4']
};

window.MATERIAL_TYPES = MATERIAL_TYPES;
window.COLOR_PALETTES = COLOR_PALETTES;