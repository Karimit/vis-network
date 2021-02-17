import { Alea } from "vis-util/esnext";

class DragSolver {
  /**
   * @param {object} body
   * @param {{physicsNodeIndices: Array, physicsEdgeIndices: Array, forces: {}, velocities: {}}} physicsBody
   * @param {object} options
   */
  constructor(body, physicsBody, options) {
    this._rng = Alea("REPULSION SOLVER");

    this.body = body
    this.physicsBody = physicsBody
    this.setOptions(options)

    this.dragging = false
    this.deltaX = 0
    this.deltaY = 0

    this.body.emitter.on('dragStarted', (pointer) => {
      this.dragging = true
      this.pointer = pointer
    })

    this.body.emitter.on('dragEnded', (pointer) => {
      this.dragging = false
      
      this.deltaX = pointer.x - this.pointer.x
      this.deltaY = pointer.y - this.pointer.y

      this.pointer = pointer
    })

    this.body.emitter.on('drag', (pointer) => {
      this.deltaX = pointer.x - this.pointer.x
      this.deltaY = pointer.y - this.pointer.y
      // console.log('drag', pointer, this.deltaX, this.deltaY)

      this.pointer = pointer
    })
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
    let distance, dx, dy, dragForce
    const nodes = this.body.nodes
    const nodeIndices = this.physicsBody.physicsNodeIndices
    const forces = this.physicsBody.forces
    dx = this.deltaX
    dy = this.deltaY

    if (!this.dragging)
      return;

    distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) {
      distance = 0.1 * this._rng()
      dx = distance
    }

    // approximation constants
    const a = .8
    const b = 4 / 3
    dragForce = a * distance + b
    dragForce = dragForce / distance
    const fx = dx * dragForce
    const fy = dy * dragForce

    // console.log(dragForce, distance, fx, fy, dx, dy)

    for (let i = 0; i < nodeIndices.length; i++) {
      const node = nodes[nodeIndices[i]]
      const nodeId = node.id

      forces[nodeId].x += fx;
      forces[nodeId].y += .05 * fy;
    }
  }
}

export default DragSolver
