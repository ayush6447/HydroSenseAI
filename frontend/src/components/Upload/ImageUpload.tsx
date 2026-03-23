import { useState } from 'react'
import { detectDisease } from '../../api/predict'

export default function ImageUpload() {
  const [result, setResult] = useState<any>(null)
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const r = await detectDisease(e.target.files[0])
    setResult(r.data)
  }
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="img" />
      <label htmlFor="img" className="cursor-pointer text-green-600">Upload plant image for YOLOv8 analysis</label>
      {result && <pre className="mt-4 text-xs text-left">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
