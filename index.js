import { vs_pen, fs_pen } from "./penguin.js"
import { vs_cu, fs_cu } from "./cube.js"
import { vs_py, fs_py } from "./pyramid.js"
import { vs_octa, fs_octa } from "./octahedron.js"
import { vs_cyl, fs_cyl } from "./cylinder.js"
import { vs_con, fs_con } from "./cone.js"
import { vs_uv, fs_uv } from "./UVsphere.js"
import { vs_ico, fs_ico } from "./icosahedron.js"
import { vs_tor, fs_tor } from "./torus.js"

const BACKGROUND = "black"
const FOREGROUND = "green"

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

console.log("starting...")

const canvas = document.getElementById("canvas");
const menu = document.getElementById("menu")
const backbutton = document.getElementById("back-button")

//canvas.style.display = "none"

backbutton.addEventListener("click", () => {
  menu.style.display = "grid"
  canvas.style.display = "none"
  backbutton.style.display = "none"
})

for (const model of models) {
  const box = document.createElement("div")
  box.className = "menu-box"
  box.textContent = model.name

  box.addEventListener("click", () => {
    currentModel = model

    menu.style.display = "none"
    canvas.style.display = "block"
    backbutton.style.display = "block"
  })


  menu.appendChild(box)
}



function resize() {
  //keep it a square
  canvas.width = window.innerHeight
  canvas.height = window.innerHeight
}

resize() //initial resize

window.addEventListener("resize", resize)



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

        /*line(
          NdcToScreen(project(translate_z(rotate_xz(p1, angle), dz))),
          NdcToScreen(project(translate_z(rotate_xz(p2, angle), dz)))
        )*/

        line(
          NdcToScreen(project(transform(p1))),
          NdcToScreen(project(transform(p2)))
        )
      }
    }
  }


  setTimeout(frame, frameDuration);
}

setTimeout(frame, frameDuration);



