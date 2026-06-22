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

/*
const ctx = canvas.getContext("2d");

function clear() {
  ctx.fillStyle = BACKGROUND
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function line(p1, p2) {
  ctx.lineWidth = 3
  ctx.strokeStyle = FOREGROUND
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
}


function point({ x, y }) {
  const size = 15
  ctx.fillStyle = FOREGROUND
  ctx.fillRect(x - size / 2, y - size / 2, size, size)
}

function NdcToScreen({ x, y }) {
  //[-1,1] --> [0,2] --> [0,1] --> [0,w] : x' = (x+1)/2 * w
  //[1,-1] --> [0,2] -> [0,1] -> [0,h] : y' = (1-y)/2 * h  
  return {
    x: (x + 1) / 2 * canvas.width,
    y: (1 - y) / 2 * canvas.height
  }
}

function project({ x, y, z }) {
  return {
    x: x / z,
    y: y / z
  }
}


function translate({ x, y, z }, dx, dy, dz) {
  return {
    x: x + dx,
    y: y + dy,
    z: z + dz
  }
}


function rotate_xz({ x, y, z }, angle) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    y: y,
    z: x * Math.sin(angle) + z * Math.cos(angle)
  }
}

function rotate_xy({ x, y, z }, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
    z: z
  }
}

function rotate_yz({ x, y, z }, angle) {
  return {
    x: x,
    y: y * Math.cos(angle) - z * Math.sin(angle),
    z: y * Math.sin(angle) + z * Math.cos(angle)
  }
}

function transform(p) {

  if (currentModel.name == "Torus") {
    // rotation
    p = rotate_yz(p, angle);
  } else {
    p = rotate_xz(p, angle)
  }

  // movement
  p = translate(p, 0, 0, dz);

  return p;
}


const FPS = 60
const frameDuration = 1000 / FPS

let dz = 1;
let angle = 0;
const rotations_per_second = 1 / 4
const dt = 1 / FPS //same as frameDuration but in seconds = delta-time between frames in one second

const renderVertex = false
const renderEdges = true


//set the current model to load
//const vs = vs_ico
//const fs = fs_ico


function frame() {
  //dz += 1 * dt; //will move of +1 every second
  angle += 2 * Math.PI * dt * rotations_per_second; //will do one complete rotation every second

  clear();

  //renders vertices
  if (renderVertex) {
    for (const v of currentModel.vs) {
      point(NdcToScreen(project(transform(v))))

    }
  }


  //renders edges
  if (renderEdges) {
    for (const f of currentModel.fs) {
      for (let i = 0; i < f.length; i++) {
        let p1 = currentModel.vs[f[i]]
        let p2 = currentModel.vs[f[(i + 1) % f.length]]

        line(
          NdcToScreen(project(transform(p1))),
          NdcToScreen(project(transform(p2)))
        )
      }
    }
  }


  setTimeout(frame, frameDuration);
}

setTimeout(frame, frameDuration);*/



class Renderer {
  constructor(canvas, model) {
    this.canvas = canvas
    this.model = model
    this.ctx = this.canvas.getContext("2d")

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

    this.showVertices = false
    this.showEdges = true
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
    this.ctx.fillRect(x - this.vertexSize / 2, y - this.vertexSize / 2, this.vertexSize, this.vertexSize)
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

  translate({ x, y, z }) {
    return {
      x: x + this.dx,
      y: y + this.dy,
      z: z + this.dz
    }
  }


  rotate_xz({ x, y, z }) {
    return {
      x: x * Math.cos(this.angle) - z * Math.sin(this.angle),
      y: y,
      z: x * Math.sin(this.angle) + z * Math.cos(this.angle)
    }
  }

  rotate_xy({ x, y, z }) {
    return {
      x: x * Math.cos(this.angle) - y * Math.sin(this.angle),
      y: x * Math.sin(this.angle) + y * Math.cos(this.angle),
      z: z
    }
  }

  rotate_yz({ x, y, z }) {
    return {
      x: x,
      y: y * Math.cos(this.angle) - z * Math.sin(this.angle),
      z: y * Math.sin(this.angle) + z * Math.cos(this.angle)
    }
  }

  transform(p) {

    if (this.model.name == "Torus") {
      // rotation
      p = this.rotate_yz(p);
    } else {
      p = this.rotate_xz(p)
    }

    // movement
    p = this.translate(p);

    return p;
  }


  update_params() {
    this.angle += 2 * Math.PI * this.dt * this.rotations_per_second;
    //this.dz += 1 * this.dt; //will move back of +1 every second
  }

  draw_vertices() {
    for (const v of this.model.vs) {
      this.point(this.NdcToScreen(this.project(this.transform(v))))
    }
  }

  draw_edges() {
    for (const f of this.model.fs) {
      for (let i = 0; i < f.length; i++) {
        let p1 = this.model.vs[f[i]]
        let p2 = this.model.vs[f[(i + 1) % f.length]]

        this.line(
          this.NdcToScreen(this.project(this.transform(p1))),
          this.NdcToScreen(this.project(this.transform(p2)))
        )
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
    this.update_params()
    this.draw()

    setTimeout(() => this.frame(), this.frameDuration)
  }

  start() {
    //setTimeout(this.frame, this.frameDuration);
    this.frame()
  }
}



for (let { previewCanvas, title, box, model } of previews) {
  const r = new Renderer(previewCanvas, model)
  r.start()
}

const mainRenderer = new Renderer(canvas, currentModel)
mainRenderer.start()

document.getElementById("vertex-button").addEventListener("click", () => {
  mainRenderer.toggleVertices();
});

document.getElementById("edge-button").addEventListener("click", () => {
  mainRenderer.toggleEdges();
});