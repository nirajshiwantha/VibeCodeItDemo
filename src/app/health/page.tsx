"use client"
import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as actions from "./actions"
import { HealthChart } from "@/components/ui/HealthChart"

const TABS = [
  { key: "weight", label: "Weight" },
  { key: "measurements", label: "Measurements" },
  { key: "water", label: "Water" },
  { key: "sleep", label: "Sleep" },
  { key: "mood", label: "Mood & Energy" },
  { key: "custom", label: "Custom Metrics" },
]

export default function HealthPage() {
  const [tab, setTab] = useState("weight")
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-8">
      <h1 className="text-2xl font-bold mb-4">Health Tracking</h1>
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {tab === "weight" && <WeightSection />}
      {tab === "measurements" && <MeasurementsSection />}
      {tab === "water" && <WaterSection />}
      {tab === "sleep" && <SleepSection />}
      {tab === "mood" && <MoodSection />}
      {tab === "custom" && <CustomMetricsSection />}
    </main>
  )
}

function WeightSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [value, setValue] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPending, startTransition] = useTransition()
  useEffect(() => { actions.getWeightLogs().then(setLogs) }, [])
  const handleAdd = async () => {
    if (!value) return
    startTransition(async () => {
      await actions.addWeightLog(parseFloat(value), new Date(date))
      setValue("")
      actions.getWeightLogs().then(setLogs)
    })
  }
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await actions.deleteWeightLog(id)
      actions.getWeightLogs().then(setLogs)
    })
  }
  // Analytics
  const values = logs.map(l => l.value)
  const min = values.length ? Math.min(...values) : null
  const max = values.length ? Math.max(...values) : null
  const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null
  // Chart data
  const chartLabels = logs.map(l => new Date(l.date).toLocaleDateString()).reverse()
  const chartData = values.slice().reverse()
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Weight Logging</h2>
      <div className="flex gap-2 mb-4">
        <Input type="number" placeholder="Weight (kg)" value={value} onChange={e => setValue(e.target.value)} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={handleAdd} disabled={isPending || !value}>Add</Button>
      </div>
      <div className="mb-4">
        <HealthChart labels={chartLabels} data={chartData} label="Weight (kg)" color="#2563eb" />
      </div>
      <div className="mb-2 text-sm text-muted-foreground">Min: {min} kg | Max: {max} kg | Avg: {avg} kg</div>
      <div className="mb-2 text-sm text-muted-foreground">Recent logs (latest first):</div>
      <ul className="space-y-1">
        {logs.map(log => (
          <li key={log.id} className="flex items-center gap-2">
            <span>{log.value} kg</span>
            <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>🗑️</Button>
          </li>
        ))}
        {logs.length === 0 && <li className="text-muted-foreground">No logs yet.</li>}
      </ul>
    </div>
  )
}

function MeasurementsSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [type, setType] = useState("")
  const [value, setValue] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPending, startTransition] = useTransition()
  useEffect(() => { actions.getMeasurements().then(setLogs) }, [])
  const handleAdd = async () => {
    if (!type || !value) return
    startTransition(async () => {
      await actions.addMeasurement(type, parseFloat(value), new Date(date))
      setValue("")
      actions.getMeasurements().then(setLogs)
    })
  }
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await actions.deleteMeasurement(id)
      actions.getMeasurements().then(setLogs)
    })
  }
  // Analytics
  const min = logs.length ? Math.min(...logs.map(l => l.value)) : null
  const max = logs.length ? Math.max(...logs.map(l => l.value)) : null
  const avg = logs.length ? (logs.reduce((a, b) => a + b.value, 0) / logs.length).toFixed(1) : null
  // Chart data
  const chartLabels = logs.map(l => `${l.type} ${new Date(l.date).toLocaleDateString()}`).reverse()
  const chartData = logs.map(l => l.value).reverse()
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Body Measurements</h2>
      <div className="flex gap-2 mb-4">
        <select className="p-2 border rounded-md" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Type</option>
          <option value="waist">Waist</option>
          <option value="chest">Chest</option>
          <option value="hips">Hips</option>
          <option value="arm">Arm</option>
          <option value="thigh">Thigh</option>
        </select>
        <Input type="number" placeholder="Value (cm)" value={value} onChange={e => setValue(e.target.value)} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={handleAdd} disabled={isPending || !type || !value}>Add</Button>
      </div>
      <div className="mb-4">
        <HealthChart labels={chartLabels} data={chartData} label="Measurement (cm)" color="#059669" />
      </div>
      <div className="mb-2 text-sm text-muted-foreground">Min: {min} cm | Max: {max} cm | Avg: {avg} cm</div>
      <div className="mb-2 text-sm text-muted-foreground">Recent logs (latest first):</div>
      <ul className="space-y-1">
        {logs.map(log => (
          <li key={log.id} className="flex items-center gap-2">
            <span>{log.type}: {log.value} cm</span>
            <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>🗑️</Button>
          </li>
        ))}
        {logs.length === 0 && <li className="text-muted-foreground">No logs yet.</li>}
      </ul>
    </div>
  )
}

function WaterSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPending, startTransition] = useTransition()
  useEffect(() => { actions.getWaterIntakeLogs().then(setLogs) }, [])
  const handleAdd = async () => {
    if (!amount) return
    startTransition(async () => {
      await actions.addWaterIntake(parseFloat(amount), new Date(date))
      setAmount("")
      actions.getWaterIntakeLogs().then(setLogs)
    })
  }
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await actions.deleteWaterIntake(id)
      actions.getWaterIntakeLogs().then(setLogs)
    })
  }
  // Analytics
  const min = logs.length ? Math.min(...logs.map(l => l.amount)) : null
  const max = logs.length ? Math.max(...logs.map(l => l.amount)) : null
  const avg = logs.length ? (logs.reduce((a, b) => a + b.amount, 0) / logs.length).toFixed(1) : null
  // Chart data
  const chartLabels = logs.map(l => new Date(l.date).toLocaleDateString()).reverse()
  const chartData = logs.map(l => l.amount).reverse()
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Water Intake</h2>
      <div className="flex gap-2 mb-4">
        <Input type="number" placeholder="Amount (ml)" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={handleAdd} disabled={isPending || !amount}>Add</Button>
      </div>
      <div className="mb-4">
        <HealthChart labels={chartLabels} data={chartData} label="Water (ml)" color="#0ea5e9" type="bar" />
      </div>
      <div className="mb-2 text-sm text-muted-foreground">Min: {min} ml | Max: {max} ml | Avg: {avg} ml</div>
      <div className="mb-2 text-sm text-muted-foreground">Recent logs (latest first):</div>
      <ul className="space-y-1">
        {logs.map(log => (
          <li key={log.id} className="flex items-center gap-2">
            <span>{log.amount} ml</span>
            <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>🗑️</Button>
          </li>
        ))}
        {logs.length === 0 && <li className="text-muted-foreground">No logs yet.</li>}
      </ul>
    </div>
  )
}

function SleepSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [duration, setDuration] = useState("")
  const [quality, setQuality] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPending, startTransition] = useTransition()
  useEffect(() => { actions.getSleepLogs().then(setLogs) }, [])
  const handleAdd = async () => {
    if (!duration) return
    startTransition(async () => {
      await actions.addSleepLog(parseFloat(duration), quality ? parseInt(quality) : 0, new Date(date))
      setDuration("")
      setQuality("")
      actions.getSleepLogs().then(setLogs)
    })
  }
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await actions.deleteSleepLog(id)
      actions.getSleepLogs().then(setLogs)
    })
  }
  // Analytics
  const min = logs.length ? Math.min(...logs.map(l => l.duration)) : null
  const max = logs.length ? Math.max(...logs.map(l => l.duration)) : null
  const avg = logs.length ? (logs.reduce((a, b) => a + b.duration, 0) / logs.length).toFixed(1) : null
  // Chart data
  const chartLabels = logs.map(l => new Date(l.date).toLocaleDateString()).reverse()
  const chartData = logs.map(l => l.duration).reverse()
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Sleep Quality</h2>
      <div className="flex gap-2 mb-4">
        <Input type="number" placeholder="Duration (hours)" value={duration} onChange={e => setDuration(e.target.value)} />
        <Input type="number" placeholder="Quality (1-10)" value={quality} onChange={e => setQuality(e.target.value)} min={1} max={10} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={handleAdd} disabled={isPending || !duration}>Add</Button>
      </div>
      <div className="mb-4">
        <HealthChart labels={chartLabels} data={chartData} label="Sleep (h)" color="#a21caf" />
      </div>
      <div className="mb-2 text-sm text-muted-foreground">Min: {min} h | Max: {max} h | Avg: {avg} h</div>
      <div className="mb-2 text-sm text-muted-foreground">Recent logs (latest first):</div>
      <ul className="space-y-1">
        {logs.map(log => (
          <li key={log.id} className="flex items-center gap-2">
            <span>{log.duration}h, quality {log.quality || "-"}/10</span>
            <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>🗑️</Button>
          </li>
        ))}
        {logs.length === 0 && <li className="text-muted-foreground">No logs yet.</li>}
      </ul>
    </div>
  )
}

function MoodSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [mood, setMood] = useState("")
  const [energy, setEnergy] = useState("")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPending, startTransition] = useTransition()
  useEffect(() => { actions.getMoodLogs().then(setLogs) }, [])
  const handleAdd = async () => {
    if (!mood) return
    startTransition(async () => {
      await actions.addMoodLog(parseInt(mood), energy ? parseInt(energy) : 0, notes, new Date(date))
      setMood("")
      setEnergy("")
      setNotes("")
      actions.getMoodLogs().then(setLogs)
    })
  }
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await actions.deleteMoodLog(id)
      actions.getMoodLogs().then(setLogs)
    })
  }
  // Analytics
  const min = logs.length ? Math.min(...logs.map(l => l.mood)) : null
  const max = logs.length ? Math.max(...logs.map(l => l.mood)) : null
  const avg = logs.length ? (logs.reduce((a, b) => a + b.mood, 0) / logs.length).toFixed(1) : null
  // Chart data
  const chartLabels = logs.map(l => new Date(l.date).toLocaleDateString()).reverse()
  const chartData = logs.map(l => l.mood).reverse()
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Mood &amp; Energy</h2>
      <div className="flex gap-2 mb-4">
        <Input type="number" placeholder="Mood (1-10)" value={mood} onChange={e => setMood(e.target.value)} min={1} max={10} />
        <Input type="number" placeholder="Energy (1-10)" value={energy} onChange={e => setEnergy(e.target.value)} min={1} max={10} />
        <Input type="text" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={handleAdd} disabled={isPending || !mood}>Add</Button>
      </div>
      <div className="mb-4">
        <HealthChart labels={chartLabels} data={chartData} label="Mood (1-10)" color="#f59e42" />
      </div>
      <div className="mb-2 text-sm text-muted-foreground">Min: {min} | Max: {max} | Avg: {avg}</div>
      <div className="mb-2 text-sm text-muted-foreground">Recent logs (latest first):</div>
      <ul className="space-y-1">
        {logs.map(log => (
          <li key={log.id} className="flex items-center gap-2">
            <span>Mood {log.mood}/10, Energy {log.energy || "-"}/10</span>
            {log.notes && <span className="text-xs text-muted-foreground">{log.notes}</span>}
            <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>🗑️</Button>
          </li>
        ))}
        {logs.length === 0 && <li className="text-muted-foreground">No logs yet.</li>}
      </ul>
    </div>
  )
}

function CustomMetricsSection() {
  const [logs, setLogs] = useState<any[]>([])
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [unit, setUnit] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPending, startTransition] = useTransition()
  useEffect(() => { actions.getCustomMetrics().then(setLogs) }, [])
  const handleAdd = async () => {
    if (!name || !value) return
    startTransition(async () => {
      await actions.addCustomMetric(name, parseFloat(value), unit, new Date(date))
      setName("")
      setValue("")
      setUnit("")
      actions.getCustomMetrics().then(setLogs)
    })
  }
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await actions.deleteCustomMetric(id)
      actions.getCustomMetrics().then(setLogs)
    })
  }
  // Analytics
  const min = logs.length ? Math.min(...logs.map(l => l.value)) : null
  const max = logs.length ? Math.max(...logs.map(l => l.value)) : null
  const avg = logs.length ? (logs.reduce((a, b) => a + b.value, 0) / logs.length).toFixed(1) : null
  // Chart data
  const chartLabels = logs.map(l => `${l.name} ${new Date(l.date).toLocaleDateString()}`).reverse()
  const chartData = logs.map(l => l.value).reverse()
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Custom Health Metrics</h2>
      <div className="flex gap-2 mb-4">
        <Input type="text" placeholder="Metric name" value={name} onChange={e => setName(e.target.value)} />
        <Input type="number" placeholder="Value" value={value} onChange={e => setValue(e.target.value)} />
        <Input type="text" placeholder="Unit (optional)" value={unit} onChange={e => setUnit(e.target.value)} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={handleAdd} disabled={isPending || !name || !value}>Add</Button>
      </div>
      <div className="mb-4">
        <HealthChart labels={chartLabels} data={chartData} label="Custom Metric" color="#6366f1" />
      </div>
      <div className="mb-2 text-sm text-muted-foreground">Min: {min} | Max: {max} | Avg: {avg}</div>
      <div className="mb-2 text-sm text-muted-foreground">Recent logs (latest first):</div>
      <ul className="space-y-1">
        {logs.map(log => (
          <li key={log.id} className="flex items-center gap-2">
            <span>{log.name}: {log.value} {log.unit}</span>
            <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>🗑️</Button>
          </li>
        ))}
        {logs.length === 0 && <li className="text-muted-foreground">No logs yet.</li>}
      </ul>
    </div>
  )
} 