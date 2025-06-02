// Depends on: constants.js (for scene, camera, renderer, playerShip, asteroids, lasers, explosions, GAME_STATE)
// Depends on: utilities.js (for removeObject)

// Three.js Setup
function setupThreeJs() {
    const container = document.getElementById('game-display');
    if (!container) {
        console.error('Game display container not found!');
        return;
    }

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // Camera (Adjust for phone perspective)
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 60); // Position high and far back, slightly higher
    camera.lookAt(0, 0, 0); // Look at the center of the scene

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Responsive sizing for Three.js
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 5); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // Player Ship
    const playerGeometry = new THREE.ConeGeometry(5, 10, 8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    playerShip = new THREE.Mesh(playerGeometry, playerMaterial);
    playerShip.rotation.x = -Math.PI / 2; // Point cone "forward" (towards -Z)
    playerShip.position.set(0, -15, 0); // Position at the bottom of the screen view, adjusted
    scene.add(playerShip);
}

// Asteroid management
function spawnAsteroid() {
    const geometry = new THREE.SphereGeometry(Math.random() * 5 + 3, 16, 16); // Random size
    const asteroidHealth = Math.floor(Math.random() * 3) + 1; // 1 to 3 hits
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Start white/bright
    const asteroid = new THREE.Mesh(geometry, material);

    const minX = -40, maxX = 40;
    const minY = 10, maxY = 30; // Closer to player, still visible
    const minZ = -100, maxZ = -80; // Far away

    asteroid.position.set(
        Math.random() * (maxX - minX) + minX,
        Math.random() * (maxY - minY) + minY,
        Math.random() * (maxZ - minZ) + minZ
    );
    
    let difficultyFromHarvesting = GAME_STATE.solarHarvesting.active ? ASTEROID_DIFFICULTY_FROM_HARVESTING : 0;
    asteroid.userData = {
        health: asteroidHealth,
        maxHealth: asteroidHealth,
        speed: Math.random() * 5 + 5 + (GAME_STATE.rankIndex * 0.5) + difficultyFromHarvesting, 
        type: 'asteroid'
    };
    asteroids.push(asteroid);
    scene.add(asteroid);
}

function updateAsteroids(deltaTime) {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.position.z += asteroid.userData.speed * deltaTime; // Move towards camera (z-axis)

        // Update color based on health
        const healthRatio = asteroid.userData.health / asteroid.userData.maxHealth;
        const color = new THREE.Color();
        if (healthRatio > 0.5) {
            color.lerpColors(new THREE.Color(0xffffff), new THREE.Color(0x00BCD4), (1 - healthRatio) * 2); 
            asteroid.material.emissive.copy(color).multiplyScalar(0.7); 
        } else {
            color.lerpColors(new THREE.Color(0x9C27B0), new THREE.Color(0xff0000), (0.5 - healthRatio) * 2); 
            asteroid.material.emissive.copy(color).multiplyScalar(0.3); 
        }
        asteroid.material.color.copy(color);
        
        // Check for collision with player (simple Z-axis proximity)
        if (asteroid.position.z > playerShip.position.z + 10) { // Asteroid passed player
            takeDamage(10); // 10% shield damage for unintercepted asteroid
            removeObject(asteroid, asteroids);
            playSound('hit');
        }
    }
}

// Laser management
function fireLaser(damage) {
    if (asteroids.length === 0 || Date.now() < GAME_STATE.weaponsJammedUntil) return; // No target or weapons jammed

    let targetAsteroid = null;
    let minDistance = Infinity;
    for (const asteroid of asteroids) {
        if (asteroid.position.z < playerShip.position.z + 20) { 
            const distance = asteroid.position.distanceTo(playerShip.position);
            if (distance < minDistance) {
                minDistance = distance;
                targetAsteroid = asteroid;
            }
        }
    }
    
    if (!targetAsteroid) return; 

    const laserStartPos = new THREE.Vector3().copy(playerShip.position);
    laserStartPos.y += 5; 

    const direction = new THREE.Vector3().subVectors(targetAsteroid.position, laserStartPos).normalize();

    const laserGeometry = new THREE.SphereGeometry(1.5, 8, 8); 
    const laserMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1.5 });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);

    laser.position.copy(laserStartPos);
    
    laser.userData = {
        target: targetAsteroid,
        speed: 150, 
        damage: damage,
        aoeDamage: (GAME_STATE.upgrades['aoe_laser_1'] ? damage * UPGRADES_DATA['aoe_laser_1'].effect.aoeDamageMultiplier : 0), 
        direction: direction 
    };
    lasers.push(laser);
    scene.add(laser);
    playSound('shoot');
}

function updateLasers(deltaTime) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        
        laser.position.add(laser.userData.direction.clone().multiplyScalar(laser.userData.speed * deltaTime));

        if (!laser.userData.target.parent || laser.position.distanceTo(playerShip.position) > laser.userData.target.position.distanceTo(playerShip.position) + 5) {
            removeObject(laser, lasers);
            continue;
        }

        const distance = laser.position.distanceTo(laser.userData.target.position);
        const collisionThreshold = laser.userData.target.geometry.parameters.radius + laser.geometry.parameters.radius;

        if (distance < collisionThreshold) {
            onLaserImpact(laser.userData.target, laser.userData.damage, laser.userData.aoeDamage);
            removeObject(laser, lasers);
        }
    }
}

function onLaserImpact(asteroid, damage, aoeDamage) {
    if (!asteroid || !asteroid.parent) return;

    asteroid.userData.health -= damage;
    GAME_STATE.totalDamageDealt += damage;

    // Apply AoE damage
    if (aoeDamage > 0) {
        const aoeRadius = 15; 
        const asteroidsHitByAoE = [];
        for (const otherAsteroid of asteroids) {
            if (otherAsteroid !== asteroid && otherAsteroid.position.distanceTo(asteroid.position) < aoeRadius) {
                otherAsteroid.userData.health -= aoeDamage;
                GAME_STATE.totalDamageDealt += aoeDamage;
                asteroidsHitByAoE.push(otherAsteroid);
            }
        }
        for (const hitAsteroid of asteroidsHitByAoE) {
            if (hitAsteroid.userData.health <= 0 && hitAsteroid.parent) { 
                playSound('destroy');
                createExplosion(hitAsteroid.position);
                removeObject(hitAsteroid, asteroids);
            }
        }
    }

    if (asteroid.userData.health <= 0) {
        playSound('destroy');
        createExplosion(asteroid.position);
        removeObject(asteroid, asteroids);
    }
    updateUI(); 
}

// Explosion management
function createExplosion(position) {
    const explosionGeometry = new THREE.SphereGeometry(1, 8, 8);
    const explosionMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 1 });
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(position);
    explosion.userData = {
        life: 0.5, 
        maxLife: 0.5,
        initialScale: explosion.scale.clone()
    };
    explosions.push(explosion);
    scene.add(explosion);
}

function updateExplosions(deltaTime) {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.userData.life -= deltaTime;

        const progress = (explosion.userData.maxLife - explosion.userData.life) / explosion.userData.maxLife;
        const scale = 1 + progress * 5; 
        explosion.scale.set(scale, scale, scale);
        explosion.material.opacity = 1 - progress; 

        if (explosion.userData.life <= 0) {
            removeObject(explosion, explosions);
        }
    }
}
