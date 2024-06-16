import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./style.css";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { AudioContext } from "three";
//import { rotateTowardsTarget } from "./rotatetowardstarget";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

//model licence text
//Church by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/0Oe72PEPCK6)
//Pine tree by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/7rTNpk6j01O)
//Analog clock by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/5gAoMR2YHs3)

/* Music by <a href="https://pixabay.com/users/purpleplanetmusic-23350895/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=172408">Geoffrey Harvey</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=172408">Pixabay</a>
 */

/* Music by <a href="https://pixabay.com/users/geoffharvey-9096471/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=180852">Geoff Harvey</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=180852">Pixabay</a> */

/* Sound Effect from <a href="https://pixabay.com/sound-effects/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=29924">Pixabay</a>
 */
/**
 * Sizes
 */

// Debug
//const gui = new GUI();

// consts
let delta;
let score = 0;
let pineTreeHit;
let enemyHit;
let walkActions = [];
let attackActions = [];
let deathActions = [];
let startTweens = [];
let backTweens = [];
let deathTweens = [];
const mixers = [];
let startTween;
let backTween;
let deathTween;
let walkAction;
let attackAction;
let deathAction;

let listener;
let music;
let deathSound;
let orbitControlsSwitch = document.getElementById("orbitcontrolstoggle");
//let orbitControlsSwitch.checked; // it returns Boolean value

// canvas
const canvas = document.querySelector("canvas.webgl");

// set up scene
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scene = new THREE.Scene();

//scene, lighting, camera

// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  1,
  1000
);
camera.position.set(0, 2, 14);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = true;

//GroundPlane
// Plane
const groundGeometry = new THREE.PlaneGeometry(25, 50, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.MeshPhongMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Objects

// the mooon
const geometry = new THREE.SphereGeometry(1, 16, 16);
const material = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("/moon.jpg"),
});

const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(10, 7, -10);
scene.add(sphere);

//ConeGeometry(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
//cone
const coneGeometry = new THREE.ConeGeometry(1.8, 20, 16);
const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
coneGeometry.rotateX(-Math.PI / 2);
coneGeometry.translate(0, 0, 10);
cone.position.set(0, 2, 14);

scene.add(cone);

//mouse and light target
const target = new THREE.Object3D();
target.position.z = -2;
scene.add(target);

//target object behind camera
const target2 = new THREE.Object3D();
target2.position.set(0, 4, 15);
scene.add(target2);

// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

//clock light
const clocklight = new THREE.PointLight(0xc0c0c0, 0.8, 100);
clocklight.position.set(0, 5.7, -10);
scene.add(clocklight);

// directional light / moon light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.castShadow = true;
directionalLight.position.set(10, 6, -10);
directionalLight.target.position.set(0, 0, 15);
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.right = 50;
scene.add(directionalLight);
scene.add(directionalLight.target);

//const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
//scene.add(directionalLightHelper);
//const helper = new THREE.CameraHelper(directionalLight.shadow.camera);

//SpotLight( color, intensity, distance, angle, penumbra, decay )
//mouse controlled spotlight
let light = new THREE.SpotLight(0xffffff, 3, 100, 0.1, 0.2, 0);
light.position.copy(camera.position);
light.castShadow = true;
light.target = target;
scene.add(light);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Pinetrees locations array
let pineTreesPosArray = [
  new THREE.Vector3(2.5, 1.5, 2),
  new THREE.Vector3(-2.5, 1.5, 2),
  new THREE.Vector3(-3, 1.5, 4),
  new THREE.Vector3(3, 1.5, 4),
  new THREE.Vector3(-3, 1.5, 8),
  new THREE.Vector3(3, 1.5, 8),
];

// Enemy starting position array
let enemyPosArray = [
  new THREE.Vector3(4, 0, 1),
  new THREE.Vector3(-4, 0, 1),
  new THREE.Vector3(4, 0, 3),
  new THREE.Vector3(-4, 0, 3),
  new THREE.Vector3(4, 0, 7),
  new THREE.Vector3(-4, 0, 7),
];

const pineTreesArray = [];
const enemiesCurrentPosition = [];
const enemyDeadFlags = [];
let heads = [];
let enemy;
let pineTree;
let head;
let clips;
let endX;
let gameRunning = false;
const clock = new THREE.Clock();

// mouse position consts
const intersectionPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

//  Churchmodel settings
const churchLoader = new GLTFLoader();
let church;

churchLoader.load("/Church.glb", function (gltf) {
  church = gltf.scene;
  church.scale.set(0.1, 0.1, 0.1);
  church.position.set(0, 0, -15);
  traverseAndAddShadow(church);
  scene.add(church);
});

// Clockmodel settings
const analogclockLoader = new GLTFLoader();
let analogclock;

