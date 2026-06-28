import { vs_pen, fs_pen } from "./penguin.js"
import { vs_cu, fs_cu } from "./cube.js"
import { vs_py, fs_py } from "./pyramid.js"
import { vs_octa, fs_octa } from "./octahedron.js"
import { vs_cyl, fs_cyl } from "./cylinder.js"
import { vs_con, fs_con } from "./cone.js"
import { vs_uv, fs_uv } from "./UVsphere.js"
import { vs_ico, fs_ico } from "./icosahedron.js"
import { vs_tor, fs_tor } from "./torus.js"

import { fixWindingOrder } from "./preprocessing.js"

console.log("starting...")

const models = [
  { name: "Cube", vs: vs_cu, fs: fs_cu, convex: true },
  { name: "Pyramid", vs: vs_py, fs: fs_py, convex: true },
  { name: "Octahedron", vs: vs_octa, fs: fs_octa, convex: true },
  { name: "Cylinder", vs: vs_cyl, fs: fs_cyl, convex: true },
  { name: "Cone", vs: vs_con, fs: fs_con, convex: true },
  { name: "Icosahedron", vs: vs_ico, fs: fs_ico, convex: true },
  { name: "UV Sphere", vs: vs_uv, fs: fs_uv, convex: false },
  { name: "Torus", vs: vs_tor, fs: fs_tor, convex: false },
  { name: "Penguin", vs: vs_pen, fs: fs_pen, convex: false }
]

for (const model of models) {
  if (model.convex) {
    fixWindingOrder(model);
  }
}

const distinctColors = [
  '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff'
];


/**
 * Later, add more metadata to models : 
 * {
  name: "Torus",
  vs: vs_tor,
  fs: fs_tor,
  dz: 1.5,
  rotationAxis: "yz"
  }
 */

const keys = {}

document.addEventListener("keydown", e => {
  keys[e.key] = true
})

document.addEventListener("keyup", e => {
  keys[e.key] = false
})

function updateCamera(camera) {
  const moveSpeed = 0.05
  const rotSpeed = 0.03

  //rotations
  if (keys["ArrowLeft"]) camera.rotate(rotSpeed, 0)
  if (keys["ArrowRight"]) camera.rotate(-rotSpeed, 0)

  if (keys["ArrowUp"]) camera.rotate(0, -rotSpeed)
  if (keys["ArrowDown"]) camera.rotate(0, rotSpeed)


  /**
   * forward & right vector from any angle yaw of camera (we consider yaw = 0 when forward = (0,0,1) & concluded this formula's)
  */

  const forward = {
    x: -Math.sin(camera.yaw) * Math.cos(camera.pitch),
    y: -Math.sin(camera.pitch),
    z: Math.cos(camera.yaw) * Math.cos(camera.pitch)
  }

  const right = {
    x: Math.cos(camera.yaw),
    y: 0,
    z: Math.sin(camera.yaw)
  }

  //movement 
  if (keys["z"]) {
    camera.x += forward.x * moveSpeed
    camera.y += forward.y * moveSpeed
    camera.z += forward.z * moveSpeed
  }

  if (keys["s"]) {
    camera.x -= forward.x * moveSpeed
    camera.y -= forward.y * moveSpeed
    camera.z -= forward.z * moveSpeed
  }

  if (keys["d"]) {
    camera.x += right.x * moveSpeed
    camera.y += right.y * moveSpeed
    camera.z += right.z * moveSpeed
  }

  if (keys["q"]) {
    camera.x -= right.x * moveSpeed
    camera.y -= right.y * moveSpeed
    camera.z -= right.z * moveSpeed
  }

  if (keys["a"]) camera.y += moveSpeed
  if (keys["e"]) camera.y -= moveSpeed
}




let currentModel = models[0];

const canvas = document.getElementById("canvas");
const menu = document.getElementById("menu")
const backbutton = document.getElementById("back-button")
const shapeUI = document.getElementById("shape-ui")
const cameraUI = document.getElementById("camera-ui")

backbutton.addEventListener("click", () => {
  menu.style.display = "grid"
  canvas.style.display = "none"

  backbutton.style.display = "none"

  shapeUI.style.display = "none"
  cameraUI.style.display = "none"

  mainRenderer.stop()

  for (const r of previewRenderers) {
    r.start()
  }

})


const previews = [];

