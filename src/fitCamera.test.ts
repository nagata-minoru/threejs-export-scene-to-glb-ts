import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import { fitCameraToObject } from './fitCamera';

/**
 * 指定した中心・大きさの箱型メッシュを作ります。
 * @param {THREE.Vector3} center - 箱の中心
 * @param {THREE.Vector3} size - 箱の大きさ
 * @returns {THREE.Mesh} 箱型メッシュ
 */
const createBox = (center: THREE.Vector3, size: THREE.Vector3) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z));
  mesh.position.copy(center);
  mesh.updateMatrixWorld();
  return mesh;
};

/**
 * オブジェクトのバウンディングボックスの 8 頂点を、カメラの正規化デバイス座標に変換します。
 * @param {THREE.PerspectiveCamera} camera - カメラ
 * @param {THREE.Object3D} object - 対象のオブジェクト
 * @returns {THREE.Vector3[]} 正規化デバイス座標の配列
 */
const projectCorners = (camera: THREE.PerspectiveCamera, object: THREE.Object3D) => {
  const { min, max } = new THREE.Box3().setFromObject(object);
  camera.updateMatrixWorld();
  return [min.x, max.x].flatMap((x) => [min.y, max.y].flatMap((y) => [min.z, max.z].map((z) => (
    new THREE.Vector3(x, y, z).project(camera)
  ))));
};

describe('fitCameraToObject', () => {
  const cases = [{
    name: '横長の画面', aspect: 16 / 9, center: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(2, 2, 2),
  }, {
    name: '縦長の画面', aspect: 9 / 16, center: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(2, 2, 2),
  }, {
    name: '横に細長いモデル', aspect: 9 / 16, center: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(20, 1, 1),
  }, {
    name: '原点から離れた大きなモデル', aspect: 16 / 9, center: new THREE.Vector3(500, -200, 300), size: new THREE.Vector3(1000, 400, 800),
  }, {
    name: 'とても小さなモデル', aspect: 4 / 3, center: new THREE.Vector3(0.01, 0, 0), size: new THREE.Vector3(0.001, 0.001, 0.001),
  }];

  it.each(cases)('$name でもモデル全体が画面と描画範囲に収まる', ({ aspect, center, size }) => {
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
    camera.position.set(0, 1, 3);
    const box = createBox(center, size);

    fitCameraToObject(camera, box);

    for (const corner of projectCorners(camera, box)) {
      expect(Math.abs(corner.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(corner.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(corner.z)).toBeLessThanOrEqual(1);
    }
  });

  it('バウンディングボックスの中心を返し、カメラはその中心を向く', () => {
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 100);
    camera.position.set(0, 1, 3);
    const center = new THREE.Vector3(3, 4, -5);

    const result = fitCameraToObject(camera, createBox(center, new THREE.Vector3(2, 2, 2)));

    expect(result.toArray()).toEqual(center.toArray());
    const forward = camera.getWorldDirection(new THREE.Vector3());
    const toCenter = center.clone().sub(camera.position).normalize();
    expect(forward.dot(toCenter)).toBeCloseTo(1, 6);
  });

  it('モデルの大きさに応じて near / far を設定する', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.set(0, 1, 3);

    fitCameraToObject(camera, createBox(new THREE.Vector3(), new THREE.Vector3(1000, 1000, 1000)));

    const distance = camera.position.length();
    expect(camera.near).toBeCloseTo(distance / 100);
    expect(camera.far).toBeCloseTo(distance * 100);
  });
});
