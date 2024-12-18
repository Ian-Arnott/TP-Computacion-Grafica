// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// Add fog
scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 50, 50);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 0);
scene.add(directionalLight);

// Create terrain manager
const terrainManager = new TerrainManager(scene);

// Create building
const building = new Building(scene);

// Create drone
const drone = new Drone();
scene.add(drone.group);

// Create camera controller
const cameraController = new CameraController(camera, drone);

// Controls setup (same as before)
const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    q: false,
    e: false
};

// Key event listeners (same as before)
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }

    switch(e.key) {
        case '1':
            cameraController.setMode('orbital');
            break;
        case '2':
            cameraController.setMode('rear');
            break;
        case '3':
            cameraController.setMode('side');
            break;
        case '4':
            cameraController.setMode('top');
            break;
        case 't':
            drone.toggleLandingGear();
            break;
        case 'h':
            drone.togglePropellers();
            break;
        case 'p':
            drone.toggleDoor();
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateDroneMovement() {
    if (keys.w) drone.speed = Math.min(drone.speed + 0.1, drone.maxSpeed);
    else if (keys.s) drone.speed = Math.max(drone.speed - 0.1, -drone.maxSpeed);
    else drone.speed *= 0.95;

    if (keys.a) drone.group.rotation.y += 0.03;
    if (keys.d) drone.group.rotation.y -= 0.03;

    if (keys.q) drone.verticalSpeed = 0.2;
    else if (keys.e) drone.verticalSpeed = -0.2;
    else drone.verticalSpeed = 0; // TODO: change to *= 0.5

    drone.update();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    updateDroneMovement();

    terrainManager.update(drone.group.position);

    cameraController.update();

    const time = Date.now();
    building.update(time);

    renderer.render(scene, camera);
}

animate();