/**
 * canvas.js — Three.js ambient holographic canvas
 * DOMIINIQUE: Conscious Holographic Reality
 */

(function () {
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('global-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 30;

    // --- Floating Particle Constellation ---
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
        sizes[i] = Math.random() * 2.5 + 0.5;
        opacities[i] = Math.random() * 0.6 + 0.1;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0xC9A84C,
        size: 0.18,
        transparent: true,
        opacity: 0.25,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Second layer: white/silver micro-particles ---
    const miniCount = 180;
    const miniPos = new Float32Array(miniCount * 3);
    for (let i = 0; i < miniCount; i++) {
        miniPos[i * 3] = (Math.random() - 0.5) * 100;
        miniPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        miniPos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 15;
    }
    const miniGeo = new THREE.BufferGeometry();
    miniGeo.setAttribute('position', new THREE.BufferAttribute(miniPos, 3));
    const miniMat = new THREE.PointsMaterial({
        color: 0xF5F0E8,
        size: 0.08,
        transparent: true,
        opacity: 0.12,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const miniParticles = new THREE.Points(miniGeo, miniMat);
    scene.add(miniParticles);

    // --- Floating Geometric Shapes ---
    function addFloater(geometry, x, y, z, colorHex, opacity, wireframe) {
        const mat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: opacity,
            wireframe: wireframe,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.position.set(x, y, z);
        mesh.userData.rotSpeed = {
            x: (Math.random() - 0.5) * 0.003,
            y: (Math.random() - 0.5) * 0.004,
            z: (Math.random() - 0.5) * 0.002,
        };
        mesh.userData.floatSpeed = Math.random() * 0.3 + 0.15;
        mesh.userData.floatOffset = Math.random() * Math.PI * 2;
        mesh.userData.baseY = y;
        scene.add(mesh);
        return mesh;
    }

    const floaters = [
        addFloater(new THREE.IcosahedronGeometry(3.5, 1), -20, 8, -5, 0xC9A84C, 0.06, true),
        addFloater(new THREE.OctahedronGeometry(2.2, 0), 18, -6, -8, 0xC9A84C, 0.07, true),
        addFloater(new THREE.TetrahedronGeometry(2.8, 0), -14, -10, -12, 0xE8C96A, 0.05, true),
        addFloater(new THREE.IcosahedronGeometry(1.8, 0), 24, 12, -14, 0xF5F0E8, 0.04, true),
        addFloater(new THREE.OctahedronGeometry(1.4, 0), 8, -15, -10, 0xC9A84C, 0.06, true),
        addFloater(new THREE.TorusGeometry(4, 0.3, 8, 24), -8, 14, -20, 0xC9A84C, 0.04, true),
        addFloater(new THREE.TorusGeometry(2.5, 0.2, 6, 16), 28, -3, -18, 0x9E7F3C, 0.05, true),
    ];

    // --- Scroll offset tracking ---
    let scrollY = 0;
    let targetScrollY = 0;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });

    // --- Mouse parallax ---
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- Resize handler ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Animation loop ---
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.008;

        // Smooth scroll interpolation
        scrollY += (targetScrollY - scrollY) * 0.05;

        // Smooth mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.03;
        mouseY += (targetMouseY - mouseY) * 0.03;

        // Camera drift from scroll + mouse
        camera.position.y = -scrollY * 0.004;
        camera.position.x = mouseX * 1.2;
        camera.rotation.y = mouseX * 0.012;
        camera.rotation.x = -mouseY * 0.008;

        // Rotate star fields
        particles.rotation.y = time * 0.025;
        particles.rotation.x = time * 0.008;
        miniParticles.rotation.y = -time * 0.015;
        miniParticles.rotation.x = time * 0.005;

        // Animate floaters
        floaters.forEach((f) => {
            const ud = f.userData;
            f.rotation.x += ud.rotSpeed.x;
            f.rotation.y += ud.rotSpeed.y;
            f.rotation.z += ud.rotSpeed.z;
            f.position.y = ud.baseY + Math.sin(time * ud.floatSpeed + ud.floatOffset) * 1.2;
        });

        renderer.render(scene, camera);
    }

    animate();
})();
