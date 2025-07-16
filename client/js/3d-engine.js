/**
 * MOTOR 3D CONFIGURADOR INMOBILIARIO
 * 
 * Motor principal basado en Three.js para la visualización 3D
 * Maneja la escena, cámara, luces, modelos y interacciones
 */

class Engine3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Managers
        this.loadingManager = null;
        this.gltfLoader = null;
        this.textureLoader = null;
        
        // Estado
        this.isInitialized = false;
        this.objectsInScene = new Map();
        this.selectedObject = null;
        this.isDragging = false;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        // Configuración
        this.config = {
            camera: {
                fov: 75,
                near: 0.1,
                far: 1000,
                position: { x: 10, y: 10, z: 10 }
            },
            renderer: {
                antialias: true,
                shadowMapEnabled: true,
                shadowMapType: THREE.PCFSoftShadowMap
            },
            controls: {
                enableDamping: true,
                dampingFactor: 0.05,
                minDistance: 5,
                maxDistance: 50,
                maxPolarAngle: Math.PI / 2
            }
        };
        
        // Callbacks
        this.onObjectSelected = null;
        this.onObjectMoved = null;
        this.onSceneUpdated = null;
        
        this.init();
    }
    
    /**
     * Inicialización principal del motor 3D
     */
    init() {
        console.log('🎮 Inicializando Motor 3D...');
        
        try {
            this.createScene();
            this.createCamera();
            this.createRenderer();
            this.createControls();
            this.createLights();
            this.createEnvironment();
            this.setupLoaders();
            this.setupEventListeners();
            this.startRenderLoop();
            
            this.isInitialized = true;
            console.log('✅ Motor 3D inicializado correctamente');
            
            // Callback de inicialización
            if (window.configurador && window.configurador.onEngine3DReady) {
                window.configurador.onEngine3DReady(this);
            }
            
        } catch (error) {
            console.error('❌ Error inicializando Motor 3D:', error);
        }
    }
    
    /**
     * Crear la escena 3D
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.fog = new THREE.Fog(0xf0f0f0, 50, 200);
    }
    
    /**
     * Configurar la cámara
     */
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(
            this.config.camera.fov,
            aspect,
            this.config.camera.near,
            this.config.camera.far
        );
        
        this.camera.position.set(
            this.config.camera.position.x,
            this.config.camera.position.y,
            this.config.camera.position.z
        );
    }
    
    /**
     * Configurar el renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: this.config.renderer.antialias 
        });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Sombras
        this.renderer.shadowMap.enabled = this.config.renderer.shadowMapEnabled;
        this.renderer.shadowMap.type = this.config.renderer.shadowMapType;
        
        // Tone mapping para mejor apariencia
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Configurar los controles de órbita
     */
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        this.controls.enableDamping = this.config.controls.enableDamping;
        this.controls.dampingFactor = this.config.controls.dampingFactor;
        this.controls.minDistance = this.config.controls.minDistance;
        this.controls.maxDistance = this.config.controls.maxDistance;
        this.controls.maxPolarAngle = this.config.controls.maxPolarAngle;
        
        // Punto de mira en el centro de la habitación
        this.controls.target.set(0, 0, 0);
    }
    
    /**
     * Configurar la iluminación
     */
    createLights() {
        // Luz ambiente suave
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direccional principal (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        
        // Configurar sombras
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        
        this.scene.add(directionalLight);
        
        // Luces puntuales adicionales para mejor iluminación interior
        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 30);
        pointLight1.position.set(-5, 8, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 30);
        pointLight2.position.set(5, 8, -5);
        this.scene.add(pointLight2);
    }
    
    /**
     * Crear el entorno básico (piso, paredes)
     */
    createEnvironment() {
        // Piso
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.name = 'floor';
        
        this.scene.add(floor);
        
        // Grid helper para referencia
        const gridHelper = new THREE.GridHelper(20, 20, 0xccccccc, 0xeeeeee);
        gridHelper.name = 'grid';
        this.scene.add(gridHelper);
        
        // Paredes básicas (opcionales)
        this.createBasicRoom();
    }
    
    /**
     * Crear habitación básica con paredes
     */
    createBasicRoom() {
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf8f8f8,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        // Pared trasera
        const backWallGeometry = new THREE.PlaneGeometry(20, 8);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, 4, -10);
        backWall.name = 'backWall';
        this.scene.add(backWall);
        
        // Pared izquierda
        const leftWallGeometry = new THREE.PlaneGeometry(20, 8);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.set(-10, 4, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.name = 'leftWall';
        this.scene.add(leftWall);
        
        // Pared derecha
        const rightWallGeometry = new THREE.PlaneGeometry(20, 8);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.set(10, 4, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.name = 'rightWall';
        this.scene.add(rightWall);
    }
    
    /**
     * Configurar loaders para modelos 3D
     */
    setupLoaders() {
        // Loading manager
        this.loadingManager = new THREE.LoadingManager();
        
        this.loadingManager.onLoad = () => {
            console.log('✅ Todos los recursos cargados');
        };
        
        this.loadingManager.onProgress = (url, loaded, total) => {
            const progress = (loaded / total) * 100;
            console.log(`📥 Cargando: ${Math.round(progress)}% (${url})`);
            
            // Actualizar barra de progreso
            if (window.updateLoadingProgress) {
                window.updateLoadingProgress(progress);
            }
        };
        
        this.loadingManager.onError = (url) => {
            console.error('❌ Error cargando:', url);
        };
        
        // GLTF Loader para modelos 3D
        this.gltfLoader = new THREE.GLTFLoader(this.loadingManager);
        
        // Draco Loader para compresión
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Texture Loader
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    }
    
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Touch events (móvil)
        this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.renderer.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }
    
    /**
     * Bucle de renderizado principal
     */
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Actualizar controles
            if (this.controls) {
                this.controls.update();
            }\n            \n            // Renderizar escena\n            this.renderer.render(this.scene, this.camera);\n            \n            // Actualizar FPS counter\n            this.updateFPSCounter();\n        };\n        \n        animate();\n    }\n    \n    /**\n     * Manejar redimensionamiento de ventana\n     */\n    onWindowResize() {\n        const width = this.container.clientWidth;\n        const height = this.container.clientHeight;\n        \n        this.camera.aspect = width / height;\n        this.camera.updateProjectionMatrix();\n        \n        this.renderer.setSize(width, height);\n    }\n    \n    /**\n     * Manejar clicks del mouse\n     */\n    onMouseClick(event) {\n        this.updateMousePosition(event);\n        \n        // Raycast para detectar objetos\n        this.raycaster.setFromCamera(this.mouse, this.camera);\n        const intersects = this.raycaster.intersectObjects(this.scene.children, true);\n        \n        if (intersects.length > 0) {\n            const object = this.getSelectableObject(intersects[0].object);\n            \n            if (object && object.userData.selectable) {\n                this.selectObject(object);\n            } else {\n                this.deselectObject();\n            }\n        } else {\n            this.deselectObject();\n        }\n    }\n    \n    /**\n     * Actualizar posición del mouse\n     */\n    updateMousePosition(event) {\n        const rect = this.renderer.domElement.getBoundingClientRect();\n        \n        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;\n        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;\n    }\n    \n    /**\n     * Obtener objeto seleccionable desde un mesh hijo\n     */\n    getSelectableObject(object) {\n        let current = object;\n        \n        while (current) {\n            if (current.userData.selectable) {\n                return current;\n            }\n            current = current.parent;\n        }\n        \n        return null;\n    }\n    \n    /**\n     * Seleccionar un objeto\n     */\n    selectObject(object) {\n        // Deseleccionar objeto anterior\n        this.deselectObject();\n        \n        this.selectedObject = object;\n        \n        // Efecto visual de selección\n        this.addSelectionOutline(object);\n        \n        // Callback\n        if (this.onObjectSelected) {\n            this.onObjectSelected(object);\n        }\n        \n        console.log('🎯 Objeto seleccionado:', object.name);\n    }\n    \n    /**\n     * Deseleccionar objeto actual\n     */\n    deselectObject() {\n        if (this.selectedObject) {\n            this.removeSelectionOutline(this.selectedObject);\n            this.selectedObject = null;\n            \n            // Callback\n            if (this.onObjectSelected) {\n                this.onObjectSelected(null);\n            }\n        }\n    }\n    \n    /**\n     * Agregar outline de selección\n     */\n    addSelectionOutline(object) {\n        // Crear outline usando un material emisivo\n        object.traverse((child) => {\n            if (child.isMesh) {\n                child.userData.originalMaterial = child.material;\n                \n                const outlineMaterial = child.material.clone();\n                outlineMaterial.emissive = new THREE.Color(0x3498db);\n                outlineMaterial.emissiveIntensity = 0.3;\n                \n                child.material = outlineMaterial;\n            }\n        });\n    }\n    \n    /**\n     * Remover outline de selección\n     */\n    removeSelectionOutline(object) {\n        object.traverse((child) => {\n            if (child.isMesh && child.userData.originalMaterial) {\n                child.material = child.userData.originalMaterial;\n                delete child.userData.originalMaterial;\n            }\n        });\n    }\n    \n    /**\n     * Cargar modelo 3D desde URL\n     */\n    async loadModel(url, options = {}) {\n        return new Promise((resolve, reject) => {\n            console.log('📥 Cargando modelo:', url);\n            \n            this.gltfLoader.load(\n                url,\n                (gltf) => {\n                    const model = gltf.scene;\n                    \n                    // Aplicar configuraciones\n                    this.configureModel(model, options);\n                    \n                    console.log('✅ Modelo cargado:', url);\n                    resolve(model);\n                },\n                (progress) => {\n                    const percentage = (progress.loaded / progress.total) * 100;\n                    console.log(`📊 Progreso: ${Math.round(percentage)}%`);\n                },\n                (error) => {\n                    console.error('❌ Error cargando modelo:', error);\n                    reject(error);\n                }\n            );\n        });\n    }\n    \n    /**\n     * Configurar modelo recién cargado\n     */\n    configureModel(model, options) {\n        // Configurar sombras\n        model.traverse((child) => {\n            if (child.isMesh) {\n                child.castShadow = true;\n                child.receiveShadow = true;\n                \n                // Mejorar materiales\n                if (child.material) {\n                    child.material.needsUpdate = true;\n                }\n            }\n        });\n        \n        // Aplicar configuraciones personalizadas\n        if (options.scale) {\n            model.scale.setScalar(options.scale);\n        }\n        \n        if (options.position) {\n            model.position.copy(options.position);\n        }\n        \n        if (options.rotation) {\n            model.rotation.copy(options.rotation);\n        }\n        \n        // Marcar como seleccionable\n        model.userData.selectable = options.selectable !== false;\n        model.userData.category = options.category || 'furniture';\n        model.userData.price = options.price || 0;\n        model.userData.id = options.id || Date.now().toString();\n    }\n    \n    /**\n     * Agregar mueble a la escena\n     */\n    async addFurniture(furnitureData) {\n        try {\n            const model = await this.loadModel(furnitureData.modelUrl, {\n                scale: furnitureData.scale || 1,\n                position: furnitureData.position || new THREE.Vector3(0, 0, 0),\n                category: furnitureData.category,\n                price: furnitureData.price,\n                id: furnitureData.id\n            });\n            \n            model.name = furnitureData.name;\n            \n            // Agregar a la escena\n            this.scene.add(model);\n            \n            // Guardar referencia\n            this.objectsInScene.set(furnitureData.id, model);\n            \n            // Callback\n            if (this.onSceneUpdated) {\n                this.onSceneUpdated();\n            }\n            \n            console.log('🛋️ Mueble agregado:', furnitureData.name);\n            return model;\n            \n        } catch (error) {\n            console.error('❌ Error agregando mueble:', error);\n            throw error;\n        }\n    }\n    \n    /**\n     * Remover objeto de la escena\n     */\n    removeObject(objectId) {\n        const object = this.objectsInScene.get(objectId);\n        \n        if (object) {\n            // Deseleccionar si está seleccionado\n            if (this.selectedObject === object) {\n                this.deselectObject();\n            }\n            \n            // Remover de la escena\n            this.scene.remove(object);\n            \n            // Limpiar memoria\n            this.disposeObject(object);\n            \n            // Remover referencia\n            this.objectsInScene.delete(objectId);\n            \n            // Callback\n            if (this.onSceneUpdated) {\n                this.onSceneUpdated();\n            }\n            \n            console.log('🗑️ Objeto removido:', objectId);\n        }\n    }\n    \n    /**\n     * Limpiar memoria de un objeto\n     */\n    disposeObject(object) {\n        object.traverse((child) => {\n            if (child.geometry) {\n                child.geometry.dispose();\n            }\n            \n            if (child.material) {\n                if (Array.isArray(child.material)) {\n                    child.material.forEach(material => {\n                        this.disposeMaterial(material);\n                    });\n                } else {\n                    this.disposeMaterial(child.material);\n                }\n            }\n        });\n    }\n    \n    /**\n     * Limpiar memoria de un material\n     */\n    disposeMaterial(material) {\n        const textures = ['map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap'];\n        \n        textures.forEach(textureType => {\n            if (material[textureType]) {\n                material[textureType].dispose();\n            }\n        });\n        \n        material.dispose();\n    }\n    \n    /**\n     * Cambiar color de un objeto\n     */\n    changeObjectColor(objectId, color) {\n        const object = this.objectsInScene.get(objectId);\n        \n        if (object) {\n            object.traverse((child) => {\n                if (child.isMesh && child.material) {\n                    if (Array.isArray(child.material)) {\n                        child.material.forEach(material => {\n                            material.color.setHex(color);\n                        });\n                    } else {\n                        child.material.color.setHex(color);\n                    }\n                }\n            });\n            \n            console.log('🎨 Color cambiado:', objectId, color);\n        }\n    }\n    \n    /**\n     * Obtener estadísticas de la escena\n     */\n    getSceneStats() {\n        let vertices = 0;\n        let faces = 0;\n        \n        this.scene.traverse((object) => {\n            if (object.geometry) {\n                if (object.geometry.attributes.position) {\n                    vertices += object.geometry.attributes.position.count;\n                }\n                \n                if (object.geometry.index) {\n                    faces += object.geometry.index.count / 3;\n                } else if (object.geometry.attributes.position) {\n                    faces += object.geometry.attributes.position.count / 3;\n                }\n            }\n        });\n        \n        return {\n            objects: this.objectsInScene.size,\n            vertices: Math.round(vertices),\n            faces: Math.round(faces),\n            memory: this.renderer.info.memory,\n            render: this.renderer.info.render\n        };\n    }\n    \n    /**\n     * Actualizar contador de FPS\n     */\n    updateFPSCounter() {\n        // Implementación básica de FPS counter\n        // En un entorno real, usarías Stats.js\n        const fpsElement = document.getElementById('fpsCounter');\n        if (fpsElement) {\n            // Por simplicidad, mostrar 60 FPS como ejemplo\n            fpsElement.textContent = '60';\n        }\n    }\n    \n    /**\n     * Capturar screenshot de la escena\n     */\n    captureScreenshot() {\n        return this.renderer.domElement.toDataURL('image/png');\n    }\n    \n    /**\n     * Limpiar toda la escena\n     */\n    clearScene() {\n        // Remover todos los muebles\n        const objectIds = Array.from(this.objectsInScene.keys());\n        objectIds.forEach(id => this.removeObject(id));\n        \n        console.log('🧹 Escena limpiada');\n    }\n    \n    /**\n     * Destruir el motor 3D\n     */\n    destroy() {\n        // Limpiar escena\n        this.clearScene();\n        \n        // Remover event listeners\n        window.removeEventListener('resize', this.onWindowResize);\n        \n        // Limpiar renderer\n        if (this.renderer) {\n            this.renderer.dispose();\n            this.container.removeChild(this.renderer.domElement);\n        }\n        \n        // Limpiar controles\n        if (this.controls) {\n            this.controls.dispose();\n        }\n        \n        console.log('🔥 Motor 3D destruido');\n    }\n    \n    // Eventos de mouse adicionales (para implementar drag & drop)\n    onMouseMove(event) {\n        this.updateMousePosition(event);\n        \n        if (this.isDragging && this.selectedObject) {\n            // Implementar lógica de arrastre\n            this.updateObjectPosition(event);\n        }\n    }\n    \n    onMouseDown(event) {\n        this.isDragging = true;\n    }\n    \n    onMouseUp(event) {\n        this.isDragging = false;\n    }\n    \n    onTouchStart(event) {\n        if (event.touches.length === 1) {\n            event.preventDefault();\n            event.clientX = event.touches[0].clientX;\n            event.clientY = event.touches[0].clientY;\n            this.onMouseDown(event);\n        }\n    }\n    \n    onTouchEnd(event) {\n        event.preventDefault();\n        this.onMouseUp(event);\n    }\n    \n    /**\n     * Actualizar posición de objeto durante arrastre\n     */\n    updateObjectPosition(event) {\n        if (!this.selectedObject) return;\n        \n        // Calcular nueva posición basada en el mouse\n        this.raycaster.setFromCamera(this.mouse, this.camera);\n        \n        // Intersección con el piso\n        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);\n        const intersection = new THREE.Vector3();\n        \n        if (this.raycaster.ray.intersectPlane(floorPlane, intersection)) {\n            this.selectedObject.position.x = intersection.x;\n            this.selectedObject.position.z = intersection.z;\n            \n            // Callback\n            if (this.onObjectMoved) {\n                this.onObjectMoved(this.selectedObject);\n            }\n        }\n    }\n}\n\n// Exportar para uso global\nwindow.Engine3D = Engine3D;