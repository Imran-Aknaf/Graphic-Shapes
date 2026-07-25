import { vs_pen, fs_pen } from "./penguin.js"
import { vs_cu, fs_cu } from "./cube.js"
import { vs_py, fs_py } from "./pyramid.js"
import { vs_octa, fs_octa } from "./octahedron.js"
import { vs_cyl, fs_cyl } from "./cylinder.js"
import { vs_con, fs_con } from "./cone.js"
import { vs_uv, fs_uv } from "./UVsphere.js"
import { vs_ico, fs_ico } from "./icosahedron.js"
import { vs_tor, fs_tor } from "./torus.js"

import { fixWindingOrder, fixPenguin } from "./preprocessing.js"

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

  else if (model.name == "Penguin") {
    fixPenguin(model);
  }
}

//colors definitions

const distinctColors = [
  '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff'
];

/**
 * document.documentElement = html/:root
 * getComputedStyle(<html>) = give me final CSS values applied to this element (html)
 */
const root = getComputedStyle(document.documentElement)
const BACKGROUND_COLOR = root.getPropertyValue("--canvas-background-color").trim()




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

//get UI categories (div)
const shapeUI = document.getElementById("shape-ui")
const cameraUI = document.getElementById("camera-ui")
const lightUI = document.getElementById("light-ui")

