class TerrainChunk {
    constructor(x, z, size, segments, noise, textures) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.segments = segments;
        this.noise = noise;
        this.textures = textures; // Preloaded textures from TerrainManager
        this.geometry = new THREE.BufferGeometry();
        
        this.generateChunk();
    }

    generateChunk() {
        const vertices = [];
        const indices = [];
        const colors = [];
        const uvs = [];

        const segmentSize = this.size / this.segments;

        // Generate vertices, colors, and UVs
        for (let z = 0; z <= this.segments; z++) {
            for (let x = 0; x <= this.segments; x++) {
                const xPos = (x * segmentSize) + this.x;
                const zPos = (z * segmentSize) + this.z;
                
                let height = 0;
                let frequency = 0.01;
                let amplitude = 15;
                
                for (let i = 0; i < 4; i++) {
                    height += this.noise.noise2D(xPos * frequency, zPos * frequency) * amplitude;
                    frequency *= 2;
                    amplitude *= 0.5;
                }

                vertices.push(xPos, height, zPos);

                // Normalize height for color shading
                const normalizedHeight = (height + 15) / 30;
                const color = new THREE.Color();

                if (normalizedHeight < 0.2) {
                    color.setHSL(0.35, 0.9, 0.2); // Dark green (low areas)
                } else if (normalizedHeight < 0.4) {
                    color.setHSL(0.35, 0.9, 0.3); // Grass green
                } else if (normalizedHeight < 0.7) {
                    color.setHSL(0.35, 0.9, 0.4); // Lighter green
                } else {
                    color.setHSL(0, 0, normalizedHeight); // Rocky terrain (gray scale)
                }

                colors.push(color.r, color.g, color.b);

                // UV Mapping
                uvs.push(x / this.segments, z / this.segments);
            }
        }

        // Generate indices
        for (let z = 0; z < this.segments; z++) {
            for (let x = 0; x < this.segments; x++) {
                const a = x + (this.segments + 1) * z;
                const b = x + (this.segments + 1) * (z + 1);
                const c = (x + 1) + (this.segments + 1) * (z + 1);
                const d = (x + 1) + (this.segments + 1) * z;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // Assign attributes to geometry
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.geometry.setIndex(indices);
        this.geometry.computeVertexNormals();

        // Use the preloaded textures
        const material = new THREE.MeshStandardMaterial({
            map: this.textures.terrain,
            normalMap: this.textures.normal,
            roughnessMap: this.textures.roughness,
            flatShading: false,
            shininess: 0,
        });

        this.mesh = new THREE.Mesh(this.geometry, material);
    }

    dispose() {
        this.geometry.dispose();
        this.mesh.material.dispose();
    }
}
