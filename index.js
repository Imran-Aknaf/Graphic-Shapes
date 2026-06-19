import { vs_pen, fs_pen } from "./penguin.js"
import { vs_cu, fs_cu } from "./cube.js"

const BACKGROUND = "black"
const FOREGROUND = "green"

console.log("displaying thing...")
const canvas = document.getElementById("canvas");

canvas.width = 500
canvas.height = 500

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

function translate_z({ x, y, z }, dz) {
  return {
    x: x,
    y: y,
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



const FPS = 60
const frameDuration = 1000 / FPS

let dz = 1;
let angle = 0;
const rotations_per_second = 1 / 2
const dt = 1 / FPS //same as frameDuration but in seconds = delta-time between frames in one second

const renderVertex = false
const renderEdges = true


//set the current model to load
const vs = vs_pen
const fs = fs_pen


function frame() {
  //dz += 1 * dt; //will move of +1 every second
  angle += 2 * Math.PI * dt * rotations_per_second; //will do one complete rotation every second

  clear();

  //renders vertices
  if (renderVertex) {
    for (const v of vs) {
      point(NdcToScreen(project(translate_z(rotate_xz(v, angle), dz))))

    }
  }


  //renders edges
  if (renderEdges) {
    for (const f of fs) {
      for (let i = 0; i < f.length; i++) {
        let p1 = vs[f[i]]
        let p2 = vs[f[(i + 1) % f.length]]

        line(
          NdcToScreen(project(translate_z(rotate_xz(p1, angle), dz))),
          NdcToScreen(project(translate_z(rotate_xz(p2, angle), dz)))
        )
      }
    }
  }


  setTimeout(frame, frameDuration);
}

setTimeout(frame, frameDuration);



