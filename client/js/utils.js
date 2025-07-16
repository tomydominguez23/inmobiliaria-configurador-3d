/**
 * UTILIDADES GENERALES
 * 
 * Funciones de utilidad compartidas entre frontend y backend
 */

const Utils = {
    
    /**
     * Formatear precio en pesos chilenos
     */
    formatPrice(price, includeCurrency = true) {
        const formatter = new Intl.NumberFormat('es-CL', {
            style: includeCurrency ? 'currency' : 'decimal',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(price);
    },
    
    /**
     * Formatear números grandes (millones, miles)
     */
    formatLargeNumber(number) {
        if (number >= 1000000) {
            return `${(number / 1000000).toFixed(1)}M`;
        }
        if (number >= 1000) {
            return `${(number / 1000).toFixed(1)}K`;
        }
        return number.toString();
    },
    
    /**
     * Validar email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Generar ID único
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
    },
    
    /**
     * Debounce function para optimizar eventos
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    /**
     * Throttle function para controlar frecuencia de eventos
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Detectar dispositivo móvil
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    },
    
    /**
     * Detectar soporte WebGL
     */
    supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Calcular distancia entre dos puntos 3D
     */
    distance3D(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    /**
     * Convertir grados a radianes
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * Convertir radianes a grados
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * Clampar valor entre min y max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Interpolación lineal
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    /**
     * Normalizar valor entre 0 y 1
     */
    normalize(value, min, max) {
        return (value - min) / (max - min);
    },
    
    /**
     * Mapear valor de un rango a otro
     */
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },
    
    /**
     * Obtener coordenadas del mouse relativas a un elemento
     */
    getRelativeMousePosition(event, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY - rect.top) / rect.height) * 2 + 1
        };
    },
    
    /**
     * Detectar colisión entre dos cajas (AABB)
     */
    aabbCollision(box1, box2) {
        return (
            box1.min.x <= box2.max.x &&
            box1.max.x >= box2.min.x &&
            box1.min.y <= box2.max.y &&
            box1.max.y >= box2.min.y &&
            box1.min.z <= box2.max.z &&
            box1.max.z >= box2.min.z
        );
    },
    
    /**
     * Convertir hexadecimal a RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    /**
     * Convertir RGB a hexadecimal
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    /**
     * Obtener contraste de color (claro u oscuro)
     */
    getColorBrightness(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 0;
        
        // Fórmula de luminancia
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    
    /**
     * Determinar si usar texto claro u oscuro según el fondo
     */
    getContrastColor(backgroundColor) {
        return this.getColorBrightness(backgroundColor) > 128 ? '#000000' : '#FFFFFF';
    },
    
    /**
     * Deep clone de objetos
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },
    
    /**
     * Fusionar objetos profundamente
     */
    deepMerge(target, source) {
        if (!source) return target;
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    source[key] &&
                    typeof source[key] === 'object' &&
                    !Array.isArray(source[key])
                ) {
                    target[key] = target[key] || {};
                    this.deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        
        return target;
    },
    
    /**
     * Formatear fecha en español
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        return new Intl.DateTimeFormat('es-CL', finalOptions).format(new Date(date));
    },
    
    /**
     * Calcular tiempo transcurrido desde una fecha
     */
    timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        const intervals = {
            año: 31536000,
            mes: 2592000,
            semana: 604800,
            día: 86400,
            hora: 3600,
            minuto: 60
        };
        
        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `hace ${interval} ${unit}${interval > 1 ? (unit === 'mes' ? 'es' : 's') : ''}`;
            }
        }
        
        return 'hace un momento';
    },
    
    /**
     * Validar dimensiones de imagen
     */
    validateImageDimensions(file, maxWidth = 1920, maxHeight = 1080) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const isValid = img.width <= maxWidth && img.height <= maxHeight;
                resolve({
                    valid: isValid,
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                });
            };
            img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
            img.src = URL.createObjectURL(file);
        });
    },
    
    /**
     * Comprimir imagen
     */
    compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    },
    
    /**
     * Obtener información del navegador
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /chrome/i,
            safari: /safari/i,
            firefox: /firefox/i,
            edge: /edge/i,
            ie: /msie|trident/i
        };
        
        for (const [name, regex] of Object.entries(browsers)) {
            if (regex.test(ua)) {
                return {
                    name: name,
                    mobile: this.isMobile(),
                    webgl: this.supportsWebGL(),
                    userAgent: ua
                };
            }
        }
        
        return { name: 'unknown', mobile: this.isMobile(), webgl: this.supportsWebGL() };
    },
    
    /**
     * Crear URL de descarga para blob
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Copiar texto al portapapeles
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        }
    },
    
    /**
     * Obtener parámetros de URL
     */
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    },
    
    /**
     * Actualizar parámetros de URL sin recargar la página
     */
    updateUrlParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        window.history.pushState({}, '', url);
    },
    
    /**
     * Loader/Spinner genérico
     */
    showLoader(message = 'Cargando...') {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(loader);
        }
        
        loader.innerHTML = `
            <div style="text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; 
                           border-radius: 50%; width: 40px; height: 40px; 
                           animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div>${message}</div>
            </div>
        `;
        
        // Agregar animación CSS si no existe
        if (!document.getElementById('spinAnimation')) {
            const style = document.createElement('style');
            style.id = 'spinAnimation';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loader.style.display = 'flex';
    },
    
    hideLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    },
    
    /**
     * Logging mejorado con niveles
     */
    log: {
        info: (message, data = null) => {
            console.log(`ℹ️ [INFO] ${message}`, data);
        },
        warn: (message, data = null) => {
            console.warn(`⚠️ [WARN] ${message}`, data);
        },
        error: (message, error = null) => {
            console.error(`❌ [ERROR] ${message}`, error);
        },
        success: (message, data = null) => {
            console.log(`✅ [SUCCESS] ${message}`, data);
        },
        debug: (message, data = null) => {
            if (window.DEBUG || localStorage.getItem('debug')) {
                console.log(`🐛 [DEBUG] ${message}`, data);
            }
        }
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}