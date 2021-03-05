// DOM utility methods

/**
 * this prepares the JSON container for allocating SVG elements
 *
 * @param {object} JSONcontainer
 * @private
 */
export function prepareElements(JSONcontainer) {
  // cleanup the redundant svgElements;
  for (const elementType in JSONcontainer) {
    if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) {
      JSONcontainer[elementType].redundant = JSONcontainer[elementType].used;
      JSONcontainer[elementType].used = [];
    }
  }
}

/**
 * this cleans up all the unused SVG elements. By asking for the parentNode, we only need to supply the JSON container from
 * which to remove the redundant elements.
 *
 * @param {object} JSONcontainer
 * @private
 */
export function cleanupElements(JSONcontainer) {
  // cleanup the redundant svgElements;
  for (const elementType in JSONcontainer) {
    if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) {
      if (JSONcontainer[elementType].redundant) {
        for (let i = 0; i < JSONcontainer[elementType].redundant.length; i++) {
          JSONcontainer[elementType].redundant[i].parentNode.removeChild(
            JSONcontainer[elementType].redundant[i]
          );
        }
        JSONcontainer[elementType].redundant = [];
      }
    }
  }
}

/**
 * Ensures that all elements are removed first up so they can be recreated cleanly
 *
 * @param {object} JSONcontainer
 */
export function resetElements(JSONcontainer) {
  prepareElements(JSONcontainer);
  cleanupElements(JSONcontainer);
  prepareElements(JSONcontainer);
}

/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {object} JSONcontainer
 * @param {object} svgContainer
 * @returns {Element}
 * @private
 */
export function getSVGElement(elementType, JSONcontainer, svgContainer) {
  let element;
  // allocate SVG element, if it doesnt yet exist, create one.
  if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) {
    // this element has been created before
    // check if there is an redundant element
    if (JSONcontainer[elementType].redundant.length > 0) {
      element = JSONcontainer[elementType].redundant[0];
      JSONcontainer[elementType].redundant.shift();
    } else {
      // create a new element and add it to the SVG
      element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        elementType
      );
      svgContainer.appendChild(element);
    }
  } else {
    // create a new element and add it to the SVG, also create a new object in the svgElements to keep track of it.
    element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      elementType
    );
    JSONcontainer[elementType] = { used: [], redundant: [] };
    svgContainer.appendChild(element);
  }
  JSONcontainer[elementType].used.push(element);
  return element;
}

/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {object} JSONcontainer
 * @param {Element} DOMContainer
 * @param {Element} insertBefore
 * @returns {*}
 */
export function getDOMElement(
  elementType,
  JSONcontainer,
  DOMContainer,
  insertBefore
) {
  let element;
  // allocate DOM element, if it doesnt yet exist, create one.
  if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) {
    // this element has been created before
    // check if there is an redundant element
    if (JSONcontainer[elementType].redundant.length > 0) {
      element = JSONcontainer[elementType].redundant[0];
      JSONcontainer[elementType].redundant.shift();
    } else {
      // create a new element and add it to the SVG
      element = document.createElement(elementType);
      if (insertBefore !== undefined) {
        DOMContainer.insertBefore(element, insertBefore);
      } else {
        DOMContainer.appendChild(element);
      }
    }
  } else {
    // create a new element and add it to the SVG, also create a new object in the svgElements to keep track of it.
    element = document.createElement(elementType);
    JSONcontainer[elementType] = { used: [], redundant: [] };
    if (insertBefore !== undefined) {
      DOMContainer.insertBefore(element, insertBefore);
    } else {
      DOMContainer.appendChild(element);
    }
  }
  JSONcontainer[elementType].used.push(element);
  return element;
}

/**
 * Draw a point object. This is a separate function because it can also be called by the legend.
 * The reason the JSONcontainer and the target SVG svgContainer have to be supplied is so the legend can use these functions
 * as well.
 *
 * @param {number} x
 * @param {number} y
 * @param {object} groupTemplate: A template containing the necessary information to draw the datapoint e.g., {style: 'circle', size: 5, className: 'className' }
 * @param groupTemplate
 * @param {object} JSONcontainer
 * @param {object} svgContainer
 * @param {object} labelObj
 * @returns {vis.PointItem}
 */
