import * as THREE from 'three';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

/**
 * 指定したオブジェクトを除外して、シーンを GLB 形式でエクスポートします📦
 * 除外したオブジェクトは、成功・失敗どちらの場合も必ずシーンに戻します🔁
 * @param {THREE.Scene} scene - エクスポートするシーン
 * @param {THREE.Object3D[]} excluded - エクスポート対象から除外するオブジェクト
 * @returns {Promise<ArrayBuffer>} GLB 形式のデータ
 */
export const exportSceneAsGlb = async (scene: THREE.Scene, excluded: THREE.Object3D[]) => {
  scene.remove(...excluded);
  try {
    return await (new GLTFExporter()).parseAsync(scene, { binary: true }) as ArrayBuffer;
  } finally {
    scene.add(...excluded);
  }
};
