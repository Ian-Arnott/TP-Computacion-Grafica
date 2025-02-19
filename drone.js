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

        // Animation properties
        this.animations = {
            landingGear: { current: 0, target: 0 },
            propellers: { current: 0, target: 0 },
            door: { current: 0, target: 0 },
            ladder: { current: 0, target: 0 }
        };

        this.propellerBlades = [];
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {
            color: this.textureLoader.load('https://64.media.tumblr.com/18e897fe5a57da94741f766d1f5f1a76/b808ced3b96f8530-68/s1280x1920/74bd1ee97102ed1822eb01957120662f0cedc916.jpg'),
            normal: this.textureLoader.load('https://64.media.tumblr.com/c6176e5962a14fb2cbbc8b49af93547c/b808ced3b96f8530-c7/s1280x1920/fce44587890e00476841556a9dacdbad4c143e4d.pnj'),
            metalness: this.textureLoader.load('https://64.media.tumblr.com/ddfabafef80b974d83612e1392801a53/b808ced3b96f8530-9d/s1280x1920/89f7df0aad31a3dacb7a2833d980d804a090600d.jpg'),
        };
        this.createDrone();
    }

    createDrone() {
        this.createBody();
        this.createPropellerGroups();
        this.createLandingGear();
        this.createDoor();

        this.group.position.y = 31.3; // Initial position
    }

    createBody() {
        const bodyGroup = new THREE.Group();
    
        // Main central body - outer shell (Deep Navy Blue)
        const bodyGeometry = new THREE.BoxGeometry(5, 5, 10.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x1B3C59,
            metalness: 1.0,
            roughness: 0.4
        });
        const mainBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        mainBody.castShadow = true
        mainBody.position.y = -2;
        bodyGroup.add(mainBody);
    
        // Inner box (Matte Black)
        const innerGeometry = new THREE.BoxGeometry(3.5, 4, 5);
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0x232323,
            metalness: 0.3,
            roughness: 0.8
        });
        const innerBody = new THREE.Mesh(innerGeometry, innerMaterial);
        innerBody.castShadow = true;
        innerBody.position.set(0,-2,2.8);
        bodyGroup.add(innerBody);
    
        // Tapered nose (Matching body color)
        const noseGeometry = new THREE.CylinderGeometry(2, 3.5, 4, 4, 8, false);
        const noseMesh = new THREE.Mesh(noseGeometry, bodyMaterial);
        noseMesh.castShadow = true;
        noseMesh.rotation.y = -Math.PI / 4;
        noseMesh.rotation.x = -Math.PI / 2;
        noseMesh.position.set(0, -2, -7.1);
        bodyGroup.add(noseMesh);
    
        // Cylindrical accents (Silver)
        const accentGeo = new THREE.CylinderGeometry(4, 4, 3, 8);
        const accentMat = new THREE.MeshPhongMaterial({
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0xC0C0C0,
            metalness: 1.0,
            roughness: 0.2
        });
        
        const accent1 = new THREE.Mesh(accentGeo, accentMat);
        const accent2 = new THREE.Mesh(accentGeo, accentMat);
        accent1.castShadow = true;
        accent2.castShadow = true;
        
        accent1.rotation.y = Math.PI / 8;
        accent1.rotation.x = Math.PI / 2;
        accent2.rotation.y = Math.PI / 8;
        accent2.rotation.x = Math.PI / 2;
        
        accent1.position.z = -3;
        accent2.position.z = 3;
        accent1.position.y = -2;
        accent2.position.y = -2;
        
        bodyGroup.add(accent1);
        bodyGroup.add(accent2);
    
        this.body = bodyGroup;
        this.group.add(bodyGroup);
    }

    createPropellerGroups() {
        this.propellerGroups = [];
    
        for (let i = 0; i < 4; i++) {
            const propellerGroup = this.createSinglePropellerGroup();
    
            const xOffset = i < 2 ? -3: 3;
            const zOffset = i % 2 === 0 ? -3 : 3;
    
            if (xOffset < 0) {
                propellerGroup.scale.set(-1, 1, 1);
            }
    
            propellerGroup.position.set(xOffset, 1, zOffset);
            this.propellerGroups.push(propellerGroup);
            this.group.add(propellerGroup);
        }
    }

    createSinglePropellerGroup() {
        const propellerGroup = new THREE.Group();

        // Propeller hinge (Gunmetal)
        const hingeGeometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
        const hingeMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x2C3539,
            metalness: 0.7,
            roughness: 0.3
        });
        const hinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
        hinge.rotation.x = Math.PI / 2;
        propellerGroup.add(hinge);

        // Propeller arm (Dark Silver)
        const armGeometry = new THREE.CylinderGeometry(0.8, 0.5, 6, 32);
        const armMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x808080,
            metalness: 0.6,
            roughness: 0.4
        });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.rotation.z = Math.PI / 2;
        arm.position.x = 2.5;
        propellerGroup.add(arm);

        this.createTorusSegments(propellerGroup);

        // Propeller center (Matching body color)
        const centerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 32);
        const centerMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x1B3C59,
            metalness: 0.6,
            roughness: 0.4
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.x = 7.5;
        propellerGroup.add(center);

        this.createPropellerBlades(propellerGroup);

        return propellerGroup;
    }

    createTorusSegments(propellerGroup) {
        const torusSegmentsGroup = new THREE.Group();

        const material = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x1B3C59,
            metalness: 0.6,
            roughness: 0.4
        });

        for (let i = 0; i < 4; i++) {
            const torusGroup = new THREE.Group();
            const curve = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 2),
                new THREE.Vector3(1.104568, 0, 2),
                new THREE.Vector3(2, 0, 1.104568),
                new THREE.Vector3(2, 0, 0)
            );
            const tubeGeometry = new THREE.TubeGeometry(curve, 16, 0.4, 32, false);
            const tube = new THREE.Mesh(tubeGeometry, material);

            torusGroup.add(tube);
            torusGroup.rotation.y = (Math.PI / 2) * i;
            torusGroup.position.x = 7.5;
            torusSegmentsGroup.add(torusGroup);
        }

        propellerGroup.add(torusSegmentsGroup);
    }

    createPropellerBlades(propellerGroup) {
        const bladeGeometry = new THREE.BoxGeometry(3, 0.1, 0.2);
        const bladeMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x2C3539,
            metalness: 0.7,
            roughness: 0.3
        });

        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(7.5, 0, 0);
            blade.rotation.y = i * Math.PI / 4;
            this.propellerBlades.push(blade);
            propellerGroup.add(blade);
        }
    }

    createLandingGear() {
        this.landingGear = new THREE.Group();
        
        const controlPoints = [
            new THREE.Vector2(0.3, 0),
            new THREE.Vector2(0.25, -1),
            new THREE.Vector2(0.2, -2),
            new THREE.Vector2(0.4, -3)
        ];
        const bezierCurve = new THREE.CubicBezierCurve(
            controlPoints[0],
            controlPoints[1],
            controlPoints[2],
            controlPoints[3]
        );
        
        const points = bezierCurve.getPoints(20);
        const legGeometry = new THREE.LatheGeometry(points, 32);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x808080, 
            metalness: 0.6,
            roughness: 0.4,
            side: THREE.DoubleSide
        });
    
        const legPositions = [
            { x: -2, z: -3 },
            { x: -2, z: 3 },
            { x: 2, z: -3 },
            { x: 2, z: 3 }
        ];
    
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, -1, pos.z);
            leg.geometry.computeVertexNormals();            
            this.landingGear.add(leg);
        });
    
        // Base of leg (Matching body color)
        const footGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
        const footMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x1B3C59,
            metalness: 0.6,
            roughness: 0.4,
            side: THREE.DoubleSide
        });
    
        legPositions.forEach(pos => {
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(pos.x, -4, pos.z);
            this.landingGear.add(foot);
        });    
        this.group.add(this.landingGear);
    }

    createDoor() {
        const doorAssembly = new THREE.Group();
        
        const doorWidth = 3.5;
        const doorHeight = 4;
        const doorThickness = 0.4;
    
        // Door (Matching body color)
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
        const doorMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x1B3C59,
            metalness: 0.6,
            roughness: 0.4
        });
        this.door = new THREE.Mesh(doorGeometry, doorMaterial);
        this.door.geometry.translate(doorWidth/2, doorHeight/2, 0);
        
        // Vertical Hinges (Gunmetal)
        const hingeGeometry = new THREE.CylinderGeometry(doorThickness, doorThickness, 0.3, 16);
        const hingeMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x2C3539,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const topHinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
        topHinge.position.set(0, doorHeight - 0.3, 0);
        
        const bottomHinge = new THREE.Mesh(hingeGeometry, hingeMaterial);
        bottomHinge.position.set(0, 0.3, 0);
        
        // Create ladder
        const ladderGroup = new THREE.Group();
        this.ladder = ladderGroup;
        
        // Ladder side rails
        const railGeometry = new THREE.CylinderGeometry(0.1, 0.1, doorHeight - 0.5, 16);
        const railMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x808080,
            metalness: 0.6,
            roughness: 0.4
        });
        
        const leftRail = new THREE.Mesh(railGeometry, railMaterial);
        leftRail.position.set(0.4, doorHeight/2, 0.2);
        
        const rightRail = new THREE.Mesh(railGeometry, railMaterial);
        rightRail.position.set(2.8, doorHeight/2, 0.2);
        
        ladderGroup.add(leftRail);
        ladderGroup.add(rightRail);
        
        // Ladder rungs
        const rungGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 16);
        const rungMaterial = new THREE.MeshPhongMaterial({ 
            map: this.textures.color,
            normalMap: this.textures.normal,
            metalnessMap: this.textures.metalness,
            color: 0x808080,
            metalness: 0.6,
            roughness: 0.4
        });
        
        // Add 5 rungs
        for (let i = 0; i < 5; i++) {
            const rung = new THREE.Mesh(rungGeometry, rungMaterial);
            rung.rotation.z = Math.PI / 2;
            rung.position.set(1.6, 0.5 + i * (doorHeight - 1) / 4, 0.2);
            ladderGroup.add(rung);
        }
        
        doorAssembly.add(this.door);
        doorAssembly.add(topHinge);
        doorAssembly.add(bottomHinge);
        doorAssembly.add(ladderGroup);
        
        doorAssembly.position.set(-1.75, -4, 5.25);
        ladderGroup.position.set(0, 0, -0.3);
        this.doorAssembly = doorAssembly;
        this.group.add(doorAssembly);
    }

    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    update() {
        // Only spin propellers if they're extended
        if (!this.isPropellersExtended) {
            this.propellerBlades.forEach(blade => {
                blade.rotation.y += 0.2;
            });
        }
    
        // Tilt propellers based on speed
        const tiltAngle = -(this.speed / this.maxSpeed) * Math.PI / 6;
        this.propellerBlades.forEach(blade => {
            blade.rotation.x = tiltAngle;
        });
    
        const animationSpeed = 0.05;

        // Landing gear animation
        this.animations.landingGear.current = this.lerp(
            this.animations.landingGear.current,
            this.animations.landingGear.target,
            animationSpeed
        );
        this.landingGear.position.y = this.lerp(0, -3, this.animations.landingGear.current);

        // Propeller animation
        this.animations.propellers.current = this.lerp(
            this.animations.propellers.current,
            this.animations.propellers.target,
            animationSpeed
        );
        this.propellerGroups.forEach((propellerGroup) => {
            const targetRotation = propellerGroup.position.x < 0 ? -Math.PI/2 : Math.PI/2;
            propellerGroup.rotation.z = this.lerp(0, targetRotation, this.animations.propellers.current);
        });

        // Door and Ladder animation
        this.animations.door.current = this.lerp(
            this.animations.door.current,
            this.animations.door.target,
            animationSpeed
        );
        this.door.rotation.y = this.lerp(0, -Math.PI * 135 / 180, this.animations.door.current);
        const ladderDownDistance = 3.5;
        this.ladder.position.y = this.lerp(0, -ladderDownDistance, this.animations.door.current);
    
        // Update position
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        this.group.position.addScaledVector(direction, this.speed);
        this.group.position.y += this.verticalSpeed;
    }

    abs(value) {
        return Math.abs(value);
    }

    toggleLandingGear() {
        this.isLandingGearDeployed = !this.isLandingGearDeployed;
        this.animations.landingGear.target = this.isLandingGearDeployed ? 1 : 0;
    }

    togglePropellers() {
        this.isPropellersExtended = !this.isPropellersExtended;
        this.animations.propellers.target = this.isPropellersExtended ? 1 : 0;
    }

    toggleDoor() {
        this.isDoorOpen = !this.isDoorOpen;
        this.animations.door.target = this.isDoorOpen ? 1 : 0;
    }
}