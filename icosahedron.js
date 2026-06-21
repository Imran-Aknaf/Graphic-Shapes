const phi = (1 + Math.sqrt(5)) / 2
const size = 0.3

function scale({ x, y, z }) {
  return {
    x: x * size,
    y: y * size,
    z: z * size
  }
}

export const vs_ico = [
  scale({ x: -1, y: phi, z: 0 }),
  scale({ x: 1, y: phi, z: 0 }),
  scale({ x: -1, y: -phi, z: 0 }),
  scale({ x: 1, y: -phi, z: 0 }),

  scale({ x: 0, y: -1, z: phi }),
  scale({ x: 0, y: 1, z: phi }),
  scale({ x: 0, y: -1, z: -phi }),
  scale({ x: 0, y: 1, z: -phi }),

  scale({ x: phi, y: 0, z: -1 }),
  scale({ x: phi, y: 0, z: 1 }),
  scale({ x: -phi, y: 0, z: -1 }),
  scale({ x: -phi, y: 0, z: 1 }),
]

export const fs_ico = [
  [0, 11, 5],
  [0, 5, 1],
  [0, 1, 7],
  [0, 7, 10],
  [0, 10, 11],

  [1, 5, 9],
  [5, 11, 4],
  [11, 10, 2],
  [10, 7, 6],
  [7, 1, 8],

  [3, 9, 4],
  [3, 4, 2],
  [3, 2, 6],
  [3, 6, 8],
  [3, 8, 9],

  [4, 9, 5],
  [2, 4, 11],
  [6, 2, 10],
  [8, 6, 7],
  [9, 8, 1]
]