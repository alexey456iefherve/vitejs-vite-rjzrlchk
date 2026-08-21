import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import LeftPanel from './components/LeftPanel.jsx';
import RightPanel from './components/RightPanel.jsx';
import EditorCanvas from './components/EditorCanvas.jsx';
import { PencilBrush } from 'fabric'; // Обязательный импорт для v6

export default function App() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(30);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brushWidth, setBrushWidth] = useState(5);
  const [brushType, setBrushType] = useState('pencil'); // 'pencil', 'circle', 'spray'
  const [activeMenu, setActiveMenu] = useState(null); // 'file', 'edit' или null
  const [history, setHistory] = useState([]); // Стек для Undo
  const [redoHistory, setRedoHistory] = useState([]); // Стек для Redo
  const isSavingHistory = useRef(false); // Флаг, чтобы избежать зацикливания при откате
  const clipboardRef = useRef(null); // Хранилище для скопированного объекта
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const saveState = () => {
    if (!fabricRef.current || isSavingHistory.current) return;
    const json = fabricRef.current.toJSON();
    setHistory((prev) => [...prev, JSON.stringify(json)]);
    setRedoHistory([]);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Создаем холст
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 640,
      height: 400,
      backgroundColor: '#ffffff',
    });
    fabricRef.current = canvas;

    // Сохраняем состояние при изменениях
    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);
    canvas.on('path:created', saveState);

    const initialJson = canvas.toJSON();
    setHistory([JSON.stringify(initialJson)]);

    // ОБНОВЛЕНИЕ ПОЛЗУНКОВ ПРИ ВЫБОРЕ ОБЪЕКТА
    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      setOpacity(activeObject.opacity ?? 1);
      setRotation(Math.round(activeObject.angle ?? 0));

      if (activeObject.type === 'text' || activeObject.type === 'i-text') {
        setTextColor(activeObject.fill || '#000000');
        setFontSize(activeObject.fontSize ?? 30);
        setFontFamily(activeObject.fontFamily || 'sans-serif');
      } else if (activeObject.fill && typeof activeObject.fill === 'string') {
        setTextColor(activeObject.fill);
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('object:modified', handleSelection);
    canvas.on('object:moving', handleSelection);
    canvas.on('object:scaling', handleSelection);

    canvas.on('selection:cleared', () => {
      setRotation(0);
      setOpacity(1);
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        const isTypingInInput = document.activeElement?.tagName === 'INPUT';

        if (activeObject && !activeObject.isEditing && !isTypingInInput) {
          canvas.remove(activeObject);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleGlobalClick = (e) => {
      if (!e.target.closest('.menu-tab')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleGlobalClick);
      canvas.off();
      fabricRef.current = null;
      canvas.dispose().catch((err) => {
        console.error('Ошибка при удалении холста Fabric:', err);
      });
    };
  }, []);

  // 🟢 СИНХРОНИЗАЦИЯ ПОЛЗУНКОВ ИЗ ПРАВОЙ ПАНЕЛИ НА ЛЕТУ
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !canvas.isDrawingMode || !canvas.freeDrawingBrush) return;

    // Ширину меняем всегда (и для ластика, и для кисти)
    canvas.freeDrawingBrush.width = brushWidth;

    if (isEraser) {
      // Если включен ластик — намертво держим цвет белым
      canvas.freeDrawingBrush.color = '#ffffff';
    } else {
      // Если включена кисть — берем цвет из правой панели
      canvas.freeDrawingBrush.color = textColor;
    }
  }, [brushWidth, textColor, isEraser, isDrawing]);

  // Вспомогательная функция для настройки кисти
  const applyBrush = (type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // В Fabric v6 используем импортированный PencilBrush напрямую (без fabric.) во избежание падений
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushWidth;
    canvas.freeDrawingBrush.color = textColor;
  };

  // Переключение кисти (Левая панель)
  const toggleDrawing = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const nextState = !isDrawing;

    setIsDrawing(nextState);
    setIsEraser(false); // Выключаем ластик при выборе кисти
    canvas.isDrawingMode = nextState;

    if (nextState) {
      applyBrush(brushType);
    }
  };

  // Переключение ЛАСТИКА (Левая панель)
  const toggleEraser = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const nextState = !isEraser;

    setIsEraser(nextState);
    setIsDrawing(false); // Выключаем кисть при выборе ластика
    canvas.isDrawingMode = nextState;

    if (nextState) {
      // ИСПРАВЛЕНО: Безопасный вызов PencilBrush для v6 + строго белый цвет
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = '#ffffff';
    }
  };

  // Функция изменения типа кисти из правой панели
  const handleBrushTypeChange = (type) => {
    setBrushType(type);
    if (fabricRef.current && fabricRef.current.isDrawingMode && !isEraser) {
      applyBrush(type);
    }
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const text = new fabric.IText('Новый текст', {
      left: 150,
      top: 150,
      fill: textColor,
      fontSize: fontSize,
      opacity: opacity,
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  };

  const addRectangle = () => {
    if (!fabricRef.current) return;
    const rect = new fabric.Rect({
      left: 200,
      top: 150,
      width: 100,
      height: 100,
      fill: textColor,
      opacity: opacity,
    });
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.renderAll();
  };

  const addTriangle = () => {
    if (!fabricRef.current) return;
    const triangle = new fabric.Triangle({
      left: 250,
      top: 150,
      width: 100,
      height: 100,
      fill: textColor,
      opacity: opacity,
    });
    fabricRef.current.add(triangle);
    fabricRef.current.setActiveObject(triangle);
    fabricRef.current.renderAll();
  };

  const addHexagon = () => {
    if (!fabricRef.current) return;
    const size = 60;
    const centerX = 100;
    const centerY = 100;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      points.push({
        x: centerX + size * Math.cos(angle),
        y: centerY + size * Math.sin(angle),
      });
    }
    const hexagon = new fabric.Polygon(points, {
      left: 250,
      top: 250,
      fill: textColor,
      opacity: opacity,
    });
    fabricRef.current.add(hexagon);
    fabricRef.current.setActiveObject(hexagon);
    fabricRef.current.renderAll();
  };

  const addLine = () => {
    if (!fabricRef.current) return;
    
    // Создаем линию: координаты [startX, startY, endX, endY]
    // В Fabric v6 Line принимает массив координат первым аргументом
    const line = new fabric.Line([50, 50, 250, 50], {
      stroke: textColor,       // Цвет линии берем из правой панели
      strokeWidth: brushWidth, // Толщину берем из ползунка ширины кисти
      opacity: opacity,
      left: 200,
      top: 200,
    });

    fabricRef.current.add(line);
    fabricRef.current.setActiveObject(line);
    fabricRef.current.renderAll();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file || !fabricRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data !== 'string') return;

      fabric.FabricImage.fromURL(data).then((img) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const scaleX = (canvas.width * 0.8) / img.width;
        const scaleY = (canvas.height * 0.8) / img.height;
        const scale = Math.min(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
          cornerStyle: 'circle',
          cornerColor: '#3498db',
          cornerSize: 10,
          transparentCorners: false,
        });

        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (newColor) => {
    setTextColor(newColor);
    modifyActiveObject('fill', newColor);

    if (
      fabricRef.current &&
      fabricRef.current.isDrawingMode &&
      fabricRef.current.freeDrawingBrush
    ) {
      fabricRef.current.freeDrawingBrush.color = newColor;
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    modifyActiveObject('fontSize', size);
  };

  const handleFontFamilyChange = (font) => {
    setFontFamily(font);
    modifyActiveObject('fontFamily', font);
  };

  const handleOpacityChange = (val) => {
    setOpacity(val);
    modifyActiveObject('opacity', val);
  };

  const handleRotationChange = (angle) => {
    setRotation(angle);
    modifyActiveObject('angle', angle);
  };

  const handleBrushWidthChange = (width) => {
    setBrushWidth(width);
    if (fabricRef.current && fabricRef.current.freeDrawingBrush) {
      fabricRef.current.freeDrawingBrush.width = width;
    }
  };

  const modifyActiveObject = (property, value) => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      activeObject.set(property, value);
      fabricRef.current.renderAll();
    }
  };

  const bringToFront = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      fabricRef.current.bringObjectToFront(activeObject);
      fabricRef.current.renderAll();
      saveState();
    }
  };

  const sendToBack = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      fabricRef.current.sendObjectToBack(activeObject);
      fabricRef.current.renderAll();
      saveState();
    }
  };

  const editText = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();

    // Проверяем, является ли объект текстом и можно ли его редактировать
    if (
      activeObject &&
      (activeObject.type === 'text' || activeObject.type === 'i-text')
    ) {
      fabricRef.current.setActiveObject(activeObject);
      activeObject.enterEditing(); // Активируем курсор внутри текста
      fabricRef.current.renderAll();
    }
    setActiveMenu(null); // Закрываем выпадающее меню
  };

  const deleteSelected = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      fabricRef.current.remove(activeObject);
      fabricRef.current.discardActiveObject();
      fabricRef.current.renderAll();
    }
  };

  // КОПИРОВАНИЕ ВЫБРАННОГО ОБЪЕКТА
  const copyObject = () => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (!activeObject) return;

    // В Fabric.js v6 клонирование работает асинхронно через клонирование самого объекта
    activeObject.clone().then((cloned) => {
      clipboardRef.current = cloned; // Сохраняем клон в буфер обмена
    });
  };

  // ВСТАВКА ОБЪЕКТА ИЗ БУФЕРА
  const pasteObject = () => {
    if (!fabricRef.current || !clipboardRef.current) return;

    // Клонируем объект из буфера, чтобы можно было вставлять его многократно
    clipboardRef.current.clone().then((clonedObj) => {
      if (!fabricRef.current) return;

      // Делаем небольшое смещение, чтобы вставленный объект не перекрывал оригинал полностью
      clonedObj.set({
        left: clonedObj.left + 20,
        top: clonedObj.top + 20,
        evented: true,
      });

      // Если это текстовый объект, сбрасываем режим редактирования для безопасности
      if (clonedObj.type === 'i-text' || clonedObj.type === 'text') {
        clonedObj.isEditing = false;
      }

      fabricRef.current.add(clonedObj);
      fabricRef.current.setActiveObject(clonedObj); // Делаем вставленный объект активным
      fabricRef.current.renderAll();

      // Срабатывает сохранение в историю (saveState), так как вызвался метод canvas.add()
    });
  };

  const undo = () => {
    // Для отката назад в истории должно быть как минимум 2 состояния:
    // [0] - стартовый холст, [1] - первое действие пользователя.
    if (!fabricRef.current || history.length <= 1) return;

    // Включаем защиту от записи во время загрузки JSON
    isSavingHistory.current = true;

    const currentHistory = [...history];
    // Извлекаем текущее состояние, которое сейчас на холсте
    const currentState = currentHistory.pop();

    // Загружать будем то, что осталось на вершине стека истории
    const previousState = currentHistory[currentHistory.length - 1];

    // Отправляем текущее состояние в стек Redo (шаг вперед)
    setRedoHistory((prev) => [...prev, currentState]);
    // Обновляем историю Undo (без текущего состояния)
    setHistory(currentHistory);

    // Загружаем предыдущее состояние в Fabric.js
    fabricRef.current.loadFromJSON(JSON.parse(previousState)).then(() => {
      fabricRef.current.renderAll();

      // Выключаем защиту ТОЛЬКО внутри .then(), когда Fabric полностью построил объекты
      setTimeout(() => {
        isSavingHistory.current = false;
      }, 50);
    });

    setActiveMenu(null);
  };

  const redo = () => {
    if (!fabricRef.current || redoHistory.length === 0) return;

    isSavingHistory.current = true;

    const nextHistory = [...redoHistory];
    // Извлекаем состояние для шага вперед
    const nextState = nextHistory.pop();

    // Добавляем его в стек истории Undo
    setHistory((prev) => [...prev, nextState]);
    // Обновляем стек Redo
    setRedoHistory(nextHistory);

    // Загружаем это состояние на холст
    fabricRef.current.loadFromJSON(JSON.parse(nextState)).then(() => {
      fabricRef.current.renderAll();

      setTimeout(() => {
        isSavingHistory.current = false;
      }, 50);
    });

    setActiveMenu(null);
  };

  const clearCanvas = () => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = '#ffffff';
    fabricRef.current.renderAll();
  };

  const downloadImage = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'editor.png';
    link.href = dataUrl;
    link.click();
  };

  const downloadSVG = () => {
    if (!fabricRef.current) return;
    const svgCode = fabricRef.current.toSVG();
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'editor.svg';
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  // Метод для получения цвета в зависимости от выбранной темы
  const getThemeColor = (element) => {
     const colors = {
    bgApp: isDarkMode ? '#0f172a' : '#f8fafc',      // Фон страницы
    bgPanel: isDarkMode ? '#1e293b' : '#ffffff',    // Фон панелей и меню
    textMain: isDarkMode ? '#f8fafc' : '#1e293b',   // Главный текст
    textMuted: isDarkMode ? '#94a3b8' : '#334155',  // Текст кнопок меню
    border: isDarkMode ? '#334155' : '#e2e8f0',     // Границы элементов
  };
  return colors[element] || 'transparent';
};

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background-color 0.3s ease', 
      }}
    >
      {/* 👑 ВЕРХНЕЕ МЕНЮ */}
      <div 
        style={{ 
          ...menubarStyle, 
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', // Меняем фон меню
          borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0', // Меняем цвет границы
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}
      >
        <div className="menu-tab" style={{ position: 'relative' }}>
          <button
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            style={{ 
              ...menuBtnStyle, 
              color: isDarkMode ? '#f8fafc' : '#334155' // Светлый текст в темной теме
            }}
          >
            Файл
          </button>
          {activeMenu === 'file' && (
             <div style={{ ...dropdownStyle, backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
             <label style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                📁 Открыть фото...
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageUpload(e);
                    setActiveMenu(null);
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  downloadImage();
                  setActiveMenu(null);
                }}
              >
                💾 Экспорт в PNG
              </div>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  downloadSVG();
                  setActiveMenu(null);
                }}
              >
                📐 Экспорт в SVG
              </div>
              <hr
                style={{
                  margin: '4px 0',
                  border: 'none',
                  borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                }}
              />
              <div
                style={{ ...dropdownItemStyle, color: '#e74c3c' }}
                onClick={() => {
                  clearCanvas();
                  setActiveMenu(null);
                }}
              >
                💥 Очистить холст
              </div>
            </div>
          )}
        </div>

        <div className="menu-tab" style={{ position: 'relative' }}>
        <button
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
            style={{ ...menuBtnStyle, color: isDarkMode ? '#f8fafc' : '#334155' }}
          >
            Редактирование
          </button>
          {activeMenu === 'edit' && (
             <div style={{ ...dropdownStyle, backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
              {/* ↩️ ШАГ НАЗАД */}
              <div
                style={{
                  ...dropdownItemStyle,
                  color: history.length <= 1 ? '#94a3b8' : (isDarkMode ? '#f8fafc' : '#1e293b'),
                  cursor: history.length <= 1 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => {
                  if (history.length > 1) {
                    undo();
                    setActiveMenu(null);
                  }
                }}
              >
                ↩️ Шаг назад (Undo)
              </div>

              {/* ↪️ ШАГ ВПЕРЕД */}
              <div
                style={{
                  ...dropdownItemStyle,
                  color: redoHistory.length === 0 ? '#94a3b8' : (isDarkMode ? '#f8fafc' : '#1e293b'),
                  cursor: redoHistory.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onClick={() => {
                  if (redoHistory.length > 0) {
                    redo();
                    setActiveMenu(null);
                  }
                }}
              >
                ↪️ Шаг вперед (Redo)
              </div>

              {/* 📝 РЕДАКТИРОВАТЬ ТЕКСТ */}
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  editText();
                  setActiveMenu(null);
                }}
              >
                📝 Редактировать текст
              </div>

              <hr
                style={{
                  margin: '4px 0',
                  border: 'none',
                  borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                }}
              />

              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  copyObject();
                  setActiveMenu(null);
                }}
              >
                📄 Копировать объект (Copy)
              </div>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  pasteObject();
                  setActiveMenu(null);
                }}
              >
                📋 Вставить объект (Paste)
              </div>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  deleteSelected();
                  setActiveMenu(null);
                }}
              >
                🗑️ Удалить выбранное
              </div>
              <div
                style={{ ...dropdownItemStyle, color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                onClick={() => {
                  toggleDrawing();
                  setActiveMenu(null);
                }}
              >
                ✏️ Режим рисования
              </div>
            </div>
          )}
        </div>

        <a
          href="https://github.com/alexey456iefherve/vitejs-vite-rjzrlchk" // <-- ЗАМЕНИТЕ НА ВАШУ ССЫЛКУ
          target="_blank"
          rel="noopener noreferrer"
          title="Открыть проект на GitHub"
          style={{
            marginLeft: 'auto', // Выталкивает иконку и кнопку темы в правый угол
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Качественная SVG иконка GitHub, меняющая цвет в зависимости от темы */}
          <svg
            height="22"
            width="22"
            viewBox="0 0 16 16"
            style={{
              fill: isDarkMode ? '#f8fafc' : '#334155',
              transition: 'fill 0.3s ease'
            }}
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
                {/* КНОПКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ (ИКОНКА) */}
                <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
          style={{
            marginLeft: '5px',
            background: 'none',
            border: 'none',
            fontSize: '20px',    // Размер иконки
            cursor: 'pointer',
            padding: '4px 8px',
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
      </div> {/* <-- Это оригинальный закрывающий тег вашего верхнего меню */}

      {/* КОНТЕНТ */}
      <div style={{ padding: '10px 20px', flex: 1, display: 'flex', flexDirection: 'column', }}>
      
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '24px',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            marginTop: '10px',
            transition: 'color 0.3s ease',
          }}
        >
          PRO Фоторедактор
        </h1>

        <div style={layoutStyle}>
          <LeftPanel
            onImageUpload={handleImageUpload}
            onAddText={addText}
            onAddRect={addRectangle}
            onAddTriangle={addTriangle}
            onAddLine={addLine}
            isDrawing={isDrawing}
            onToggleDrawing={toggleDrawing}
            isEraser={isEraser}
            onToggleEraser={toggleEraser}
            onAddHexagon={addHexagon}
            isDarkMode={isDarkMode} 
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              flex: 1,
            }}
          >
            <EditorCanvas ref={canvasRef} />

            <div style={buttonsContainerStyle}>
              <button onClick={downloadImage} style={downloadBtnStyle}>
                Скачать PNG
              </button>
              <button onClick={downloadSVG} style={downloadSvgBtnStyle}>
                Скачать SVG
              </button>
            </div>
          </div>

          <RightPanel
            textColor={textColor}
            onColorChange={handleColorChange}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            opacity={opacity}
            onOpacityChange={handleOpacityChange}
            rotation={rotation}
            onRotationChange={handleRotationChange}
            onDelete={deleteSelected}
            brushWidth={brushWidth}
            onBrushWidthChange={handleBrushWidthChange}
            isDrawing={isDrawing || isEraser}
            fontFamily={fontFamily}
            onFontFamilyChange={handleFontFamilyChange}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            brushType={brushType}
            onBrushTypeChange={handleBrushTypeChange}
            isDarkMode={isDarkMode} 
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// СТИЛИ ДЛЯ ВЫПАДАЮЩЕГО МЕНЮ И ИНТЕРФЕЙСА
// ==========================================
const menubarStyle = {
  display: 'flex',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  padding: '6px 20px',
  gap: '10px',
  zIndex: 9999,
};

const menuBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 12px',
  fontSize: '14px',
  cursor: 'pointer',
  borderRadius: '4px',
  fontWeight: '500',
  color: '#334155',
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  padding: '5px 0',
  minWidth: '180px',
  display: 'flex',
  flexDirection: 'column',
  marginTop: '5px',
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

const layoutStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  gap: '20px',
  width: '100%',
};

const buttonsContainerStyle = {
  display: 'flex',
  gap: '15px',
};

const downloadBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
};

const downloadSvgBtnStyle = {
  ...downloadBtnStyle,
  backgroundColor: '#3498db',
};
