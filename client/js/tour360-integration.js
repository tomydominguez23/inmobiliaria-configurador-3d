/**
 * INTEGRACIÓN TOUR 360 - GIOT HUT RENDER 360
 * 
 * Maneja la integración seamless entre el tour 360 y el configurador 3D
 * Incluye comunicación bidireccional, hotspots y sincronización de estados
 */

class Tour360Integration {
    constructor(configurador) {
        this.configurador = configurador;
        this.isActive = false;
        this.currentTour = null;
        this.iframe = null;
        this.modal = null;
        
        // Configuración
        this.config = {
            baseUrl: 'https://render360.giothut.com',
            username: 'tomydominguez',
            autoSync: true,
            hotspotIntegration: true,
            communicationTimeout: 5000
        };
        
        // Estado de la integración
        this.state = {
            tourLoaded: false,
            configuratorHotspots: [],
            currentScene: null,
            userSession: this.generateSessionId()
        };
        
        this.init();
    }
    
    /**
     * Inicializar integración
     */
    init() {
        console.log('🔄 Inicializando integración Tour 360...');
        
        this.setupEventListeners();
        this.setupModalElements();
        this.loadTourConfiguration();
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar mensajes del iframe del tour
        window.addEventListener('message', (event) => {
            this.handleTourMessage(event);
        });
        
        // Eventos del configurador
        if (this.configurador) {
            this.configurador.onConfigurationChanged = (state) => {
                this.syncConfigurationWithTour(state);
            };
        }
        
        // Botones de navegación
        const enterDesignMode = document.getElementById('enterDesignMode');
        if (enterDesignMode) {
            enterDesignMode.addEventListener('click', () => {
                this.switchToConfigurator();
            });
        }
        
        const captureView = document.getElementById('captureView');
        if (captureView) {
            captureView.addEventListener('click', () => {
                this.captureTourView();
            });
        }
        
        // Cerrar modal
        const closeTour360 = document.getElementById('closeTour360');
        if (closeTour360) {
            closeTour360.addEventListener('click', () => {
                this.closeTour();
            });
        }
    }
    
