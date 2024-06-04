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

//GroundPlane
// Plane
const groundGeometry = new THREE.PlaneGeometry(25, 25, 32, 32);
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

//mouse and light target
const target = new THREE.Object3D();
target.position.z = -2;
scene.add(target);

//target object behind camera
const target2 = new THREE.Object3D();
target2.position.set(0, 4, 15);
scene.add(target2);

// Lights

//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//scene.add(ambientLight);

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

let zombieSoundPosAudio = [];
let deathSoundPosAudio = [];
let zombieSounds = [];
let deathSounds = [];
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

const zombieloader = new GLTFLoader();

const gltfLoader = new GLTFLoader();
//let church;

const [churchGlb, zombieGlb, analogclockGlb, pineTreeGlb] = await Promise.all([
  gltfLoader.loadAsync("/Church.glb"),
  gltfLoader.loadAsync("/Zombie.glb"),
  gltfLoader.loadAsync("/Analogclock.glb"),
  gltfLoader.loadAsync("/Pinetree.glb"),
]);

function startGame() {
  gameRunning = true;
  document.getElementById("startButton").style.display = "none";
  document.getElementById("backstory").style.display = "none";
  initializeAudio();

  //Add listner to the camera
  camera.add(listener);

  //  Churchmodel settings
  const church = churchGlb.scene;
  church.scale.set(0.1, 0.1, 0.1);
  church.position.set(0, 0, -15);
  traverseAndAddShadow(church);

  scene.add(church);

  // Clockmodel settings
  const analogclock = analogclockGlb.scene;
  analogclock.scale.set(0.05, 0.05, 0.05);
  analogclock.rotateY(-Math.PI / 2);
  analogclock.position.set(0, 5, -10.9);
  traverseAndAddShadow(analogclock);
  scene.add(analogclock);

  // Pinetreemodel settings
  pineTree = pineTreeGlb.scene;
  pineTree.scale.set(2, 2, 2); // set scale/size of model

  //for every cooardinates(items) in the array render a clone of the loaded model
  //and place it according to the cooardinates in that position in the array
  for (let i = 0; i < pineTreesPosArray.length; i++) {
    let pineTreeClone = SkeletonUtils.clone(pineTree);
    pineTreeClone.position.copy(pineTreesPosArray[i]);
    traverseAndAddShadow(pineTreeClone);
    scene.add(pineTreeClone);
    pineTreesArray.push(pineTreeClone);
  }

  enemy = zombieGlb.scene;
  clips = zombieGlb.animations;
  enemy.scale.set(0.5, 0.5, 0.5);
  traverseAndAddShadow(enemy);

  //to be able to attach a zombiemoan to each loaded enemyClone I had to wrap
  //the whole for loop so that for each clone made the sound is added
  const zombieSoundLoader = new THREE.AudioLoader();
  zombieSoundLoader.load("/zombie-moans-29924-edited.mp3", function (buffer) {
    //for every cooardinates(items) in the array render a clone of the loaded model
    //and place it according to the cooardinates in that position in the array
    for (let i = 0; i < enemyPosArray.length; i++) {
      let enemyClone = SkeletonUtils.clone(enemy);
      enemyClone.position.copy(enemyPosArray[i]);
      enemyClone.updateMatrixWorld();

      const audio = new THREE.Audio(listener);
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.setVolume(0.1);
      enemyClone.add(audio);

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
      animateEnemy(enemyClone, startX, endX, randomDelayTime(), i);
    }
  });

  render(scene, camera, renderer, light);
}

// functions

function init() {
  document.getElementById("backstory").style.display = "block";
  document.getElementById("startButton").style.display = "block";
}

init();

