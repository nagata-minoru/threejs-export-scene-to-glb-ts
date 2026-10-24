import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { exportSceneAsGlb } from './exportScene';

/**
 * GLTFExporter が使う FileReader の、Node.js 向けの最小限の代替実装です。
 */
class FileReaderStub {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;

  readAsArrayBuffer = (blob: Blob) => {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  };
}

/**
 * GLB データから JSON チャンクを取り出します。
 * @param {ArrayBuffer} glb - GLB データ
 * @returns {any} JSON チャンクの内容
 */
const readGlbJson = (glb: ArrayBuffer) => {
  const length = new DataView(glb).getUint32(12, true);
  return JSON.parse(new TextDecoder().decode(new Uint8Array(glb, 20, length)));
};

/**
 * アプリと同じ構成(メッシュ・カメラ・ライト)のシーンを作ります。
 * @returns {{ scene: THREE.Scene, mesh: THREE.Mesh, excluded: THREE.Object3D[] }} シーンと、その中のメッシュ・除外対象
 */
const createScene = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  const ambientLight = new THREE.AmbientLight(0x404040);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  mesh.name = 'Cube';
  scene.add(camera, directionalLight, ambientLight, mesh);
  return { scene, mesh, excluded: [camera, directionalLight, ambientLight] };
};

describe('exportSceneAsGlb', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', FileReaderStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('GLB 形式で出力する', async () => {
    const { scene, excluded } = createScene();

    const glb = await exportSceneAsGlb(scene, excluded);

    const view = new DataView(glb);
    expect(new TextDecoder().decode(new Uint8Array(glb, 0, 4))).toBe('glTF');
    expect(view.getUint32(4, true)).toBe(2);
    expect(view.getUint32(8, true)).toBe(glb.byteLength);
  });

  it('カメラとライトを除外し、メッシュだけを出力する', async () => {
    const { scene, excluded } = createScene();

    const json = readGlbJson(await exportSceneAsGlb(scene, excluded));

    expect(json.nodes.map((node: { name?: string }) => node.name)).toEqual(['Cube']);
    expect(json.meshes).toHaveLength(1);
    expect(json.cameras).toBeUndefined();
    expect(json.extensionsUsed ?? []).not.toContain('KHR_lights_punctual');
  });

  it('出力した GLB を GLTFLoader で読み戻せる', async () => {
    const { scene, mesh, excluded } = createScene();

    const glb = await exportSceneAsGlb(scene, excluded);
    const gltf = await (new GLTFLoader()).parseAsync(glb, '');

    const loaded = gltf.scene.getObjectByName('Cube') as THREE.Mesh;
    expect(loaded).toBeInstanceOf(THREE.Mesh);
    expect(loaded.geometry.attributes.position.count).toBe(mesh.geometry.attributes.position.count);
  });

  it('成功後、除外したオブジェクトをシーンに戻す', async () => {
    const { scene, excluded } = createScene();

    await exportSceneAsGlb(scene, excluded);

    for (const object of excluded) {
      expect(object.parent).toBe(scene);
    }
  });

  it('失敗してもエラーを返し、除外したオブジェクトをシーンに戻す', async () => {
    const { scene, excluded } = createScene();
    const error = new Error('export failed');
    vi.spyOn(GLTFExporter.prototype, 'parseAsync').mockRejectedValue(error);

    await expect(exportSceneAsGlb(scene, excluded)).rejects.toBe(error);

    for (const object of excluded) {
      expect(object.parent).toBe(scene);
    }
  });
});
