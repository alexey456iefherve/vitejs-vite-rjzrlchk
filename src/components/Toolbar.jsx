import { useState, useEffect } from 'react';

export default function Toolbar({
  onImageUpload,
  onDownload,
  onClearCanvas,
  onDeleteSelected,
  onToggleDrawing,
  onToggleEraser,
  isDarkMode,     // 🌟 Принимаем пропс темы из App.jsx
  setIsDarkMode, // 🌟 Принимаем функцию переключения темы из App.jsx
}) {
  const [activeMenu, setActiveMenu] = useState(null); // 'file', 'edit' или null

  // Закрываем меню при клике в любое другое место экрана
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.menu-container')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleMenuClick = (menuType) => {
    setActiveMenu(activeMenu === menuType ? null : menuType);
  };

  return (
    <div 
      style={{
        ...toolbarStyle,
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', // Фон тулбара
        borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0' // Нижний бордер
      }}
    >
      {/* ЛЕВАЯ СТОРОНА: ВЫПАДАЮЩИЕ МЕНЮ */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* МЕНЮ: ФАЙЛ */}
        <div className="menu-container" style={{ position: 'relative' }}>
          <button
            onClick={() => handleMenuClick('file')}
            style={{
              ...menuTabStyle,
              color: isDarkMode ? '#f8fafc' : '#334155', // Текст кнопки Файл
              backgroundColor:
                activeMenu === 'file' 
                  ? (isDarkMode ? '#334155' : '#f1f5f9') 
                  : 'transparent',
            }}
          >
            Файл
          </button>

          {activeMenu === 'file' && (
            <div 
              style={{ 
                ...dropdownStyle, 
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0'
              }}
            >
              <label style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                📁 Открыть фото...
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    onImageUpload(e);
                    setActiveMenu(null);
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  onDownload();
                  setActiveMenu(null);
                }}
              >
                💾 Сохранить как PNG
              </div>
              <hr style={{ ...dividerStyle, borderTopColor: isDarkMode ? '#334155' : '#e2e8f0' }} />
              <div
                style={{ ...dropdownItemStyle, color: '#e74c3c' }}
                onClick={() => {
                  onClearCanvas();
                  setActiveMenu(null);
                }}
              >
                💥 Очистить холст
              </div>
            </div>
          )}
        </div>

        {/* МЕНЮ: РЕДАКТИРОВАНИЕ */}
        <div className="menu-container" style={{ position: 'relative' }}>
          <button
            onClick={() => handleMenuClick('edit')}
            style={{
              ...menuTabStyle,
              color: isDarkMode ? '#f8fafc' : '#334155', // Текст кнопки Редактирование
              backgroundColor:
                activeMenu === 'edit' 
                  ? (isDarkMode ? '#334155' : '#f1f5f9') 
                  : 'transparent',
            }}
          >
            Редактирование
          </button>

          {activeMenu === 'edit' && (
            <div 
              style={{ 
                ...dropdownStyle, 
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0'
              }}
            >
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  onDeleteSelected();
                  setActiveMenu(null);
                }}
              >
                🗑️ Удалить выбранное{' '}
                <span
                  style={{
                    float: 'right',
                    color: '#94a3b8',
                    fontSize: '11px',
                    marginLeft: '10px',
                  }}
                >
                  Del
                </span>
              </div>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  onToggleDrawing();
                  setActiveMenu(null);
                }}
              >
                ✏️ Режим рисования
              </div>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  onToggleEraser();
                  setActiveMenu(null);
                }}
              >
                🧽 Ластик
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ПРАВАЯ СТОРОНА: БЫСТРЫЕ ДЕЙСТВИЯ + КНОПКА-ИКОНКА ТЕМЫ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* 🌗 КНОПКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ (ИКОНКА) */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <button onClick={onDownload} style={quickBtnStyle}>
          💾 Быстрый экспорт
        </button>
      </div>
    </div>
  );
}

// СТИЛИ КОМПОНЕНТА ТУЛБАРА (Остаются оригинальными)
const toolbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  padding: '6px 20px',
  position: 'relative',
  zIndex: 1000,
};

const menuTabStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 14px',
  fontSize: '14px',
  cursor: 'pointer',
  borderRadius: '4px',
  fontWeight: '500',
  color: '#334155',
  outline: 'none',
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  boxShadow:
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  padding: '6px 0',
  minWidth: '200px',
  display: 'flex',
  flexDirection: 'column',
  marginTop: '4px',
};

const dropdownItemStyle = {
  padding: '8px 16px',
  fontSize: '13px',
  color: '#1e293b',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'block',
  backgroundColor: 'transparent',
  border: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const dividerStyle = {
  margin: '4px 0',
  border: 'none',
  borderTop: '1px solid #e2e8f0',
};

const quickBtnStyle = {
  padding: '6px 12px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 'bold',
};
