class Drone {
    constructor() {
        this.group = new THREE.Group();
        this.position = this.group.position;
        this.speed = 0;
        this.maxSpeed = 2;
        this.verticalSpeed = 0;
        this.isLandingGearDeployed = false;
        this.isPropellersExtended = false;
        this.isDoorOpen = false;

        this.propellerBlades = [];
        this.createDrone();
    }

    createDrone() {
        this.createBody();
        this.createPropellerGroups(); // Updated to handle multiple propellers
        this.createLandingGear();
        this.createDoor();

        this.group.position.y = 5; // Initial position
    }

    createPropellerGroups() {
        this.propellerGroups = [];
    
        for (let i = 0; i < 4; i++) {
            const propellerGroup = this.createSinglePropellerGroup();
    
            // Positioning propeller groups: 2 on each side
            const xOffset = i < 2 ? -4 : 4; // Left or right side
            const zOffset = i % 2 === 0 ? -3 : 3; // Front or back
    
            // Apply scaling for the left-side propellers
            if (xOffset < 0) {
                propellerGroup.scale.set(-1, 1, 1); // Mirror along x-axis
            }
    
            propellerGroup.position.set(xOffset, 0, zOffset);
            this.propellerGroups.push(propellerGroup);
            this.group.add(propellerGroup);
        }
    }
    

    createSinglePropellerGroup() {
        const propellerGroup = new THREE.Group();

        // Propeller hinge
        const hingeGeometry = new THREE.CylinderGeometry(1, 1, 4, 32);
        const hingeMaterial = new THREE.MeshPhongMaterial({ color: 0x93FF33 });
        const hinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
        hinge.rotation.x = Math.PI / 2;
        propellerGroup.add(hinge);

        // Propeller arm
        const armGeometry = new THREE.CylinderGeometry(0.8, 0.5, 6, 32);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6E33 });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.rotation.z = Math.PI / 2;
        arm.position.x = 2.5;
        propellerGroup.add(arm);

        // Torus segments
        this.createTorusSegments(propellerGroup);

        // Propeller center
        const centerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 32);
        const centerMaterial = new THREE.MeshPhongMaterial({ color: 0xE8BB01 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.x = 7.5;
        propellerGroup.add(center);

        // Propeller blades
        this.createPropellerBlades(propellerGroup);

        return propellerGroup;
    }

    createTorusSegments(propellerGroup) {
        const torusSegmentsGroup = new THREE.Group();

        for (let i = 0; i < 4; i++) {
            const torusGroup = new THREE.Group();
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 2),
                new THREE.Vector3(1.104568, 0, 2),
                new THREE.Vector3(2, 0, 1.104568),
                new THREE.Vector3(2, 0, 0)
            );
            const tubeGeometry = new THREE.TubeGeometry(curve, 16, 0.4, 32, false);
            const tubeMaterial = new THREE.MeshPhongMaterial({ color: 0xE8BB01 });
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);

            torusGroup.add(tube);
            torusGroup.rotation.y = (Math.PI / 2) * i;
            torusGroup.position.x = 7.5;
            torusSegmentsGroup.add(torusGroup);
        }

        propellerGroup.add(torusSegmentsGroup);
    }

    createPropellerBlades(propellerGroup) {
        const bladeGeometry = new THREE.BoxGeometry(3, 0.1, 0.2);
        const bladeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(7.5, 0, 0);
            blade.rotation.y = i*Math.PI / 4;
            this.propellerBlades.push(blade);
            propellerGroup.add(blade);
        }
    }

    createBody() {
        const bodyGeometry = new THREE.BoxGeometry(8, 2, 8); // Resized body
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.group.add(this.body);
    }

    createLandingGear() {
        this.landingGear = new THREE.Group();
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4); // Adjusted leg length
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

        for (let i = 0; i < 6; i++) { // Increased number of legs
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(i < 3 ? -2 : 2, -1, i % 3 === 0 ? -3 : (i % 3 === 1 ? 0 : 3));
            this.landingGear.add(leg);
        }

        this.group.add(this.landingGear);
    }

    createDoor() {
        const doorGeometry = new THREE.BoxGeometry(0.1, 1.5, 2); // Adjusted door size
        const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        this.door = new THREE.Mesh(doorGeometry, doorMaterial);
        this.door.position.set(3.5, 0, 0);
        this.group.add(this.door);
    }

    abs(value) {
        return Math.abs(value);
    }

    update() {
        // Rotate propeller blades if the drone is moving
        if (this.abs(this.speed) > 0 || this.verticalSpeed !== 0) {
            this.propellerBlades.forEach(blade => {
                blade.rotation.y += 0.2;
            });
        }
    
        // Tilt propellers based on speed
        const tiltAngle = -(this.speed / this.maxSpeed) * Math.PI / 6;
        
        // Apply the same tilt to all propellers
        this.propellerBlades.forEach(blade => {
            blade.rotation.x = tiltAngle;
        });
    
        // Update position
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        this.group.position.addScaledVector(direction, this.speed);
        this.group.position.y += this.verticalSpeed;
    }
    

    toggleLandingGear() {
        this.isLandingGearDeployed = !this.isLandingGearDeployed;
        this.landingGear.position.y = this.isLandingGearDeployed ? -1 : 0;
    }

    togglePropellers() {
        this.isPropellersExtended = !this.isPropellersExtended;
        this.propellerGroups.forEach((propellerGroup, index) => {
            if (propellerGroup.position.x < 0) {
                propellerGroup.rotation.z = this.isPropellersExtended ? -Math.PI/2 : 0;

            } else {
            propellerGroup.rotation.z = this.isPropellersExtended ? Math.PI/2 : 0;
            }
        })
    }

    toggleDoor() {
        this.isDoorOpen = !this.isDoorOpen;
        this.door.rotation.y = this.isDoorOpen ? Math.PI / 2 : 0;
    }
}
