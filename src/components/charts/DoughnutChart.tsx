"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface DoughnutChartProps {
  data: number[]
  labels: string[]
  title?: string
  colors?: string[]
  darkMode?: boolean
}

const DoughnutChart = ({
  data,
  labels,
  title,
  colors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"],
  darkMode = false,
}: DoughnutChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destruir el gráfico anterior si existe
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: colors,
                borderColor: darkMode ? "#1f2937" : "white",
                borderWidth: 2,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  font: {
                    size: 12,
                    family: "'Inter', sans-serif",
                  },
                  usePointStyle: true,
                  color: darkMode ? "#e5e7eb" : "#4b5563",
                },
              },
              title: {
                display: !!title,
                text: title || "",
                font: {
                  size: 14,
                  family: "'Inter', sans-serif",
                },
                padding: {
                  bottom: 10,
                },
                color: darkMode ? "#e5e7eb" : "#4b5563",
              },
              tooltip: {
                backgroundColor: darkMode ? "rgba(30, 41, 59, 0.8)" : "rgba(0, 0, 0, 0.7)",
                padding: 10,
                cornerRadius: 4,
                titleFont: {
                  size: 13,
                  family: "'Inter', sans-serif",
                },
                bodyFont: {
                  size: 12,
                  family: "'Inter', sans-serif",
                },
              },
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, labels, title, colors, darkMode])

  return <canvas ref={chartRef} height={300} />
}

export default DoughnutChart
