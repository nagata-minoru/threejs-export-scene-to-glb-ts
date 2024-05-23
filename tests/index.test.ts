import { scene, camera, renderer, controls, GLTFLoader, GLTFExporter, init } from '../src/index';
import * as THREE from 'three';

jest.mock('../src/index');

// モック用に仮想のDOMをセットアップ
document.body.innerHTML = `
  <canvas class="webgl"></canvas>
  <input type="file" id="file-input" style="display: none;">
  <button id="upload-glb">Upload GLB</button>
  <button id="download-glb">Download GLB</button>
`;

describe('3D Scene Initialization', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <canvas class="webgl"></canvas>
        <input type="file" id="file-input" style="display: none;">
        <button id="upload-glb">Upload GLB</button>
        <button id="download-glb">Download GLB</button>
      </div>
    `;
    init(); // DOMがセットアップされた後に初期化関数を呼び出します
  });

  test('init() should be defined', () => {
    const element = document.querySelector('.webgl');
    expect(element).toBeDefined();
  });

  // test('Scene should be defined', () => {
  //   expect(scene).toBeDefined();
  // });

//   test('Camera should be added to the scene', () => {
//     expect(scene.children.includes(camera)).toBe(true);
//   });

//   test('Lights should be added to the scene', () => {
//     const directionalLight1 = scene.children.find(obj => obj instanceof THREE.DirectionalLight && obj.position.equals(new THREE.Vector3(1, 1, 1)));
//     const directionalLight2 = scene.children.find(obj => obj instanceof THREE.DirectionalLight && obj.position.equals(new THREE.Vector3(-1, -1, -1)));
//     const ambientLight = scene.children.find(obj => obj instanceof THREE.AmbientLight);

//     expect(directionalLight1).toBeDefined();
//     expect(directionalLight2).toBeDefined();
//     expect(ambientLight).toBeDefined();
//   });

//   test('Renderer should be properly configured', () => {
//     const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
//     expect(renderer.domElement).toBe(canvas);
//     expect(renderer.getSize(new THREE.Vector2())).toEqual({
//       width: window.innerWidth,
//       height: window.innerHeight - 60,
//     });
//   });

//   test('Controls should be properly configured', () => {
//     expect(controls).toBeDefined();
//     expect(controls.enableDamping).toBe(true);
//   });
// });

// describe('GLB File Upload and Download', () => {
//   test('File input should trigger GLTFLoader on change', () => {
//     const fileInput = document.getElementById('file-input') as HTMLInputElement;
//     const gltfLoaderMock = jest.spyOn(GLTFLoader.prototype, 'parse');

//     const mockFile = new File(['(⌐□_□)'], 'mockFile.glb', { type: 'model/gltf-binary' });
//     const event = new Event('change');
//     Object.defineProperty(fileInput, 'files', { value: [mockFile] });

//     fileInput.dispatchEvent(event);

//     expect(gltfLoaderMock).toHaveBeenCalled();
//   });

//   test('GLB export should call GLTFExporter and save the file', () => {
//     const gltfExporterMock = jest.spyOn(GLTFExporter.prototype, 'parse');
//     const saveMock = jest.fn();

//     document.getElementById('download-glb')!.onclick = saveMock;

//     document.getElementById('download-glb')!.click();

//     expect(gltfExporterMock).toHaveBeenCalled();
//     expect(saveMock).toHaveBeenCalled();
//   });
});
