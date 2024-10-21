class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map(); // Map to store active chunks
        this.chunkSize = 100;
        this.segments = 50;
        this.loadDistance = 300; // Distance to load chunks
        this.noise = new SimplexNoise();
        
        // Create chunk key from coordinates
        this.getChunkKey = (x, z) => `${Math.floor(x/this.chunkSize)},${Math.floor(z/this.chunkSize)}`;
    }

    update(targetPosition) {
        const centerChunkX = Math.floor(targetPosition.x / this.chunkSize);
        const centerChunkZ = Math.floor(targetPosition.z / this.chunkSize);
        
        // Determine chunks to load
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

        // Add new chunks
        for (const key of chunksToLoad) {
            if (!this.chunks.has(key)) {
                const [chunkX, chunkZ] = key.split(',').map(Number);
                const chunk = new TerrainChunk(
                    chunkX * this.chunkSize,
                    chunkZ * this.chunkSize,
                    this.chunkSize,
                    this.segments,
                    this.noise
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

        // Find the nearest vertex height
        const localX = x - Math.floor(x/this.chunkSize) * this.chunkSize;
        const localZ = z - Math.floor(z/this.chunkSize) * this.chunkSize;
        
        const xIndex = Math.round((localX / this.chunkSize) * this.segments);
        const zIndex = Math.round((localZ / this.chunkSize) * this.segments);
        
        const vertexIndex = (zIndex * (this.segments + 1) + xIndex) * 3 + 1;
        return chunk.geometry.attributes.position.array[vertexIndex];
    }
}