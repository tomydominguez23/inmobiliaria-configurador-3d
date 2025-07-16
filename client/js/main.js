/**
 * MAIN.JS - INICIALIZADOR PRINCIPAL
 * 
 * Archivo principal que inicializa y conecta todos los componentes
 * del configurador 3D inmobiliario
 */

(function() {
    'use strict';

    /**
     * Configuración global de la aplicación
     */
    const APP_CONFIG = {
        name: 'Configurador 3D Inmobiliario',
        version: '1.0.0',
        debug: window.location.hostname === 'localhost',
        
        // URLs de API
        api: {
            base: window.location.origin + '/api',
            properties: '/api/properties',
            furniture: '/api/furniture',
            configurations: '/api/configurations',
            tours: '/api/tours'
        },
        
        // Configuración del motor 3D
        engine3D: {
            antialias: true,
            shadows: true,
            quality: 'high',
            maxObjects: 50
        },
        
        // Configuración de integraciónes
        integrations: {
            giotHut: {
                enabled: true,
                username: 'tomydominguez',
                baseUrl: 'https://render360.giothut.com'
            },
            ar: {
                enabled: true,
                fallbackMode: true
            },
            analytics: {
                enabled: true,
                trackEvents: true
            }
        }
    };

    /**
     * Estado global de la aplicación
     */
    const APP_STATE = {
        initialized: false,
        loading: true,
        error: null,
        
        // Componentes principales
        configurador: null,
        engine3D: null,
        tour360: null,
        arViewer: null,
        costCalculator: null,
        
        // Estado de carga
        loadingSteps: {
            dom: false,
            engine3D: false,
            furniture: false,
            integrations: false
        }
    };

    /**
     * Manejador de eventos globales
     */
    const EventManager = {
        events: new Map(),
        
        on(event, callback) {
            if (!this.events.has(event)) {
                this.events.set(event, []);
            }
            this.events.get(event).push(callback);
        },
        
        emit(event, data) {
            if (this.events.has(event)) {
                this.events.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error en evento ${event}:`, error);
                    }
                });
            }
        },
        
        off(event, callback) {
            if (this.events.has(event)) {
                const callbacks = this.events.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        }
    };

    /**
     * Verificaciones de compatibilidad
     */
    const CompatibilityChecker = {
        async checkAll() {
            const checks = {
                webgl: this.checkWebGL(),
                es6: this.checkES6(),
                fetch: this.checkFetch(),
                canvas: this.checkCanvas(),
                localStorage: this.checkLocalStorage(),
                mediaDevices: this.checkMediaDevices()
            };
            
            const results = {
                compatible: true,
                warnings: [],
                errors: []
            };
            
            Object.entries(checks).forEach(([feature, supported]) => {
                if (!supported) {
                    if (feature === 'webgl') {
                        results.compatible = false;
                        results.errors.push(`WebGL no soportado - El configurador 3D no funcionará`);
                    } else {
                        results.warnings.push(`${feature} no soportado - Funcionalidad limitada`);
                    }
                }
            });
            
            return results;
        },
        
        checkWebGL() {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && 
                         (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        },
        
        checkES6() {
            try {
                new Function("(a = 0) => a");
                return true;
            } catch (e) {
                return false;
            }
        },
        
        checkFetch() {
            return typeof fetch !== 'undefined';
        },
        
        checkCanvas() {
            try {
                return !!document.createElement('canvas').getContext('2d');
            } catch (e) {
                return false;
            }
        },
        
        checkLocalStorage() {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        
        checkMediaDevices() {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        }
    };

    /**
     * Gestor de carga progresiva
     */
    const LoadingManager = {
        steps: ['dom', 'compatibility', 'engine3D', 'furniture', 'integrations', 'finalization'],
        currentStep: 0,
        
        updateProgress(step, status) {
            APP_STATE.loadingSteps[step] = status;
            
            if (status) {
                this.currentStep++;
                const progress = (this.currentStep / this.steps.length) * 100;
                this.updateUI(progress, this.getStepMessage(step));
            }
            
            EventManager.emit('loadingProgress', {
                step,
                status,
                progress: this.currentStep / this.steps.length
            });
        },
        
        updateUI(progress, message) {
            const loaderBar = document.getElementById('loaderBar');
            const loaderPercentage = document.getElementById('loaderPercentage');
            const loaderText = document.querySelector('.loader-text');
            
            if (loaderBar) {
                loaderBar.style.width = `${progress}%`;
            }
            
            if (loaderPercentage) {
                loaderPercentage.textContent = `${Math.round(progress)}%`;
            }
            
            if (loaderText && message) {
                loaderText.textContent = message;
            }
        },
        
        getStepMessage(step) {
            const messages = {
                dom: 'Inicializando interfaz...',
                compatibility: 'Verificando compatibilidad...',
                engine3D: 'Cargando motor 3D...',
                furniture: 'Cargando catálogo de muebles...',
                integrations: 'Configurando integraciónes...',
                finalization: 'Finalizando configuración...'
            };
            
            return messages[step] || 'Cargando...';
        },
        
        complete() {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if (loader) {
                    loader.classList.add('hidden');
                }
                APP_STATE.loading = false;
                APP_STATE.initialized = true;
                
                EventManager.emit('appReady', APP_STATE);
            }, 500);
        }
    };

    /**
     * Inicialización principal
     */
    async function initializeApp() {
        try {
            console.log(`🚀 Iniciando ${APP_CONFIG.name} v${APP_CONFIG.version}`);
            
            // 1. Verificar compatibilidad
            LoadingManager.updateProgress('compatibility', false);
            const compatibility = await CompatibilityChecker.checkAll();
            
            if (!compatibility.compatible) {
                throw new Error('Navegador no compatible: ' + compatibility.errors.join(', '));
            }
            
            if (compatibility.warnings.length > 0) {
                console.warn('⚠️ Advertencias de compatibilidad:', compatibility.warnings);
            }
            
            LoadingManager.updateProgress('compatibility', true);
            
            // 2. Inicializar motor 3D
            LoadingManager.updateProgress('engine3D', false);
            await initializeEngine3D();
            LoadingManager.updateProgress('engine3D', true);
            
            // 3. Cargar datos de muebles
            LoadingManager.updateProgress('furniture', false);
            await loadFurnitureData();
            LoadingManager.updateProgress('furniture', true);
            
            // 4. Inicializar integraciónes
            LoadingManager.updateProgress('integrations', false);
            await initializeIntegrations();
            LoadingManager.updateProgress('integrations', true);
            
            // 5. Finalizar configuración
            LoadingManager.updateProgress('finalization', false);
            await finalizeInitialization();
            LoadingManager.updateProgress('finalization', true);
            
            // 6. Completar carga
            LoadingManager.complete();
            
            console.log('✅ Aplicación inicializada exitosamente');
            
        } catch (error) {
            handleInitializationError(error);
        }
    }

    /**
     * Inicializar motor 3D
     */
    async function initializeEngine3D() {
        const viewerContainer = document.getElementById('viewer3d');
        
        if (!viewerContainer) {
            throw new Error('Contenedor del visor 3D no encontrado');
        }
        
        // Verificar que Three.js esté disponible
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js no cargado');
        }
        
        // Crear instancia del motor 3D
        APP_STATE.engine3D = new Engine3D(viewerContainer);
        
        // Esperar a que se inicialice
        return new Promise((resolve, reject) => {
            const checkInitialized = () => {
                if (APP_STATE.engine3D.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkInitialized, 100);
                }
            };
            
            setTimeout(() => {
                if (!APP_STATE.engine3D.isInitialized) {
                    reject(new Error('Timeout inicializando motor 3D'));
                }
            }, 10000);
            
            checkInitialized();
        });
    }

    /**
     * Cargar datos de muebles
     */
    async function loadFurnitureData() {
        // Los datos ya están en furniture-data.js
        // Verificar que estén disponibles
        if (typeof FURNITURE_DATABASE === 'undefined' || typeof FurnitureData === 'undefined') {
            throw new Error('Base de datos de muebles no cargada');
        }
        
        // Verificar integridad de los datos
        const stats = FurnitureData.getStats();
        
        if (stats.totalItems === 0) {
            throw new Error('No hay muebles disponibles en la base de datos');
        }
        
        console.log(`📦 ${stats.totalItems} muebles cargados exitosamente`);
    }

    /**
     * Inicializar integraciónes
     */
    async function initializeIntegrations() {
        // Inicializar calculadora de costos
        APP_STATE.costCalculator = new CostCalculator({
            currency: 'CLP',
            locale: 'es-CL'
        });
        
        // Inicializar integración Tour 360 si está habilitada
        if (APP_CONFIG.integrations.giotHut.enabled) {
            try {
                APP_STATE.tour360 = new Tour360Integration(APP_STATE.configurador);
                console.log('🔄 Integración Tour 360 inicializada');
            } catch (error) {
                console.warn('⚠️ Error inicializando Tour 360:', error);
            }
        }
        
        // Inicializar AR si está habilitado
        if (APP_CONFIG.integrations.ar.enabled) {
            try {
                APP_STATE.arViewer = new ARViewer(APP_STATE.configurador);
                console.log('📱 Visor AR inicializado');
            } catch (error) {
                console.warn('⚠️ Error inicializando AR:', error);
            }
        }
    }

    /**
     * Finalizar inicialización
     */
    async function finalizeInitialization() {
        // Conectar todos los componentes
        connectComponents();
        
        // Configurar analytics si está habilitado
        if (APP_CONFIG.integrations.analytics.enabled) {
            initializeAnalytics();
        }
        
        // Configurar manejo de errores globales
        setupGlobalErrorHandling();
        
        // Configurar eventos de window
        setupWindowEvents();
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            if (APP_STATE.configurador && APP_STATE.configurador.showNotification) {
                APP_STATE.configurador.showNotification(
                    '🏠 ¡Bienvenido al Configurador 3D! Arrastra muebles para comenzar.',
                    'success'
                );
            }
        }, 2000);
    }

    /**
     * Conectar componentes entre sí
     */
    function connectComponents() {
        if (!APP_STATE.configurador) return;
        
        // Conectar calculadora de costos
        if (APP_STATE.costCalculator) {
            APP_STATE.configurador.onCostUpdated = (total, breakdown) => {
                EventManager.emit('costUpdated', { total, breakdown });
            };
        }
        
        // Conectar integración tour 360
        if (APP_STATE.tour360) {
            APP_STATE.configurador.tour360 = APP_STATE.tour360;
            
            // Configurar callback cuando tour esté listo
            APP_STATE.configurador.onTour360Ready = (data) => {
                console.log('🔄 Tour 360 listo para interactuar');
            };
        }
        
        // Conectar visor AR
        if (APP_STATE.arViewer) {
            APP_STATE.configurador.arViewer = APP_STATE.arViewer;
            
            // Sobrescribir función de abrir AR
            APP_STATE.configurador.openARView = () => {
                APP_STATE.arViewer.startAR();
            };
        }
        
        // Configurar callbacks del motor 3D
        if (APP_STATE.engine3D) {
            APP_STATE.engine3D.onObjectSelected = (object) => {
                EventManager.emit('objectSelected', object);
            };
            
            APP_STATE.engine3D.onSceneUpdated = () => {
                EventManager.emit('sceneUpdated');
            };
        }
    }

    /**
     * Inicializar analytics
     */
    function initializeAnalytics() {
        // Configurar Google Analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: APP_CONFIG.name,
                page_location: window.location.href
            });
        }
        
        // Eventos de analytics personalizados
        EventManager.on('furnitureAdded', (data) => {
            trackEvent('furniture_added', data);
        });
        
        EventManager.on('designCompleted', (data) => {
            trackEvent('design_completed', data);
        });
        
        EventManager.on('tour360Opened', (data) => {
            trackEvent('tour_360_opened', data);
        });
        
        EventManager.on('arViewerOpened', (data) => {
            trackEvent('ar_viewer_opened', data);
        });
    }

    /**
     * Rastrear evento de analytics
     */
    function trackEvent(eventName, eventData) {
        if (!APP_CONFIG.integrations.analytics.trackEvents) return;
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
        
        // Analytics personalizado
        console.log(`📊 Event: ${eventName}`, eventData);
        
        // En un entorno real, enviarías a tu sistema de analytics
        if (APP_CONFIG.debug) {
            console.log('📊 Analytics Event:', { eventName, eventData });
        }
    }

    /**
     * Configurar manejo de errores globales
     */
    function setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('❌ Error global:', event.error);
            
            if (APP_STATE.configurador && APP_STATE.configurador.showError) {
                APP_STATE.configurador.showError('Ha ocurrido un error inesperado');
            }
            
            // Enviar error a analytics
            trackEvent('error_occurred', {
                message: event.error?.message || 'Error desconocido',
                filename: event.filename,
                lineno: event.lineno
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promise rechazada:', event.reason);
            
            // Enviar error a analytics
            trackEvent('promise_rejection', {
                reason: event.reason?.toString() || 'Promise rechazada'
            });
        });
    }

    /**
     * Configurar eventos de window
     */
    function setupWindowEvents() {
        // Manejo de redimensionamiento
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (APP_STATE.engine3D) {
                    APP_STATE.engine3D.onWindowResize();
                }
                EventManager.emit('windowResized');
            }, 250);
        });
        
        // Manejo de visibilidad de página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                EventManager.emit('pageHidden');
            } else {
                EventManager.emit('pageVisible');
            }
        });
        
        // Manejo de cierre de página
        window.addEventListener('beforeunload', (event) => {
            // Limpiar recursos si es necesario
            if (APP_STATE.arViewer && APP_STATE.arViewer.isActive) {
                APP_STATE.arViewer.exitAR();
            }
            
            // Guardar estado si hay cambios sin guardar
            if (APP_STATE.configurador && APP_STATE.configurador.state.selectedFurniture.length > 0) {
                const shouldSave = confirm('¿Deseas guardar tu configuración antes de salir?');
                if (shouldSave) {
                    APP_STATE.configurador.saveConfiguration();
                }
            }
        });
    }

    /**
     * Manejar errores de inicialización
     */
    function handleInitializationError(error) {
        console.error('❌ Error inicializando aplicación:', error);
        
        APP_STATE.error = error;
        APP_STATE.loading = false;
        
        // Ocultar loader
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Mostrar mensaje de error
        const errorHTML = `
            <div class="error-container">
                <div class="error-content">
                    <h2>🚫 Error de Inicialización</h2>
                    <p>No se pudo cargar el configurador 3D:</p>
                    <div class="error-message">${error.message}</div>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        🔄 Recargar Página
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
        
        // Enviar error a analytics
        trackEvent('initialization_error', {
            error: error.message,
            userAgent: navigator.userAgent
        });
    }

    /**
     * Función de limpieza al cerrar la aplicación
     */
    function cleanup() {
        console.log('🧹 Limpiando recursos...');
        
        // Destruir componentes
        if (APP_STATE.configurador && APP_STATE.configurador.destroy) {
            APP_STATE.configurador.destroy();
        }
        
        if (APP_STATE.engine3D && APP_STATE.engine3D.destroy) {
            APP_STATE.engine3D.destroy();
        }
        
        if (APP_STATE.tour360 && APP_STATE.tour360.destroy) {
            APP_STATE.tour360.destroy();
        }
        
        if (APP_STATE.arViewer && APP_STATE.arViewer.destroy) {
            APP_STATE.arViewer.destroy();
        }
        
        // Limpiar event listeners
        EventManager.events.clear();
    }

    /**
     * API pública para debugging
     */
    window.ConfiguradorApp = {
        state: APP_STATE,
        config: APP_CONFIG,
        events: EventManager,
        
        // Métodos de utilidad
        getStats() {
            return {
                initialized: APP_STATE.initialized,
                componentsLoaded: {
                    configurador: !!APP_STATE.configurador,
                    engine3D: !!APP_STATE.engine3D,
                    tour360: !!APP_STATE.tour360,
                    arViewer: !!APP_STATE.arViewer,
                    costCalculator: !!APP_STATE.costCalculator
                },
                performance: {
                    loadTime: Date.now() - window.performance.timing.navigationStart,
                    memoryUsage: window.performance.memory?.usedJSHeapSize || 'N/A'
                }
            };
        },
        
        restart() {
            cleanup();
            window.location.reload();
        },
        
        debug: {
            enableDebug() {
                APP_CONFIG.debug = true;
                localStorage.setItem('debug', 'true');
                console.log('🐛 Modo debug activado');
            },
            
            disableDebug() {
                APP_CONFIG.debug = false;
                localStorage.removeItem('debug');
                console.log('🐛 Modo debug desactivado');
            },
            
            showState() {
                console.log('📊 Estado actual:', APP_STATE);
            }
        }
    };

    /**
     * Inicialización cuando el DOM esté listo
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LoadingManager.updateProgress('dom', true);
            initializeApp();
        });
    } else {
        LoadingManager.updateProgress('dom', true);
        initializeApp();
    }

    // Debug mode si está en localStorage
    if (localStorage.getItem('debug')) {
        APP_CONFIG.debug = true;
    }

    console.log(`📱 ${APP_CONFIG.name} v${APP_CONFIG.version} - Inicializando...`);

})();