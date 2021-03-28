import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Matrix from '../../matrix';

type Props = {
    width?: string;
    height?: string;
    data: Matrix;
    style?: any;
};

const Graph: React.FunctionComponent<Props> = (props: Props) => {
    const canvasRef = useRef(null);
    const [renderer, setRenderer] = useState(null);
    const [camera, setCamera] = useState(null);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        setRenderer(new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        }));
    }, [canvasRef]);

    useEffect(() => {
        if (!renderer || !canvasRef || !canvasRef.current || !props.data) {
            return;
        }
        const canvas = canvasRef.current;

        const scene = new THREE.Scene();

        scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a0a, 1));

        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const makeVertex = (x: number, y: number) => {
            return [
                x / props.data.getWidth()  - 0.5,
                props.data.getAt(x, y),
                y / props.data.getHeight() - 0.5,
            ];
        };
        props.data.forEach((val, [x, y]) => {
            const neighborIndexes = props.data.neighborIndexesOf(x, y);
            if (neighborIndexes.length < 2 || neighborIndexes.length > 8) {
                console.error('Weird geometry');
                return;
            }
            for (let i = 0; i < neighborIndexes.length - 1; ++i) {
                vertices.push(...[
                    ...makeVertex(x, y),
                    ...makeVertex(...neighborIndexes[i]),
                    ...makeVertex(...neighborIndexes[i+1]),
                ]);
            }
        });
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const { width, height } = canvas.getBoundingClientRect();
        const newCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        setCamera(newCamera);
        newCamera.position.z = 2;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height, false);

        const controls = new OrbitControls(newCamera, renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, newCamera);
        };
        animate();
    }, [renderer, props.data]);

    const onResize = (callback: () => void, params: any[]) => {
        useLayoutEffect(() => {
            window.addEventListener('resize', callback);
            return () => {
                window.removeEventListener('resize', callback);
            };
        }, [...params]);
    };

    onResize(() => {
        const canvas = canvasRef && canvasRef.current;
        if (!camera || !canvas) {
            return;
        }

        const { width, height } = canvas.getBoundingClientRect();
        renderer.setSize(width, height, false);
        const newAspect = width / height;
        if (newAspect !== camera.aspect) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }, [canvasRef, camera]);

    return <canvas
        ref={canvasRef}
        width={props.width}
        height={props.height}
        style={props.style}
    ></canvas>;
};

export default Graph;
