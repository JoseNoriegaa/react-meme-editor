// eslint-disable-next-line no-unused-vars
import React, {
  useState,
  useMemo,
} from 'react';

import { getTextWidth } from './utils';

/**
 * @param {React.MutableRefObject<HTMLCanvasElement>} canvasRef
 * @param {string} defaultText
 * @param {number} defaultX
 * @param {number} defaultY
 * @param {boolean} defaultY
 */
const useDraggableText = (
  canvasRef,
  defaultText = '',
  lineHeight = 0,
  defaultX = 0,
  defaultY = 0,
  isBottom = false,
) => {
  const [text, setText] = useState(defaultText);
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });

  const lines = useMemo(() => {
    const chunks = text?.split('\n') ?? [];
    return chunks;
  }, [text]);

  const width = useMemo(() => {
    if (canvasRef.current) {
      const w = getTextWidth(canvasRef.current.getContext('2d'), lines ?? []);
      return w;
    }

    return 0;
  }, [canvasRef, lines, lineHeight]);

  const height = useMemo(
    () => lines.length * lineHeight,
    [lineHeight, lines.length],
  );

  /**
   * @param {string} val
   */
  const handleTextChange = (val) => {
    const ctx = canvasRef.current.getContext('2d');

    const prevWidth = width;
    const newWidth = getTextWidth(ctx, val);

    let newX = position.x;
    let newY = position.y;

    if (position.y <= 0) {
      const canvasMetrics = canvasRef.current.getBoundingClientRect();

      if (isBottom) {
        newY = lineHeight + 10;
        newX = (canvasMetrics.width / 2) - (newWidth / 2);
      } else {
        newY = canvasMetrics.height - 10;
        newX = canvasMetrics.width / 2;
      }
    }

    if (prevWidth > newWidth) {
      newX += (prevWidth - newWidth) / 2;
    } else if (prevWidth < newWidth) {
      newX -= (newWidth - prevWidth) / 2;
    }

    if (isBottom) {
      const prevLines = lines;
      const currentLines = val.split('\n');

      if (currentLines.length > prevLines.length) {
        newY -= (lineHeight * (currentLines.length - prevLines.length));
      } else if (currentLines.length < prevLines.length) {
        newY += (lineHeight * (prevLines.length - currentLines.length));
      }
    }

    setText(val);
    setPosition({ x: newX, y: newY });
  };

  return [
    text,
    position,
    width,
    height,
    lines,
    handleTextChange,
    setPosition,
  ];
};

export {
  useDraggableText,
};
