import { expect, test, type Download, type Page } from '@playwright/test';

// 1 辺 2 の立方体メッシュ(ノード名 'Cube')だけを含む GLB ファイルです
const cubeGlb = new URL('./fixtures/cube.glb', import.meta.url).pathname;

/**
 * ダウンロードされた GLB をページ内で読み込み、ヘッダと JSON チャンクを取り出します。
 * @param {Page} page - ページ
 * @param {Download} download - ダウンロード
 * @returns {Promise<{ magic: string, json: any }>} マジックナンバーと JSON チャンクの内容
 */
const readDownloadedGlb = (page: Page, download: Download) => page.evaluate(async (url) => {
  const glb = await (await fetch(url)).arrayBuffer();
  const length = new DataView(glb).getUint32(12, true);
  return {
    magic: new TextDecoder().decode(new Uint8Array(glb, 0, 4)),
    json: JSON.parse(new TextDecoder().decode(new Uint8Array(glb, 20, length))),
  };
}, download.url());

/**
 * fixture の GLB をアップロードし、シーンに追加されるまで待ちます。
 * @param {Page} page - ページ
 */
const uploadCube = async (page: Page) => {
  const loaded = page.waitForEvent('console', (message) => message.text() === 'GLB file loaded and added to the scene.');
  await page.locator('#file-input').setInputFiles(cubeGlb);
  await loaded;
};

/**
 * Download GLB ボタンを押し、ダウンロードされた GLB を返します。
 * @param {Page} page - ページ
 * @returns {Promise<{ filename: string, magic: string, json: any }>} ファイル名と GLB の内容
 */
const downloadGlb = async (page: Page) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download GLB Format' }).click(),
  ]);
  return { filename: download.suggestedFilename(), ...await readDownloadedGlb(page, download) };
};

/**
 * キャンバスの表示サイズを返します。
 * @param {Page} page - ページ
 * @returns {Promise<number[]>} [幅, 高さ]
 */
const canvasSize = (page: Page) => page.locator('canvas.webgl').evaluate((canvas) => [canvas.clientWidth, canvas.clientHeight]);

let errors: string[];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    // favicon は用意していないため、その 404 は無視する
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(message.text());
  });
  await page.goto('./');
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('ボタンとキャンバスが表示される', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Download GLB Format' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload GLB File' })).toBeVisible();

  const viewport = page.viewportSize()!;
  expect(await canvasSize(page)).toEqual([viewport.width, viewport.height - 60]);
});

test('Upload GLB File ボタンでファイル選択を開く', async ({ page }) => {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Upload GLB File' }).click(),
  ]);
  await chooser.setFiles(cubeGlb);

  await expect.poll(() => page.locator('#file-input').evaluate((input: HTMLInputElement) => input.files?.[0]?.name)).toBe('cube.glb');
});

test('読み込んだモデルを GLB でダウンロードでき、カメラとライトは含まれない', async ({ page }) => {
  await uploadCube(page);

  const { filename, magic, json } = await downloadGlb(page);

  expect(filename).toBe('scene.glb');
  expect(magic).toBe('glTF');
  expect(json.nodes.map((node: { name?: string }) => node.name)).toContain('Cube');
  expect(json.cameras).toBeUndefined();
  expect(json.extensionsUsed ?? []).not.toContain('KHR_lights_punctual');
  // AmbientLight は glTF のライトにならず中身のないノードとして出力されるため、空ノードが無いことも確かめる
  expect(json.nodes.filter((node: { mesh?: number, children?: number[] }) => node.mesh === undefined && !node.children)).toEqual([]);
});

test('続けてダウンロードしても同じ内容になる', async ({ page }) => {
  await uploadCube(page);

  const first = await downloadGlb(page);
  const second = await downloadGlb(page);

  expect(second.json.nodes).toEqual(first.json.nodes);
  expect(second.json.cameras).toBeUndefined();
});

test('ウィンドウサイズに合わせてキャンバスの大きさが変わる', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 });

  await expect.poll(() => canvasSize(page)).toEqual([600, 840]);
});
