class Building {
    constructor(scene, position = { x: 0, y: 8, z: 0 }) {
        this.group = new THREE.Group();
        
        // Main building body
        const buildingGeometry = new THREE.BoxGeometry(20, 40, 20);
        const buildingMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            flatShading: true
        });
        this.buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        this.buildingMesh.position.y = -5
        // Landing pad on top
        const padGeometry = new THREE.CylinderGeometry(8, 8, 1, 32);
        const padMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333
        });
        this.landingPad = new THREE.Mesh(padGeometry, padMaterial);
        this.landingPad.position.y = 15.5; // Half of building height + half of pad height
        
        // Landing pad markings
        const markingsGeometry = new THREE.CylinderGeometry(6, 6, 1.1, 32);
        const markingsMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF
        });
        this.padMarkings = new THREE.Mesh(markingsGeometry, markingsMaterial);
        this.padMarkings.position.y = 15.5;
        
        // H marking
        const hGeometry = new THREE.PlaneGeometry(8, 8);
        const hTexture = this.createHTexture();
        const hMaterial = new THREE.MeshBasicMaterial({
            map: hTexture,
            transparent: true
        });
        this.hMarking = new THREE.Mesh(hGeometry, hMaterial);
        this.hMarking.rotation.x = -Math.PI / 2;
        this.hMarking.position.y = 16.1;
        
        // Add warning lights
        this.warningLights = this.createWarningLights();
        
        // Add everything to the group
        this.group.add(this.buildingMesh);
        this.group.add(this.landingPad);
        this.group.add(this.padMarkings);
        this.group.add(this.hMarking);
        this.warningLights.forEach(light => this.group.add(light));
        
        // Position the building
        this.group.position.set(position.x, position.y, position.z);
        
        // Add to scene
        scene.add(this.group);
    }
    
    createHTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Draw H
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#333333';
        // Left vertical bar
        context.fillRect(50, 20, 40, 216);
        // Right vertical bar
        context.fillRect(166, 20, 40, 216);
        // Horizontal bar
        context.fillRect(50, 108, 156, 40);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createWarningLights() {
        const lights = [];
        const radius = 7;
        const numberOfLights = 8;
        
        for (let i = 0; i < numberOfLights; i++) {
            const angle = (i / numberOfLights) * Math.PI * 2;
            const lightGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const lightMaterial = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 1
            });
            
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.x = Math.cos(angle) * radius;
            light.position.z = Math.sin(angle) * radius;
            light.position.y = 16;
            
            lights.push(light);
        }
        
        return lights;
    }
    
    update(time) {
        // Blink warning lights
        this.warningLights.forEach((light, index) => {
            const blink = Math.sin(time * 0.003 + index) > 0;
            light.material.emissiveIntensity = blink ? 0.5 : 0.1;
        });
    }
}