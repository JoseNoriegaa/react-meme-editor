// eslint-disable-next-line no-unused-vars
import React from 'react';

/**
 * @param {React.MutableRefObject<HTMLCanvasElement>} canvasRef
 * @param {string | string[]} text text to measure
 * @returns {number} width of text
 */
const getTextWidth = (ctx, text) => {
  let w = 0;

  let lines = text;

  if (typeof text === 'string') {
    lines = text.split('\n');
  }

  for (let i = 0; i < lines.length; i += 1) {
    const metrics = ctx.measureText(lines[i]);

    if (metrics.width > w) {
      w = metrics.width;
    }
  }

  return w;
};

export {
  getTextWidth,
};
