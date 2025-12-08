"use client";
import React, { useMemo, useCallback } from "react";

import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface IChartDataPoint {
  date: string; // "YYYY-MM-DD"
  quantityByRequest: number;
  quantityByPlan: number;
  quantityByFact: number;
  quantityByDeparture: number;
}

interface LineChartOne1Props {
  data: IChartDataPoint[];
  onZoom?: (dateFrom: string, dateTo: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LineChartOne1({ data, onZoom: _onZoom }: LineChartOne1Props) {
  // Функция для прореживания данных до максимум 100 точек
  const limitDataPoints = useCallback((dataPoints: Array<{ x: number; y: number }>, maxPoints: number = 100) => {
    if (dataPoints.length <= maxPoints) {
      return dataPoints;
    }

    // Вычисляем шаг для равномерного прореживания
    const step = Math.ceil(dataPoints.length / maxPoints);
    const limited: Array<{ x: number; y: number }> = [];

    // Берем каждую N-ю точку для равномерного распределения
    for (let i = 0; i < dataPoints.length; i += step) {
      limited.push(dataPoints[i]);
    }

    // Всегда добавляем последнюю точку, чтобы сохранить конец графика
    if (limited[limited.length - 1]?.x !== dataPoints[dataPoints.length - 1]?.x) {
      limited.push(dataPoints[dataPoints.length - 1]);
    }

    return limited;
  }, []);

  // Преобразуем данные для графика
  const series = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: "По заявке", data: [] },
        { name: "По плану", data: [] },
        { name: "По факту", data: [] },
        { name: "Убытие", data: [] },
      ];
    }

    const requestData = data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.quantityByRequest
    }));
    const planData = data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.quantityByPlan
    }));
    const factData = data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.quantityByFact
    }));
    const departureData = data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.quantityByDeparture
    }));

    // Ограничиваем количество точек до 150
    const maxPoints = 150;
    const limitedRequestData = limitDataPoints(requestData, maxPoints);
    const limitedPlanData = limitDataPoints(planData, maxPoints);
    const limitedFactData = limitDataPoints(factData, maxPoints);
    const limitedDepartureData = limitDataPoints(departureData, maxPoints);

    return [
      {
        name: "По заявке",
        data: limitedRequestData,
      },
      {
        name: "По плану",
        data: limitedPlanData,
      },
      {
        name: "По факту",
        data: limitedFactData,
      },
      {
        name: "Убытие",
        data: limitedDepartureData,
      },
    ];
  }, [data, limitDataPoints]);

  const options: ApexOptions = useMemo(() => ({
    legend: {
      show: true, // Show legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#8A1817", "#C919B7", "#2D995B", "#276698"], // Define line colors
    chart: {
      fontFamily: "Roboto, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: true, // Show chart toolbar
        tools: {
          reset: true, // Кнопка сброса зума
        },
      },
      zoom: {
        enabled: true, // Включаем зум
        type: "x", // По оси X
        autoScaleYaxis: true, // Автоматическое масштабирование Y при зуме
      },
      locales: [
        {
          name: "ru",
          options: {
            months: [
              "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
              "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
            ],
            shortMonths: [
              "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
              "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
            ],
            days: [
              "Воскресенье", "Понедельник", "Вторник", "Среда",
              "Четверг", "Пятница", "Суббота",
            ],
            shortDays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
          },
        },
      ],
      defaultLocale: "ru",
    },
    stroke: {
      curve: "smooth", // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      x: {
        format: "dd MMM yyyy", // Format for x-axis tooltip
      },
    },
    xaxis: {
      type: "datetime", // Category-based x-axis
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM",
          day: "dd MMM",
        },
      },
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  }), []);
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartEight" className="min-w-[1000px]">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
