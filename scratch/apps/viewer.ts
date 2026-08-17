import '../style.css';
import { objectRegistry } from './objectDatabase';
import { MapControls } from '../controls';
import { TileType, getTileColor } from '../tiles';

const GRID_SIZE = 5;
const PAN_STEP = 50;
const ZOOM_STEP = 0.1;

type DisplayMode = 'floating' | 'grid';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('#app not found');

// Scene structure: viewer-scene > viewer-scene-inner (MapControls target)
const viewerScene = document.createElement('div');
viewerScene.className = 'viewer-scene';

const sceneInner = document.createElement('div');
sceneInner.className = 'viewer-scene-inner';
viewerScene.appendChild(sceneInner);

const controls = new MapControls(sceneInner);

let selectedId = objectRegistry[0]?.id ?? '';
let displayMode: DisplayMode = 'floating';

function buildMinimalGrid(): HTMLElement {
  const mapContainer = document.createElement('div');
  mapContainer.className = 'isometric-map';
  mapContainer.style.width = `${GRID_SIZE * 32}px`;
  mapContainer.style.height = `${GRID_SIZE * 32}px`;
  mapContainer.style.transform = 'rotate(45deg)';

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const tileEl = document.createElement('div');
      tileEl.className = 'tile';
      tileEl.style.backgroundColor = getTileColor(TileType.GRASS);
      tileEl.style.left = `${x * 32}px`;
      tileEl.style.top = `${y * 32}px`;
      mapContainer.appendChild(tileEl);
    }
  }

  const centerCol = Math.floor(GRID_SIZE / 2);
  const centerRow = Math.floor(GRID_SIZE / 2);
  const objectCell = document.createElement('div');
  objectCell.className = 'viewer-object-cell';
  objectCell.style.left = `${centerCol * 32}px`;
  objectCell.style.top = `${centerRow * 32}px`;
  mapContainer.appendChild(objectCell);

  return mapContainer;
}

function renderObject() {
  const entry = objectRegistry.find((e) => e.id === selectedId);
  if (!entry) return;

  const obj = entry.create();

  sceneInner.innerHTML = '';

  if (displayMode === 'floating') {
    const wrap = document.createElement('div');
    wrap.className = 'viewer-floating-wrap';
    wrap.style.width = '100%';
    wrap.style.height = '100%';
    wrap.style.position = 'relative';
    wrap.appendChild(obj);
    sceneInner.appendChild(wrap);
  } else {
    const gridWrap = document.createElement('div');
    gridWrap.style.display = 'flex';
    gridWrap.style.alignItems = 'center';
    gridWrap.style.justifyContent = 'center';
    gridWrap.style.width = '100%';
    gridWrap.style.height = '100%';
    const grid = buildMinimalGrid();
    const cell = grid.querySelector('.viewer-object-cell')!;
    cell.appendChild(obj);
    gridWrap.appendChild(grid);
    sceneInner.appendChild(gridWrap);
  }
}

// --- Controls UI ---
const controlsContainer = document.createElement('div');
controlsContainer.className = 'controls';

// Object selector
const objectGroup = document.createElement('div');
objectGroup.className = 'control-group';
objectGroup.innerHTML = '<div class="control-label">Object</div>';
const objectSelect = document.createElement('select');
objectSelect.className = 'control-btn';
objectSelect.style.width = '100%';
objectSelect.style.minHeight = '40px';
for (const e of objectRegistry) {
  const opt = document.createElement('option');
  opt.value = e.id;
  opt.textContent = e.name;
  objectSelect.appendChild(opt);
}
objectSelect.value = selectedId;
objectSelect.addEventListener('change', () => {
  selectedId = objectSelect.value;
  renderObject();
});
objectGroup.appendChild(objectSelect);
controlsContainer.appendChild(objectGroup);

// Display mode
const modeGroup = document.createElement('div');
modeGroup.className = 'control-group';
modeGroup.innerHTML = '<div class="control-label">Display</div>';
const modeSelect = document.createElement('select');
modeSelect.className = 'control-btn';
modeSelect.style.width = '100%';
modeSelect.style.minHeight = '40px';
const optFloating = document.createElement('option');
optFloating.value = 'floating';
optFloating.textContent = 'Floating';
const optGrid = document.createElement('option');
optGrid.value = 'grid';
optGrid.textContent = 'On grid';
modeSelect.appendChild(optFloating);
modeSelect.appendChild(optGrid);
modeSelect.value = displayMode;
modeSelect.addEventListener('change', () => {
  displayMode = modeSelect.value as DisplayMode;
  renderObject();
});
modeGroup.appendChild(modeSelect);
controlsContainer.appendChild(modeGroup);

// Pan
const panGroup = document.createElement('div');
panGroup.className = 'control-group';
panGroup.innerHTML = '<div class="control-label">Pan</div>';
const panGrid = document.createElement('div');
panGrid.className = 'pan-grid';
const panUp = document.createElement('button');
panUp.className = 'control-btn pan-btn';
panUp.textContent = '↑';
panUp.addEventListener('click', () => controls.pan(0, -PAN_STEP));
const panDown = document.createElement('button');
panDown.className = 'control-btn pan-btn';
panDown.textContent = '↓';
panDown.addEventListener('click', () => controls.pan(0, PAN_STEP));
const panLeft = document.createElement('button');
panLeft.className = 'control-btn pan-btn';
panLeft.textContent = '←';
panLeft.addEventListener('click', () => controls.pan(-PAN_STEP, 0));
const panRight = document.createElement('button');
panRight.className = 'control-btn pan-btn';
panRight.textContent = '→';
panRight.addEventListener('click', () => controls.pan(PAN_STEP, 0));
panGrid.appendChild(document.createElement('div'));
panGrid.appendChild(panUp);
panGrid.appendChild(document.createElement('div'));
panGrid.appendChild(panLeft);
panGrid.appendChild(document.createElement('div'));
panGrid.appendChild(panRight);
panGrid.appendChild(document.createElement('div'));
panGrid.appendChild(panDown);
panGrid.appendChild(document.createElement('div'));
panGroup.appendChild(panGrid);
controlsContainer.appendChild(panGroup);

// Zoom
const zoomGroup = document.createElement('div');
zoomGroup.className = 'control-group';
zoomGroup.innerHTML = '<div class="control-label">Zoom</div>';
const zoomButtons = document.createElement('div');
zoomButtons.className = 'zoom-buttons';
const zoomIn = document.createElement('button');
zoomIn.className = 'control-btn zoom-btn';
zoomIn.textContent = '+';
zoomIn.addEventListener('click', () => controls.zoom(ZOOM_STEP));
const zoomOut = document.createElement('button');
zoomOut.className = 'control-btn zoom-btn';
zoomOut.textContent = '−';
zoomOut.addEventListener('click', () => controls.zoom(-ZOOM_STEP));
zoomButtons.appendChild(zoomIn);
zoomButtons.appendChild(zoomOut);
zoomGroup.appendChild(zoomButtons);
controlsContainer.appendChild(zoomGroup);

app.appendChild(controlsContainer);
app.appendChild(viewerScene);

renderObject();
