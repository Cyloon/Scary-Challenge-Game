import * as THREE from "three";

import { listener } from "./main";

/* export function getAudioContext() {
  return listener;
} */

const music = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
async function loadMusic() {
  return new Promise((resolve, reject) => {
    const musicLoader = new THREE.AudioLoader();
    musicLoader.load(
      "/spirits-of-the-moor-180852.mp3",
      function (buffer) {
        music.setBuffer(buffer);
        music.setLoop(true);
        music.setVolume(0.5);
        //music.play();
        resolve(music);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

async function loadZombieMoanSound() {
  return new Promise((resolve, reject) => {
    const zombieSoundLoader = new THREE.AudioLoader();
    zombieSoundLoader.load(
      "/zombie-moans-29924-edited.mp3",
      function (buffer) {
        const zombieSound = new THREE.PositionalAudio(listener);
        zombieSound.setBuffer(buffer);
        zombieSound.setRefDistance(20);
        zombieSound.setLoop(true);
        resolve(zombieSound);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

async function loadZombieDeathSound() {
  return new Promise((resolve, reject) => {
    const zombieSoundLoader = new THREE.AudioLoader();
    zombieSoundLoader.load(
      "/zombiedeath.mp3",
      function (buffer) {
        const deathSound = new THREE.PositionalAudio(listener);
        deathSound.setBuffer(buffer);
        deathSound.setRefDistance(20);
        deathSound.setLoop(false);
        resolve(deathSound);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

let testmusic;
let testzombie;
let testdeath;

async function asyncaudiofileloader() {
  const testAudioLoader = new THREE.AudioLoader();
  const [musicLoad, zombieMoanLoad, zombieDeathLoad] = await Promise.all([
    testAudioLoader.loadAsync("/spirits-of-the-moor-180852.mp3"),
    testAudioLoader.loadAsync("/zombie-moans-29924-edited.mp3"),
    testAudioLoader.loadAsync("/zombiedeath.mp3"),
  ]);
  testmusic = musicLoad;
  testzombie = zombieMoanLoad;
  testdeath = zombieDeathLoad;
}

function whateverever() {
  let promises = [
    testAudioLoader.loadAsync("/spirits-of-the-moor-180852.mp3"),
    testAudioLoader.loadAsync("/zombie-moans-29924-edited.mp3"),
    testAudioLoader.loadAsync("/zombiedeath.mp3"),
  ];
  Promise.all(promises)
    .then((results) => {
      let testmusicLoad = results[0];
      let testzombieMoanLoad = results[1];
      let testzombieDeathLoad = results[2];
    })
    .catch((error) => console.log(error));
}
