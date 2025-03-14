import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();

scene.fog = new THREE.Fog(0xaaaaaa, 1, 5);
scene.fog = new THREE.FogExp2(0xaaaaaa, 0.02);

// Enable Shadows in Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create a Skybox Using a Cube
const skyboxGeometry = new THREE.BoxGeometry(80, 80, 80);
const skyboxMaterials = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load("../lib/skybox.jpg"), side: THREE.BackSide }), // Right
  new THREE.MeshBasicMaterial({ map: textureLoader.load("../lib/skybox.jpg"), side: THREE.BackSide }), // Left
  new THREE.MeshBasicMaterial({ map: textureLoader.load("../lib/skybox.jpg"), side: THREE.BackSide }), // Top
  new THREE.MeshBasicMaterial({ map: textureLoader.load("../lib/skybox_floor.jpg"), side: THREE.BackSide }), // Bottom
  new THREE.MeshBasicMaterial({ map: textureLoader.load("../lib/skybox.jpg"), side: THREE.BackSide }), // Front
  new THREE.MeshBasicMaterial({ map: textureLoader.load("../lib/skybox.jpg"), side: THREE.BackSide })  // Back
];

const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
skybox.position.set(0, 38.5, 0);
scene.add(skybox);

// Set Up Camera & Controls
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 15);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2;

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Variables to store models for rotation
let carModel = null;
let platformModel = null;

// Load Sports Car Model
const mtlLoader = new MTLLoader();
mtlLoader.load("../lib/sportsCar.mtl", (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load(
    "../lib/sportsCar.obj",
    (object) => {
      object.position.set(0, 0, 0);
      object.scale.set(2, 2, 2);
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.fog = false;
        }
      });

      carModel = object;
      scene.add(carModel);
      console.log("Sports Car Model Loaded!");
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    (error) => console.error("Error loading sports car OBJ model:", error)
  );
});

// Load Platform Model
const platformMtlLoader = new MTLLoader();
platformMtlLoader.load("../lib/platform.mtl", (materials) => {
  materials.preload();
  const platformObjLoader = new OBJLoader();
  platformObjLoader.setMaterials(materials);
  platformObjLoader.load(
    "../lib/platform.obj",
    (object) => {
      object.position.set(0, -6, 0);
      object.scale.set(1, 1, 1);
      object.rotation.x = -Math.PI / 2;
      object.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.material.fog = false;
        }
      });

      platformModel = object;
      scene.add(platformModel);
      console.log("Platform Model Loaded!");
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    (error) => console.error("Error loading platform OBJ model:", error)
  );
});

// Create spotlight in the middle
const spotlight = new THREE.SpotLight(0xffffff, 20);
spotlight.position.set(0, 10, 0);
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.5;
spotlight.decay = 2;
spotlight.distance = 50;
spotlight.castShadow = true;

// Configure shadows for spotlight
spotlight.shadow.mapSize.width = 2048;
spotlight.shadow.mapSize.height = 2048;
spotlight.shadow.camera.near = 1;
spotlight.shadow.camera.far = 50;
spotlight.shadow.camera.fov = 30;

// Set the Spotlight Target
spotlight.target.position.set(0, -6, 0);
scene.add(spotlight.target);
scene.add(spotlight);

const lightSpheres = [];
const rows = 5;
const cols = 4;
const spacing = 6;
const startX = -((cols - 1) * spacing) / 2;
const startZ = -((rows - 1) * spacing) / 2;
const yHeight = 7;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    // Calculate even positions in a grid
    const x = startX + col * spacing;
    const z = startZ + row * spacing;
    const y = yHeight;  // Keep lights at fixed height

    // Create point light
    const light = new THREE.PointLight(0xffffff, 2, 10); // White light, intensity 2, distance 10
    light.position.set(x, y, z);
    scene.add(light);

    // Create white sphere
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16); // Small sphere
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(light.position); // Place sphere at light's position
    scene.add(sphere);

    // Store for animation
    lightSpheres.push({ light, sphere, speed: Math.random() * 0.02 + 0.01 });
  }
}

// Create a red button (Cylinder)
const buttonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
button.position.set(0, -1.1, 7);
button.castShadow = true;
button.receiveShadow = true;
scene.add(button);

// Create a cube under the button (Cube)
const buttonMetalTexture = textureLoader.load("../lib/button_metal.jpg");
const baseGeometry = new THREE.BoxGeometry(1, 0.2, 1);
const baseMaterial = new THREE.MeshBasicMaterial({
  map: buttonMetalTexture,
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.set(0, -1.3, 7);
base.scale.set(1.5, 1.5, 1.5);
scene.add(base);


let isBlue = false;
// Picking Setup (Raycasting for mouse clicks)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Cast ray from camera through mouse position
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([button]);

  if (intersects.length > 0) {
    // Toggle between blue and white
    if (isBlue) {
      // Change all lights and spheres to white
      lightSpheres.forEach(({ light, sphere }) => {
        // Set point light and sphere color to white
        light.color.set(0xffffff);
        sphere.material.color.set(0xffffff);
      });
    } else {
      // Change all lights and spheres to blue
      lightSpheres.forEach(({ light, sphere }) => {
        // Set point light and sphere color to blue
        light.color.set(0x4E97D1);
        sphere.material.color.set(0x4E97D1);
      });
    }

    isBlue = !isBlue;
  }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Floating Animation
    lightSpheres.forEach(({ light, sphere, speed }) => {
      light.position.y += Math.sin(Date.now() * 0.001 * speed) * 0.05;
      sphere.position.copy(light.position); // Keep sphere & light together
    });

    if (carModel) carModel.rotation.y += 0.02;              // Rotate car
    if (platformModel) platformModel.rotation.z += 0.01;    // Rotate platform

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