    /**
     * Configurar elementos del modal
     */
    setupModalElements() {
        this.modal = document.getElementById('tour360Modal');
        this.iframe = document.getElementById('tour360Frame');
        
        if (this.modal) {
            // Cerrar modal al hacer click fuera
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeTour();
                }
            });
        }
    }
    
    /**
     * Cargar configuración del tour desde la API
     */
    async loadTourConfiguration() {
        try {
            const propertyId = this.getPropertyId();
            if (!propertyId) {
                console.warn('⚠️ No se encontró propertyId para cargar tour');
                return;
            }
            
            const response = await fetch(`/api/tours?propertyId=${propertyId}`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                this.currentTour = data.data[0];
                console.log('✅ Configuración de tour cargada:', this.currentTour.title);
            }
            
        } catch (error) {
            console.error('❌ Error cargando configuración del tour:', error);
        }
    }
    
    /**
     * Abrir tour 360
     */
    async openTour(sceneId = null) {
        if (!this.currentTour) {
            await this.loadTourConfiguration();
        }
        
        if (!this.currentTour) {
            this.showError('No se encontró tour para esta propiedad');
            return;
        }
        
        try {
            // Construir URL del tour con parámetros
            const params = new URLSearchParams({
                customHotspots: 'true',
                enableVR: 'true',
                showNavigation: 'true',
                userSession: this.state.userSession
            });
            
            if (sceneId) {
                params.append('startScene', sceneId);
            }
            
            const tourUrl = `${this.currentTour.embedUrl}?${params.toString()}`;
            
            // Cargar tour en iframe
            if (this.iframe) {
                this.iframe.src = tourUrl;
            }
            
            // Mostrar modal
            if (this.modal) {
                this.modal.style.display = 'flex';
                this.isActive = true;
            }
            
            // Registrar apertura del tour
            this.trackEvent('tour_opened', {
                tourId: this.currentTour.id,
                sceneId: sceneId
            });
            
            console.log('🔄 Tour 360 abierto:', this.currentTour.title);
            
        } catch (error) {
            console.error('❌ Error abriendo tour:', error);
            this.showError('Error al cargar el tour 360');
        }
    }
    
    /**
     * Cerrar tour
     */
    closeTour() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        
        if (this.iframe) {
            this.iframe.src = '';
        }
        
        this.isActive = false;
        
        console.log('🔄 Tour 360 cerrado');
    }
    
    /**
     * Manejar mensajes del tour (comunicación iframe)
     */
    handleTourMessage(event) {
        // Verificar origen por seguridad
        if (!event.origin.includes('render360.giothut.com') && !event.origin.includes('localhost')) {
            return;
        }
        
        const message = event.data;
        
        if (typeof message !== 'object' || !message.type) {
            return;
        }
        
        console.log('📨 Mensaje del tour:', message);
        
        switch (message.type) {
            case 'tourReady':
                this.onTourReady(message.data);
                break;
                
            case 'sceneChanged':
                this.onSceneChanged(message.data);
                break;
                
            case 'hotspotClicked':
                this.onHotspotClicked(message.data);
                break;
                
            case 'configuratorRequested':
                this.onConfiguratorRequested(message.data);
                break;
                
            case 'tourError':
                this.onTourError(message.data);
                break;
                
            default:
                console.log('🔍 Mensaje de tour no manejado:', message.type);
        }
    }
    
    /**
     * Tour listo para interactuar
     */
    onTourReady(data) {
        console.log('✅ Tour 360 listo');
        this.state.tourLoaded = true;
        
        // Sincronizar hotspots del configurador
        this.syncConfiguratorHotspots();
        
        // Notificar al configurador
        if (this.configurador && this.configurador.onTour360Ready) {
            this.configurador.onTour360Ready(data);
        }
    }
    
    /**
     * Cambio de escena en el tour
     */
    onSceneChanged(data) {
        console.log('🏠 Escena cambiada:', data.sceneId);
        this.state.currentScene = data.sceneId;
        
        // Registrar evento
        this.trackEvent('scene_changed', {
            sceneId: data.sceneId,
            sceneName: data.sceneName
        });
        
        // Actualizar configurador si es necesario
        if (this.configurador && data.room) {
            this.configurador.changeRoom(data.room);
        }
    }
    
    /**
     * Click en hotspot del tour
     */
    onHotspotClicked(data) {
        console.log('📍 Hotspot clickeado:', data);
        
        // Registrar evento
        this.trackEvent('hotspot_clicked', {
            hotspotId: data.hotspotId,
            sceneId: data.sceneId,
            hotspotType: data.type
        });
        
        // Manejar según el tipo de hotspot
        switch (data.action) {
            case 'openConfigurator':
                this.switchToConfigurator(data.room);
                break;
                
            case 'showInfo':
                this.showRoomInfo(data);
                break;
                
            case 'gotoScene':
                // Navegación manejada por el tour
                break;
                
            default:
                console.log('🔍 Acción de hotspot no manejada:', data.action);
        }
    }
    
    /**
     * Solicitud de abrir configurador desde el tour
     */
    onConfiguratorRequested(data) {
        console.log('🎨 Configurador solicitado desde tour:', data);
        this.switchToConfigurator(data.room, data.sceneId);
    }
    
    /**
     * Error en el tour
     */
    onTourError(data) {
        console.error('❌ Error en tour 360:', data);
        this.showError('Error en el tour 360: ' + data.message);
    }
    
    /**
     * Cambiar al configurador desde el tour
     */
    switchToConfigurator(room = 'living', sceneId = null) {
        // Cerrar tour
        this.closeTour();
        
        // Cambiar al modo configurador
        if (this.configurador) {
            this.configurador.switchMode('configurador');
            
            if (room) {
                this.configurador.changeRoom(room);
            }
        }
        
        // Registrar conversión
        this.trackEvent('tour_to_configurator', {
            room: room,
            sceneId: sceneId
        });
        
        // Mostrar notificación
        this.showNotification(`🎨 Configurador abierto para ${this.getRoomName(room)}`);
    }
    
    /**
     * Sincronizar hotspots del configurador con el tour
     */
    async syncConfiguratorHotspots() {
        if (!this.state.tourLoaded || !this.config.hotspotIntegration) {
            return;
        }
        
        try {
            // Obtener configuración de hotspots
            const response = await fetch(`/api/tours/${this.currentTour.id}/js-config`);
            const config = await response.json();
            
            if (config.success) {
                this.state.configuratorHotspots = config.data.scenes;
                
                // Enviar hotspots al tour
                this.sendMessageToTour({
                    type: 'updateHotspots',
                    data: {
                        hotspots: this.state.configuratorHotspots,
                        configuratorUrl: config.data.integration.configuratorBaseUrl
                    }
                });
                
                console.log('✅ Hotspots sincronizados con el tour');
            }
            
        } catch (error) {
            console.error('❌ Error sincronizando hotspots:', error);
        }
    }
    
    /**
     * Sincronizar configuración actual con el tour
     */
    syncConfigurationWithTour(configState) {
        if (!this.state.tourLoaded || !this.config.autoSync) {
            return;
        }
        
        // Preparar datos de sincronización
        const syncData = {
            furniture: configState.selectedFurniture,
            totalCost: configState.totalCost,
            room: configState.currentRoom,
            timestamp: new Date().toISOString()
        };
        
        // Enviar al tour
        this.sendMessageToTour({
            type: 'configurationUpdated',
            data: syncData
        });
        
        console.log('🔄 Configuración sincronizada con tour');
    }
    
    /**
     * Enviar mensaje al tour (iframe)
     */
    sendMessageToTour(message) {
        if (!this.iframe || !this.iframe.contentWindow) {
            console.warn('⚠️ No se puede enviar mensaje: iframe no disponible');
            return;
        }
        
        try {
            this.iframe.contentWindow.postMessage(message, '*');
        } catch (error) {
            console.error('❌ Error enviando mensaje al tour:', error);
        }
    }
    
    /**
     * Capturar vista actual del tour
     */
    async captureTourView() {
        try {
            // Solicitar captura al tour
            this.sendMessageToTour({
                type: 'captureView',
                data: {
                    quality: 'high',
                    includeHotspots: false
                }
            });
            
            this.showNotification('📸 Capturando vista del tour...');
            
        } catch (error) {
            console.error('❌ Error capturando vista:', error);
            this.showError('Error al capturar la vista');
        }
    }
    
    /**
     * Mostrar información de habitación
     */
    showRoomInfo(data) {
        const info = `
            <div class="room-info-modal">
                <h3>${data.roomName}</h3>
                <p>${data.description}</p>
                <div class="room-stats">
                    <div>Área: ${data.area} m²</div>
                    <div>Dimensiones: ${data.dimensions}</div>
                </div>
                <button onclick="configurador.tour360.switchToConfigurator('${data.room}')">
                    🎨 Configurar esta habitación
                </button>
            </div>
        `;
        
        this.showModal(info);
    }
    
    /**
     * Registrar eventos para analytics
     */
    async trackEvent(eventType, eventData) {
        try {
            await fetch(`/api/tours/${this.currentTour?.id}/hotspot-click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType,
                    eventData,
                    userSession: this.state.userSession,
                    timestamp: new Date().toISOString()
                })
            });
            
        } catch (error) {
            console.error('❌ Error registrando evento:', error);
        }
    }
    
    /**
     * Obtener ID de propiedad actual
     */
    getPropertyId() {
        // Obtener de URL o configuración
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('propertyId') || 
                          window.location.pathname.split('/').pop();
        
        return propertyId;
    }
    
    /**
     * Obtener nombre de habitación
     */
    getRoomName(room) {
        const roomNames = {
            living: 'Sala de Estar',
            dining: 'Comedor',
            kitchen: 'Cocina',
            bedroom1: 'Dormitorio Principal',
            bedroom2: 'Dormitorio 2',
            bathroom1: 'Baño Principal',
            terrace: 'Terraza'
        };
        
        return roomNames[room] || room;
    }
    
    /**
     * Generar ID de sesión
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        if (this.configurador && this.configurador.showNotification) {
            this.configurador.showNotification(message, type);
        } else {
            console.log('📢', message);
        }
    }
    
    /**
     * Mostrar error
     */
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    /**
     * Mostrar modal genérico
     */
    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'generic-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                ${content}
            </div>
        `;
        
        modal.querySelector('.close-modal').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
        
        document.body.appendChild(modal);
    }
    
    /**
     * Obtener estado actual de la integración
     */
    getIntegrationState() {
        return {
            isActive: this.isActive,
            tourLoaded: this.state.tourLoaded,
            currentTour: this.currentTour?.id,
            currentScene: this.state.currentScene,
            userSession: this.state.userSession
        };
    }
    
    /**
     * Destruir integración
     */
    destroy() {
        // Remover event listeners
        window.removeEventListener('message', this.handleTourMessage);
        
        // Cerrar tour si está abierto
        if (this.isActive) {
            this.closeTour();
        }
        
        console.log('🔥 Integración Tour 360 destruida');
    }
}

// Exportar para uso global
window.Tour360Integration = Tour360Integration;