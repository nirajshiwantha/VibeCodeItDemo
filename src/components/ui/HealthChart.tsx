import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface HealthChartProps {
  type?: "line" | "bar"
  labels: string[]
  data: number[]
  label: string
  color?: string
  height?: number
}

export function HealthChart({ type = "line", labels, data, label, color = "#2563eb", height = 200 }: HealthChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: color + "33",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  }
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#eee" } },
    },
  }
  return type === "bar" ? (
    <Bar data={chartData} options={options} height={height} />
  ) : (
    <Line data={chartData} options={options} height={height} />
  )
} 