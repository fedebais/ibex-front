import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface Dataset {
  label: string
  data: number[]
  color: string
  fill?: boolean
}

interface LineChartProps {
  data?: number[]
  datasets?: Dataset[]
  labels: string[]
  title?: string
  color?: string
  fill?: boolean
  darkMode?: boolean
}

const LineChart = ({ data, datasets, labels, title, color = "#f97316", fill = false, darkMode = false }: LineChartProps) => {
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
        // Determinar qué datasets usar
        const chartDatasets = datasets
          ? datasets.map((dataset) => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: dataset.color,
              backgroundColor: dataset.fill ? `${dataset.color}20` : undefined,
              fill: dataset.fill || false,
              tension: 0.3,
              pointBackgroundColor: dataset.color,
              pointBorderColor: darkMode ? "#1f2937" : "#fff",
              pointBorderWidth: 1,
              pointRadius: 4,
              pointHoverRadius: 6,
            }))
          : [
              {
                label: title || "",
                data: data || [],
                borderColor: color,
                backgroundColor: fill ? `${color}20` : undefined,
                fill,
                tension: 0.3,
                pointBackgroundColor: color,
                pointBorderColor: darkMode ? "#1f2937" : "#fff",
                pointBorderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ]

        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: chartDatasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: !!(title || datasets),
                position: "top",
                labels: {
                  font: {
                    size: 12,
                    family: "'Inter', sans-serif",
                  },
                  usePointStyle: true,
                  color: darkMode ? "#e5e7eb" : "#4b5563",
                },
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
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  //drawBorder: false,
                  color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                },
                ticks: {
                  font: {
                    size: 11,
                    family: "'Inter', sans-serif",
                  },
                  color: darkMode ? "#e5e7eb" : "#4b5563",
                },
              },
              x: {
                grid: {
                  display: false,
                 // drawBorder: false,
                },
                ticks: {
                  font: {
                    size: 11,
                    family: "'Inter', sans-serif",
                  },
                  color: darkMode ? "#e5e7eb" : "#4b5563",
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
  }, [data, datasets, labels, title, color, fill, darkMode])

  return <canvas ref={chartRef} height={300} />
}

export default LineChart
