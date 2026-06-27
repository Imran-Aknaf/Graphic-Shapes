const height = 1.5

export const vs_octa = [
  { x: 0.5, y: 0, z: 0 }, //right (0)
  { x: -0.5, y: 0, z: 0 }, //left (0.5)
  { x: 0, y: height / 2, z: 0 }, //up    (2)
  { x: 0, y: -height / 2, z: 0 }, //down (3)
  { x: 0, y: 0, z: 0.5 },//front  (4)
  { x: 0, y: 0, z: -0.5 }, //back (5)
]

export const fs_octa = [
  [2, 5, 0],
  [2, 1, 5],
  [3, 0, 5],
  [3, 5, 1],

  [2, 0, 4],
  [2, 4, 1],
  [3, 4, 0],
  [3, 1, 4],
]