for (const model of models) {
  const box = document.createElement("div")
  box.className = "menu-box"

  const title = document.createElement("div")
  title.className = "menu-title"
  title.textContent = model.name

  const previewCanvas = document.createElement("canvas")
  previewCanvas.className = "preview-canvas"

  box.addEventListener("click", () => {
    mainRenderer.setModel(model)

    menu.style.display = "none"
    canvas.style.display = "block"

    backbutton.style.display = "block"

    shapeUI.style.display = "flex"
    cameraUI.style.display = "flex"

    mainRenderer.start()

    for (const r of previewRenderers) {
      r.stop()
    }
  })

  box.appendChild(title)
  box.appendChild(previewCanvas)
  menu.appendChild(box)

  previews.push({ previewCanvas, title, box, model })

}


function resize() {
  //keep it a square
  canvas.width = window.innerHeight
  canvas.height = window.innerHeight
}

function resizeAllPreviews() {
  for (let { previewCanvas, title, box, model } of previews) {
    const rect = previewCanvas.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);

    previewCanvas.width = size
    previewCanvas.height = size;
  }
}

//initial resize
resize()
resizeAllPreviews()

window.addEventListener("resize", resize)
//window.addEventListener("resize", resizeAllPreviews)


class Camera {
  constructor() {
    this.x = 0
    this.y = 0
    this.z = 0

    this.yaw = 0 //left-right
    this.pitch = 0 //up-down
  }

  rotate(dYaw, dPitch) {
    this.yaw += dYaw
    this.pitch += dPitch

    //can go up/down in range [-range°, +range°]
    const range = 85
    const limit = range * Math.PI / 180
    if (this.pitch > limit) this.pitch = limit
    if (this.pitch < -limit) this.pitch = -limit
  }

  reset() {
    this.x = 0
    this.y = 0
    this.z = 0

    this.yaw = 0
    this.pitch = 0
  }
}

class Renderer {
  constructor(canvas, model, options) {
    this.canvas = canvas
    this.model = model
    this.ctx = this.canvas.getContext("2d")

    this.camera = options.camera || null

    this.angle = 0
    this.dx = 0
    this.dy = 0
    this.dz = 1

    this.FPS = 60
    this.frameDuration = 1000 / this.FPS
    this.dt = 1 / this.FPS //same as frameDuration but in seconds = delta-time between frames in one second

    this.rotations_per_second = 1 / 4


    this.BACKGROUND = "black"
    this.FOREGROUND = "green"
    this.WHITE = "white"
    this.PURPLE = "#22132D"

    this.vertexSize = 15
    this.vertexShape = "circle"

    this.options = {
      rotate: options.rotate ?? false,

      showVertices: options.showVertices ?? false,
      showEdges: options.showEdges ?? false,
      showFaces: options.showFaces ?? true,
      showColors: options.showColors ?? false,
      showBackfaceCulling: options.showBackfaceCulling ?? true,

      faceStyle: {
        fill: options.faceStyle?.fill ?? this.PURPLE,
        stroke: options.faceStyle?.stroke ?? this.FOREGROUND
      },

      vertexColor: options.vertexColor ?? this.FOREGROUND
    }

    this.colors = this.initColors()

    this.running = false;
  }

  setModel(model) {
    this.model = model
    this.colors = this.initColors()

  }

  initColors() {
    const colors = []

    for (let i = 0; i < this.model.fs.length; i++) {
      colors[i] = distinctColors[Math.floor(Math.random() * distinctColors.length)]

    }
    return colors
  }

  toggleVertices() {
    this.options.showVertices = !this.options.showVertices
  }

  toggleEdges() {
    this.options.showEdges = !this.options.showEdges
  }

  toggleFaces() {
    this.options.showFaces = !this.options.showFaces
  }

  toggleColors() {
    this.options.showColors = !this.options.showColors
  }

  toggleBackfaceCulling() {
    this.options.showBackfaceCulling = !this.options.showBackfaceCulling;
  }

  clear() {
    this.ctx.fillStyle = this.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }


  line(p1, p2, edgeColor) {
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = edgeColor

    this.ctx.beginPath()
    this.ctx.moveTo(p1.x, p1.y)
    this.ctx.lineTo(p2.x, p2.y)
    this.ctx.stroke()
  }

  polygon(points, faceColor) {
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }
    this.ctx.closePath()