export function drawPoint(
  x,
  y,
  groupTemplate,
  JSONcontainer,
  svgContainer,
  labelObj
) {
  let point;
  if (groupTemplate.style == "circle") {
    point = getSVGElement("circle", JSONcontainer, svgContainer);
    point.setAttributeNS(null, "cx", x);
    point.setAttributeNS(null, "cy", y);
    point.setAttributeNS(null, "r", 0.5 * groupTemplate.size);
  } else {
    point = getSVGElement("rect", JSONcontainer, svgContainer);
    point.setAttributeNS(null, "x", x - 0.5 * groupTemplate.size);
    point.setAttributeNS(null, "y", y - 0.5 * groupTemplate.size);
    point.setAttributeNS(null, "width", groupTemplate.size);
    point.setAttributeNS(null, "height", groupTemplate.size);
  }

  if (groupTemplate.styles !== undefined) {
    point.setAttributeNS(null, "style", groupTemplate.styles);
  }
  point.setAttributeNS(null, "class", groupTemplate.className + " vis-point");
  //handle label

  if (labelObj) {
    const label = getSVGElement("text", JSONcontainer, svgContainer);
    if (labelObj.xOffset) {
      x = x + labelObj.xOffset;
    }

    if (labelObj.yOffset) {
      y = y + labelObj.yOffset;
    }
    if (labelObj.content) {
      label.textContent = labelObj.content;
    }

    if (labelObj.className) {
      label.setAttributeNS(null, "class", labelObj.className + " vis-label");
    }
    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", y);
  }

  return point;
}

/**
 * draw a bar SVG element centered on the X coordinate
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} className
 * @param {object} JSONcontainer
 * @param {object} svgContainer
 * @param {string} style
 */
export function drawBar(
  x,
  y,
  width,
  height,
  className,
  JSONcontainer,
  svgContainer,
  style
) {
  if (height != 0) {
    if (height < 0) {
      height *= -1;
      y -= height;
    }
    const rect = getSVGElement("rect", JSONcontainer, svgContainer);
    rect.setAttributeNS(null, "x", x - 0.5 * width);
    rect.setAttributeNS(null, "y", y);
    rect.setAttributeNS(null, "width", width);
    rect.setAttributeNS(null, "height", height);
    rect.setAttributeNS(null, "class", className);
    if (style) {
      rect.setAttributeNS(null, "style", style);
    }
  }
}

