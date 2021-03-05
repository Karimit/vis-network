"use strict";

import CircleImageBase from "../util/CircleImageBase";
import { tweenFunctions } from "../../../../../DOMutil";

/**
 * A Circle Node/Cluster shape.
 *
 * @augments CircleImageBase
 */
class Circle extends CircleImageBase {
  /**
   * @param {object} options
   * @param {object} body
   * @param {Label} labelModule
   */
  constructor(options, body, labelModule) {
    super(options, body, labelModule);
    this._setMargins(labelModule);
    this.step = 0.01
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} [selected]
   * @param {boolean} [hover]
   */
  resize(ctx, selected = this.selected, hover = this.hover) {
    if (!selected) {
      this.step = 0
    }

    if (this.needsRefresh(selected, hover) || (selected && this.step < 1)) {
      const dimensions = this.getDimensionsFromLabel(ctx, selected, hover);

      let diameter = Math.max(
        dimensions.width + this.margin.right + this.margin.left,
        dimensions.height + this.margin.top + this.margin.bottom
      );

      if (selected) {
        const diff = tweenFunctions.easeOutBounce(this.step, 0, this.options.selectedWidthDelta, 2)
        diameter += diff ?? 0
        this.step += 0.05
      }

      this.options.size = diameter / 2; // NOTE: this size field only set here, not in Ellipse, Database, Box
      this.width = diameter;
      this.height = diameter;
      this.radius = this.width / 2;
    }
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x width
   * @param {number} y height
   * @param {boolean} selected
   * @param {boolean} hover
   * @param {ArrowOptions} values
   */
  draw(ctx, x, y, selected, hover, values) {
    this.resize(ctx, selected, hover);
    this.left = x - this.width / 2;
    this.top = y - this.height / 2;

    this._drawRawCircle(ctx, x, y, values);

    this.updateBoundingBox(x, y);
    let diff = 0
    const selectedAdditionalWidth = (this.options.selectedWidthDelta ?? 0) / 2
    if (selected && selectedAdditionalWidth > 0) {
      diff = tweenFunctions.easeOutBounce(this.step, 0, selectedAdditionalWidth, 2)
    }
    this.labelModule.draw(
      ctx,
      this.left + this.textSize.width / 2 + (selected ?  diff : 0) + this.margin.left,
      y,
      selected,
      hover
    );
  }

  /**
   *
   * @param {number} x width
   * @param {number} y height
   */
  updateBoundingBox(x, y) {
    const size = this.options.size

    this.boundingBox.top = y - size;
    this.boundingBox.left = x - size;
    this.boundingBox.right = x + size;
    this.boundingBox.bottom = y + size;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @returns {number}
   */
  distanceToBorder(ctx) {
    if (ctx) {
      this.resize(ctx);
    }
    return this.width * 0.5;
  }
}

export default Circle;
