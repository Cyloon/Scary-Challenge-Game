import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

const gltfLoader = new GLTFLoader();

const [zombie, church, analogclock, pineTree] = await Promise.all([
  gltfLoader.loadAsync("/Zombie.glb"),
  gltfLoader.loadAsync("/Church.glb"),
  gltfLoader.loadAsync("/Analogclock.glb"),
  gltfLoader.loadAsync("/Pinetree.glb"),
]);

/* const promiseGLTFLoad = (url) =>
  new Promise((resolve) => new GLTFLoader().load(url, resolve));

 export async function loadZombie() {
  const gltf = await promiseGLTFLoad("/Zombie.glb");
  var zombie = gltf.scene;
  zombie.scale.set(0.5, 0.5, 0.5);

//var zombie.animations = gltf.animations;
 var mixer = new THREE.AnimationMixer(enemy);
  var animationsMap = new Map();
  gltfAnimations
    .filter((a) => a.name != "TPose")
    .forEach((a) => animationsMap.set(a.name, mixer.clipAction(a)));
  // Need to return the result!!
//return { zombie };
//}

const churchLoader = new GLTFLoader();
const analogclockLoader = new GLTFLoader();
const pineLoader = new GLTFLoader();
//const zombieLoader = new GLTFLoader();

// Load Zombie model

 export async function loadZombie() {
  return new Promise((resolve, reject) => {
    zombieLoader.load(
      "/Zombie.glb",
      (gltf) => {
        const animations = gltf.animations;
        resolve(gltf.scene);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

// Load church model

export async function loadChurch() {
  return new Promise((resolve, reject) => {
    churchLoader.load(
      "/Church.glb",
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
}

// Load Analog clock model

export async function loadAnalogClock() {
  return new Promise((resolve, reject) => {
    analogclockLoader.load(
      "/Analogclock.glb",
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
}

// Load Pinetree model

export async function loadPineTree() {
  return new Promise((resolve, reject) => {
    pineLoader.load(
      "/Pinetree.glb",
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
}

 function loadZombie() {
  return new Promise(function (resolve) {
    const loader = new GLTFLoader();
    loader.load("/Zombie.glb", function (gltf) {
      resolve(gltf.scene);
    });
  });
}

async function asyncLoad() {
  console.log("loading");
  const result = await loadZombie();
  console.log(result);
}

asyncLoad();
 function loadChurch() {
  return new Promise(function (resolve, reject) {
    const loader = new GLTFLoader();
    loader.load(
      "/Church.glb",
      function (gltf) {
        resolve(gltf.scene);
      },
      undefined,
      function (error) {
        reject(error);
      }
    );
  });
}  */
