import * as THREE from "three";
import { Mesh } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight, false);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const top = 3;
const right = (window.innerWidth / window.innerHeight) * top;
const camera = new THREE.OrthographicCamera(-right, right, top, -top, 0.1, 100);
const cameraStartingPosition = new THREE.Vector3(0, 0, 10);
camera.position.copy(cameraStartingPosition);

renderer.setClearColor(0x000000, 0);

function resizeCanvas() {
    const { width, clientWidth, height, clientHeight } = renderer.domElement;
    if (width === clientWidth && height === clientHeight) return;

    renderer.setSize(clientWidth, clientHeight, false);
    camera.right = (clientWidth / clientHeight) * top;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.enableZoom = false;
let usingControls = false;
const switchControls = () => (usingControls = !usingControls);
controls.addEventListener("start", switchControls);
controls.addEventListener("end", switchControls);

const loader = new GLTFLoader();

let logo: THREE.Object3D;

const init = async () => {
    logo = (await loader.loadAsync("/assets/drive.glb")).scene.children[0];

    const colors = [
        // front: top, right, left
        0x035c64, 0x298d82, 0x4fbe9f,
        // back: left right bottom
        0x167573, 0x1c7d78, 0x3ca691,
        // inner: top, right, bottom, left
        0x4fbe9f, 0x298d82, 0x035c64, 0x035c64,
        // middle: top, right, left, bottom
        0x035c64, 0x035c64, 0x298d82, 0x298d82,
    ];
    logo.children.forEach((child, i) => {
        (child as Mesh).material = new THREE.MeshBasicMaterial({ color: colors[i] });
    });

    logo.rotation.set(0, Math.PI, 0);

    scene.add(logo);
};

const clock = new THREE.Clock();

const animate: FrameRequestCallback = () => {
    const dt = clock.getDelta();

    if (!usingControls) {
        const delta = cameraStartingPosition.clone().sub(camera.position);
        if (delta.length() > 0.02) {
            const multiplier = Math.min(4 * dt, 0.1);
            camera.position.addScaledVector(delta, multiplier);
        } else {
            camera.position.copy(cameraStartingPosition);
        }
    }

    controls.update();

    resizeCanvas();

    render();

    requestAnimationFrame(animate);
};

const render = () => {
    renderer.render(scene, camera);
};

init()
    .then(() => requestAnimationFrame(animate))
    .catch(console.log);
