import { vs_pen, fs_pen } from "./penguin.js"
import { vs_cu, fs_cu } from "./cube.js"
import { vs_py, fs_py } from "./pyramid.js"
import { vs_octa, fs_octa } from "./octahedron.js"
import { vs_cyl, fs_cyl } from "./cylinder.js"
import { vs_con, fs_con } from "./cone.js"
import { vs_uv, fs_uv } from "./UVsphere.js"
import { vs_ico, fs_ico } from "./icosahedron.js"
import { vs_tor, fs_tor } from "./torus.js"

console.log("starting...")

//const BACKGROUND = "black"
//const FOREGROUND = "green"

const models = [
  { name: "Cube", vs: vs_cu, fs: fs_cu },
  { name: "Pyramid", vs: vs_py, fs: fs_py },
  { name: "Octahedron", vs: vs_octa, fs: fs_octa },
  { name: "Cylinder", vs: vs_cyl, fs: fs_cyl },
  { name: "Cone", vs: vs_con, fs: fs_con },
  { name: "Icosahedron", vs: vs_ico, fs: fs_ico },
  { name: "UV Sphere", vs: vs_uv, fs: fs_uv },
  { name: "Torus", vs: vs_tor, fs: fs_tor },
  { name: "Penguin", vs: vs_pen, fs: fs_pen }
]

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

  //rotation 
  if (keys["ArrowLeft"]) camera.rotate(-rotSpeed)
  if (keys["ArrowRight"]) camera.rotate(rotSpeed)



  //forward & right vector from any angle yaw of camera (we consider yaw = 0 when forward = (0,0,1) & concluded this formula's)

  // (0,0,1) by default as camera.yaw = 0°
  const forward = {
    x: -Math.sin(camera.yaw),
    y: 0,
    z: Math.cos(camera.yaw)
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
    camera.y -= forward.y * moveSpeed // Descend si on regarde en haut
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

  //if (keys["a"]) camera.y += moveSpeed
  //if (keys["e"]) camera.y -= moveSpeed
}




let currentModel = models[0];

const canvas = document.getElementById("canvas");
const menu = document.getElementById("menu")
const backbutton = document.getElementById("back-button")
const ui = document.getElementById("ui")


backbutton.addEventListener("click", () => {
  menu.style.display = "grid"
  canvas.style.display = "none"
  backbutton.style.display = "none"
  ui.style.display = "none"

  mainRenderer.stop()
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
    mainRenderer.model = model

    menu.style.display = "none"
    canvas.style.display = "block"
    backbutton.style.display = "block"
    ui.style.display = "block"

    mainRenderer.start()
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
  }

  rotate(dYaw) {
    this.yaw += dYaw
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

    this.vertexSize = 15
    this.vertexShape = "circle"

    this.showVertices = options.showVertices ?? false //default value
    this.showEdges = options.showEdges ?? true //default value

    this.running = false;
  }

  toggleVertices() {
    this.showVertices = !this.showVertices
  }

  toggleEdges() {
    this.showEdges = !this.showEdges
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }


  line(p1, p2) {
    this.ctx.lineWidth = 3
    this.ctx.strokeStyle = this.FOREGROUND

    this.ctx.beginPath()
    this.ctx.moveTo(p1.x, p1.y)
    this.ctx.lineTo(p2.x, p2.y)
    this.ctx.stroke()
  }


  point({ x, y }) {
    //const size = 15
    this.ctx.fillStyle = this.FOREGROUND
    if (this.vertexShape == "square") {
      this.ctx.fillRect(x - this.vertexSize / 2, y - this.vertexSize / 2, this.vertexSize, this.vertexSize)
    }
    else if (this.vertexShape == "circle") {
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.vertexSize / 2, 0, 2 * Math.PI)
      this.ctx.fill()
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
    if (this.model.name == "Torus") {
      // rotation
      p = this.rotate_yz(p, this.angle);
    } else {
      p = this.rotate_xz(p, this.angle)
    }

    // movement
    p = this.translate(p, this.dx, this.dy, this.dz);

    return p
  }

  cameraTransform(p) {

    if (!this.camera) return p

    p = this.translate(p, -this.camera.x, -this.camera.y, -this.camera.z)
    p = this.rotate_xz(p, -this.camera.yaw)
    //p = this.rotate_yz(p, -this.camera.pitch)

    // roll/tilt (around Z axis)
    //p = this.rotate_xy(p, -this.camera.roll)

    return p

  }

  transform(p) {
    p = this.worldTransform(p)
    p = this.cameraTransform(p)

    return p
  }

  update() {
    this.angle += 2 * Math.PI * this.dt * this.rotations_per_second;

    //this.dz += 1 * this.dt; //will move back of +1 every second

    if (this.camera) {
      updateCamera(this.camera)
    }
  }

  draw_vertices() {
    for (const v of this.model.vs) {
      const p = this.transform(v)

      if (p.z < 0.1) continue;
      this.point(this.NdcToScreen(this.project(p)))
      //this.point(this.NdcToScreen(this.project(this.transform(v))))
    }
  }

  draw_edges() {
    for (const f of this.model.fs) {
      for (let i = 0; i < f.length; i++) {
        let p1 = this.model.vs[f[i]]
        let p2 = this.model.vs[f[(i + 1) % f.length]]

        p1 = this.transform(p1)
        p2 = this.transform(p2)

        if (p1.z < 0.1 || p2.z < 0.1) continue;

        this.line(
          this.NdcToScreen(this.project(p1)),
          this.NdcToScreen(this.project(p2))
        );

        /*this.line(
          this.NdcToScreen(this.project(this.transform(p1))),
          this.NdcToScreen(this.project(this.transform(p2)))
        )*/
      }
    }
  }

  draw() {
    this.clear()
    if (this.showVertices) {
      this.draw_vertices()
    }
    if (this.showEdges) {
      this.draw_edges()
    }
  }

  frame() {
    if (!this.running) return
    this.update()
    this.draw()

    setTimeout(() => this.frame(), this.frameDuration)
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



for (let { previewCanvas, title, box, model } of previews) {
  const r = new Renderer(previewCanvas, model, { showEdges: true })
  r.start()
}


const camera = new Camera();
const mainRenderer = new Renderer(canvas, currentModel, { showEdges: true, camera: camera })
mainRenderer.start()

document.getElementById("vertex-button").addEventListener("click", () => {
  mainRenderer.toggleVertices();
});

document.getElementById("edge-button").addEventListener("click", () => {
  mainRenderer.toggleEdges();
});