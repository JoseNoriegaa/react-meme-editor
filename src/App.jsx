import React, { useState, useRef, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import { useDraggableText } from './hooks';

function App() {
  // Refs
  const canvasRef = useRef(null);

  // States
  const [imageUrl, setImageUrl] = useState('');
  const [lineHeight, setLineHeight] = useState(0);
  const [
    line1,
    line1Position,
    line1Width,
    line1Height,
    lines1,
    setLine1,
    setLine1Position,
  ] = useDraggableText(canvasRef, '', lineHeight, 0, 0, false);

  const [
    line2,
    line2Position,
    line2Width,
    line2Height,
    lines2,
    setLine2,
    setLine2Position,
  ] = useDraggableText(canvasRef, '', lineHeight, 0, 0, true);

  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [lineDragged, setLineDragged] = useState(0);

  // Functions

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {string[]} text lines to render
   * @param {number} x position
   * @param {number} y position
   * @param {number} width
   */
  const renderText = (ctx, lines, x, y, width) => {
    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(
        lines[i],
        x + (width / 2),
        y + (i * lineHeight),
      );
      ctx.strokeText(
        lines[i],
        x + (width / 2),
        y + (i * lineHeight),
      );
    }
  };

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  const previewTextRenderer = (ctx) => {
    renderText(ctx, lines1, line1Position.x, line1Position.y, line1Width);
    renderText(ctx, lines2, line2Position.x, line2Position.y, line2Width);
  };

  const previewRenderer = () => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = imageUrl;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      previewTextRenderer(ctx);
    };
  };

  const getTextHeight = (ctx) => {
    const metrics = ctx.measureText('gF');
    return Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
  };

  const textHittest = (mouseX, mouseY, lineX, lineY, lineW, lineH) => (
    mouseX >= lineX
      && mouseX <= lineX + lineW
      && mouseY >= lineY - lineHeight
      && mouseY <= lineY - lineHeight + lineH
  );

  const onMouseDown = (e) => {
    e.preventDefault();
    const canvasMetrics = canvasRef.current.getBoundingClientRect();

    const startX = parseInt(e.clientX - canvasMetrics.left, 10);
    const startY = parseInt(e.clientY - canvasMetrics.top, 10);

    let isOverText = textHittest(
      startX,
      startY,
      line1Position.x,
      line1Position.y,
      line1Width,
      line1Height,
    );

    if (isOverText) {
      setStartPosition({
        x: startX - line1Position.x,
        y: startY - line1Position.y,
      });
      setLineDragged(1);
    }

    isOverText = textHittest(
      startX,
      startY,
      line2Position.x,
      line2Position.y,
      line2Width,
      line2Height,
    );

    if (isOverText) {
      setStartPosition({
        x: startX - line2Position.x,
        y: startY - line2Position.y,
      });
      setLineDragged(2);
    }
  };

  const onMouseMove = (e) => {
    if (lineDragged === 0) {
      return;
    }

    e.preventDefault();
    const canvasMetrics = canvasRef.current.getBoundingClientRect();

    const mouseX = parseInt(e.clientX - canvasMetrics.left, 10);
    const mouseY = parseInt(e.clientY - canvasMetrics.top, 10);

    const dx = mouseX - startPosition.x;
    const dy = mouseY - startPosition.y;

    if (lineDragged === 1) {
      setLine1Position({
        x: dx,
        y: dy,
      });
    } else if (lineDragged === 2) {
      setLine2Position({
        x: dx,
        y: dy,
      });
    }
  };

  const onMouseUp = (e) => {
    e.preventDefault();
    setLineDragged(0);

    setStartPosition({ x: 0, y: 0 });
  };

  const onMouseOut = (e) => {
    e.preventDefault();
    onMouseUp(e);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'meme.png';
    link.click();
  };

  // Effects
  useEffect(() => {
    previewRenderer();
  }, [
    imageUrl,
    line1,
    line1Position.x,
    line1Position.y,
    line2,
    line2Position.x,
    line2Position.y,
  ]);

  // Resize handler
  useEffect(() => {
    // Set the canvas size to fit its container
    const resizeHandler = () => {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      const fontSize = canvas.width * 0.1;

      const ctx = canvas.getContext('2d');

      ctx.font = `${fontSize}px Impact`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.lineWidth = fontSize * 0.05;

      const lHeight = getTextHeight(ctx);
      setLineHeight(lHeight);
      previewRenderer();
    };
    resizeHandler();

    // repeat it if the window is resized
    window.addEventListener('resize', resizeHandler);

    // return the function to remove the event listener
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  useEffect(() => {
    setLine1Position({
      x: (canvasRef.current.width / 2) - (line1Width / 2),
      y: lineHeight + canvasRef.current.width * 0.05,
    });

    setLine2Position({
      x: (canvasRef.current.width / 2) - (line2Width / 2),
      y: canvasRef.current.height - ((canvasRef.current.width * 0.05) + (line2Height - lineHeight)),
    });
  }, [lineHeight]);

  return (
    <div className="App">
      <Header />

      <main className="app-content">

        <div className="editor">
          <h2>
            Editor
          </h2>

          <div className="controls">
            <div className="preview-container">
              <canvas
                id="editor-preview"
                ref={canvasRef}
                onPointerDown={onMouseDown}
                onPointerMove={onMouseMove}
                onPointerUp={onMouseUp}
                onPointerOut={onMouseOut}
              />

              {
                Boolean(line1) && (
                  <div
                    className="dragbox"
                    style={{
                      height: line1Height,
                      width: line1Width,
                      top: line1Position.y - lineHeight,
                      left: line1Position.x,
                    }}
                  />
                )
              }

              {
                Boolean(line2) && (
                  <div
                    className="dragbox"
                    style={{
                      height: line2Height,
                      width: line2Width,
                      top: line2Position.y - lineHeight,
                      left: line2Position.x,
                    }}
                  />
                )
              }
            </div>

            <div className="inputs">

              <div className="control-item">
                <label htmlFor="image-url">
                  Image URL

                  <input
                    type="text"
                    id="image-url"
                    name="image-url"
                    placeholder="Enter image URL"
                    onChange={(e) => setImageUrl(e.target.value)}
                    value={imageUrl}
                  />
                </label>

              </div>

              <div className="control-item">
                <label htmlFor="top-text">
                  Top Text

                  <textarea
                    type="text"
                    id="top-text"
                    name="top-text"
                    placeholder="Enter top text"
                    disabled={!imageUrl}
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                  />
                </label>

              </div>

              <div className="control-item">
                <label htmlFor="bottom-text">
                  Bottom Text

                  <textarea
                    type="text"
                    id="bottom-text"
                    placeholder="Enter bottom text"
                    disabled={!imageUrl}
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                  />
                </label>

              </div>

              <div className="control-item export-btn-container">
                <button
                  type="button"
                  disabled={!imageUrl || (!line1 && !line2)}
                  onClick={exportImage}
                >
                  Export
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default App;
