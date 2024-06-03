import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

const churchLoader = new GLTFLoader();
const analogclockLoader = new GLTFLoader();
const pineLoader = new GLTFLoader();
const zombieLoader = new GLTFLoader();

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

// Load Zombie model

export async function loadZombie() {
  return new Promise((resolve, reject) => {
    zombieLoader.load(
      "/Zombie.glb",
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
}

/* export async function loadChurch() {
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
} */
