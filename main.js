// Scene setup
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x87CEEB);

const textureLoader = new THREE.TextureLoader();
const skyboxTexture = textureLoader.load("https://64.media.tumblr.com/9739a19061cb943a6050208995a2bb40/83668255401eb369-ee/s2048x3072/ce46af4ab722c3e2c602165a4bcd26edd89b852b.jpg", () => {
    skyboxTexture.mapping = THREE.EquirectangularReflectionMapping;
    skyboxTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyboxTexture;
    scene.environment = skyboxTexture;
});


// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 50, 50);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.physicallyCorrectLights = true;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

document.body.appendChild(renderer.domElement);


// Directional Light for stronger shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(50, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

// Ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Create terrain manager
const terrainManager = new TerrainManager(scene);

// Create building
// const building = new Building(scene);

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
    // building.update(time);

    renderer.render(scene, camera);
}

animate();