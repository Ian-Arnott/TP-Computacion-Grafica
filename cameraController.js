class CameraController {
    constructor(camera, drone) {
        this.camera = camera;
        this.drone = drone;
        this.currentMode = 'orbital';
        this.orbitRadius = 30;
        this.orbitAngle = 0;
        this.orbitHeight = 15;
        this.offsets = {
            rear: new THREE.Vector3(0, 5, 15),
            side: new THREE.Vector3(15, 5, 0),
            top: new THREE.Vector3(0, 15, 0)
        };
    }

    update() {
        switch (this.currentMode) {
            case 'orbital':
                this.updateOrbitalCamera();
                break;
            case 'rear':
                this.updateFollowCamera('rear');
                break;
            case 'side':
                this.updateFollowCamera('side');
                break;
            case 'top':
                this.updateFollowCamera('top');
                break;
        }
    }

    updateOrbitalCamera() {
        this.orbitAngle += 0.005;
        const x = Math.sin(this.orbitAngle) * this.orbitRadius;
        const z = Math.cos(this.orbitAngle) * this.orbitRadius;
        this.camera.position.set(x, this.orbitHeight, z);
        this.camera.lookAt(0, 0, 0);  // Look at origin instead of drone
    }

    updateFollowCamera(mode) {
        const offset = this.offsets[mode];
        const dronePosition = this.drone.group.position;
        const droneRotation = this.drone.group.rotation;
        const cameraPosition = new THREE.Vector3();
        cameraPosition.copy(offset).applyAxisAngle(new THREE.Vector3(0, 1, 0), droneRotation.y);
        cameraPosition.add(dronePosition);
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(dronePosition);
    }

    setMode(mode) {
        this.currentMode = mode;
    }
}