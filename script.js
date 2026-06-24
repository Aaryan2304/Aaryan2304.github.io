// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    // --- Three.js Background: Enhanced Geospatial Command Center ---
    var container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0B0D17, 1);
    container.appendChild(renderer.domElement);

    // --- Globe group ---
    var globeGroup = new THREE.Group();
    globeGroup.position.set(2.5, -0.5, -2);
    scene.add(globeGroup);

    // --- Main wireframe globe ---
    var globeGeo = new THREE.SphereGeometry(1.8, 32, 32);
    var globeMat = new THREE.MeshBasicMaterial({
        color: 0x4A90D9,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    var globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // --- Latitude / Longitude grid lines ---
    var gridMat = new THREE.LineBasicMaterial({
        color: 0x4A90D9,
        transparent: true,
        opacity: 0.12
    });

    for (var lat = -60; lat <= 60; lat += 30) {
        var latRad = lat * Math.PI / 180;
        var r = 1.81 * Math.cos(latRad);
        var y = 1.81 * Math.sin(latRad);
        var latPoints = [];
        for (var i = 0; i <= 64; i++) {
            var theta = (i / 64) * Math.PI * 2;
            latPoints.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
        }
        var latGeo = new THREE.BufferGeometry().setFromPoints(latPoints);
        var latLine = new THREE.Line(latGeo, gridMat);
        globeGroup.add(latLine);
    }

    for (var lon = 0; lon < 360; lon += 30) {
        var lonRad = lon * Math.PI / 180;
        var lonPoints = [];
        for (var j = 0; j <= 64; j++) {
            var phi = (j / 64) * Math.PI - Math.PI / 2;
            lonPoints.push(new THREE.Vector3(
                1.81 * Math.cos(phi) * Math.cos(lonRad),
                1.81 * Math.sin(phi),
                1.81 * Math.cos(phi) * Math.sin(lonRad)
            ));
        }
        var lonGeo = new THREE.BufferGeometry().setFromPoints(lonPoints);
        var lonLine = new THREE.Line(lonGeo, gridMat);
        globeGroup.add(lonLine);
    }

    // --- Inner sphere ---
    var innerGeo = new THREE.SphereGeometry(1.75, 32, 32);
    var innerMat = new THREE.MeshBasicMaterial({
        color: 0xD4A574,
        transparent: true,
        opacity: 0.025
    });
    var innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // --- Orbital rings ---
    var ringGeo = new THREE.RingGeometry(2.4, 2.42, 64);
    var ringMat = new THREE.MeshBasicMaterial({
        color: 0xD4A574,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    globeGroup.add(ring);

    var ring2Geo = new THREE.RingGeometry(2.8, 2.82, 64);
    var ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x5B9A6F,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
    });
    var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2.5;
    ring2.rotation.y = Math.PI / 6;
    globeGroup.add(ring2);

    // --- Satellites ---
    var satGeo = new THREE.SphereGeometry(0.035, 8, 8);
    var satellites = [];

    for (var i = 0; i < 5; i++) {
        var satColor = i === 0 ? 0xD4A574 : 0x4A90D9;
        var satMat = new THREE.MeshBasicMaterial({ color: satColor });
        var sat = new THREE.Mesh(satGeo, satMat);
        globeGroup.add(sat);

        satellites.push({
            mesh: sat,
            radius: 2.4 + (i % 2) * 0.4,
            speed: 0.25 + i * 0.08,
            offset: (i / 5) * Math.PI * 2,
            tilt: Math.PI / 3 + (i - 2) * 0.15
        });
    }

    // --- Hotspot markers ---
    var hotspots = [];
    var hotspotPositions = [
        { lat: 20, lon: 75 },
        { lat: 35, lon: -100 },
        { lat: -15, lon: -55 },
        { lat: 50, lon: 30 },
        { lat: 10, lon: 110 }
    ];

    hotspotPositions.forEach(function(pos, idx) {
        var latRad = pos.lat * Math.PI / 180;
        var lonRad = pos.lon * Math.PI / 180;
        var x = 1.82 * Math.cos(latRad) * Math.cos(lonRad);
        var y = 1.82 * Math.sin(latRad);
        var z = 1.82 * Math.cos(latRad) * Math.sin(lonRad);

        var dotGeo = new THREE.SphereGeometry(0.025, 8, 8);
        var dotMat = new THREE.MeshBasicMaterial({
            color: idx === 0 ? 0xD4A574 : 0x5B9A6F,
            transparent: true,
            opacity: 0.9
        });
        var dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(x, y, z);
        globeGroup.add(dot);

        var pulseGeo = new THREE.RingGeometry(0.04, 0.05, 16);
        var pulseMat = new THREE.MeshBasicMaterial({
            color: idx === 0 ? 0xD4A574 : 0x5B9A6F,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        var pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.position.set(x, y, z);
        pulse.lookAt(new THREE.Vector3(0, 0, 0));
        globeGroup.add(pulse);

        hotspots.push({
            dot: dot,
            pulse: pulse,
            pulseMat: pulseMat
        });
    });

    // --- Particles ---
    var particlesGeo = new THREE.BufferGeometry();
    var particleCount = 250;
    var positions = new Float32Array(particleCount * 3);

    for (var p = 0; p < particleCount; p++) {
        positions[p * 3] = (Math.random() - 0.5) * 15;
        positions[p * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[p * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particlesMat = new THREE.PointsMaterial({
        color: 0x4A90D9,
        size: 0.018,
        transparent: true,
        opacity: 0.5
    });
    var particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // --- Mouse interaction ---
    var mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- Animation ---
    function animate() {
        requestAnimationFrame(animate);
        var time = Date.now() * 0.001;

        globeGroup.rotation.y += 0.0008;
        globeGroup.rotation.x = Math.sin(time * 0.1) * 0.05;

        for (var k = 0; k < satellites.length; k++) {
            var s = satellites[k];
            var angle = time * s.speed + s.offset;
            var sx = Math.cos(angle) * s.radius;
            var sy = Math.sin(angle) * s.radius * Math.sin(s.tilt);
            var sz = Math.sin(angle) * s.radius * Math.cos(s.tilt) * 0.5;
            s.mesh.position.set(sx, sy, sz);
        }

        for (var h = 0; h < hotspots.length; h++) {
            var hs = hotspots[h];
            var pulseScale = 1 + Math.sin(time * 2 + h) * 0.5;
            hs.pulse.scale.set(pulseScale, pulseScale, pulseScale);
            hs.pulseMat.opacity = 0.6 - (pulseScale - 1) * 0.4;
        }

        particles.rotation.y += 0.00015;
        particles.rotation.x += 0.00008;

        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

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

    // --- Smooth scroll ---
    document.querySelectorAll('.nav-links a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
