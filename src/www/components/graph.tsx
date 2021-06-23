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
    highlightedPoints?: {
        coordinates: {x: number, y: number},
        color: number,
        size?: number,
    }[],
    showContours?: boolean;
    projection?: 'perspective' | 'orthographic';
    onCursor?: (coordinates: {x: number, y: number, z: number}) => void;
};

const Graph: React.FunctionComponent<Props> = (props: Props) => {
    const canvasRef = useRef(null);
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer>(null);
    const [camera, setCamera] = useState<THREE.Camera>(null);
    const [scene, setScene] = useState<THREE.Scene>(null);
    const [controls, setControls] = useState<OrbitControls>(null);
    const [graph, setGraph] = useState<THREE.Object3D>(null);
    const [cursor, setCursor] = useState<THREE.Vector3>(null);
    const projection = props.projection ?? 'perspective';

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;

        const newRenderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        const newScene = new THREE.Scene();

        setRenderer(newRenderer);
        setScene(newScene);

        return () => {
            newRenderer.dispose();
        };
    }, [canvasRef]);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current || !scene || !renderer) {
            return;
        }

        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();
        let newCamera: THREE.Camera = null;
        const aspect = width / height;
        switch (projection) {
            case 'perspective': {
                newCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
                break;
            }
            case 'orthographic': {
                const w = width > height ? 1 : aspect;
                const h = width > height ? aspect : 1;
                newCamera = new THREE.OrthographicCamera(-w, w, h, -h, 0.1, 1000);
                break;
            }
        }
        if (!newCamera) {
            return;
        }
        setCamera(newCamera);
        newCamera.position.z = 2;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height, false);
    }, [canvasRef, scene, renderer, projection]);

    useEffect(() => {
        if (!scene) {
            return;
        }

        const newLight = new THREE.HemisphereLight(0xffffff, 0x0a0a0a, 1);
        scene.add(newLight);
    }, [scene]);

    useEffect(() => {
        if (!renderer || !camera) {
            return;
        }
        const newControls = new OrbitControls(camera, renderer.domElement);
        setControls(newControls);
        return () => {
            newControls.dispose();
        };
    }, [renderer, camera]);

    useEffect(() => {
        if (!controls || !renderer) {
            return;
        }

        let running = true;
        const animate = () => {
            if (!running) {
                return;
            }
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            running = false;
        };
    }, [controls, renderer, scene, camera]);

    useEffect(() => {
        if (!scene) {
            return;
        }
        const newGraph = new THREE.Object3D();
        scene.add(newGraph);
        setGraph(newGraph);
    }, [scene]);

    useEffect(() => {
        if (!cursor) {
            return;
        }

        const minZ = props.data.toArray().reduce((min, cur) => cur < min ? cur : min,  Infinity);
        const maxZ = props.data.toArray().reduce((max, cur) => cur > max ? cur : max, -Infinity);
        const deltaZ = maxZ - minZ;
        
        if (props.onCursor) {
            props.onCursor({
                x: cursor.x * props.data.getWidth() / 2,
                y: cursor.z * deltaZ / 2,
                z: cursor.y * props.data.getHeight() / 2,
            });
        }
    }, [cursor, props.data]);

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

        const renderShape = () => {
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
            graph.add(mesh);
            graph.add(wireframeLines);
        };

        const renderContours = () => {
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
                const maxHue = 120; // Green like global maximum
                const material = new MeshLineMaterial({
                    color: new THREE.Color(`hsl(${normalize(contour.level, minZ, maxZ)*maxHue}, 100%, 50%)`),
                    resolution: new THREE.Vector2(width, height),
                    sizeAttenuation: 0,
                    lineWidth: 8,
                });
                const line = new MeshLine();
                line.setPoints(points);
                const mesh = new THREE.Mesh(line, material);
                graph.add(mesh);
            });
        };

        const renderHighlightedPoints = () => {
            if (!props.highlightedPoints || !props.data) {
                return;
            }

            props.highlightedPoints.forEach(highlightPoint => {
                if (!highlightPoint) {
                    return;
                }

                const {x, y} = highlightPoint.coordinates;
                if (x < 0 || x >= props.data.getWidth() || y < 0 || y >= props.data.getHeight()) {
                    return;
                }

                const size = highlightPoint.size ?? 0.025;

                const maxVal = props.data.toArray().reduce((max, cur) => cur > max ? cur : max, -Infinity);
                const minVal = props.data.toArray().reduce((min, cur) => cur < min ? cur : min,  Infinity);
                const cubeGeometry = new THREE.BoxGeometry(size, size, size);
                const material = new THREE.MeshBasicMaterial({color: highlightPoint.color});
                const mesh = new THREE.Mesh(cubeGeometry, material);
                const vertex = makeVertex(x, y, minVal, maxVal);
                mesh.position.x = vertex[0];
                mesh.position.y = vertex[1];
                mesh.position.z = vertex[2];
                mesh.rotateY(Math.PI / 4);
                mesh.rotateX(Math.PI / 4);
                graph.add(mesh);
            });
        };

        if (!graph) {
            return;
        }

        graph.clear();
        renderShape();
        renderContours();
        renderHighlightedPoints();
    }, [graph, props.data, props.showContours, props.highlightedPoints]);

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
        if (!camera || !canvas || !renderer) {
            return;
        }

        const { width, height } = canvas.getBoundingClientRect();
        renderer.setSize(width, height, false);
        const newAspect = width / height;
        switch (projection) {
            case 'perspective': {
                const perspectiveCamera = camera as THREE.PerspectiveCamera;
                if (newAspect !== perspectiveCamera.aspect) {
                    perspectiveCamera.aspect = width / height;
                    perspectiveCamera.updateProjectionMatrix();
                }
                break;
            }
            case 'orthographic': {
                const orthographicCamera = camera as THREE.OrthographicCamera;
                const w = width > height ? 1 : newAspect;
                const h = width > height ? newAspect : 1;
                orthographicCamera.left = -w;
                orthographicCamera.right = w;
                orthographicCamera.top = h;
                orthographicCamera.bottom = -h;
                orthographicCamera.updateProjectionMatrix();
                break;
            }
        }
    }, [canvasRef, renderer, camera]);

    useEffect(() => {
        const raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 0.01;
        raycaster.params.Line.threshold = 0.01;
        let lastDebounce = Date.now();
        const onMouse = function (this: Window, ev: MouseEvent): any {
            if (!canvasRef || !canvasRef.current) {
                return;
            }
            
            if (Date.now() - lastDebounce < 500) {
                return;
            }
            lastDebounce = Date.now();

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const canvasX = ev.clientX - rect.left;
            const canvasY = ev.clientY - rect.top;
            const x = ((canvasX / rect.width) - 0.5) * 2;
            const y = ((canvasY / rect.height) - 0.5) * -2;
            raycaster.setFromCamera({x, y}, camera);
            const intersected = raycaster.intersectObjects(graph.children);
            if (intersected.length) {
                const closestIntersected = intersected[0];
                setCursor(closestIntersected.point);
            }
        };
        window.addEventListener<'mousemove'>('mousemove', onMouse);
        return () => {
            window.removeEventListener<'mousemove'>('mousemove', onMouse);
        };
    }, [canvasRef, camera, graph]);

    return <canvas
        ref={canvasRef}
        width={props.width}
        height={props.height}
        style={props.style}
    ></canvas>;
};

export default Graph;