    this.ctx.fillStyle = faceColor
    this.ctx.fill();
  }

  point({ x, y }, index) {
    this.ctx.fillStyle = this.options.vertexColor

    if (this.vertexShape == "square") {
      this.ctx.fillRect(x - this.vertexSize / 2, y - this.vertexSize / 2, this.vertexSize, this.vertexSize)
    }
    else if (this.vertexShape == "circle") {
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.vertexSize / 2, 0, 2 * Math.PI)
      this.ctx.fill()
    }

    //numerate them
    this.ctx.fillStyle = this.WHITE;
    this.ctx.font = "bold 12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(index, x, y);
  }

  subtract(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z
    }
  }

  add(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z
    }
  }

  multiply(v, s) {
    /*
    returns scalar * vector 
    */
    return {
      x: v.x * s,
      y: v.y * s,
      z: v.z * s
    }
  }

  dotProduct(a, b) {
    /*
    dot = 0 : vectors are orthogonal (90° angle)
    dot > 0 : vectors point in a similar direction (angle < 90°)
    dot < 0 : vectors point in opposite directions (angle > 90°)

    returns a scalar 
    */
    return a.x * b.x + a.y * b.y + a.z * b.z
  }

  crossProduct(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    }
  }

  NdcToScreen({ x, y }) {
    //[-1,1] --> [0,2] --> [0,1] --> [0,w] : x' = (x+1)/2 * w
    //[1,-1] --> [0,2] -> [0,1] -> [0,h] : y' = (1-y)/2 * h  
    return {
      x: (x + 1) / 2 * this.canvas.width,
      y: (1 - y) / 2 * this.canvas.height
    }
  }

  project({ x, y, z }) {
    return {
      x: x / z,
      y: y / z
    }
  }

  translate({ x, y, z }, dx, dy, dz) {
    return {
      x: x + dx,
      y: y + dy,
      z: z + dz
    }
  }


  rotate_xz({ x, y, z }, angle) {
    return {
      x: x * Math.cos(angle) - z * Math.sin(angle),
      y: y,
      z: x * Math.sin(angle) + z * Math.cos(angle)
    }
  }

  rotate_xy({ x, y, z }, angle) {
    return {
      x: x * Math.cos(angle) - y * Math.sin(angle),
      y: x * Math.sin(angle) + y * Math.cos(angle),
      z: z
    }
  }

  rotate_yz({ x, y, z }, angle) {
    return {
      x: x,
      y: y * Math.cos(angle) - z * Math.sin(angle),
      z: y * Math.sin(angle) + z * Math.cos(angle)
    }
  }

  worldTransform(p) {
    if (this.options.rotate) {
      if (this.model.name == "Torus") {
        p = this.rotate_yz(p, this.angle);
      } else {
        p = this.rotate_xz(p, this.angle)
      }
    }

    p = this.translate(p, this.dx, this.dy, this.dz);

    return p
  }

  cameraTransform(p) {

    if (!this.camera) return p

    p = this.translate(p, -this.camera.x, -this.camera.y, -this.camera.z)
    p = this.rotate_xz(p, -this.camera.yaw)
    p = this.rotate_yz(p, -this.camera.pitch)

    return p
  }

  transform(p) {
    p = this.worldTransform(p)
    p = this.cameraTransform(p)

    return p
  }


  isFrontFace(face) {
    /** 
     * Implements backface culling by detecting face orientation based on their normal vector direction compared to face-camera vector direction
     * Depends totally on a consistent winding order of face vertices
     * 
     * In our case : 
     * - CCW = face is seen by camera
     * - CW = face is not seen by camera
     * 
     * Also after test & trial, in our situation, normal will be oriented opposite to face->camera, when face need to be shown :
     * - So we use dot < 0 as a check
     * 
     * Assumes camera is at (0,0,0) at all point wich should be the case as we only move the objects, not the camera
    */


    //takes 3 points that define the plane
    const v0 = this.transform(this.model.vs[face[0]])
    const v1 = this.transform(this.model.vs[face[1]])
    const v2 = this.transform(this.model.vs[face[2]])

    //takes the vectors lying on the surface on this plane
    const e1 = this.subtract(v1, v0)
    const e2 = this.subtract(v2, v0)

    //takes the perpendicular vector of this plane = where the face "looks" at
    const normal = this.crossProduct(e1, e2)


    //computes face center
    let center = { x: 0, y: 0, z: 0 }

    for (const index of face)
      center = this.add(center, this.transform(this.model.vs[index]))

    center = this.multiply(center, 1 / face.length)

    //camera is at origin, so this compute [face -> camera] vector : A -> B = B-A
    const view = {
      x: -center.x,
      y: -center.y,
      z: -center.z
    }

    return this.dotProduct(normal, view) < 0
  }

  draw_vertices() {
    for (let i = 0; i < this.model.vs.length; i++) {
      const p = this.transform(this.model.vs[i])

      if (p.z < 0.1) continue;

      this.point(this.NdcToScreen(this.project(p)), i)
    }
  }

  draw_faces() {
    for (let j = 0; j < this.model.fs.length; j++) {
      const face = this.model.fs[j]

      if (this.options.showBackfaceCulling && !this.isFrontFace(face)) continue //skip hidden faces


      const faceColor = this.options.showColors ? this.colors[j] : this.options.faceStyle.fill
      const edgeColor = this.options.faceStyle.stroke

      const screenPoints = []
      let validFace = true

      for (let i = 0; i < face.length; i++) {
        let p1 = this.model.vs[face[i]]
        let p2 = this.model.vs[face[(i + 1) % face.length]]

        p1 = this.transform(p1)
        p2 = this.transform(p2)

        //don't draw line if too close from camera
        if (p1.z < 0.1 || p2.z < 0.1) {
          validFace = false
          continue
        }

        p1 = this.NdcToScreen(this.project(p1))
        p2 = this.NdcToScreen(this.project(p2))

        screenPoints.push(p1) //will be linked with p2 (through i+1) only if both are valid
      }

      if (this.options.showFaces && validFace) {
        this.polygon(screenPoints, faceColor)
      }

      if (this.options.showEdges && validFace) {
        for (let i = 0; i < screenPoints.length; i++) {
          const p1 = screenPoints[i]
          const p2 = screenPoints[(i + 1) % screenPoints.length]

          this.line(p1, p2, edgeColor)
        }
      }
    }
  }


  draw() {
    this.clear()

    if (this.options.showVertices) {
      this.draw_vertices()
    }

    if (this.options.showEdges || this.options.showFaces) {
      this.draw_faces()
    }
  }

  update() {
    this.angle += 2 * Math.PI * this.dt * this.rotations_per_second;

    //this.dz += 1 * this.dt; //will move back of +1 every second

    if (this.camera) {
      updateCamera(this.camera)
    }
  }

  frame() {
    if (!this.running) return
    this.update()
    this.draw()

    setTimeout(() => this.frame(), this.frameDuration)
    //askip utiliser requestAnimationFrame(() => this.frame()), a voir
  }

  start() {
    if (!this.running) {
      this.running = true
      this.frame()
    }
  }

  stop() {
    this.running = false
  }
}


