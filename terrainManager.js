class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map(); // Map to store active chunks
        this.chunkSize = 100;
        this.segments = 50;
        this.loadDistance = 800;
        this.noise = new SimplexNoise();

        this.getChunkKey = (x, z) => `${Math.floor(x / this.chunkSize)},${Math.floor(z / this.chunkSize)}`;

        // Preload textures
        this.textureLoader = new THREE.TextureLoader();
        this.textures = {
            terrain: this.textureLoader.load('https://64.media.tumblr.com/c75c27f06bd117b021724bb1025181d2/9d1ae0262bb26833-b5/s1280x1920/ba063c036cd6e18e93a1890f24713c6e34dce068.jpg'),
            normal: this.textureLoader.load('https://64.media.tumblr.com/4394e07b798de7f0d83e89db9ec4ae82/9d1ae0262bb26833-45/s1280x1920/40981c52459c769261a7973b9682a9235f32b519.jpg'),
            roughness: this.textureLoader.load('https://64.media.tumblr.com/0a9efc6ac199834b3ce2357e1beacbae/9d1ae0262bb26833-24/s1280x1920/e4950ae03ff6e3ddcf07081124a7b95fed5be562.jpg'),
        };
    }

    update(targetPosition) {
        const centerChunkX = Math.floor(targetPosition.x / this.chunkSize);
        const centerChunkZ = Math.floor(targetPosition.z / this.chunkSize);
        
        const chunksToLoad = new Set();
        const loadRadius = Math.ceil(this.loadDistance / this.chunkSize);
        
        for (let x = -loadRadius; x <= loadRadius; x++) {
            for (let z = -loadRadius; z <= loadRadius; z++) {
                const chunkX = centerChunkX + x;
                const chunkZ = centerChunkZ + z;
                const key = `${chunkX},${chunkZ}`;

                const distance = Math.sqrt(x * x + z * z) * this.chunkSize;
                if (distance <= this.loadDistance) {
                    chunksToLoad.add(key);
                }
            }
        }

        // Remove out-of-range chunks
        for (const [key, chunk] of this.chunks.entries()) {
            if (!chunksToLoad.has(key)) {
                chunk.dispose();
                this.scene.remove(chunk.mesh);
                this.chunks.delete(key);
            }
        }

        // Add new chunks using preloaded textures
        for (const key of chunksToLoad) {
            if (!this.chunks.has(key)) {
                const [chunkX, chunkZ] = key.split(',').map(Number);
                const chunk = new TerrainChunk(
                    chunkX * this.chunkSize,
                    chunkZ * this.chunkSize,
                    this.chunkSize,
                    this.segments,
                    this.noise,
                    this.textures // Pass preloaded textures
                );
                this.chunks.set(key, chunk);
                this.scene.add(chunk.mesh);
            }
        }
    }

    getHeightAt(x, z) {
        const chunkKey = this.getChunkKey(x, z);
        const chunk = this.chunks.get(chunkKey);
        
        if (!chunk) return 0;

        const localX = x - Math.floor(x / this.chunkSize) * this.chunkSize;
        const localZ = z - Math.floor(z / this.chunkSize) * this.chunkSize;
        
        const xIndex = Math.round((localX / this.chunkSize) * this.segments);
        const zIndex = Math.round((localZ / this.chunkSize) * this.segments);
        
        const vertexIndex = (zIndex * (this.segments + 1) + xIndex) * 3 + 1;
        return chunk.geometry.attributes.position.array[vertexIndex];
    }
}
