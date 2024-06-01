import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./style.css";
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

//model licence text
//Church by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/0Oe72PEPCK6)
//Pine tree by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/7rTNpk6j01O)
//Analog clock by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/5gAoMR2YHs3)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Debug
//const gui = new GUI();

// consts
let enemyHit;
let pineTreeHit;
let isDead;
let endX;
let heads = [];
let walkActions = [];
let attackActions = [];
let deathActions = [];
let startTweens = [];
let backTweens = [];
let deathTweens = [];

let startTween;
let backTween;
let deathTween;
let walkAction;
let attackAction;
let deathAction;

//THREE.ColorManagement.legacyMode = false;

let i = 0;

// canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const geometry = new THREE.SphereGeometry(1, 16, 16);
//const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const material = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("/moon.jpg"),
});

const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(10, 7, -10);
scene.add(sphere); // the mooon

//mouse and light target
const target = new THREE.Object3D();
target.position.z = -2;
scene.add(target);

//target object behind camera
const target2 = new THREE.Object3D();
target2.position.set(0, 4, 15);
scene.add(target2);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  1,
  1000
);
camera.position.set(0, 2, 14);
scene.add(camera);

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

// Loader

// Load church model

const churchLoader = new GLTFLoader();
let church;

churchLoader.load(
  "/Church.glb",
  function (gltf) {
    church = gltf.scene;
    church.scale.set(0.1, 0.1, 0.1);
    church.position.set(0, 0, -15);
    church.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(church);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// load clock model

const analogclockLoader = new GLTFLoader();
let ananlogclock;

analogclockLoader.load(
  "/Analogclock.glb",
  function (gltf) {
    ananlogclock = gltf.scene;
    ananlogclock.scale.set(0.05, 0.05, 0.05);
    ananlogclock.rotateY(-Math.PI / 2);
    ananlogclock.position.set(0, 5, -10.9);
    scene.add(ananlogclock);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Load pinetree model
const pineLoader = new GLTFLoader();

const pineTreesArray = [];

pineLoader.load(
  "/Pinetree.glb",
  function (gltf) {
    gltf.scene.scale.set(2, 2, 2); // set scale/size of model
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    //for every cooardinates(items) in the array render a copy of the loaded model
    //and place it according to the cooardinates in that position in the array
    for (i = 0; i < pineTreesPosArray.length; i++) {
      let pineTree = gltf.scene.clone();
      pineTree.position.copy(pineTreesPosArray[i]);
      scene.add(pineTree);
      pineTreesArray.push(pineTree);
    }
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// load zombie model
const zombieLoader = new GLTFLoader();

let enemy;
let head;
let clips;
const mixers = [];
const enemiesCurrentPosition = [];
const enemyDeadFlags = [];

zombieLoader.load(
  "/Zombie.glb",
  function (gltf) {
    clips = gltf.animations;
    enemy = gltf.scene;
    enemy.scale.set(0.5, 0.5, 0.5);
    enemy.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    //for every cooardinates(items) in the array render a copy of the loaded model
    //and place it according to the cooardinates in that position in the array
    //also add a mixer and walk and attack animation to each model
    for (i = 0; i < enemyPosArray.length; i++) {
      let enemyClone = SkeletonUtils.clone(enemy);
      enemyClone.position.copy(enemyPosArray[i]);

      if (enemyClone.position.x > 0) {
        enemyClone.rotation.y = -Math.PI / 2;
      } else {
        enemyClone.rotation.y = Math.PI / 2;
      }

      heads[i] = enemyClone.getObjectByName("Head");
      scene.add(enemyClone);
      enemiesCurrentPosition[i] = enemyClone;
      enemyDeadFlags[i] = false;

      //const delayTime = Math.random() * 10000;
      const startX = enemyClone.position.x;
      endX = enemyClone.position.x > 0 ? 1 : -1;
      animateEnemy(enemyClone, startX, endX, randomDelayTime(), i);
    }
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Lights

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

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);

//mouse controlled spotlight
let light = new THREE.SpotLight(0xffffff, 3, 100, 0.1, 0.2, 0);
light.position.copy(camera.position);
light.castShadow = true;
light.target = target;
scene.add(light);

// mouse position consts
const intersectionPoint = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Eventlisteners

window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / sizes.width) * 2 - 1;
  mousePosition.y = -(e.clientY / sizes.height) * 2 + 1;
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
  raycaster.setFromCamera(mousePosition, camera);
  if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
    target.position.copy(intersectionPoint);
  }

  // Clear the message before checking for intersections
  document.getElementById("zombiehit").innerHTML = "";

  // is the light shining on any enemy? (is the raycaster point hitting any part of any enemy?)
  enemyHit = false;
  pineTreeHit = false;
  enemiesCurrentPosition.forEach((enemyClone, index) => {
    if (raycaster.intersectObject(enemyClone).length > 0) {
      enemyHit = true;

      pineTreesArray.forEach((pineTree) => {
        if (raycaster.intersectObject(pineTree).length > 0) {
          pineTreeHit = true;
        }
      });

      if (!pineTreeHit && !enemyDeadFlags[index]) {
        enemyDeathAndReset(enemyClone, index);
        document.getElementById("zombiehit").innerHTML =
          "<h1>The Zombie is Hit</h1>";
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

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Controls
const controls = new OrbitControls(camera, canvas);

// functions

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
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(() => {
      endX > 0
        ? enemyClone.rotateY(Math.PI / 2)
        : enemyClone.rotateY(-Math.PI / 2);
    });

  backTween = new TWEEN.Tween(enemyClone.position)
    .to({ x: 0, z: 15 }, 7000) // 7 seconds to move towards the player
    .onStart(() => {
      head.lookAt(target2.position);
    })
    .easing(TWEEN.Easing.Circular.In)
    .onComplete(() => {
      endX > 0 ? enemyClone.rotateY(Math.PI) : enemyClone.rotateY(-Math.PI);
    });

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
  if (startTween) {
    console.log("not removed");
  } else {
    ("yes suceccfully removed");
  }

  deathTween = new TWEEN.Tween(enemiesCurrentPosition[index])
    .to({ y: -1 }, 3000) // 3 seconds to sink under ground
    .easing(TWEEN.Easing.Linear.None)
    .onComplete(() => {
      enemyClone.position.copy(enemyPosArray[index]);
      enemyClone.position.y = 0;
      isDead = false;
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
  console.log(TWEEN.getAll());
}

/**
 * Animate
 */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixers.forEach((mixer) => {
    mixer.update(delta);
  });

  // update tween
  TWEEN.update();

  // Update Orbital Controls
  controls.update();

  //update shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Update spotlight target
  light.target.updateMatrixWorld(); // Ensure the spotlight target is updated

  // Render
  renderer.render(scene, camera);
}

animate();

/* function enemyDeathAndReset(enemyClone, index) {
  const mixer = mixers[index];
  const isDead = enemyDeadFlags[index];

  if (isDead) {
    return;
  }

  const deathClip = THREE.AnimationClip.findByName(
    clips,
    "EnemyArmature|EnemyArmature|EnemyArmature|Death"
  );
  const deathAction = mixer.clipAction(deathClip);
  deathAction.setEffectiveTimeScale(0.3);

  const walkClip = THREE.AnimationClip.findByName(
    clips,
    "EnemyArmature|EnemyArmature|EnemyArmature|Walk"
  );
  const walkAction = mixer.clipAction(walkClip);
  walkAction.setEffectiveTimeScale(0.9);

  const attackClip = THREE.AnimationClip.findByName(
    clips,
    "EnemyArmature|EnemyArmature|EnemyArmature|Attack"
  );
  const attackAction = mixer.clipAction(attackClip);
  attackAction.setEffectiveTimeScale(0.02);

  attackAction.stop();
  walkAction.stop();

  deathAction.reset().play();
  enemyDeadFlags[index] = true;

  deathAction.clampWhenFinished = true;
  deathAction.loop = THREE.LoopOnce;

  deathAction.onComplete(() => {
    enemyClone.visible = false;

    enemyClone.position.copy(enemyPosArray[index]);
    enemyDeadFlags[index] = false;

    setTimeout(() => {
      enemyClone.visible = true;
      const endX = enemyClone.position.x > 0 ? -1 : 1;
      new TWEEN.Tween(enemyClone.position)
        .to({ x: endX }, 10000)
        .repeat(Infinity)
        .yoyo(true)
        .start();

      walkAction.reset().play();
    }, 5000);
  });
} */

//Zombie animations Attack, Death, HitRecive, Idle, Jump, Run, Walk

// IMPORTANT ABOUT SPOTLIGHT! Set Decay to 0
// SpotLight( color, intensity, distance, angle, penumbra, decay)

//renderer.outputEncoding = THREE.sRGBEncoding;
//renderer.toneMapping = THREE.ACESFilmicToneMapping;

/* const deathClip = THREE.AnimationClip.findByName(
  clips,
  "EnemyArmature|EnemyArmature|EnemyArmature|Death"
);
const deathAction = mixer.clipAction(deathClip);
deathAction.setEffectiveTimeScale(0.3);
if (deathHit) {
  walkAction.reset();
  attackAction.reset();
  deathAction.play();
  //animateEnemy();
} */

// Ensure the animation loop is set to `animate`
//renderer.setAnimationLoop(animate);

/* // for getting glow on clock
const analogclocktarget = new THREE.WebGLRenderTarget(
  sizes.width,
  sizes.height,
  {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    encoding: THREE.sRGBEncoding,
  }
);
analogclocktarget.samples = 8;
const composer = new EffectComposer(renderer, analogclocktarget);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(undefined, 1, 1, 1)); */

/*   if (zombie) {
    console.log("Zombie position before:", zombie.position.x);
    if (zombie.position.x >= 5) {
      deltaX = -deltaX; // Reverse direction when target is reached
    } else if (zombie.position.x <= 2) {
      deltaX = -deltaX; // Reverse direction when reaching initial position
    }
    zombie.position.x += deltaX; // Update zombie position
    console.log("Zombie position after:", zombie.position.x);
  } */

/* 
  enemypositionsArray = []
  
  let pineTreesPosArray = [
  new THREE.Vector3(2.5, 1.8, 2),
  new THREE.Vector3(-2.5, 1.8, 2),
  new THREE.Vector3(-3, 1.8, 4),
  new THREE.Vector3(3, 1.8, 4),
  new THREE.Vector3(-3, 1.8, 8),
  new THREE.Vector3(3, 1.8, 8),
  ];

  for each enemyposition place zombie
      if x value is negative
        rotate model
          play animations

  if zombie is hit by light
      play death animation
        remove that zombie
          put zombie in start position
            play animation again

            
    TWEEN animation starts and random times on each zombie





    

  */