const previewRenderers = []

for (let { previewCanvas, title, box, model } of previews) {
  const r = new Renderer(previewCanvas, model, {
    rotate: true,
    showVertices: false,
    showEdges: true,
    showFaces: false,
    showColors: false,
    showBackfaceCulling: false,
  })

  r.start()

  previewRenderers.push(r)
}

const camera = new Camera();
const mainRenderer = new Renderer(canvas, currentModel, {
  camera: camera,
  rotate: false,
  showVertices: false,
  showEdges: true,
  showFaces: true,
  showColors: false,
  showBackfaceCulling: true,
})



const vertexBtn = document.getElementById("vertex-button");
const edgeBtn = document.getElementById("edge-button");
const faceBtn = document.getElementById("face-button");
const cullingBtn = document.getElementById("culling-button");
const colorBtn = document.getElementById("color-button");

//initialise button styles to the current initial state
vertexBtn.classList.toggle("active", mainRenderer.options.showVertices);
edgeBtn.classList.toggle("active", mainRenderer.options.showEdges);
faceBtn.classList.toggle("active", mainRenderer.options.showFaces);
cullingBtn.classList.toggle("active", mainRenderer.options.showBackfaceCulling);
colorBtn.classList.toggle("active", mainRenderer.options.showColors);

vertexBtn.addEventListener("click", () => {
  mainRenderer.toggleVertices();
  vertexBtn.classList.toggle("active", mainRenderer.options.showVertices);
});

edgeBtn.addEventListener("click", () => {
  mainRenderer.toggleEdges();
  edgeBtn.classList.toggle("active", mainRenderer.options.showEdges);
});

faceBtn.addEventListener("click", () => {
  mainRenderer.toggleFaces();
  faceBtn.classList.toggle("active", mainRenderer.options.showFaces);
});

cullingBtn.addEventListener("click", () => {
  mainRenderer.toggleBackfaceCulling();
  cullingBtn.classList.toggle("active", mainRenderer.options.showBackfaceCulling);
});


colorBtn.addEventListener("click", () => {
  mainRenderer.toggleColors();
  colorBtn.classList.toggle("active", mainRenderer.options.showColors);
});

document.getElementById("reset-button").addEventListener("click", () => {
  mainRenderer.camera.reset();
})