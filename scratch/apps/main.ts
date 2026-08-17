import '../style.css'
import { createSampleMap } from '../map'
import { renderMap } from '../renderer'
import { MapControls } from '../controls'

const app = document.querySelector<HTMLDivElement>('#app')!

// Create and render the map
const map = createSampleMap()
const scene = renderMap(app, map)

// Create controls
const controls = new MapControls(scene)

// Create control buttons
const controlsContainer = document.createElement('div')
controlsContainer.className = 'controls'

// Pan buttons
const panUp = document.createElement('button')
panUp.textContent = '↑'
panUp.className = 'control-btn pan-btn'
panUp.addEventListener('click', () => controls.pan(0, -50))

const panDown = document.createElement('button')
panDown.textContent = '↓'
panDown.className = 'control-btn pan-btn'
panDown.addEventListener('click', () => controls.pan(0, 50))

const panLeft = document.createElement('button')
panLeft.textContent = '←'
panLeft.className = 'control-btn pan-btn'
panLeft.addEventListener('click', () => controls.pan(-50, 0))

const panRight = document.createElement('button')
panRight.textContent = '→'
panRight.className = 'control-btn pan-btn'
panRight.addEventListener('click', () => controls.pan(50, 0))

// Zoom buttons
const zoomIn = document.createElement('button')
zoomIn.textContent = '+'
zoomIn.className = 'control-btn zoom-btn'
zoomIn.addEventListener('click', () => controls.zoom(0.1))

const zoomOut = document.createElement('button')
zoomOut.textContent = '−'
zoomOut.className = 'control-btn zoom-btn'
zoomOut.addEventListener('click', () => controls.zoom(-0.1))

// Pan controls group
const panGroup = document.createElement('div')
panGroup.className = 'control-group'
panGroup.innerHTML = '<div class="control-label">Pan</div>'
const panGrid = document.createElement('div')
panGrid.className = 'pan-grid'
panGrid.appendChild(document.createElement('div')) // empty cell
panGrid.appendChild(panUp)
panGrid.appendChild(document.createElement('div')) // empty cell
panGrid.appendChild(panLeft)
panGrid.appendChild(document.createElement('div')) // empty cell
panGrid.appendChild(panRight)
panGrid.appendChild(document.createElement('div')) // empty cell
panGrid.appendChild(panDown)
panGrid.appendChild(document.createElement('div')) // empty cell
panGroup.appendChild(panGrid)

// Zoom controls group
const zoomGroup = document.createElement('div')
zoomGroup.className = 'control-group'
zoomGroup.innerHTML = '<div class="control-label">Zoom</div>'
const zoomButtons = document.createElement('div')
zoomButtons.className = 'zoom-buttons'
zoomButtons.appendChild(zoomIn)
zoomButtons.appendChild(zoomOut)
zoomGroup.appendChild(zoomButtons)

controlsContainer.appendChild(panGroup)
controlsContainer.appendChild(zoomGroup)
app.appendChild(controlsContainer)