// t: current time, b: beginning value, _c: final value, d: total duration
export const tweenFunctions = {
  // linear: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * t / d + b;
  // },
  // easeInQuad: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * (t /= d) * t + b;
  // },
  // easeOutQuad: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return -c * (t /= d) * (t - 2) + b;
  // },
  // easeInOutQuad: function(t, b, _c, d) {
  //   const c = _c - b;
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t + b;
  //   } else {
  //     return -c / 2 * ((--t) * (t - 2) - 1) + b;
  //   }
  // },
  // easeInCubic: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * (t /= d) * t * t + b;
  // },
  // easeOutCubic: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * ((t = t / d - 1) * t * t + 1) + b;
  // },
  // easeInOutCubic: function(t, b, _c, d) {
  //   const c = _c - b;
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t + b;
  //   } else {
  //     return c / 2 * ((t -= 2) * t * t + 2) + b;
  //   }
  // },
  // easeInQuart: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * (t /= d) * t * t * t + b;
  // },
  // easeOutQuart: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  // },
  // easeInOutQuart: function(t, b, _c, d) {
  //   const c = _c - b;
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t * t + b;
  //   } else {
  //     return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  //   }
  // },
  // easeInQuint: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * (t /= d) * t * t * t * t + b;
  // },
  // easeOutQuint: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  // },
  // easeInOutQuint: function(t, b, _c, d) {
  //   const c = _c - b;
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * t * t * t * t * t + b;
  //   } else {
  //     return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  //   }
  // },
  // easeInSine: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  // },
  // easeOutSine: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * Math.sin(t / d * (Math.PI / 2)) + b;
  // },
  // easeInOutSine: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  // },
  // easeInExpo: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  // },
  // easeOutExpo: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  // },
  // easeInOutExpo: function(t, b, _c, d) {
  //   const c = _c - b;
  //   if (t === 0) {
  //     return b;
  //   }
  //   if (t === d) {
  //     return b + c;
  //   }
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
  //   } else {
  //     return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  //   }
  // },
  // easeInCirc: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  // },
  // easeOutCirc: function(t, b, _c, d) {
  //   const c = _c - b;
  //   return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  // },
  // easeInOutCirc: function(t, b, _c, d) {
  //   const c = _c - b;
  //   if ((t /= d / 2) < 1) {
  //     return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
  //   } else {
  //     return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  //   }
  // },
  // easeInElastic: function(t, b, _c, d) {
  //   const c = _c - b;
  //   let a, p, s;
  //   s = 1.70158;
  //   p = 0;
  //   a = c;
  //   if (t === 0) {
  //     return b;
  //   } else if ((t /= d) === 1) {
  //     return b + c;
  //   }
  //   if (!p) {
  //     p = d * 0.3;
  //   }
  //   if (a < Math.abs(c)) {
  //     a = c;
  //     s = p / 4;
  //   } else {
  //     s = p / (2 * Math.PI) * Math.asin(c / a);
  //   }
  //   return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  // },
  // easeOutElastic: function(t, b, _c, d) {
  //   const c = _c - b;
  //   let a, p, s;
  //   s = 1.70158;
  //   p = 0;
  //   a = c;
  //   if (t === 0) {
  //     return b;
  //   } else if ((t /= d) === 1) {
  //     return b + c;
  //   }
  //   if (!p) {
  //     p = d * 0.3;
  //   }
  //   if (a < Math.abs(c)) {
  //     a = c;
  //     s = p / 4;
  //   } else {
  //     s = p / (2 * Math.PI) * Math.asin(c / a);
  //   }
  //   return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
  // },
  // easeInOutElastic: function(t, b, _c, d) {
  //   const c = _c - b;
  //   let a, p, s;
  //   s = 1.70158;
  //   p = 0;
  //   a = c;
  //   if (t === 0) {
  //     return b;
  //   } else if ((t /= d / 2) === 2) {
  //     return b + c;
  //   }
  //   if (!p) {
  //     p = d * (0.3 * 1.5);
  //   }
  //   if (a < Math.abs(c)) {
  //     a = c;
  //     s = p / 4;
  //   } else {
  //     s = p / (2 * Math.PI) * Math.asin(c / a);
  //   }
  //   if (t < 1) {
  //     return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  //   } else {
  //     return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
  //   }
  // },
  // easeInBack: function(t, b, _c, d, s) {
  //   const c = _c - b;
  //   if (s === void 0) {
  //     s = 1.70158;
  //   }
  //   return c * (t /= d) * t * ((s + 1) * t - s) + b;
  // },
  // easeOutBack: function(t, b, _c, d, s) {
  //   const c = _c - b;
  //   if (s === void 0) {
  //     s = 1.70158;
  //   }
  //   return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  // },
  // easeInOutBack: function(t, b, _c, d, s) {
  //   const c = _c - b;
  //   if (s === void 0) {
  //     s = 1.70158;
  //   }
  //   if ((t /= d / 2) < 1) {
  //     return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
  //   } else {
  //     return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
  //   }
  // },
  // easeInBounce: function(t, b, _c, d) {
  //   const c = _c - b;
  //   const v = tweenFunctions.easeOutBounce(d - t, 0, c, d);
  //   return c - v + b;
  // },
  easeOutBounce: function(t, b, _c, d) {
    const c = _c - b;
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  },
  // easeInOutBounce: function(t, b, _c, d) {
  //   const c = _c - b;
  //   let v;
  //   if (t < d / 2) {
  //     v = tweenFunctions.easeInBounce(t * 2, 0, c, d);
  //     return v * 0.5 + b;
  //   } else {
  //     v = tweenFunctions.easeOutBounce(t * 2 - d, 0, c, d);
  //     return v * 0.5 + c * 0.5 + b;
  //   }
  // }
};
