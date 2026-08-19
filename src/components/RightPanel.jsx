import { useState } from 'react';

export default function RightPanel({
  textColor,
  onColorChange,
  fontSize,
  onFontSizeChange,
  opacity,
  onOpacityChange,
  rotation,
  onRotationChange,
  onDelete,
  isDrawing,
  brushWidth,
  onBrushWidthChange,
  fontFamily,
  onFontFamilyChange,
  onBringToFront,
  onSendToBack,

  brushType,
  onBrushTypeChange,
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
        ◀
      </button>
    );
  }

  return (
    <div 
    style={{
      ...panelStyle,
      backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      color: isDarkMode ? '#f8fafc' : '#1e293b',
    }}
    >
      <div style={{ ...headerStyle, borderBottomColor: isDarkMode ? '#334155' : '#ddd' }}>
        <h4 style={{ margin: 0 }}>Свойства</h4>
        <button onClick={() => setIsOpen(false)} style={closeBtnStyle}>
          ✕
        </button>
      </div>

      {/* Цвет */}
      <div style={controlGroupStyle}>
      <label style={{ ...labelStyle, color: isDarkMode ? '#94a3b8' : '#555' }}>Цвет:</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={textColor}
            onChange={(e) => onColorChange(e.target.value)}
            style={{ ...colorPickerStyle, borderColor: isDarkMode ? '#334155' : '#ccc' }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isDarkMode ? '#cbd5e1' : '#000' }}>
            {textColor}
          </span>
        </div>
      </div>

      {/* НАСТРОЙКА КИСТИ (Показывается только в режиме рисования) */}
      {isDrawing ? (
        <div
        style={{
          ...controlGroupStyle,
          backgroundColor: isDarkMode ? '#334155' : '#eef2f7', // Темная или светлая подложка для кисти
          padding: '8px',
          borderRadius: '4px',
          gap: '9px',
        }}
        >
          {/* ВЫБОР ФОРМЫ КИСТИ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ ...labelStyle, color: isDarkMode ? '#cbd5e1' : '#555' }}>Форма кисти:</label>
            <select
              value={brushType}
              onChange={(e) => onBrushTypeChange(e.target.value)}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f8fafc' : '#1e293b',
                fontSize: '13px',
              }}
            >
              <option value="pencil">✏️ Обычная (Карандаш)</option>
              <option value="square">🟩 Квадраты (Пиксели)</option>
              <option value="spray">💨 Распылитель (Спрей)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label
              style={{ ...labelStyle, color: '#e67e22', fontWeight: 'bold' }}>
              Толщина кисти: {brushWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={brushWidth}
              onChange={(e) => onBrushWidthChange(Number(e.target.value))}
              style={{ width: '75%' }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Слайдеры для фигур показываем, только когда НЕ рисуем */}
          {/* ВЫБОР СТИЛЯ ШРИФТА */}
          <div style={controlGroupStyle}>
          <label style={{ ...labelStyle, color: isDarkMode ? '#94a3b8' : '#555' }}>Семейство шрифта:</label>
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: isDarkMode ? '#475569' : '#cbd5e1',
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f8fafc' : '#1e293b',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: fontFamily,
              }}
            >
              <option value="sans-serif" style={{ fontFamily: 'sans-serif' }}>
                Стандартный без засечек
              </option>
              <option
                value="'Times New Roman', Times, serif"
                style={{ fontFamily: "'Times New Roman', serif" }}
              >
                Times New Roman (Классика)
              </option>
              <option
                value="Georgia, serif"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Georgia (Книжный)
              </option>
              <option value="Roboto" style={{ fontFamily: 'Roboto' }}>
                Roboto (Строгий)
              </option>
              <option value="Poppins" style={{ fontFamily: 'Poppins' }}>
                Poppins (Современный)
              </option>
              <option
                value="Playfair Display"
                style={{ fontFamily: 'Playfair Display' }}
              >
                Playfair (Контрастные засечки)
              </option>
              <option value="Lora" style={{ fontFamily: 'Lora' }}>
                Lora (Элегантный с засечками)
              </option>
              <option value="Oswald" style={{ fontFamily: 'Oswald' }}>
                Oswald (Узкий)
              </option>
              <option value="Caveat" style={{ fontFamily: 'Caveat' }}>
                Caveat (Рукописный)
              </option>
            </select>
          </div>

          {/* Размер текста */}
          <div style={controlGroupStyle}>
          <label style={{ ...labelStyle, color: isDarkMode ? '#94a3b8' : '#555' }}>Размер шрифта: {fontSize}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Вращение объекта */}
          <div style={controlGroupStyle}>
          <label style={{ ...labelStyle, color: isDarkMode ? '#94a3b8' : '#555' }}>Поворот: {rotation}°</label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => onRotationChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Прозрачность */}
          <div style={controlGroupStyle}>
          <label style={{ ...labelStyle, color: isDarkMode ? '#94a3b8' : '#555' }}>
              Прозрачность: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </>
      )}

      {/* БЛОК ИЗМЕНЕНИЯ СЛОЕВ ОБЪЕКТА */}
      {!isDrawing && (
        <div style={controlGroupStyle}>
          <label style={{ ...labelStyle, color: isDarkMode ? '#94a3b8' : '#555' }}>Порядок слоев:</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={onBringToFront} style={layerBtnStyle}>
              🔼 На фото (Наверх)
            </button>
            <button onClick={onSendToBack} style={layerBtnStyle}>
              🔽 Под фото (Вниз)
            </button>
          </div>
        </div>
      )}

      {/* Удаление */}
      <button onClick={onDelete} style={deleteBtnStyle}>
        🗑️ Удалить
      </button>
    </div>
  );
}

// ==========================================
// СТИЛИ КОМПОНЕНТА
// ==========================================
const panelStyle = {
  backgroundColor: '#f8f9fa',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  paddingBottom: '8px',
  marginBottom: '4px',
  gap: '10px',
};

const controlGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const labelStyle = { fontSize: '12px', color: '#555', fontWeight: '500' };

const colorPickerStyle = {
  cursor: 'pointer',
  width: '35px',
  height: '25px',
  padding: 0,
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const layerBtnStyle = {
  flex: 1,
  padding: '6px 4px',
  backgroundColor: '#34495e',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: '500',
  textAlign: 'center',
};

const deleteBtnStyle = {
  padding: '8px',
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  marginTop: '5px',
  fontWeight: 'bold',
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
  borderRadius: '8px 0 0 8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  alignSelf: 'start',
};
