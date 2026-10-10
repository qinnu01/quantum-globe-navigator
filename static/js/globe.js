import * as THREE from 'three';

export class InteractiveGlobe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.init();
    }

    init() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 3.6;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x06b6d4, 3, 50);
        pointLight.position.set(5, 3, 5);
        this.scene.add(pointLight);

        // --- TRANSPARENT MESH GLOBE STRUCTURE ---
        const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Highly transparent inner core
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: 0x0284c7,
            emissive: 0x0369a1,
            emissiveIntensity: 0.2,
            shininess: 30,
            transparent: true,
            opacity: 0.15
        });
        this.core = new THREE.Mesh(sphereGeometry, coreMaterial);

        // Outer transparent wireframe mesh grid
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        });
        this.globeWire = new THREE.Mesh(sphereGeometry, wireMaterial);
        this.globeWire.scale.set(1.01, 1.01, 1.01);

        this.globeGroup = new THREE.Group();
        this.globeGroup.add(this.core);
        this.globeGroup.add(this.globeWire);
        this.scene.add(this.globeGroup);

        // Location Pin Marker
        const pinGroup = new THREE.Group();
        const headGeo = new THREE.SphereGeometry(0.04, 16, 16);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const pinHead = new THREE.Mesh(headGeo, headMat);
        pinHead.position.y = 0.08;
        
        const stemGeo = new THREE.CylinderGeometry(0.008, 0.002, 0.08, 8);
        const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pinStem = new THREE.Mesh(stemGeo, stemMat);
        pinStem.position.y = 0.04;

        pinGroup.add(pinHead);
        pinGroup.add(pinStem);
        
        this.targetPin = pinGroup;
        this.globeGroup.add(this.targetPin);

        // Cursor Drag Rotation
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            this.globeGroup.rotation.y += deltaX * 0.005;
            this.globeGroup.rotation.x += deltaY * 0.005;

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => { this.isDragging = false; });

        this.setTargetMarker(35.6762, 139.6503);
        this.animate();

        window.addEventListener('resize', () => {
            if (!this.container) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    setTargetMarker(lat, lon) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const radius = 1.02;
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = (radius * Math.cos(phi));
        const z = (radius * Math.sin(phi) * Math.sin(theta));

        this.targetPin.position.set(x, y, z);
        this.targetPin.lookAt(0, 0, 0);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}