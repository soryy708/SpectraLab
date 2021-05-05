declare module 'three.meshline' {
    import { Vector2, Material, BufferGeometry } from 'three';

    export class MeshLineMaterial extends Material {
        constructor(options: {
            color?: any,
            resolution?: Vector2,
            sizeAttenuation?: 0 | 1,
            lineWidth?: number,
        })
    }

    export class MeshLine extends BufferGeometry {
        setPoints(points: number[]): void
    }
}
