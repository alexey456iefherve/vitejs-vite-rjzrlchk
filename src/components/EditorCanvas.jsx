import { forwardRef } from 'react';

const EditorCanvas = forwardRef((props, ref) => {
  return (
    <div
      style={{
        border: '2px dashed #ccc',
        display: 'inline-block',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <canvas ref={ref} />
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
export default EditorCanvas;
