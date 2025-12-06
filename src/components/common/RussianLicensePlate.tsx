"use client";
import React from "react";

interface RussianLicensePlateProps {
  plateNumber: string;
  className?: string;
}

/**
 * Парсит номер ТС в формат: основной номер и регион
 * Форматы входных данных:
 * - "К273ТР70" -> { main: "К273ТР", region: "70" }
 * - "К273ТР 70" -> { main: "К273ТР", region: "70" }
 * - "К273ТР" -> { main: "К273ТР", region: null }
 * - "Е512НУ152" -> { main: "Е512НУ", region: "152" }
 */
const parsePlateNumber = (plateNumber: string): { main: string; region: string | null } => {
  if (!plateNumber) return { main: '', region: null };
  
  // Приводим к верхнему регистру и нормализуем пробелы
  const normalized = plateNumber.trim().toUpperCase();
  
  if (!normalized) return { main: '', region: null };
  
  // Пытаемся разделить по пробелам: "К273ТР 70" или "К273ТР  70"
  const parts = normalized.split(/\s+/).filter(Boolean);
  
  if (parts.length >= 2) {
    // Если есть пробел, то последняя часть - регион
    const region = parts[parts.length - 1];
    const main = parts.slice(0, -1).join(' ');
    
    // Проверяем, что регион - это число (1-3 цифры)
    if (/^\d{1,3}$/.test(region)) {
      return { main, region };
    }
  }
  
  // Пытаемся найти регион в конце без пробелов
  const cleaned = normalized.replace(/\s+/g, '');
  
  // Паттерн для российского номера: [Буква][3 цифры][2 буквы][регион 1-3 цифры?]
  // Примеры: К273ТР70, Е512НУ152, К273ТР
  const fullMatch = cleaned.match(/^([А-ЯЁ]\d{3}[А-ЯЁ]{2})(\d{1,3})?$/);
  
  if (fullMatch) {
    return {
      main: fullMatch[1],
      region: fullMatch[2] || null
    };
  }
  
  // Если не соответствует стандартному формату, пробуем найти регион в конце
  const regionMatch = cleaned.match(/(\d{1,3})$/);
  
  if (regionMatch && cleaned.length > regionMatch[1].length) {
    const region = regionMatch[1];
    const main = cleaned.slice(0, -region.length);
    return { main, region };
  }
  
  // Если регион не найден, возвращаем как есть
  return { main: normalized, region: null };
};

/**
 * Разбивает основной номер на символы и определяет, является ли символ буквой или цифрой
 */
const parseMainNumber = (main: string): Array<{ char: string; isLetter: boolean }> => {
  return main.split('').map(char => ({
    char,
    isLetter: /[А-ЯЁ]/.test(char)
  }));
};

export default function RussianLicensePlate({ plateNumber, className = "" }: RussianLicensePlateProps) {
  if (!plateNumber) return <span className={className}>-</span>;
  
  const { main, region } = parsePlateNumber(plateNumber);
  
  if (!main) return <span className={className}>-</span>;
  
  const mainChars = parseMainNumber(main);
  
  // Пропорции 520x112 = 4.64:1 (точное соотношение)
  // Для таблицы делаем компактную версию, сохраняя пропорции
  const plateWidth = 116;
  const plateHeight = Math.round(plateWidth / (520 / 112)); // ~25px, точно по пропорции
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Российский номерной знак */}
      <div 
        className="inline-flex items-center bg-white border-[2px] border-black relative overflow-hidden"
        style={{
          width: `${plateWidth}px`,
          height: `${plateHeight}px`,
          borderRadius: '4px',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Основная часть номера (буква, цифры, буквы) */}
        <div className="flex items-center justify-center h-full flex-1">
          <div className="flex items-end gap-0.5">
            {mainChars.map((item, index) => (
              <span
                key={index}
                className={`font-bold leading-none ${
                  item.isLetter ? 'text-[14px]' : 'text-[17px]'
                }`}
                style={{
                  letterSpacing: '0.4px',
                  fontWeight: 900,
                  lineHeight: 1
                }}
              >
                {item.char}
              </span>
            ))}
          </div>
        </div>
        
        {/* Разделитель (вертикальная линия) */}
        {region && (
          <>
            <div className="w-[1.5px] h-full bg-black" />
            
            {/* Правая часть с регионом */}
            <div className="flex flex-col items-center justify-center py-0.5 h-full" style={{ width: '28px' }}>
              {/* Регион */}
              <span 
                className="text-[10px] font-black text-black leading-none mb-0.5"
                style={{
                  letterSpacing: '0.2px',
                  fontWeight: 900,
                  lineHeight: 1
                }}
              >
                {region}
              </span>
              
              {/* Флаг и RUS */}
              <div className="flex items-center gap-0.5">
                {/* Флаг России (триколор) */}
                <div className="flex flex-col w-[9px] h-[6px] border border-gray-500 overflow-hidden">
                  <div className="h-1/3 bg-white"></div>
                  <div className="h-1/3 bg-blue-600"></div>
                  <div className="h-1/3 bg-red-600"></div>
                </div>
                
                {/* Текст RUS */}
                <span 
                  className="text-[6px] font-bold text-black leading-none"
                  style={{
                    letterSpacing: '0.2px',
                    fontWeight: 700,
                    lineHeight: 1
                  }}
                >
                  RUS
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

