function subtract(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  }
}

function add(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  }
}

function multiply(v, s) {
  /*
  returns scalar * vector 
  */
  return {
    x: v.x * s,
    y: v.y * s,
    z: v.z * s
  }
}

function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function crossProduct(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }
}

//function computeFaceCenter { } 

function computeNormal(face, model) {

  // This part is needed because the 3 points must be different (eg : uvSphere colapse near poles making 2 "diff" points equal)

  /* const uniqueVerts = []

  for (let i = 0; i < face.length; i++) {
    const v = model.vs[face[i]]

    let isDuplicate = false

    for (let j = 0; j < uniqueVerts.length; j++) {
      if (uniqueVerts[j].x === v.x && uniqueVerts[j].y === v.y && uniqueVerts[j].z === v.z) {
        isDuplicate = true
        break
      }
    }

    if (!isDuplicate) {
      uniqueVerts.push(v)
    }

    if (uniqueVerts.length === 3) {
      break
    }
  }

  if (uniqueVerts.length < 3) {
    console.log("Issue : computing the normal where 2 points are the same")
  }

  //takes 3 different points that define the plane
  const v0 = uniqueVerts[0]
  const v1 = uniqueVerts[1]
  const v2 = uniqueVerts[2] */

  let v0 = model.vs[face[0]]
  let v1 = model.vs[face[1]]
  let v2 = model.vs[face[2]]

  //takes the vectors lying on the surface on this plane
  const e1 = subtract(v1, v0)
  const e2 = subtract(v2, v0)

  const normal = crossProduct(e1, e2)

  return normal
}

function computeCenter(vertices) {
  const center = { x: 0, y: 0, z: 0 }
  for (const v of vertices) {
    center.x += v.x
    center.y += v.y
    center.z += v.z
  }

  return {
    x: center.x / vertices.length,
    y: center.y / vertices.length,
    z: center.z / vertices.length,
  }
}

export function fixWindingOrder(model) {
  //we find the geometric center of our convex object 
  const objCenter = computeCenter(model.vs)
  for (let i = 0; i < model.fs.length; i++) {
    const face = model.fs[i]
    //compute face normal vector
    const normalVec = computeNormal(face, model)

    const face_vertices = []
    for (const index of face) {
      face_vertices.push(model.vs[index])
    }

    //compute objcenter->faceCenter vector 
    const faceCenter = computeCenter(face_vertices)

    const outwardVec = {
      x: faceCenter.x - objCenter.x,
      y: faceCenter.y - objCenter.y,
      z: faceCenter.z - objCenter.z
    }

    //dot product to see if normal is facing outword (+), or inward/opposite (-)
    const dot = dotProduct(normalVec, outwardVec)

    if (dot > 0) {
      //wrong orientation, need to reverse
      model.fs[i] = [...face].reverse()
    }
  }

  return model
}