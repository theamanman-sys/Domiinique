/**
 * DOMIINIQUE 3D Engine — Theme-Aware
 * Three.js particles that respond to dark/light mode
 */

class DOMIINIQUEEngine {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        if (!this.container) return;

        // Theme colours
        this.DARK_PARTICLE  = 0xc9a84c;
        this.LIGHT_PARTICLE = 0x800020;

        this.scene    = new THREE.Scene();
        this.camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });

        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();

        this.init();
        this.animate();
        this.addEventListeners();
    }

    currentParticleColor() {
        return document.documentElement.getAttribute('data-theme') === 'light'
            ? this.LIGHT_PARTICLE
            : this.DARK_PARTICLE;
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // fully transparent

        this.createParticles();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xc9a84c, 2);
        pointLight.position.set(2, 3, 4);
        this.scene.add(pointLight);

        this.camera.position.z = 5;
        this.setupScrollAnimations();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
            sizes[i] = Math.random() * 0.02 + 0.005;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.particleMaterial = new THREE.PointsMaterial({
            size: 0.018,
            color: this.currentParticleColor(),
            transparent: true,
            opacity: 0.65,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, this.particleMaterial);
        this.scene.add(this.particles);
    }

    applyTheme(mode) {
        if (!this.particleMaterial) return;
        const targetColor = mode === 'light' ? this.LIGHT_PARTICLE : this.DARK_PARTICLE;
        this.particleMaterial.color.setHex(targetColor);
        this.particleMaterial.opacity = mode === 'light' ? 0.5 : 0.65;
    }

    setupScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        gsap.to(this.camera.position, {
            z: 2,
            y: -1,
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: '30% top',
                scrub: 1
            }
        });

        gsap.to(this.particles.rotation, {
            y: Math.PI * 2,
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2
            }
        });
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Listen for theme changes from main.js
        window.addEventListener('themechange', (e) => {
            this.applyTheme(e.detail.mode);
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(e) {
        this.targetMouse.x =  (e.clientX / window.innerWidth ) * 2 - 1;
        this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.08;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.08;

        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.04;
        this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.04;
        this.camera.lookAt(0, 0, 0);

        this.particles.rotation.y += 0.0008;
        this.particles.rotation.x += this.mouse.y * 0.001;

        this.renderer.render(this.scene, this.camera);
    }
}

// 3D text depth float effect
document.addEventListener('mousemove', (e) => {
    const depthEls = document.querySelectorAll('.hero__logo-text, .t-h1');
    if (!depthEls.length) return;
    const x = (window.innerWidth  / 2 - e.clientX) / 28;
    const y = (window.innerHeight / 2 - e.clientY) / 28;
    depthEls.forEach(el => {
        el.style.transform   = `rotateY(${-x}deg) rotateX(${y}deg) translateZ(40px)`;
        el.style.textShadow  = `${x * 0.5}px ${y * 0.5}px 16px rgba(0,0,0,0.3)`;
    });
});

window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        new DOMIINIQUEEngine();
    }
});
