// Import SimplexNoise from CDN in your HTML file
class Terrain {
    constructor(width = 100, height = 100, segments = 100) {
        this.width = width;
        this.height = height;
        this.segments = segments;
        this.geometry = new THREE.BufferGeometry();
        this.noise = new SimplexNoise();
        
        this.generateTerrain();
    }

    generateTerrain() {
        const vertices = [];
        const indices = [];
        const colors = [];

        // Generate vertices and colors
        for (let y = 0; y <= this.segments; y++) {
            for (let x = 0; x <= this.segments; x++) {
                const xPos = (x / this.segments) * this.width - this.width / 2;
                const zPos = (y / this.segments) * this.height - this.height / 2;
                
                // Generate height using multiple octaves of noise for more natural look
                let height = 0;
                let frequency = 0.02;
                let amplitude = 15;
                
                for (let i = 0; i < 4; i++) {
                    height += this.noise.noise2D(xPos * frequency, zPos * frequency) * amplitude;
                    frequency *= 2;
                    amplitude *= 0.5;
                }

                vertices.push(xPos, height, zPos);

                // Color based on height
                const normalizedHeight = (height + 15) / 30; // Normalize height to 0-1 range
                const color = new THREE.Color();
                
                if (normalizedHeight < 0.2) {
                    // Deep valleys (darker green)
                    color.setHSL(0.35, 0.9, 0.2);
                } else if (normalizedHeight < 0.4) {
                    // Lower ground (green)
                    color.setHSL(0.35, 0.9, 0.3);
                } else if (normalizedHeight < 0.7) {
                    // Hills (lighter green)
                    color.setHSL(0.35, 0.9, 0.4);
                } else {
                    // Mountain tops (grey-white)
                    color.setHSL(0, 0, normalizedHeight);
                }

                colors.push(color.r, color.g, color.b);
            }
        }

        // Generate indices for triangles
        for (let y = 0; y < this.segments; y++) {
            for (let x = 0; x < this.segments; x++) {
                const a = x + (this.segments + 1) * y;
                const b = x + (this.segments + 1) * (y + 1);
                const c = (x + 1) + (this.segments + 1) * (y + 1);
                const d = (x + 1) + (this.segments + 1) * y;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // Set attributes
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.geometry.setIndex(indices);
        
        // Calculate normals for proper lighting
        this.geometry.computeVertexNormals();

        // Create material
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            flatShading: false,
            shininess: 0
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, material);
    }

    // Method to get height at any point (useful for collision detection later)
    getHeightAt(x, z) {
        const localX = x + this.width / 2;
        const localZ = z + this.height / 2;
        
        let height = 0;
        let frequency = 0.02;
        let amplitude = 15;
        
        for (let i = 0; i < 4; i++) {
            height += this.noise.noise2D(x * frequency, z * frequency) * amplitude;
            frequency *= 2;
            amplitude *= 0.5;
        }
        
        return height;
    }
}