analogclockLoader.load("/Analogclock.glb", function (gltf) {
  analogclock = gltf.scene;
  analogclock.scale.set(0.05, 0.05, 0.05);
  analogclock.rotateY(-Math.PI / 2);
  analogclock.position.set(0, 5, -10.9);
  traverseAndAddShadow(analogclock);
  scene.add(analogclock);
});

// Pinetreemodel settings
const pineTreeLoader = new GLTFLoader();

pineTreeLoader.load("/Pinetree.glb", function (gltf) {
  pineTree = gltf.scene;
  pineTree.scale.set(2, 2, 2); // set scale/size of model

  //for every cooardinates(items) in the array render a clone of the loaded model
  //and place it according to the cooardinates in that position in the array
  for (let i = 0; i < pineTreesPosArray.length; i++) {
    let pineTreeClone = SkeletonUtils.clone(pineTree);
    pineTreeClone.position.copy(pineTreesPosArray[i]);
    traverseAndAddShadow(pineTreeClone);
    scene.add(pineTreeClone);
    pineTreesArray[i] = pineTreeClone;
  }
});

// load zombie model
const zombieLoader = new GLTFLoader();

zombieLoader.load("/Zombie.glb", function (gltf) {
  clips = gltf.animations;
  enemy = gltf.scene;
  enemy.scale.set(0.5, 0.5, 0.5);
  traverseAndAddShadow(enemy);

  //for every cooardinates(items) in the array render a clone of the loaded model
  //and place it according to the cooardinates in that position in the array
  for (let i = 0; i < enemyPosArray.length; i++) {
    let enemyClone = SkeletonUtils.clone(enemy);
    enemyClone.position.copy(enemyPosArray[i]);
    enemyClone.updateMatrixWorld();

    // if the enemyClone position is positive rotate it counterclockwise and oposite
    if (enemyClone.position.x > 0) {
      enemyClone.rotation.y = -Math.PI / 2;
    } else {
      enemyClone.rotation.y = Math.PI / 2;
    }

    heads[i] = enemyClone.getObjectByName("Head");
    scene.add(enemyClone);
    enemiesCurrentPosition[i] = enemyClone;
    // also where to get const audio = enemiesCurrentPosition[i]
    // audio.play()
    enemyDeadFlags[i] = false;
    const startX = enemyClone.position.x;
    const endX = enemyClone.position.x > 0 ? 1 : -1;
  }
});

render();

// functions

// give every child of the object cast and receive shaddow
function traverseAndAddShadow(object) {
  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function render() {
  requestAnimationFrame(render);

  renderer.render(scene, camera);

  delta = clock.getDelta();
  mixers.forEach((mixer) => {
    mixer.update(delta);
  });

  // update tween
  TWEEN.update();

  cone.lookAt(target.position);

  if (controls.enabled) {
    // Update Orbital Controls
    controls.update();
  }

  // Update spotlight target
  light.target.updateMatrixWorld(); // Ensure the spotlight target is updated
  scene.updateMatrixWorld();
}

orbitControlsSwitch.addEventListener("click", () => {
  if (!controls.enabled) {
    controls.enabled = true;
    console.log("orbitcontroles enabled");
  } else {
    controls.enabled = false;
    console.log("orbitcontroles disabled");
  }
});

window.addEventListener("mousemove", function (e) {
  //calculate so we can have a moving target that the spotlight follows
  //Calculating where the mouse coordinates are
  //send a raycast from the camera to the mouseposition on the invisible plane
  mousePosition.x = (e.clientX / sizes.width) * 2 - 1;
  mousePosition.y = -(e.clientY / sizes.height) * 2 + 1;
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position); //Set a vertical plane
  raycaster.setFromCamera(mousePosition, camera); //Raycast from the camera position to the mouse position
  //where the raycaster hits the plane set targets position
  if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
    target.position.copy(intersectionPoint);
  }

  // is the light shining on any enemy? (is the raycaster point hitting any part of any enemy?)

  pineTreeHit = false;
  // for each indexed enemyClone
  enemiesCurrentPosition.forEach((enemyClone, index) => {
    //if the raycaster intersect with object is more than 0 (it hits an enemyClone)
    if (raycaster.intersectObject(enemyClone).length > 0) {
      console.log("enemyClone intersect!");

      //for each pineTreeClone
      pineTreesArray.forEach((pineTreeClone) => {
        //if the raycaster intersect with object is more than 0 (it hits an pineTreeClone)
        if (raycaster.intersectObject(pineTreeClone).length > 0) {
          console.log("pineTreeClone intersect!");
          pineTreeHit = true; //set pineTreeHit to true
        }
      });
      // if raycaster hits enemyClone but not a pineTree and the enemy isn't flagged dead
      if (!pineTreeHit && !enemyDeadFlags[index]) {
        enemyDeathAndReset(enemyClone, index);
      }
    }
  });
});

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
