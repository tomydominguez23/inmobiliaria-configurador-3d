/**
 * CALCULADORA DE COSTOS INTELIGENTE
 * 
 * Maneja cálculos de precios, envío, impuestos, descuentos y financiamiento
 * Incluye integración con retailers y actualizaciones en tiempo real
 */

class CostCalculator {
    constructor(config = {}) {
        // Configuración por defecto
        this.config = {
            currency: 'CLP',
            locale: 'es-CL',
            includeShipping: true,
            includeTaxes: false, // En Chile, precios incluyen IVA
            includeInstallation: true,
            
            // Tarifas de envío
            shipping: {
                standard: 29990,     // Envío estándar
                express: 49990,      // Envío express (24-48h)
                premium: 79990,      // Envío premium (mismo día)
                freeThreshold: 500000, // Envío gratis sobre este monto
                regions: {
                    'RM': 1.0,         // Santiago (tarifa base)
                    'V': 1.2,          // Valparaíso
                    'VIII': 1.3,       // Biobío
                    'other': 1.5       // Otras regiones
                }
            },
            
            // Instalación
            installation: {
                perItem: 25000,      // Costo base por mueble
                minimum: 50000,      // Costo mínimo
                maximum: 200000,     // Costo máximo
                categories: {
                    'sofas': 1.0,
                    'mesas': 0.5,
                    'dormitorio': 1.2,
                    'decoracion': 0.3,
                    'iluminacion': 0.4
                }
            },
            
            // Descuentos
            discounts: {
                volume: [
                    { threshold: 1000000, discount: 0.05 }, // 5% sobre $1M
                    { threshold: 2000000, discount: 0.10 }, // 10% sobre $2M
                    { threshold: 5000000, discount: 0.15 }  // 15% sobre $5M
                ],
                seasonal: 0.0,       // Descuento estacional
                firstTime: 0.03,     // 3% descuento primera compra
                cash: 0.05          // 5% descuento pago al contado
            },
            
            // Financiamiento
            financing: {
                rates: {
                    6: 0.00,        // 6 cuotas sin interés
                    12: 0.05,       // 12 cuotas (5% anual)
                    18: 0.08,       // 18 cuotas (8% anual)
                    24: 0.12        // 24 cuotas (12% anual)
                },
                minAmount: 100000   // Monto mínimo para financiamiento
            },
            
            ...config
        };
        
        // Estado del cálculo
        this.state = {
            items: [],
            subtotal: 0,
            shipping: 0,
            installation: 0,
            discounts: 0,
            taxes: 0,
            total: 0,
            
            // Configuraciones aplicadas
            shippingType: 'standard',
            region: 'RM',
            includeInstallation: true,
            appliedDiscounts: [],
            financingOption: null
        };
        
        // Cache para optimización
        this.cache = new Map();
        
        this.init();
    }
    
    /**
     * Inicialización
     */
    init() {
        console.log('💰 Calculadora de costos inicializada');
    }
    
    /**
     * Calcular costos totales
     */
    calculate(items = [], options = {}) {
        // Actualizar configuración si es necesaria
        this.updateConfig(options);
        
        // Validar items
        if (!Array.isArray(items) || items.length === 0) {
            return this.getEmptyCalculation();
        }
        
        // Procesar items
        this.state.items = this.processItems(items);
        
        // Calcular subtotal
        this.calculateSubtotal();
        
        // Calcular envío
        this.calculateShipping();
        
        // Calcular instalación
        this.calculateInstallation();
        
        // Aplicar descuentos
        this.applyDiscounts();
        
        // Calcular impuestos (si aplica)
        this.calculateTaxes();
        
        // Calcular total
        this.calculateTotal();
        
        // Retornar resultado
        return this.getCalculationResult();
    }
    
