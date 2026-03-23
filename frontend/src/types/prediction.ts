export interface YieldPrediction {
  yield_score: number
  recommendation: string
}
export interface ForecastResult {
  ph_predicted: number
  tds_predicted: number
  action_needed: boolean
}
export interface DiseaseDetection {
  detected_class: string
  confidence: number
  disease: string | null
}
