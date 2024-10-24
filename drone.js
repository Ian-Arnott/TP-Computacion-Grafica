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

        this.createDrone();
    }

    createDrone() {
        this.propellerGroup = new THREE.Group();

        // Creating the propeller center
        const hinge = new THREE.CylinderGeometry(1,1,4,32);
        const hingeMaterial = new THREE.MeshPhongMaterial({ color: 0x93FF33 });
        const propellerHinge = new THREE.Mesh(hinge, hingeMaterial);
        propellerHinge.rotation.x = 0.5 * Math.PI;
        this.propellerGroup.add(propellerHinge);

        const arm = new THREE.CylinderGeometry(0.8,0.5,6,32);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6E33 });
        const propellerArm = new THREE.Mesh(arm, armMaterial);
        propellerArm.rotation.z = 0.5 * Math.PI;
        propellerArm.position.x = 2.5;
        this.propellerGroup.add(propellerArm);

        // Torus segments (remain unchanged)
        const torusSegmentsGroup = new THREE.Group();
        for (let i = 0; i < 4; i++) {
            const torusGroup = new THREE.Group();
            
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 2*1),
                new THREE.Vector3(2*0.552284, 0, 2*1),
                new THREE.Vector3(2*1, 0, 2*0.552284),
                new THREE.Vector3(2*1, 0, 0)
            );
            const tubeGeometry = new THREE.TubeGeometry(
                curve,
                16,    // tubular segments
                0.4,   // radius
                32,    // radial segments
                false  // closed
            );
            const tubeMaterial = new THREE.MeshPhongMaterial({ color: 0xE8BB01 });
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            
            torusGroup.add(tube);

            torusGroup.rotation.y = (Math.PI / 2) * i;
            torusGroup.position.x = 7.5;
            
            torusSegmentsGroup.add(torusGroup);
        }
        this.propellerGroup.add(torusSegmentsGroup);

        const cylinder = new THREE.CylinderGeometry(0.2,0.2,0.4,32);
        const cylMaterial = new THREE.MeshPhongMaterial({ color: 0xE8BB01 });
        const propellerCenter = new THREE.Mesh(cylinder, cylMaterial);
        propellerCenter.position.x = 7.5;
        this.propellerGroup.add(propellerCenter);

        this.propellerBlades = [];
        const propellerBladeGeometry = new THREE.BoxGeometry(3, 0.1, 0.2);
        const propellerBladeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 4; i++) {
            const propellerBlade = new THREE.Mesh(propellerBladeGeometry, propellerBladeMaterial);
            propellerBlade.position.set(7.5, 0, 0); // Position the blades at the center
            propellerBlade.rotation.x = 0.5*Math.PI;
            this.propellerBlades.push(propellerBlade);
            this.propellerGroup.add(propellerBlade); // Attach blades to the propellerGroup
        }

        this.group.add(this.propellerGroup);
    
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.group.add(this.body);

        // Landing gear
        this.landingGear = new THREE.Group();
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.y = -1;
            leg.position.x = (i < 2 ? -1 : 1);
            leg.position.z = (i % 2 === 0 ? -1 : 1);
            this.landingGear.add(leg);
        }
        this.group.add(this.landingGear);

        // Door and stairs (temporary basic geometry)
        this.door = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1, 1),
            new THREE.MeshPhongMaterial({ color: 0x666666 })
        );
        this.door.position.set(1.5, 0, 0);
        this.group.add(this.door);

        // Initial position
        this.group.position.y = 5;
    }

    abs(speed) {
        return speed > 0 ? speed: -speed;
    }

    update() {
        // Rotate the propeller blades instead of the entire group
        if (this.abs(this.speed) > 0 || this.verticalSpeed !== 0) {
            this.propellerBlades.forEach(blade => {
                blade.rotation.y += 0.5; // Adjusted to rotate the blades
            });
        }

        // Tilt propellers based on horizontal speed
        const tiltAngle = -(this.speed / this.maxSpeed) * Math.PI / 6;
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
        const targetY = this.isLandingGearDeployed ? -1 : 0;
        this.landingGear.position.y = targetY;
    }

    togglePropellers() {
        this.isPropellersExtended = !this.isPropellersExtended;
        // Animation would go here
    }

    toggleDoor() {
        this.isDoorOpen = !this.isDoorOpen;
        this.door.rotation.y = this.isDoorOpen ? Math.PI / 2 : 0;
    }
}
