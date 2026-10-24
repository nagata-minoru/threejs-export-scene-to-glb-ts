import * as THREE from 'three';

/**
 * オブジェクト全体が画面に収まるようにカメラの位置・描画範囲・向きを調整します📏📐
 * @param {THREE.PerspectiveCamera} camera - 調整するカメラ
 * @param {THREE.Object3D} object - 画面に収めたいオブジェクト
 * @returns {THREE.Vector3} オブジェクトのバウンディングボックスの中心(カメラの注視点)
 */
export const fitCameraToObject = (camera: THREE.PerspectiveCamera, object: THREE.Object3D) => {
  // モデルのバウンディングボックスを計算します
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // ビューポートに合わせてカメラの位置を調整
  // モデルを包む球が、縦・横のうち狭い方の視野角に収まる距離を求めます
  const radius = size.length() / 2;
  const vFov = camera.fov * (Math.PI / 180);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  let cameraZ = radius / Math.sin(Math.min(vFov, hFov) / 2);

  // カメラが近すぎる場合や遠すぎる場合の微調整
  cameraZ *= 1.2; // オブジェクトに少し余裕を持たせる
  camera.position.z = center.z + cameraZ;

  // モデルの大きさに合わせて描画範囲を調整し、大きなモデルが切れないようにします
  camera.near = cameraZ / 100;
  camera.far = cameraZ * 100;
  camera.updateProjectionMatrix();

  // 新しい位置からのオブジェクトの注視点を設定
  const direction = new THREE.Vector3().subVectors(camera.position, center).normalize();
  camera.position.addVectors(center, direction.multiplyScalar(cameraZ));
  camera.lookAt(center);

  return center;
};
