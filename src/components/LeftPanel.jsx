import { useState } from 'react';

export default function LeftPanel({
  onImageUpload,
  onAddText,
  onAddRect,
  onAddTriangle,
  onAddHexagon,
  onAddLine,
  isDrawing,
  onToggleDrawing,
  isEraser, 
  onToggleEraser,
  isDarkMode,
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} 
      style={{
        ...toggleOpenBtnStyle,
        backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        color: isDarkMode ? '#f8fafc' : '#1e293b',
      }}
      >
        ▶
      </button>
    );
  }

  return (
    <div 
    style={{
      ...panelStyle,
      backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      color: isDarkMode ? '#f8fafc' : '#1e293b'
    }}
  >
       <div 
        style={{
          ...headerStyle,
          borderBottomColor: isDarkMode ? '#334155' : '#ddd'
        }}
      >
        <h4 style={{ margin: 0 }}>Инструменты</h4>
        <button onClick={() => setIsOpen(false)} style={closeBtnStyle}>
          ✕
        </button>
      </div>

      <label style={uploadLabelStyle}>
        📁 Фото
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          style={{ display: 'none' }}
        />
      </label>

      <button onClick={onAddText} style={btnStyle}>
        🔤 Текст
      </button>
      <button onClick={onAddRect} style={btnStyle}>
        🟦 Квадрат
      </button>
      <button onClick={onAddTriangle} style={btnStyle}>
        🔺 Треугольник
      </button>
      <button onClick={onAddHexagon} style={btnStyle}>
        ⬡ Шестиугольник
      </button>
      <button onClick={onAddLine} style={btnStyle}>
        ➖ Линия
      </button>

      {/* КНОПКА СВОБОДНОГО РИСОВАНИЯ */}
      <button
        onClick={onToggleDrawing}
        style={{
          ...btnStyle,
          backgroundColor: isDrawing ? '#2ecc71' : '#e67e22', // Зеленый если включено, оранжевый если выключено
          fontWeight: isDrawing ? 'bold' : 'normal',
        }}
      >
        {isDrawing ? '🟢 Рисование: ВКЛ' : '✏️ Рисовать кистью'}
      </button>

      {/* КНОПКА ЛАСТИКА */}
      <button
        onClick={onToggleEraser}
        style={{
          ...btnStyle,
          backgroundColor: isEraser ? '#e74c3c' : '#7f8c8d', // Красный если включен, серый если выключен
          fontWeight: isEraser ? 'bold' : 'normal',
        }}
      >
        {isEraser ? '🛑 Ластик: ВКЛ' : '🧽 Ластик'}
      </button>
    </div>
  );
}

// Все стили остаются без изменений
const panelStyle = {
  backgroundColor: '#f8f9fa',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'between',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  paddingBottom: '8px',
  marginBottom: '4px',
  gap: '10px',
};

const btnStyle = {
  padding: '8px 12px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '14px',
};

const uploadLabelStyle = {
  ...btnStyle,
  backgroundColor: '#9b59b6',
  textAlign: 'center',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '14px',
  cursor: 'pointer',
  color: '#95a5a6',
  marginLeft: 'auto',
  padding: '2px 6px',
};

const toggleOpenBtnStyle = {
  padding: '12px 8px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #e2e8f0',
  borderRadius: '0 8px 8px 0',
  cursor: 'pointer',
  fontWeight: 'bold',
  alignSelf: 'start',
};
