/**
 * VISOR DE REALIDAD AUMENTADA
 * 
 * Implementa funcionalidad AR para visualizar muebles en el espacio real
 * Utilizando WebXR API y fallbacks para dispositivos compatibles
 */

class ARViewer {
    constructor(configurador) {
        this.configurador = configurador;
        this.isActive = false;
        this.isSupported = false;
        
        // Referencias DOM
        this.modal = null;
        this.arContainer = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        
        // Estado AR
        this.arSession = null;
        this.arFrame = null;
        this.arObjects = [];
        this.selectedARObject = null;
        
        // Configuración
        this.config = {
            videoConstraints: {
                video: {
                    facingMode: 'environment', // Cámara trasera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            },
            hitTestSource: null,
            renderer: null,
            scene: null,
            camera: null
        };
        
        this.init();
    }
    
    /**
     * Inicializar visor AR
     */
    async init() {
        console.log('📱 Inicializando visor AR...');
        
        // Verificar soporte AR
        await this.checkARSupport();
        
        // Configurar elementos DOM
        this.setupDOMElements();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        console.log('📱 Visor AR inicializado. Soporte:', this.isSupported);
    }
    
    /**
     * Verificar soporte de AR
     */
    async checkARSupport() {
        try {
            // Verificar WebXR
            if ('xr' in navigator) {
                this.isSupported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log('✅ WebXR AR soportado:', this.isSupported);
            }
            
            // Fallback: verificar getUserMedia para AR simulado
            if (!this.isSupported && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.isSupported = 'fallback';
                console.log('⚠️ AR simulado disponible (fallback)');
            }
            
        } catch (error) {
            console.warn('⚠️ Error verificando soporte AR:', error);
            this.isSupported = false;
        }
    }
    
    /**
     * Configurar elementos DOM
     */
    setupDOMElements() {
        this.modal = document.getElementById('arModal');
        this.arContainer = document.getElementById('arViewer');
        
        if (!this.arContainer) {
            console.error('❌ Contenedor AR no encontrado');
            return;
        }
        
        // Crear elementos necesarios
        this.createARElements();
    }
    
    /**
     * Crear elementos AR
     */
    createARElements() {
        this.arContainer.innerHTML = `
            <div class="ar-viewport">
                <video id="arVideo" autoplay muted playsinline style="display: none;"></video>
                <canvas id="arCanvas"></canvas>
                
                <div class="ar-overlay">
                    <div class="ar-instructions" id="arInstructions">
                        <div class="instruction-step">
                            <div class="step-icon">📷</div>
                            <div class="step-text">Permite el acceso a la cámara</div>
                        </div>
                        <div class="instruction-step">
                            <div class="step-icon">📐</div>
                            <div class="step-text">Apunta a una superficie plana</div>
                        </div>
                        <div class="instruction-step">
                            <div class="step-icon">👆</div>
                            <div class="step-text">Toca para colocar muebles</div>
                        </div>
                    </div>
                    
                    <div class="ar-controls" id="arControls" style="display: none;">
                        <button class="ar-btn" id="placeObjectBtn">
                            📦 Colocar Mueble
                        </button>
                        <button class="ar-btn" id="deleteObjectBtn" style="display: none;">
                            🗑️ Eliminar
                        </button>
                        <button class="ar-btn" id="captureARBtn">
                            📸 Capturar
                        </button>
                        <button class="ar-btn" id="exitARBtn">
                            ❌ Salir AR
                        </button>
                    </div>
                    
                    <div class="ar-furniture-selector" id="arFurnitureSelector">
                        <div class="furniture-carousel">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Obtener referencias
        this.video = document.getElementById('arVideo');
        this.canvas = document.getElementById('arCanvas');
        this.context = this.canvas?.getContext('2d');
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botones AR
        const placeObjectBtn = document.getElementById('placeObjectBtn');
        if (placeObjectBtn) {
            placeObjectBtn.addEventListener('click', () => this.placeSelectedObject());
        }
        
        const deleteObjectBtn = document.getElementById('deleteObjectBtn');
        if (deleteObjectBtn) {
            deleteObjectBtn.addEventListener('click', () => this.deleteSelectedObject());
        }
        
        const captureARBtn = document.getElementById('captureARBtn');
        if (captureARBtn) {
            captureARBtn.addEventListener('click', () => this.captureARView());
        }
        
        const exitARBtn = document.getElementById('exitARBtn');
        if (exitARBtn) {
            exitARBtn.addEventListener('click', () => this.exitAR());
        }
        
        // Cerrar modal AR
        const closeAR = document.getElementById('closeAR');
        if (closeAR) {
            closeAR.addEventListener('click', () => this.exitAR());
        }
        
        // Touch events en canvas
        if (this.canvas) {
            this.canvas.addEventListener('touchstart', (e) => this.onARTouch(e));
            this.canvas.addEventListener('click', (e) => this.onARClick(e));
        }
    }
    
    /**
     * Iniciar experiencia AR
     */
    async startAR() {
        if (!this.isSupported) {
            this.showNotification('AR no soportado en este dispositivo', 'error');
            return;
        }
        
        try {
            console.log('📱 Iniciando AR...');
            
            // Mostrar modal
            if (this.modal) {
                this.modal.style.display = 'flex';
            }
            
            if (this.isSupported === 'fallback') {
                await this.startFallbackAR();
            } else {
                await this.startWebXRAR();
            }
            
            this.isActive = true;
            this.loadARFurniture();
            
        } catch (error) {
            console.error('❌ Error iniciando AR:', error);
            this.showNotification('Error al iniciar AR: ' + error.message, 'error');
            this.exitAR();
        }
    }
    
    /**
     * Iniciar WebXR AR (dispositivos compatibles)
     */
    async startWebXRAR() {
        console.log('🚀 Iniciando WebXR AR...');
        
        // Solicitar sesión AR
        this.arSession = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay', 'light-estimation']
        });
        
        // Configurar Three.js para AR
        await this.setupThreeJSAR();
        
        // Configurar hit testing
        const hitTestSource = await this.arSession.requestHitTestSource({ space: 'viewer' });
        this.config.hitTestSource = hitTestSource;
        
        // Iniciar loop de renderizado AR
        this.arSession.requestAnimationFrame((time, frame) => this.onARFrame(time, frame));
        
        console.log('✅ WebXR AR iniciado');
    }
    
    /**
     * Iniciar AR con fallback (cámara + overlay)
     */
    async startFallbackAR() {
        console.log('🔄 Iniciando AR fallback...');
        
        // Solicitar acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia(this.config.videoConstraints);
        
        if (this.video) {
            this.video.srcObject = stream;
            this.video.style.display = 'block';
            
            // Configurar canvas para overlay
            this.setupFallbackCanvas();
            
            // Ocultar instrucciones y mostrar controles
            const instructions = document.getElementById('arInstructions');
            const controls = document.getElementById('arControls');
            
            if (instructions) instructions.style.display = 'none';
            if (controls) controls.style.display = 'flex';
        }
        
        console.log('✅ AR fallback iniciado');
    }
    
    /**
     * Configurar Three.js para WebXR
     */
    async setupThreeJSAR() {
        // Crear renderer compatible con WebXR
        this.config.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        
        this.config.renderer.setSize(window.innerWidth, window.innerHeight);
        this.config.renderer.xr.enabled = true;
        this.config.renderer.xr.setSession(this.arSession);
        
        // Crear escena AR
        this.config.scene = new THREE.Scene();
        
        // Crear cámara AR
        this.config.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            20
        );
        
        // Agregar renderer al DOM
        this.arContainer.appendChild(this.config.renderer.domElement);
    }
    
    /**
     * Configurar canvas para AR fallback
     */
    setupFallbackCanvas() {
        if (!this.canvas || !this.video) return;
        
        this.video.addEventListener('loadedmetadata', () => {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            // Iniciar loop de renderizado fallback
            this.renderFallbackAR();
        });
    }
    
    /**
     * Frame de AR (WebXR)
     */
    onARFrame(time, frame) {
        if (!this.isActive || !this.arSession) return;
        
        this.arFrame = frame;
        
        // Realizar hit testing
        if (this.config.hitTestSource) {
            const hitTestResults = frame.getHitTestResults(this.config.hitTestSource);
            
            if (hitTestResults.length > 0) {
                // Superficie detectada, habilitar colocación
                this.enableObjectPlacement();
            }
        }
        
        // Renderizar escena AR
        this.config.renderer.render(this.config.scene, this.config.camera);
        
        // Continuar loop
        this.arSession.requestAnimationFrame((time, frame) => this.onARFrame(time, frame));
    }
    
    /**
     * Renderizado AR fallback
     */
    renderFallbackAR() {
        if (!this.isActive || !this.context || !this.video) return;
        
        // Dibujar video en canvas
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar objetos AR simulados
        this.drawARObjects();
        
        // Continuar loop
        requestAnimationFrame(() => this.renderFallbackAR());
    }
    
    /**
     * Cargar muebles disponibles para AR
     */
    loadARFurniture() {
        const selector = document.getElementById('arFurnitureSelector');
        if (!selector) return;
        
        const carousel = selector.querySelector('.furniture-carousel');
        if (!carousel) return;
        
        // Obtener muebles seleccionados del configurador
        const selectedFurniture = this.configurador?.state?.selectedFurniture || [];
        
        if (selectedFurniture.length === 0) {
            carousel.innerHTML = '<div class="no-furniture">No hay muebles seleccionados</div>';
            return;
        }
        
        let html = '';
        selectedFurniture.forEach((item, index) => {
            html += `
                <div class="ar-furniture-item ${index === 0 ? 'selected' : ''}" 
                     data-index="${index}" 
                     onclick="arViewer.selectARFurniture(${index})">
                    <div class="furniture-icon">${this.getCategoryIcon(item.category)}</div>
                    <div class="furniture-name">${item.name}</div>
                </div>
            `;
        });
        
        carousel.innerHTML = html;
    }
    
    /**
     * Seleccionar mueble para AR
     */
    selectARFurniture(index) {
        // Actualizar selección visual
        const items = document.querySelectorAll('.ar-furniture-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
        
        // Guardar mueble seleccionado
        const selectedFurniture = this.configurador?.state?.selectedFurniture || [];
        this.selectedARFurniture = selectedFurniture[index];
        
        console.log('📦 Mueble AR seleccionado:', this.selectedARFurniture?.name);
    }
    
    /**
     * Manejar touch/click en AR
     */
    onARTouch(event) {
        event.preventDefault();
        this.handleARInteraction(event.touches[0]);
    }
    
    onARClick(event) {
        this.handleARInteraction(event);
    }
    
    /**
     * Manejar interacción AR
     */
    handleARInteraction(event) {
        if (!this.selectedARFurniture) {
            this.showNotification('Selecciona un mueble primero', 'warning');
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Colocar objeto en posición tocada
        this.placeObjectAt(x, y);
    }
    
    /**
     * Colocar objeto en posición específica
     */
    placeObjectAt(x, y) {
        if (!this.selectedARFurniture) return;
        
        const arObject = {
            id: `ar_${Date.now()}`,
            furniture: this.selectedARFurniture,
            position: { x, y },
            scale: 1,
            rotation: 0,
            placed: true
        };
        
        if (this.isSupported === 'fallback') {
            // AR fallback: agregar a lista de objetos simulados
            this.arObjects.push(arObject);
        } else {
            // WebXR: agregar a escena 3D
            this.addObjectToARScene(arObject);
        }
        
        console.log('📦 Objeto AR colocado:', arObject.furniture.name);
        this.showNotification(`${arObject.furniture.name} colocado en AR`, 'success');
        
        // Habilitar botón de eliminar
        const deleteBtn = document.getElementById('deleteObjectBtn');
        if (deleteBtn) {
            deleteBtn.style.display = 'block';
        }
    }
    
    /**
     * Agregar objeto a escena AR (WebXR)
     */
    addObjectToARScene(arObject) {
        if (!this.config.scene || !this.arFrame) return;
        
        // Crear geometría simple para el objeto
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ 
            color: arObject.furniture.color || 0x00ff00,
            opacity: 0.8,
            transparent: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = arObject;
        
        // Posicionar en el resultado del hit test
        const hitTestResults = this.arFrame.getHitTestResults(this.config.hitTestSource);
        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(this.arSession.referenceSpace);
            
            mesh.position.setFromMatrixPosition(new THREE.Matrix4().fromArray(pose.transform.matrix));
        }
        
        this.config.scene.add(mesh);
        this.arObjects.push(arObject);
    }
    
    /**
     * Dibujar objetos AR (fallback)
     */
    drawARObjects() {
        if (!this.context || this.arObjects.length === 0) return;
        
        this.arObjects.forEach(obj => {
            if (!obj.placed) return;
            
            const { x, y } = obj.position;
            const size = 50 * obj.scale;
            
            // Dibujar objeto simulado
            this.context.save();
            
            // Sombra
            this.context.shadowColor = 'rgba(0,0,0,0.3)';
            this.context.shadowBlur = 10;
            this.context.shadowOffsetY = 5;
            
            // Objeto
            this.context.fillStyle = obj.furniture.color || '#3498db';
            this.context.fillRect(x - size/2, y - size/2, size, size);
            
            // Etiqueta
            this.context.fillStyle = 'white';
            this.context.font = '12px Arial';
            this.context.textAlign = 'center';
            this.context.fillText(obj.furniture.name, x, y - size/2 - 10);
            
            this.context.restore();
        });
    }
    
    /**
     * Habilitar colocación de objetos
     */
    enableObjectPlacement() {
        const placeBtn = document.getElementById('placeObjectBtn');
        if (placeBtn) {
            placeBtn.disabled = false;
            placeBtn.textContent = '📦 Tocar para Colocar';
        }
    }
    
    /**
     * Colocar objeto seleccionado
     */
    placeSelectedObject() {
        if (!this.selectedARFurniture) {
            this.showNotification('Selecciona un mueble primero', 'warning');
            return;
        }
        
        // Colocar en el centro de la pantalla
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.placeObjectAt(centerX, centerY);
    }
    
    /**
     * Eliminar objeto seleccionado
     */
    deleteSelectedObject() {
        if (this.arObjects.length === 0) return;
        
        // Eliminar último objeto colocado
        const lastObject = this.arObjects.pop();
        
        if (this.config.scene && lastObject.mesh) {
            this.config.scene.remove(lastObject.mesh);
        }
        
        this.showNotification('Objeto eliminado', 'info');
        
        // Ocultar botón si no hay más objetos
        if (this.arObjects.length === 0) {
            const deleteBtn = document.getElementById('deleteObjectBtn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
        }
    }
    
    /**
     * Capturar vista AR
     */
    captureARView() {
        try {
            let dataURL;
            
            if (this.canvas) {
                dataURL = this.canvas.toDataURL('image/png');
            } else if (this.config.renderer) {
                dataURL = this.config.renderer.domElement.toDataURL('image/png');
            }
            
            if (dataURL) {
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.download = `ar-view-${Date.now()}.png`;
                link.href = dataURL;
                link.click();
                
                this.showNotification('📸 Vista AR capturada', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error capturando AR:', error);
            this.showNotification('Error al capturar vista AR', 'error');
        }
    }
    
    /**
     * Salir de AR
     */
    async exitAR() {
        try {
            console.log('📱 Saliendo de AR...');
            
            this.isActive = false;
            
            // Cerrar sesión WebXR
            if (this.arSession) {
                await this.arSession.end();
                this.arSession = null;
            }
            
            // Detener cámara
            if (this.video && this.video.srcObject) {
                const tracks = this.video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                this.video.srcObject = null;
            }
            
            // Limpiar objetos AR
            this.arObjects = [];
            
            // Cerrar modal
            if (this.modal) {
                this.modal.style.display = 'none';
            }
            
            // Limpiar renderer
            if (this.config.renderer && this.config.renderer.domElement.parentNode) {
                this.config.renderer.domElement.parentNode.removeChild(this.config.renderer.domElement);
            }
            
            console.log('✅ AR cerrado');
            
        } catch (error) {
            console.error('❌ Error cerrando AR:', error);
        }
    }
    
    /**
     * Obtener icono de categoría
     */
    getCategoryIcon(category) {
        const icons = {
            sofas: '🛋️',
            mesas: '🍽️',
            dormitorio: '🛏️',
            decoracion: '🎨',
            iluminacion: '💡'
        };
        return icons[category] || '📦';
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
     * Obtener estado del AR
     */
    getARState() {
        return {
            isSupported: this.isSupported,
            isActive: this.isActive,
            objectsPlaced: this.arObjects.length,
            selectedFurniture: this.selectedARFurniture?.name || null
        };
    }
    
    /**
     * Destruir visor AR
     */
    destroy() {
        if (this.isActive) {
            this.exitAR();
        }
        
        console.log('🔥 Visor AR destruido');
    }
}

// Exportar para uso global
window.ARViewer = ARViewer;