    /**
     * Procesar items del cálculo
     */
    processItems(items) {
        return items.map(item => {
            // Obtener precio actual del item
            const currentPrice = this.getCurrentPrice(item);
            
            return {
                id: item.id,
                name: item.name,
                category: item.category,
                originalPrice: item.price,
                currentPrice: currentPrice,
                quantity: item.quantity || 1,
                customizations: item.customizations || {},
                
                // Cálculos por item
                itemTotal: currentPrice * (item.quantity || 1),
                discountEligible: this.isDiscountEligible(item),
                installationRequired: this.requiresInstallation(item)
            };
        });
    }
    
    /**
     * Obtener precio actual (puede incluir fluctuaciones, ofertas, etc.)
     */
    getCurrentPrice(item) {
        // Cache key para optimización
        const cacheKey = `price_${item.id}_${JSON.stringify(item.customizations)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        let price = item.price || 0;
        
        // Aplicar modificadores por personalización
        if (item.customizations) {
            price += this.calculateCustomizationCost(item.customizations);
        }
        
        // Simular fluctuaciones de precio (en un entorno real, vendría de la API)
        const fluctuation = this.getPriceFluctuation(item.id);
        price *= (1 + fluctuation);
        
        // Cache el resultado
        this.cache.set(cacheKey, price);
        
        return Math.round(price);
    }
    
    /**
     * Calcular costo de personalizaciones
     */
    calculateCustomizationCost(customizations) {
        let additionalCost = 0;
        
        Object.entries(customizations).forEach(([type, value]) => {
            switch (type) {
                case 'material':
                    additionalCost += this.getMaterialUpcharge(value);
                    break;
                case 'color':
                    additionalCost += this.getColorUpcharge(value);
                    break;
                case 'size':
                    additionalCost += this.getSizeUpcharge(value);
                    break;
            }
        });
        
        return additionalCost;
    }
    
    /**
     * Obtener recargo por material
     */
    getMaterialUpcharge(material) {
        const upcharges = {
            'leather': 150000,
            'premium-fabric': 50000,
            'wood-upgrade': 75000,
            'metal-finish': 25000
        };
        
        return upcharges[material] || 0;
    }
    
    /**
     * Obtener recargo por color
     */
    getColorUpcharge(color) {
        // Algunos colores premium pueden tener recargo
        const premiumColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
        return premiumColors.includes(color) ? 15000 : 0;
    }
    
    /**
     * Obtener recargo por tamaño
     */
    getSizeUpcharge(sizeModifier) {
        if (sizeModifier > 1.2) return 50000; // 20% más grande
        if (sizeModifier > 1.1) return 25000; // 10% más grande
        return 0;
    }
    
    /**
     * Simular fluctuación de precios
     */
    getPriceFluctuation(itemId) {
        // Usar hash del ID para generar fluctuación consistente
        const hash = this.simpleHash(itemId);
        const fluctuation = (hash % 21 - 10) / 1000; // ±1%
        return fluctuation;
    }
    
    /**
     * Hash simple para generar números consistentes
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    /**
     * Calcular subtotal
     */
    calculateSubtotal() {
        this.state.subtotal = this.state.items.reduce((sum, item) => {
            return sum + item.itemTotal;
        }, 0);
    }
    
    /**
     * Calcular costo de envío
     */
    calculateShipping() {
        if (!this.config.includeShipping) {
            this.state.shipping = 0;
            return;
        }
        
        // Envío gratis si supera el threshold
        if (this.state.subtotal >= this.config.shipping.freeThreshold) {
            this.state.shipping = 0;
            return;
        }
        
        // Calcular costo base según tipo de envío
        let baseCost = this.config.shipping[this.state.shippingType] || this.config.shipping.standard;
        
        // Aplicar multiplicador regional
        const regionMultiplier = this.config.shipping.regions[this.state.region] || 
                                this.config.shipping.regions.other;
        
        this.state.shipping = Math.round(baseCost * regionMultiplier);
    }
    
    /**
     * Calcular costo de instalación
     */
    calculateInstallation() {
        if (!this.config.includeInstallation || !this.state.includeInstallation) {
            this.state.installation = 0;
            return;
        }
        
        let installationCost = 0;
        
        this.state.items.forEach(item => {
            if (item.installationRequired) {
                const categoryMultiplier = this.config.installation.categories[item.category] || 1.0;
                const itemCost = this.config.installation.perItem * categoryMultiplier * item.quantity;
                installationCost += itemCost;
            }
        });
        
        // Aplicar mínimo y máximo
        installationCost = Math.max(installationCost, this.config.installation.minimum);
        installationCost = Math.min(installationCost, this.config.installation.maximum);
        
        this.state.installation = Math.round(installationCost);
    }
    
    /**
     * Aplicar descuentos
     */
    applyDiscounts() {
        let totalDiscount = 0;
        this.state.appliedDiscounts = [];
        
        // Descuento por volumen
        const volumeDiscount = this.calculateVolumeDiscount();
        if (volumeDiscount > 0) {
            totalDiscount += volumeDiscount;
            this.state.appliedDiscounts.push({
                type: 'volume',
                amount: volumeDiscount,
                description: 'Descuento por volumen de compra'
            });
        }
        
        // Descuento estacional
        const seasonalDiscount = this.calculateSeasonalDiscount();
        if (seasonalDiscount > 0) {
            totalDiscount += seasonalDiscount;
            this.state.appliedDiscounts.push({
                type: 'seasonal',
                amount: seasonalDiscount,
                description: 'Descuento estacional'
            });
        }
        
        // Descuento primera compra
        const firstTimeDiscount = this.calculateFirstTimeDiscount();
        if (firstTimeDiscount > 0) {
            totalDiscount += firstTimeDiscount;
            this.state.appliedDiscounts.push({
                type: 'firstTime',
                amount: firstTimeDiscount,
                description: 'Descuento primera compra'
            });
        }
        
        this.state.discounts = Math.round(totalDiscount);
    }
    
    /**
     * Calcular descuento por volumen
     */
    calculateVolumeDiscount() {
        const subtotal = this.state.subtotal;
        
        // Encontrar el descuento aplicable más alto
        let applicableDiscount = 0;
        
        this.config.discounts.volume.forEach(tier => {
            if (subtotal >= tier.threshold) {
                applicableDiscount = Math.max(applicableDiscount, tier.discount);
            }
        });
        
        return subtotal * applicableDiscount;
    }
    
    /**
     * Calcular descuento estacional
     */
    calculateSeasonalDiscount() {
        return this.state.subtotal * this.config.discounts.seasonal;
    }
    
    /**
     * Calcular descuento primera compra
     */
    calculateFirstTimeDiscount() {
        // En un entorno real, verificarías si es primera compra via API
        const isFirstTime = this.checkIfFirstTimeCustomer();
        
        if (isFirstTime) {
            return this.state.subtotal * this.config.discounts.firstTime;
        }
        
        return 0;
    }
    
    /**
     * Verificar si es primera compra (simulado)
     */
    checkIfFirstTimeCustomer() {
        // Simular: 30% de probabilidad de ser primera compra
        return Math.random() < 0.3;
    }
    
    /**
     * Calcular impuestos
     */
    calculateTaxes() {
        if (!this.config.includeTaxes) {
            this.state.taxes = 0;
            return;
        }
        
        // En Chile, el IVA ya está incluido en los precios
        // Esto es para casos especiales o otros países
        const taxableAmount = this.state.subtotal + this.state.shipping + this.state.installation - this.state.discounts;
        this.state.taxes = Math.round(taxableAmount * 0.19); // 19% IVA
    }
    
    /**
     * Calcular total final
     */
    calculateTotal() {
        this.state.total = this.state.subtotal + 
                          this.state.shipping + 
                          this.state.installation + 
                          this.state.taxes - 
                          this.state.discounts;
        
        // Asegurar que el total no sea negativo
        this.state.total = Math.max(0, Math.round(this.state.total));
    }
    
    /**
     * Calcular opciones de financiamiento
     */
    calculateFinancingOptions() {
        const amount = this.state.total;
        
        if (amount < this.config.financing.minAmount) {
            return [];
        }
        
        const options = [];
        
        Object.entries(this.config.financing.rates).forEach(([months, rate]) => {
            const monthlyRate = rate / 12;
            let monthlyPayment;
            
            if (rate === 0) {
                // Sin interés
                monthlyPayment = amount / parseInt(months);
            } else {
                // Con interés
                monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                               (Math.pow(1 + monthlyRate, months) - 1);
            }
            
            options.push({
                months: parseInt(months),
                monthlyPayment: Math.round(monthlyPayment),
                totalAmount: Math.round(monthlyPayment * months),
                interestRate: rate,
                savings: amount - (monthlyPayment * months)
            });
        });
        
        return options;
    }
    
    /**
     * Verificar si item es elegible para descuento
     */
    isDiscountEligible(item) {
        // Algunos items pueden estar excluidos de descuentos
        const excludedCategories = ['outlet', 'clearance'];
        return !excludedCategories.includes(item.category);
    }
    
    /**
     * Verificar si item requiere instalación
     */
    requiresInstallation(item) {
        const installationCategories = ['sofas', 'dormitorio', 'iluminacion'];
        return installationCategories.includes(item.category);
    }
    
    /**
     * Actualizar configuración
     */
    updateConfig(options) {
        Object.assign(this.config, options);
        
        // Actualizar estado si es necesario
        if (options.shippingType) this.state.shippingType = options.shippingType;
        if (options.region) this.state.region = options.region;
        if (options.includeInstallation !== undefined) {
            this.state.includeInstallation = options.includeInstallation;
        }
    }
    
    /**
     * Formatear precio
     */
    formatPrice(amount) {
        return new Intl.NumberFormat(this.config.locale, {
            style: 'currency',
            currency: this.config.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    /**
     * Obtener cálculo vacío
     */
    getEmptyCalculation() {
        return {
            items: [],
            subtotal: 0,
            shipping: 0,
            installation: 0,
            discounts: 0,
            taxes: 0,
            total: 0,
            
            // Formateados
            formatted: {
                subtotal: this.formatPrice(0),
                shipping: this.formatPrice(0),
                installation: this.formatPrice(0),
                discounts: this.formatPrice(0),
                taxes: this.formatPrice(0),
                total: this.formatPrice(0)
            },
            
            discountDetails: [],
            financingOptions: [],
            summary: {
                itemCount: 0,
                categories: {},
                savings: 0
            }
        };
    }
    
    /**
     * Obtener resultado del cálculo
     */
    getCalculationResult() {
        const result = {
            ...this.state,
            
            // Precios formateados
            formatted: {
                subtotal: this.formatPrice(this.state.subtotal),
                shipping: this.formatPrice(this.state.shipping),
                installation: this.formatPrice(this.state.installation),
                discounts: this.formatPrice(this.state.discounts),
                taxes: this.formatPrice(this.state.taxes),
                total: this.formatPrice(this.state.total)
            },
            
            // Detalles de descuentos
            discountDetails: this.state.appliedDiscounts,
            
            // Opciones de financiamiento
            financingOptions: this.calculateFinancingOptions(),
            
            // Resumen
            summary: this.generateSummary(),
            
            // Timestamp del cálculo
            calculatedAt: new Date().toISOString()
        };
        
        return result;
    }
    
    /**
     * Generar resumen del cálculo
     */
    generateSummary() {
        const categories = {};
        let totalSavings = 0;
        
        // Agrupar por categorías
        this.state.items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = {
                    count: 0,
                    total: 0,
                    items: []
                };
            }
            
            categories[item.category].count += item.quantity;
            categories[item.category].total += item.itemTotal;
            categories[item.category].items.push(item.name);
        });
        
        // Calcular ahorros totales
        totalSavings = this.state.discounts;
        
        // Agregar ahorro por envío gratis
        if (this.state.shipping === 0 && this.state.subtotal >= this.config.shipping.freeThreshold) {
            totalSavings += this.config.shipping.standard;
        }
        
        return {
            itemCount: this.state.items.length,
            categories: categories,
            savings: totalSavings,
            averageItemPrice: this.state.items.length > 0 ? 
                Math.round(this.state.subtotal / this.state.items.length) : 0,
            
            // Recomendaciones
            recommendations: this.generateRecommendations()
        };
    }
    
    /**
     * Generar recomendaciones
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Recomendar envío gratis
        if (this.state.shipping > 0) {
            const remainingForFree = this.config.shipping.freeThreshold - this.state.subtotal;
            if (remainingForFree > 0 && remainingForFree <= 200000) {
                recommendations.push({
                    type: 'freeShipping',
                    message: `Agrega ${this.formatPrice(remainingForFree)} más para envío gratis`,
                    potential_savings: this.state.shipping
                });
            }
        }
        
        // Recomendar descuento por volumen
        const nextVolumeThreshold = this.config.discounts.volume.find(
            tier => tier.threshold > this.state.subtotal
        );
        
        if (nextVolumeThreshold) {
            const remaining = nextVolumeThreshold.threshold - this.state.subtotal;
            const potentialSavings = this.state.subtotal * nextVolumeThreshold.discount;
            
            if (remaining <= 500000) {
                recommendations.push({
                    type: 'volumeDiscount',
                    message: `Agrega ${this.formatPrice(remaining)} más y ahorra ${this.formatPrice(potentialSavings)}`,
                    potential_savings: potentialSavings
                });
            }
        }
        
        // Recomendar financiamiento
        if (this.state.total >= this.config.financing.minAmount) {
            const bestOption = this.calculateFinancingOptions()[0];
            if (bestOption && bestOption.interestRate === 0) {
                recommendations.push({
                    type: 'financing',
                    message: `Financia en ${bestOption.months} cuotas sin interés de ${this.formatPrice(bestOption.monthlyPayment)}`,
                    potential_savings: 0
                });
            }
        }
        
        return recommendations;
    }
    
    /**
     * Aplicar cupón de descuento
     */
    applyCoupon(couponCode) {
        // Simulación de cupones
        const coupons = {
            'WELCOME10': { type: 'percentage', value: 0.10, description: 'Bienvenida 10%' },
            'SAVE50K': { type: 'fixed', value: 50000, description: 'Descuento $50.000' },
            'FREESHIP': { type: 'shipping', value: 0, description: 'Envío gratis' }
        };
        
        const coupon = coupons[couponCode.toUpperCase()];
        
        if (!coupon) {
            return { success: false, message: 'Cupón no válido' };
        }
        
        // Aplicar cupón según tipo
        let discount = 0;
        
        switch (coupon.type) {
            case 'percentage':
                discount = this.state.subtotal * coupon.value;
                break;
            case 'fixed':
                discount = coupon.value;
                break;
            case 'shipping':
                this.state.shipping = 0;
                return { success: true, message: 'Envío gratis aplicado' };
        }
        
        this.state.discounts += discount;
        this.state.appliedDiscounts.push({
            type: 'coupon',
            amount: discount,
            description: coupon.description,
            code: couponCode
        });
        
        // Recalcular total
        this.calculateTotal();
        
        return { 
            success: true, 
            message: `Cupón aplicado: ${this.formatPrice(discount)} de descuento`,
            discount: discount
        };
    }
    
    /**
     * Limpiar cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Obtener estadísticas de rendimiento
     */
    getPerformanceStats() {
        return {
            cacheSize: this.cache.size,
            lastCalculation: this.state.calculatedAt,
            itemsProcessed: this.state.items.length
        };
    }
}

// Exportar para uso global
window.CostCalculator = CostCalculator;