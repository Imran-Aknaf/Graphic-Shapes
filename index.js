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

const cube_vertices = [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },

  { x: 0.25, y: 0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
]


const squarre_vertices = [
  { x: 0.5, y: 0.5, z: 3 },
  { x: 0.5, y: -0.5, z: 3 },
  { x: -0.5, y: 0.5, z: 3 },
  { x: -0.5, y: -0.5, z: 3 },
]


/*clear()
point(NdcToScreen(project({ x: 0.8, y: 0, z: 1 })))
point(NdcToScreen(project(rotate_xy({ x: 0.8, y: 0, z: 1 }, Math.PI / 2))))
point(NdcToScreen(project(rotate_xy({ x: 0.8, y: 0, z: 1 }, Math.PI))))*/

function frame() {
  //dz += 1 * dt;
  angle += 2 * Math.PI * dt * rotations_per_second; //will do one complete rotation every second
  clear();

  for (const v of cube_vertices) {
    //point(NdcToScreen(project(translate_z(v, dz))))
    point(NdcToScreen(project(translate_z(rotate_xz(v, angle), dz))))

  }

  setTimeout(frame, frameDuration);
}

setTimeout(frame, frameDuration);



