import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

// Function to smoothly rotate an object towards a target position
export function rotateTowardsTarget(object, targetPosition, duration) {
  // Calculate the quaternion rotation towards the target position
  const targetQuaternion = new THREE.Quaternion();
  object.lookAt(targetPosition);
  object.getWorldQuaternion(targetQuaternion);

  // Store the initial rotation
  const initialQuaternion = object.quaternion.clone();

  // Tween the rotation from initialQuaternion to targetQuaternion
  new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, duration)
    .onUpdate(function () {
      object.quaternion.slerp(targetQuaternion, this.t);
    })
    .start();
}

// Example usage:
// Call rotateTowardsTarget function after the startTween is finished
//startTween.onComplete(() => {
//  rotateTowardsTarget(enemyClone, camera.position, 2000); // Rotate towards camera position over 2 seconds
//});
