"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { IComplaintStatusStat } from "@/services/complaints.service";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ComplaintsDonutChartProps {
  data: IComplaintStatusStat[];
  viewMode: 'count' | 'confirmedCount' | 'unconfirmedCount';
}

interface ApexChartInstance {
  updateOptions: (options: ApexOptions, redraw?: boolean, animate?: boolean) => void;
}

export default function ComplaintsDonutChart({ data, viewMode }: ComplaintsDonutChartProps) {
  const [isDark, setIsDark] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartInstanceRef = useRef<ApexChartInstance | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    // Проверяем текущую тему
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Слушаем изменения темы
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Генерируем контрастные цвета для статусов
  const generateColors = (count: number): string[] => {
    // Яркая контрастная палитра, которая хорошо работает в обеих темах
    const baseColors = [
      "#465FFF", // Яркий синий (brand-500)
      "#12B76A", // Зеленый (success-500)
      "#F79009", // Оранжевый (warning-500)
      "#F04438", // Красный (error-500)
      "#7A5AF8", // Фиолетовый (purple-500)
      "#0BA5EC", // Голубой (blue-light-500)
      "#EE46BC", // Розовый (pink-500)
      "#3641F5", // Темно-синий (brand-600)
      "#039855", // Темно-зеленый (success-600)
      "#DC6803", // Темно-оранжевый (warning-600)
    ];
    
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  };

  const labels = data.map((item) => item.status);
  const series = data.map((item) => item[viewMode]);
  const colors = generateColors(data.length);

  const formatCount = (count: number) => {
    return new Intl.NumberFormat('ru-RU').format(count);
  };

  // Получаем данные для центрального отображения
  const getCenterLabel = () => {
    if (hoveredIndex !== null && data[hoveredIndex]) {
      const item = data[hoveredIndex];
      return {
        name: item.status,
        value: formatCount(item[viewMode]),
      };
    }
    return null;
  };

  const centerLabel = getCenterLabel();

  // Обновляем центральные labels через API при изменении hoveredIndex
  useEffect(() => {
    if (!isChartReady || !chartInstanceRef.current) {
      return;
    }

    try {
      const chart = chartInstanceRef.current;
      
      if (centerLabel) {
        // Показываем статус и значение при наведении
        chart.updateOptions({
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: isDark ? "#F2F4F7" : "#1D2939",
                    offsetY: -10,
                    formatter: () => centerLabel.name,
                  },
                  value: {
                    show: true,
                    fontSize: "20px",
                    fontWeight: 700,
                    color: isDark ? "#FFFFFF" : "#101828",
                    offsetY: 10,
                    formatter: () => centerLabel.value,
                  },
                  total: {
                    show: false,
                  },
                },
              },
            },
          },
        }, false, true);
      } else {
        // Скрываем все labels когда нет наведения
        chart.updateOptions({
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: false,
                },
              },
            },
          },
        }, false, true);
      }
    } catch (error) {
      console.warn('Chart update error:', error);
    }
  }, [hoveredIndex, centerLabel, isDark, isChartReady]);

  const options: ApexOptions = useMemo(() => ({
    chart: {
      fontFamily: "Roboto, sans-serif",
      type: "donut",
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 800
        }
      },
      events: {
        mounted: (chartContext) => {
          chartInstanceRef.current = chartContext;
          setIsChartReady(true);
        },
        dataPointMouseEnter: (_event, _chartContext, config) => {
          setHoveredIndex(config.dataPointIndex);
        },
        dataPointMouseLeave: () => {
          setHoveredIndex(null);
        },
      },
    },
    colors: colors,
    labels: labels,
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      fontFamily: "Roboto, sans-serif",
      fontWeight: 400,
      labels: {
        colors: isDark ? ["#D0D5DD"] : ["#475467"], // Более контрастные цвета для легенды
      },
      markers: {
        width: 10,
        height: 10,
        radius: 5,
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: [isDark ? "#1D2939" : "#FFFFFF"], // Обводка для лучшей видимости
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: false,
          },
        },
      },
    },
    tooltip: {
      enabled: false, // Отключаем стандартный tooltip
    },
  }), [labels, colors, isDark]);

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={350}
      />
    </div>
  );
}
