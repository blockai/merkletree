import {
  findLeaf,
  climb,
  left,
  right,
} from './binary-tree.js'
import { createHash } from 'crypto'

const toBuffer = (value) => {
  if (Buffer.isBuffer(value)) return value
  return new Buffer(value)
}

const combine = (hashAlgorithm = 'sha256', encoding = 'hex') => (left, right) => {
  const hash = createHash(hashAlgorithm)
  const input = Buffer.concat([
    toBuffer(left),
    toBuffer(right),
  ])
  return hash.update(input).digest('hex')
}

export const computeTree = (combineFn) => (leaves) => {
  const tree = [...leaves.reverse()]
  let idx = 0
  while (idx + 1 < tree.length) {
    tree.push(combineFn(tree[idx + 1], tree[idx]))
    idx = idx + 2
  }
  return tree.reverse()
}

// throws if leaf not found
export const proof = (tree) => (leafData) => {
  const idx = findLeaf(tree)(leafData)
  const res = []
  climb(tree)(idx, (data, idx) => {
    const leftIdx = left(tree)(idx)
    const rightIdx = right(tree)(idx)
    res.push({
      left: tree[leftIdx],
      parent: tree[idx],
      right: tree[rightIdx],
    })
  })
  return res
}

export default (leaves, {
  hashAlgorithm,
  encoding,
} = {}) => {
  const tree = computeTree(combine(hashAlgorithm, encoding))(leaves)

  return {
    root: () => tree[0],
    proof: (leaf) => proof(tree)(leaf),
  }
}