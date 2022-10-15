import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const stats = Stats();
document.body.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const top = 3;
const right = (window.innerWidth / window.innerHeight) * top;
const camera = new THREE.OrthographicCamera(-right, right, top, -top, 0.1, 100);
camera.position.z = 10;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(-1, 1, 2);
scene.add(ambientLight);
scene.add(directionalLight);

scene.background = new THREE.Color(0xffffff);

const onWindowResize = () => {
    camera.right = (window.innerWidth / window.innerHeight) * top;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
};
window.addEventListener("resize", onWindowResize, false);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const loader = new GLTFLoader();

let logo: THREE.Object3D;

const init = async () => {
    const gltf = await loader.loadAsync("/textures/drive.glb");
    logo = gltf.scene.children[0];
    logo.rotation.set(-Math.atan(Math.sqrt(2) / 2), -Math.PI / 4, Math.PI / 2);
    scene.add(logo);
};

const clock = new THREE.Clock();

const animate: FrameRequestCallback = () => {
    const delta = new THREE.Vector3(0, 0, 10).sub(camera.position);
    const dt = clock.getDelta();
    const multiplier = 2 * dt > 0.04 ? 0.04 : 2 * dt;
    const moveBy = delta.length() > 0.01 ? delta.multiplyScalar(multiplier) : delta;
    camera.position.add(delta.length() > 1 ? moveBy : delta);

    controls.update();

    render();

    stats.update();

    requestAnimationFrame(animate);
};

const render = () => {
    renderer.render(scene, camera);
};

init()
    .then(() => requestAnimationFrame(animate))
    .catch(console.log);