// give every child of the object cast and receive shaddow
function traverseAndAddShadow(object) {
  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function initializeAudio() {
  listener = new THREE.AudioListener();

  const music = new THREE.Audio(listener);
  const musicLoader = new THREE.AudioLoader();
  musicLoader.load("/spirits-of-the-moor-180852.mp3", function (buffer) {
    music.setBuffer(buffer);
    music.setLoop(true);
    music.setVolume(0.3);
    music.play();
    console.log(music);
  });
}

function render() {
  if (!gameRunning) return;
  requestAnimationFrame(render);

  renderer.render(scene, camera);

  delta = clock.getDelta();
  mixers.forEach((mixer) => {
    mixer.update(delta);
  });

  // update tween
  TWEEN.update();

  // Update Orbital Controls
  controls.update();

  // Update spotlight target
  light.target.updateMatrixWorld(); // Ensure the spotlight target is updated
  scene.updateMatrixWorld();

  checkGameOver();
}

function randomDelayTime() {
  return Math.random() * 10000;
}

function animateEnemy(enemyClone, startX, endX, delayTime, index) {
  endX = enemyClone.position.x > 0 ? 1 : -1;
  head = heads[index];

  startTween = new TWEEN.Tween(enemyClone.position)
    .to({ x: endX }, 10000) // 10 seconds to move to x:0
    .delay(delayTime)
    .onStart(() => {
      enemyDeadFlags[index] = false;
      console.log("Starting startTween for enemy index:", index);

      // set mixer and animation clips
      const mixer = new THREE.AnimationMixer(enemyClone);

      const deathClip = THREE.AnimationClip.findByName(
        clips,
        "EnemyArmature|EnemyArmature|EnemyArmature|Death"
      );
      const deathAction = mixer.clipAction(deathClip);
      deathAction.setEffectiveTimeScale(0.3);
      deathAction.clampWhenFinished = true;
      deathAction.setLoop(THREE.LoopOnce);
      deathActions[index] = deathAction;

      const walkClip = THREE.AnimationClip.findByName(
        clips,
        "EnemyArmature|EnemyArmature|EnemyArmature|Walk"
      );
      const walkAction = mixer.clipAction(walkClip);
      walkAction.setEffectiveTimeScale(0.9);
      walkActions[index] = walkAction;
      walkAction.play();

      const attackClip = THREE.AnimationClip.findByName(
        clips,
        "EnemyArmature|EnemyArmature|EnemyArmature|Attack"
      );
      const attackAction = mixer.clipAction(attackClip);
      attackAction.setEffectiveTimeScale(0.02);
      attackActions[index] = attackAction;
      attackAction.play();

      mixers[index] = mixer;

      const anything = enemiesCurrentPosition[index];
      const audio = anything.children[1];
      audio.play();
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(() => {
      endX > 0
        ? enemyClone.rotateY(Math.PI / 2)
        : enemyClone.rotateY(-Math.PI / 2);
      //rotateTowardsTarget(enemyClone, camera.position, 2000); // Rotate towards camera position over 2 seconds
      //head.lookAt(target2.position, enemiesCurrentPosition[index], enemyClone.up);
    });

  backTween = new TWEEN.Tween(enemyClone.position)
    .to({ x: 0, z: 15 }, 7000) // 7 seconds to move towards the player

    .easing(TWEEN.Easing.Circular.In)
    .onComplete(() => {});

  startTweens[index] = startTween;
  backTweens[index] = backTween;

  startTween.chain(backTween);
  backTween.chain(startTween);

  startTween.start();
}

function enemyDeathAndReset(enemyClone, index) {
  if (enemyDeadFlags[index]) {
    return;
  }
  const zombeDeathSoundLoader = new THREE.AudioLoader();
  zombeDeathSoundLoader.load("/zombiedeath.mp3", function (buffer) {
    const deathSound = new THREE.Audio(listener);
    deathSound.setBuffer(buffer);
    deathSound.setLoop(false);
    deathSound.setVolume(0.6);
    deathSound.play();
  });

  deathAction = deathActions[index];
  walkAction = walkActions[index];
  attackAction = attackActions[index];
  deathTween = deathTweens[index];
  startTween = startTweens[index];
  backTween = backTweens[index];

  walkAction.stop();
  attackAction.stop();
  deathAction.reset().play();

  enemyDeadFlags[index] = true;

  TWEEN.remove(startTween);
  TWEEN.remove(backTween);

  deathTween = new TWEEN.Tween(enemiesCurrentPosition[index])
    .to({ y: -3 }, 3000) // 3 seconds to sink under ground
    .easing(TWEEN.Easing.Linear.None)
    .onComplete(() => {
      enemyClone.position.copy(enemyPosArray[index]);
      enemyClone.position.y = 0;
      enemyDeadFlags[index] = false;
      animateEnemy(
        enemyClone,
        enemyPosArray[index].x,
        endX,
        randomDelayTime(),
        index
      );
    });
  deathTweens[index] = deathTween;
  deathTween.start();

  score++;
  //set domelement
  document.getElementById(
    "score"
  ).innerHTML = `<h1>Zombies killed: ${score}</h1>`;
}

function gameOver() {
  gameRunning = false;
  document.getElementById("gameOverMessage").style.display = "block";
}

function checkGameOver() {
  for (let i = 0; i < enemiesCurrentPosition.length; i++) {
    if (enemiesCurrentPosition[i].position.z >= 15) {
      gameOver();
      break;
    }
  }
}

// Eventlisteners

document.getElementById("startButton").addEventListener("click", () => {
  startGame();
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
      //for each pineTreeClone
      pineTreesArray.forEach((pineTreeClone) => {
        //if the raycaster intersect with object is more than 0 (it hits an pineTreeClone)
        if (raycaster.intersectObject(pineTreeClone).length > 0) {
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
