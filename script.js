// --- Three.js Background: Wireframe Globe with Orbiting Elements ---
(function() {
    var container = document.getElementById('canvas-container');
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0B0D17, 1);
    container.appendChild(renderer.domElement);

    var globeGeo = new THREE.SphereGeometry(1.8, 32, 32);
    var globeMat = new THREE.MeshBasicMaterial({
        color: 0x4A90D9,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    var globe = new THREE.Mesh(globeGeo, globeMat);
    globe.position.set(2.5, -0.5, -2);
    scene.add(globe);

    var innerGeo = new THREE.SphereGeometry(1.75, 32, 32);
    var innerMat = new THREE.MeshBasicMaterial({
        color: 0xD4A574,
        transparent: true,
        opacity: 0.02
    });
    var innerSphere = new THREE.Mesh(innerGeo, innerMat);
    innerSphere.position.copy(globe.position);
    scene.add(innerSphere);

    var ringGeo = new THREE.RingGeometry(2.4, 2.42, 64);
    var ringMat = new THREE.MeshBasicMaterial({
        color: 0xD4A574,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(globe.position);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    var ring2Geo = new THREE.RingGeometry(2.8, 2.82, 64);
    var ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x5B9A6F,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
    });
    var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.copy(globe.position);
    ring2.rotation.x = Math.PI / 2.5;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    var satGeo = new THREE.SphereGeometry(0.03, 8, 8);
    var satMat = new THREE.MeshBasicMaterial({ color: 0xD4A574 });
    var satellites = [];
    for (var i = 0; i < 5; i++) {
        var sat = new THREE.Mesh(satGeo, satMat.clone());
        sat.position.copy(globe.position);
        scene.add(sat);
        satellites.push({
            mesh: sat,
            radius: 2.4 + Math.random() * 0.5,
            speed: 0.3 + Math.random() * 0.4,
            offset: Math.random() * Math.PI * 2,
            tilt: Math.PI / 3 + (Math.random() - 0.5) * 0.5
        });
    }

    var particlesGeo = new THREE.BufferGeometry();
    var particleCount = 200;
    var positions = new Float32Array(particleCount * 3);
    for (var j = 0; j < particleCount * 3; j++) {
        positions[j] = (Math.random() - 0.5) * 15;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particlesMat = new THREE.PointsMaterial({
        color: 0x4A90D9,
        size: 0.015,
        transparent: true,
        opacity: 0.4
    });
    var particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    var mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
        requestAnimationFrame(animate);
        var time = Date.now() * 0.001;

        globe.rotation.y += 0.001;
        globe.rotation.x += 0.0003;
        innerSphere.rotation.y = globe.rotation.y;

        for (var k = 0; k < satellites.length; k++) {
            var s = satellites[k];
            var angle = time * s.speed + s.offset;
            s.mesh.position.x = globe.position.x + Math.cos(angle) * s.radius;
            s.mesh.position.y = globe.position.y + Math.sin(angle) * s.radius * Math.sin(s.tilt);
            s.mesh.position.z = globe.position.z + Math.sin(angle) * s.radius * Math.cos(s.tilt) * 0.5;
        }

        particles.rotation.y += 0.0002;
        particles.rotation.x += 0.0001;

        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// --- Scroll Reveal ---
var reveals = document.querySelectorAll('.reveal');
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
            setTimeout(function() {
                entry.target.classList.add('visible');
            }, i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

reveals.forEach(function(el) { observer.observe(el); });

// --- Smooth scroll for nav ---
document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});