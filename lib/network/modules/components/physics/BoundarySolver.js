import { Alea } from "vis-util/esnext";

class BoundarySolver {
  /**
   * @param {object} body
   * @param {{physicsNodeIndices: Array, physicsEdgeIndices: Array, forces: {}, velocities: {}}} physicsBody
   * @param {object} options
   */
  constructor(body, physicsBody, canvas, options) {
    this._rng = Alea("REPULSION SOLVER");

    this.body = body
    this.physicsBody = physicsBody
    this.canvas = canvas
    
    this.setOptions(options)
  }

  /**
   * @param {object} options
   */
  setOptions(options) {
    this.options = options
  }

  /**
   * @private
   */
  solve() {
    let distance, dx, dy, fx, fy, restitutionForce
    const nodes = this.body.nodes
    const nodeIndices = this.physicsBody.physicsNodeIndices
    const forces = this.physicsBody.forces

    // console.log(dragForce, distance, fx, fy, dx, dy)
    const canvasHeight = this.canvas.frame.canvas.clientHeight
    const height = canvasHeight / 2
    dx = 0
    dy = 0
    restitutionForce = 0

    // approximation constants
    const a = 1
    const b = 4 / 3

    for (let i = 0; i < nodeIndices.length; i++) {
      const node = nodes[nodeIndices[i]]
      const radius = node.distanceToBorder()
      const nodeId = node.id

      if (Math.abs(node.y) <= height - radius) {
        continue
      }

      dy = node.y < 0 ? node.y + height - radius : node.y - height + radius

      distance = Math.sqrt(dx * dx + dy * dy)
      restitutionForce = a * distance + b
      fx = dx * restitutionForce
      fy = dy * restitutionForce

      forces[nodeId].x += fx
      forces[nodeId].y -= fy
    }
  }
}

export default BoundarySolver
