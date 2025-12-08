"use client";
import React, { useMemo, useRef } from "react";

import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

import { IChartDataPoint } from "./LineChartOne1";

interface LineChartOne2Props {
  data: IChartDataPoint[];
  onZoom?: (dateFrom: string, dateTo: string) => void;
}

export default function LineChartOne2({ data, onZoom }: LineChartOne2Props) {
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Преобразуем данные для графика
  const series = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: "По плану", data: [] },
        { name: "По факту", data: [] },
      ];
    }

    const planData = data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.quantityByPlan
    }));
    const factData = data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.quantityByFact
    }));

    return [
      {
        name: "По плану",
        data: planData,
      },
      {
        name: "По факту",
        data: factData,
      },
    ];
  }, [data]);

  const options: ApexOptions = useMemo(() => ({
    legend: {
      show: true, // Show legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"], // Define line colors
    chart: {
      fontFamily: "Roboto, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: true, // Show chart toolbar
      },
      zoom: {
        enabled: true, // Включаем зум
        type: "x", // По оси X
        autoScaleYaxis: true, // Автоматическое масштабирование Y при зуме
      },
      events: {
        zoomed: (chartContext, { xaxis }) => {
          if (onZoom && xaxis.min && xaxis.max) {
            // Debounce для оптимизации
            if (zoomTimeoutRef.current) {
              clearTimeout(zoomTimeoutRef.current);
            }
            zoomTimeoutRef.current = setTimeout(() => {
              const dateFrom = new Date(xaxis.min).toISOString().split('T')[0];
              const dateTo = new Date(xaxis.max).toISOString().split('T')[0];
              onZoom(dateFrom, dateTo);
            }, 300);
          }
        },
      },
    },
    stroke: {
      curve: "straight", // Define the line style (straight, smooth, or step)
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
      type: "datetime", // Datetime-based x-axis
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
  }), [onZoom]);
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
