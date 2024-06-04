import * as THREE from "three";

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export function setupScene() {
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

  //mouse controlled spotlight
  let light = new THREE.SpotLight(0xffffff, 3, 100, 0.1, 0.2, 0);
  light.position.copy(camera.position);
  light.castShadow = true;
  light.target = target;
  scene.add(light);

  return { scene, camera, light, target, target2 };
}
export default setupScene;
