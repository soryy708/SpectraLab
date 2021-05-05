import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Conrec } from 'ml-conrec';
import Matrix from '../../matrix';

type Props = {
    width?: string;
    height?: string;
    data: Matrix;
    style?: any;
    showLocalExtremum?: boolean;
    showGlobalExtremum?: boolean;
    showContours?: boolean;
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
        const normalize = (val: number, min: number, max: number) => (val - min) / (max - min);
    
        const makeVertex = (x: number, y: number, minZ: number, maxZ: number) => {
            const z = props.data.getAt(x, y);
            return [
                normalize(x, 0, props.data.getWidth()) - 0.5,
                normalize(z, minZ, maxZ) - 0.5,
                normalize(y, 0, props.data.getHeight()) - 0.5,
            ];
        };

        const renderShape = (scene: THREE.Scene) => {
            const geometry = new THREE.BufferGeometry();
            const vertices: number[] = [];

            const minZ = props.data.toArray().reduce((min, cur) => cur < min ? cur : min,  Infinity);
            const maxZ = props.data.toArray().reduce((max, cur) => cur > max ? cur : max, -Infinity);

            props.data.forEach((val, [x, y]) => {
                const neighborIndexes = props.data.cardinalNeighborIndexesOf(x, y);
                if (neighborIndexes.length < 2 || neighborIndexes.length > 4) {
                    console.error('Weird geometry');
                    return;
                }
                for (let i = 0; i < neighborIndexes.length; ++i) {
                    vertices.push(...[
                        ...makeVertex(x, y, minZ, maxZ),
                        ...makeVertex(...neighborIndexes[i], minZ, maxZ),
                        ...makeVertex(...neighborIndexes[(i+1) % neighborIndexes.length], minZ, maxZ),
                    ]);
                }
            });
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
            material.side = THREE.DoubleSide;
            const mesh = new THREE.Mesh(geometry, material);
            const wireframe = new THREE.WireframeGeometry(geometry);
            const wireframeLines = new THREE.LineSegments(wireframe);
            scene.add(mesh);
            scene.add(wireframeLines);
        };

        const renderContours = (scene: THREE.Scene) => {
            if (!props.showContours) {
                return;
            }

            const minZ = props.data.toArray().reduce((min, cur) => cur < min ? cur : min,  Infinity);
            const maxZ = props.data.toArray().reduce((max, cur) => cur > max ? cur : max, -Infinity);

            const conrec = new Conrec(props.data.toMultiDimensionalArray());
            const contours: Array<{[key: number]: {x: number, y: number}, k: number, level: number}> = conrec.drawContour({contourDrawer: 'shape'});
            contours.forEach(contour => {
                const points: number[] = [];
                const keys = Object.keys(contour);
                const numericKeys = keys.filter(key => !isNaN(Number(key)));
                numericKeys.forEach(key => {
                    const z = contour.level;
                    const x = contour[Number(key)].x;
                    const y = contour[Number(key)].y;
                    points.push(
                        normalize(x, 0, props.data.getWidth()) - 0.5,
                        normalize(z, minZ, maxZ) - 0.5,
                        normalize(y, 0, props.data.getHeight()) - 0.5
                    );
                });

                if (points.length === 0) {
                    return;
                }
                
                const canvas = canvasRef.current;
                const { width, height } = canvas.getBoundingClientRect();
                const material = new MeshLineMaterial({
                    color: 0xff8800,
                    resolution: new THREE.Vector2(width, height),
                    sizeAttenuation: 0,
                    lineWidth: 8,
                });
                const line = new MeshLine();
                line.setPoints(points);
                const mesh = new THREE.Mesh(line, material);
                scene.add(mesh);
            });
        };

        const renderExtremums = (scene: THREE.Scene) => {
            if (props.showLocalExtremum || props.showGlobalExtremum) {
                const cubeGeometry = new THREE.BoxGeometry(0.025, 0.025, 0.025);
                const cubeExtremumMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
                const cubeMaxMaterial      = new THREE.MeshBasicMaterial({color: 0x00ff00});
                const cubeMinMaterial      = new THREE.MeshBasicMaterial({color: 0xff0000});
                const maxVal = props.data.toArray().reduce((max, cur) => cur > max ? cur : max, -Infinity);
                const minVal = props.data.toArray().reduce((min, cur) => cur < min ? cur : min,  Infinity);
                const cubes: THREE.Mesh[] = [];
                const makeCubeMesh = (x: number, y: number, mat: THREE.Material) => {
                    const cubeMesh = new THREE.Mesh(cubeGeometry, mat);
                    const vertex = makeVertex(x, y, minVal, maxVal);
                    cubeMesh.position.x = vertex[0];
                    cubeMesh.position.y = vertex[1];
                    cubeMesh.position.z = vertex[2];
                    cubeMesh.rotateY(Math.PI / 4);
                    cubeMesh.rotateX(Math.PI / 4);
                    return cubeMesh;
                };
                props.data.forEach((val, [x, y]) => {
                    if (props.showGlobalExtremum) {
                        if (val === maxVal) {
                            cubes.push(makeCubeMesh(x, y, cubeMaxMaterial));
                            return;
                        }
                        if (val === minVal) {
                            cubes.push(makeCubeMesh(x, y, cubeMinMaterial));
                            return;
                        }
                    }
                    if (props.showLocalExtremum) {
                        const neighborIndexes = props.data.cardinalNeighborIndexesOf(x, y);
                        const neighborVals = neighborIndexes.map(([nx, ny]) => props.data.getAt(nx, ny));
                        const maxNeighborVal = neighborVals.reduce((max, cur) => cur > max ? cur : max, -Infinity);
                        const minNeighborVal = neighborVals.reduce((min, cur) => cur < min ? cur : min,  Infinity);
                        if (val >= maxNeighborVal || val <= minNeighborVal) {
                            cubes.push(makeCubeMesh(x, y, cubeExtremumMaterial));
                        }
                    }
                });
                cubes.forEach(cube => {
                    scene.add(cube);
                });
            }
        };

        const defineCamera = () => {
            const canvas = canvasRef.current;
            const { width, height } = canvas.getBoundingClientRect();
            const newCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            setCamera(newCamera);
            newCamera.position.z = 2;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height, false);
            return newCamera;
        };

        if (!renderer || !canvasRef || !canvasRef.current || !props.data) {
            return;
        }

        const scene = new THREE.Scene();

        scene.add(new THREE.HemisphereLight(0xffffff, 0x0a0a0a, 1));
        renderShape(scene);
        renderContours(scene);
        renderExtremums(scene);

        const newCamera = defineCamera();
        const controls = new OrbitControls(newCamera, renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, newCamera);
        };
        animate();
    }, [renderer, props.data, props.showLocalExtremum, props.showGlobalExtremum, props.showContours]);

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
