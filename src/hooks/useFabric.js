import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

export default function useFabric() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [textColor, setTextColor] = useState('#000000'); // Изменили на черный по умолчанию, чтобы текст был виден на сером фоне

  useEffect(() => {
    if (!canvasRef.current) return;

    // Создаем холст
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 850,
      height: 600,
      backgroundColor: '#f0f0f0',
    });

    setCanvas(fabricCanvas);

    // Безопасное удаление холста для React StrictMode
    return () => {
      fabricCanvas.dispose().catch((err) => {
        console.warn('Fabric canvas dispose handled:', err);
      });
    };
  }, []);

  // Загрузка фото на холст
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]; // Безопасное чтение
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result;
      if (typeof data !== 'string') return;

      try {
        const img = await fabric.FabricImage.fromURL(data);

        // Масштабируем картинку, если она больше холста
        if (img.width > canvas.width || img.height > canvas.height) {
          img.scaleToWidth(canvas.width * 0.8);
        }

        img.set({
          left: 50,
          top: 50,
          selectable: true,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.centerObject(img); // Центрируем для красоты
        canvas.renderAll();
      } catch (error) {
        console.error('Ошибка загрузки изображения в Fabric:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  // Добавление интерактивного текста
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('Кликни, чтобы изменить', {
      left: 100,
      top: 100,
      fontFamily: 'sans-serif',
      fill: textColor,
      fontSize: 24,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Изменение цвета текста
  const handleColorChange = (newColor) => {
    setTextColor(newColor);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    // Проверяем тип объекта (в v6 это i-text или text)
    if (
      activeObject &&
      (activeObject.type === 'i-text' || activeObject.type === 'text')
    ) {
      activeObject.set({ fill: newColor });
      canvas.renderAll();
    }
  };

  // Экспорт в PNG
  const downloadImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'edited-photo.png';
    link.href = dataURL;
    link.click();
  };

  // Горячая клавиша Delete для удаления объектов
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject();
        // Удаляем объект, только если пользователь прямо сейчас не редактирует текст внутри него
        if (activeObject && !activeObject.isEditing) {
          canvas.remove(activeObject);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

  return {
    canvasRef,
    canvas, // Возвращаем сам canvas, чтобы дочерние компоненты могли подписываться на его события
    textColor,
    handleImageUpload,
    addText,
    handleColorChange,
    downloadImage,
  };
}
