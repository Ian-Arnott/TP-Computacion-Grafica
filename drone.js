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

        const hinge = new THREE.CylinderGeometry(1,1,4,32);
        const hingeMaterial = new THREE.MeshPhongMaterial({ color: 0x93FF33 });
        const propellerHinge = new THREE.Mesh(hinge, hingeMaterial);
        propellerHinge.rotation.x = 0.5*Math.PI;
        this.propellerGroup.add(propellerHinge);

        const arm = new THREE.CylinderGeometry(0.8,0.5,6,32);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6E33 });
        const propellerArm = new THREE.Mesh(arm, armMaterial);
        propellerArm.rotation.z = 0.5*Math.PI;
        propellerArm.position.x = 2.5;
        this.propellerGroup.add(propellerArm);

        // Create a group for all torus segments
        const torusSegmentsGroup = new THREE.Group();
        
        // Create 4 torus segments in a circle
        for (let i = 0; i < 4; i++) {
            const torusGroup = new THREE.Group();
            
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 2*1),      // Starting point at the end of arm
                new THREE.Vector3(2*0.552284, 0, 2*1),    // First control point
                new THREE.Vector3(2*1, 0, 2*0.552284),  // Second control point
                new THREE.Vector3(2*1, 0, 0)     // End point
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
            
            // Add torus to its group
            torusGroup.add(tube);
            
            // Rotate and position each torus segment
            torusGroup.rotation.y = (Math.PI / 2) * i;  // Rotate 90 degrees for each segment
            torusGroup.position.x = 7.5;  // Move out from center
            
            // Add the rotated and positioned torus group to the main segments group
            torusSegmentsGroup.add(torusGroup);
        }
        
        // Add all torus segments to the propeller group
        this.propellerGroup.add(torusSegmentsGroup);

        this.group.add(this.propellerGroup);
    
        // Main body (temporary box for now - you'll replace with curved surfaces)
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

        // Propellers
        this.propellers = [];
        const propellerGeometry = new THREE.BoxGeometry(4, 0.1, 0.2);
        const propellerMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 4; i++) {
            const propellerGroup = new THREE.Group();
            const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
            propellerGroup.add(propeller);
            propellerGroup.position.x = (i === 0 ? -2 : 2);
            propellerGroup.position.y = 0.5;
            this.propellers.push(propellerGroup);
            this.group.add(propellerGroup);
        }

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
        // Rotate propellers
        if (this.abs(this.speed) > 0 || this.verticalSpeed !== 0) {
            this.propellers.forEach(prop => {
                prop.rotation.y += 0.5;
            });
        }

        // Tilt propellers based on horizontal speed
        const tiltAngle = -(this.speed / this.maxSpeed) * Math.PI / 6;
        this.propellers.forEach(prop => {
            prop.rotation.x = tiltAngle;
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