backbutton.addEventListener("click", () => {
  menu.style.display = "grid"
  canvas.style.display = "none"

  backbutton.style.display = "none"

  shapeUI.style.display = "none"
  cameraUI.style.display = "none"
  lightUI.style.display = "none"

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
    lightUI.style.display = "flex"

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

class Color {
  constructor(r = 0, g = 0, b = 0) {
    this.r = r
    this.g = g
    this.b = b
  }

  rgbToCss() {
    //forced between [0;255]
    const r = Math.max(0, Math.min(255, this.r))
    const g = Math.max(0, Math.min(255, this.g))
    const b = Math.max(0, Math.min(255, this.b))

    return `rgb(${r},${g},${b})`
  }

  static fromHex(hex) {
    const num = parseInt(hex.replace('#', ''), 16);

    return new Color(
      (num >> 16) & 255,
      (num >> 8) & 255,
      num & 255
    )
  }
}

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

    //transformations
    this.angle = 0
    this.dx = 0
    this.dy = 0
    this.dz = 1
    this.rotations_per_second = 1 / 4

    //animation
    this.FPS = 60
    this.frameDuration = 1000 / this.FPS
    this.dt = 1 / this.FPS //same as frameDuration but in seconds = delta-time between frames in one second

    //styling
    this.BACKGROUND = BACKGROUND_COLOR
    this.FOREGROUND = "#39d353";
    this.WHITE = "#e6edf3";
    this.FACE = "#34495e";

    this.vertexSize = 15
    this.vertexShape = "circle"

    //styling & button options
    this.options = {
      rotate: options.rotate ?? false,

      showVertices: options.showVertices ?? false,
      showEdges: options.showEdges ?? false,
      showFaces: options.showFaces ?? true,
      showColors: options.showColors ?? false,
      showBackfaceCulling: options.showBackfaceCulling ?? true,
      showNormals: options.showNormals ?? false,
      showSun: options.showSun ?? false,

      faceStyle: {
        fill: options.faceStyle?.fill ?? this.FACE,
        stroke: options.faceStyle?.stroke ?? this.FOREGROUND
      },

      vertexColor: options.vertexColor ?? this.FOREGROUND
    }

    this.colors = this.initColors()

    //lighting
    this.lights = {
      ambient: {
        enabled: true,
        strength: 0.5
      },

      directional: {
        enabled: true,
        elevation: 90,  //-90 → 90
        rotation: 0, //0 → 360
        strength: 1
      }

    }

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
    this.options.showBackfaceCulling = !this.options.showBackfaceCulling
  }

  toggleNormals() {
    this.options.showNormals = !this.options.showNormals
  }

  toggleAmbientLighting() {
    this.lights.ambient.enabled = !this.lights.ambient.enabled
  }

  toggleDirectionalLighting() {
    this.lights.directional.enabled = !this.lights.directional.enabled
  }

  clear() {
    this.ctx.fillStyle = this.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

    this.ctx.fillStyle = faceColor.rgbToCss()
    this.ctx.fill();
  }

  arrow(p1, p2, color) {
    /**
     * atan2(y,x) = computes circular angle from positive side of x-axis to vector (x,y)
     * 
     * then we what is the angle of the normal vector from this x-axis
     * 
     * that means p2-arrowSize vector is exactly straight continuation of the normal vector at this angle
     * 
     * we want to create the arrow edge from angle - 30° to angle + 30° (30° = PI/6)
     */
    this.line(p1, p2, color)

    const arrowSize = 10

    const angle = Math.atan2(
      p2.y - p1.y,
      p2.x - p1.x
    )

    this.ctx.fillStyle = color
    this.ctx.beginPath()

    this.ctx.moveTo(p2.x, p2.y)

    this.ctx.lineTo(
      p2.x - arrowSize * Math.cos(angle - Math.PI / 6),
      p2.y - arrowSize * Math.sin(angle - Math.PI / 6)
    )

    this.ctx.lineTo(
      p2.x - arrowSize * Math.cos(angle + Math.PI / 6),
      p2.y - arrowSize * Math.sin(angle + Math.PI / 6)
    )

    this.ctx.closePath()
    this.ctx.fill()
  }


  magnitude(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)
  }

  normalize(v) {
    /*
    Converts a vector into a unit vector.
  
    A unit vector keeps the same direction but has a length of 1.
    v̂ = v / |v|
  
    Used when direction matters but magnitude does not.
    */

    const magnitude = this.magnitude(v)

    return {
      x: v.x / magnitude,
      y: v.y / magnitude,
      z: v.z / magnitude
    }
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

  computeModelCenter() {

    let center = { x: 0, y: 0, z: 0 }

    for (let v of this.model.vs) {
      v = this.transform(v)
      center = this.add(center, v)
    }

    return this.multiply(center, 1 / this.model.vs.length)
  }

  computeFaceCenter(face) {
    /*
    Computes the center of a face. 
    Center = (v0 + v1 + ... + vn) / numberOfVertices
    */

    let center = { x: 0, y: 0, z: 0 }

    for (const idx of face) {
      const v = this.transform(this.model.vs[idx])
      center = this.add(center, v)
    }

    return this.multiply(center, 1 / face.length)
  }

  computeFaceNormal(face) {
    /*
    Computes the outward normal vector of a face.
  
    Uses the cross product of two edges in the face plane.
  
    N = (v1-v0) × (v2-v0)

    The normal is perpendicular to the face surface.
    Its direction depends on the vertex winding order.

    Our cross product winding convention gives normals pointing inward.
    So we actually inverse here the vector to output outward normal only.
    This way we can do our calculations as outward normal is what is used.
    */

    //takes 3 points that define the plane
    const v0 = this.transform(this.model.vs[face[0]])
    const v1 = this.transform(this.model.vs[face[1]])
    const v2 = this.transform(this.model.vs[face[2]])

    //takes the vectors lying on the surface on this plane
    const e1 = this.subtract(v1, v0)
    const e2 = this.subtract(v2, v0)

    //takes the perpendicular vector of this plane
    //return this.crossProduct(e1, e2)
    const inwardNormal = this.crossProduct(e1, e2)
    const outwardNormal = this.multiply(inwardNormal, -1)

    return outwardNormal
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

  applyAmbient() {
    if (!this.lights.ambient.enabled) return 0

    return this.lights.ambient.strength
  }

  computeDirectionToLight() {
    /**
     * Directional Light => no position in the world, only a direction
     * 
     * direction = angle
     * 
     * when camera rotates => objects affected => normals change 
     * 
     * so light direction needs to also change when camera rotates
     */

    //y = vertical
    const elevation = this.lights.directional.elevation * Math.PI / 180

    //x= left/right, z= front/back (depth)
    const azimuth = this.lights.directional.rotation * Math.PI / 180

    let light = {
      x: Math.cos(elevation) * Math.sin(azimuth),
      y: Math.sin(elevation),
      z: Math.cos(elevation) * Math.cos(azimuth)
    }

    // convert world direction -> camera direction
    if (this.camera) {
      light = this.rotate_xz(light, -this.camera.yaw)
      light = this.rotate_yz(light, -this.camera.pitch)
    }

    return light
  }

  applyDirectional(face) {
    if (!this.lights.directional.enabled) return 0

    const normal = this.computeFaceNormal(face)
    const normalized_normal = this.normalize(normal)

    //global lightDirection here, so
    const L = this.computeDirectionToLight() //surface → Light vector
    const normalized_L = this.normalize(L)

    const diffuseFactor = this.dotProduct(normalized_normal, normalized_L)

    const brightness = Math.max(diffuseFactor, 0) * this.lights.directional.strength

    return brightness
  }

  calculateLighting(face, materialColor) {
    let brightness = 0

    brightness += this.applyAmbient()
    brightness += this.applyDirectional(face)


    return new Color(
      materialColor.r * brightness,
      materialColor.g * brightness,
      materialColor.b * brightness
    )
  }


  isFrontFace(face) {
    /** 
     * Implements backface culling by detecting face orientation based on their normal vector direction compared to face-camera vector direction
     * Normal vector direction depends totally on a consistent winding order of face vertices
     * 
     * In our case : 
     * - CCW = face is seen by camera
     * - CW = face is not seen by camera
     * 
     * Also after test & trial, in our situation, normal will be oriented opposite to face->camera, when face need to be shown :
     * - (So we use dot < 0 as a check) 
     * - [Update]====== we no longer do this, we inverse normal directly in method ======[Update]
     * 
     * Assumes camera is at (0,0,0) at all point wich should be the case as we only move the objects, not the camera
    */


    const normal = this.computeFaceNormal(face)

    const center = this.computeFaceCenter(face)

    //camera is at origin, so this compute [face -> camera] vector : A -> B = B-A
    const view = {
      x: -center.x,
      y: -center.y,
      z: -center.z
    }

    return this.dotProduct(normal, view) > 0
  }


  buildPainterFaces() {
    /**
     * Sort faces based on the depth to the camera
     * Goal : draw farthest filled face first, and closest will naturally draw on them by filling. 
     */

    const faces = []
    for (let j = 0; j < this.model.fs.length; j++) {

      const face = this.model.fs[j]

      if (this.options.showBackfaceCulling && !this.isFrontFace(face)) continue; //skip hidden faces

      const center = this.computeFaceCenter(face)

      faces.push({ face: face, index: j, depth: center.z })
    }

    //Sort : furthest first
    faces.sort((a, b) => b.depth - a.depth);

    return faces
  }


  draw_vertices() {
    for (let i = 0; i < this.model.vs.length; i++) {
      const p = this.transform(this.model.vs[i])

      if (p.z < 0.1) continue;

      this.point(this.NdcToScreen(this.project(p)), i)
    }
  }

  draw_faces() {

    const sortedFaces = this.buildPainterFaces()

    for (const { face, index } of sortedFaces) {

      const cssColor = this.options.showColors ? this.colors[index] : this.options.faceStyle.fill
      const materialColor = Color.fromHex(cssColor)

      const faceColor = this.calculateLighting(face, materialColor)

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
          break // will not process this face/polygon
        }

        p1 = this.NdcToScreen(this.project(p1))
        p2 = this.NdcToScreen(this.project(p2))

        screenPoints.push(p1) //will be linked with p2 (through i+1), so no need to add p2
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

  draw_normals() {
    for (let j = 0; j < this.model.fs.length; j++) {
      const face = this.model.fs[j]

      if (!this.isFrontFace(face)) continue; //only draw normals of faces visible to the camera

      const normal = this.computeFaceNormal(face)

      //where does the vector start ? => the face, take center for example
      const center = this.computeFaceCenter(face)

      /*
      - a normal is not a point = a direction => need to add(or substract) it to center to get endPoint
      - a normal magnitude depends on e1,e2 which depends on vertices distance => so big face/small face don't have same normals
      - therefore, we need to normalise so that length of vector = 1 

      1. normalize: normal = (10,0,0) => unitNormal = (1,0,0)
      2. can actually control if we anything more or less than length=1 
      3. endPoint = center + unitNormal*length
      */

      const unitNormal = this.normalize(normal)
      const displayLength = 0.3

      const endPoint = this.add(
        center,
        this.multiply(unitNormal, displayLength)
      )

      //to draw => need to project 3D points onto screen so : 
      this.arrow(
        this.NdcToScreen(this.project(center)),
        this.NdcToScreen(this.project(endPoint)),
        "#ffd60a"
      )
    }
  }

  draw_directional_light() {

    if (!this.lights.directional.enabled) return;

    // 3D vector points
    const center3D = this.computeModelCenter() //transformed into camera world already
    const lightDir = this.normalize(this.computeDirectionToLight()) //surface → sun + transformed into camera world already

    const length = 20
    const lightPoint3D = this.add(center3D, this.multiply(lightDir, length)) //end point

    //clone
    let startPoint = { ...center3D };
    let endPoint = { ...lightPoint3D };

    /**
     * When a point is behind camera (point.z < 0.1) => it gets discarded and no arrow/line is rendered
     * Fix: let's find the point that cause issue, and let's move it along the vector direction at exactly where the vector intersect with camera-plane z=0.1
     * 
     * Any point in our vector can be calculated with: point(t) = start + t*(end-start)
     * => (end-start) = length of the vector
     * if t=0 => point = start, if t=1 => point = end => if t=0.5, it's the perfect middle point of the vector
     * so t = ratio of length of the vector we want to advance
     * 
     * point(t) has surely a x,y,z. We would like to find point(t).z such that z=0.1 
     * 
     * z(t) = start_z + t*(end_z-start_z)
     * 0.1 = start_z + t*(end_z-start_z)
     * 0.1 - start_z = t*(end_z-start_z)
     * t = (0.1 - start_z)/(end_z-start_z)
     * 
     * 
     * now we can find the ratio of length to advance from start, to attein a point that will have z=0.1
     */

    if (startPoint.z < 0.1 && endPoint.z < 0.1) {
      console.log("dissappear")
      return
    }
    else if (startPoint.z < 0.1) {
      // compute t which is a % ratio of the vector length.
      // we compute t such that beyond this part of the vector, we are 0.1 z in front of the camera
      // we thus move the starting point (x,y,z) at exactly vectorStart + t * vectorLength
      // now start point will be rendered in front of camera
      const t = (0.1 - startPoint.z) / (endPoint.z - startPoint.z);
      startPoint.x = startPoint.x + t * (endPoint.x - startPoint.x);
      startPoint.y = startPoint.y + t * (endPoint.y - startPoint.y);
      startPoint.z = 0.1;
    }

    else if (endPoint.z < 0.1) {
      //same thing but for endpoint
      //this happends typically when we look at the center/face illumanated from the vector POV
      //as at that moment the endPoint is behind camera, so we move it just in front of the camera 
      //how ? we find ration t of length of the vector such that starting from startPoint + t*vectorLength, we get a point in front of camera
      //we move the endPoint here
      const t = (0.1 - startPoint.z) / (endPoint.z - startPoint.z);
      endPoint.x = startPoint.x + t * (endPoint.x - startPoint.x);
      endPoint.y = startPoint.y + t * (endPoint.y - startPoint.y);
      endPoint.z = 0.1;
    }

    //2D screen vector points
    const center2DScreen = this.NdcToScreen(this.project(startPoint))
    const light2DScreen = this.NdcToScreen(this.project(endPoint))

    this.arrow(
      light2DScreen,
      center2DScreen,
      "yellow"
    )
  }

  draw() {
    this.clear()

    if (this.options.showVertices) {
      this.draw_vertices()
    }

    if (this.options.showEdges || this.options.showFaces) {
      this.draw_faces()
    }

    if (this.options.showNormals) {
      this.draw_normals()
    }
    if (this.options.showSun) {
      this.draw_directional_light()
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
  showNormals: true,
  showSun: true,
})


//buttons
const vertexBtn = document.getElementById("vertex-button");
const edgeBtn = document.getElementById("edge-button");
const faceBtn = document.getElementById("face-button");
const cullingBtn = document.getElementById("culling-button");
const colorBtn = document.getElementById("color-button");
const normalBtn = document.getElementById("normal-button");
const ambientBtn = document.getElementById("ambient-button");
const directionalBtn = document.getElementById("directional-button");


//sliders
const ambientSlider = document.getElementById("ambient-slider")
const directionalStrengthSlider = document.getElementById("directional-strength-slider")
const directionalElevationSlider = document.getElementById("directional-elevation-slider")
const directionalRotationSlider = document.getElementById("directional-rotation-slider")

/*Renderer is source of truth, initialise UI based on it*/

//Ambient
ambientSlider.disabled = !mainRenderer.lights.ambient.enabled;
ambientSlider.value = mainRenderer.lights.ambient.strength;

//Directional
directionalStrengthSlider.disabled = !mainRenderer.lights.directional.enabled;
directionalElevationSlider.disabled = !mainRenderer.lights.directional.enabled;
directionalRotationSlider.disabled = !mainRenderer.lights.directional.enabled;

directionalStrengthSlider.value = mainRenderer.lights.directional.strength;
directionalElevationSlider.value = mainRenderer.lights.directional.elevation;
directionalRotationSlider.value = mainRenderer.lights.directional.rotation;


/*initialise button styles to the current initial state*/
vertexBtn.classList.toggle("active", mainRenderer.options.showVertices);
edgeBtn.classList.toggle("active", mainRenderer.options.showEdges);
faceBtn.classList.toggle("active", mainRenderer.options.showFaces);
cullingBtn.classList.toggle("active", mainRenderer.options.showBackfaceCulling);
colorBtn.classList.toggle("active", mainRenderer.options.showColors);
normalBtn.classList.toggle("active", mainRenderer.options.showNormals);
ambientBtn.classList.toggle("active", mainRenderer.lights.ambient.enabled);
directionalBtn.classList.toggle("active", mainRenderer.lights.directional.enabled);

/*Buttons Listener*/

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

normalBtn.addEventListener("click", () => {
  mainRenderer.toggleNormals();
  normalBtn.classList.toggle("active", mainRenderer.options.showNormals);
})

ambientBtn.addEventListener("click", () => {
  mainRenderer.toggleAmbientLighting()
  ambientBtn.classList.toggle("active", mainRenderer.lights.ambient.enabled)
  ambientSlider.disabled = !mainRenderer.lights.ambient.enabled
})

directionalBtn.addEventListener("click", () => {
  mainRenderer.toggleDirectionalLighting()

  directionalBtn.classList.toggle("active", mainRenderer.lights.directional.enabled)

  directionalStrengthSlider.disabled = !mainRenderer.lights.directional.enabled;
  directionalElevationSlider.disabled = !mainRenderer.lights.directional.enabled;
  directionalRotationSlider.disabled = !mainRenderer.lights.directional.enabled;
});

document.getElementById("reset-button").addEventListener("click", () => {
  mainRenderer.camera.reset();
})

/*Sliders Listener*/

ambientSlider.addEventListener("input", () => {
  //.value returns a string
  mainRenderer.lights.ambient.strength = Number(ambientSlider.value)
})

directionalStrengthSlider.addEventListener("input", () => {
  mainRenderer.lights.directional.strength = Number(directionalStrengthSlider.value);
})

directionalElevationSlider.addEventListener("input", () => {
  mainRenderer.lights.directional.elevation = Number(directionalElevationSlider.value);
})

directionalRotationSlider.addEventListener("input", () => {
  mainRenderer.lights.directional.rotation = Number(directionalRotationSlider.value);
})