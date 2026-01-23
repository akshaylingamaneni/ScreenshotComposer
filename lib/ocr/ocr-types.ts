export type OCRWord = {
  id: string
  text: string
  confidence: number
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

export type OCRLine = {
  id: string
  text: string
  confidence: number
  words: OCRWord[]
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

export type OCRBlock = {
  id: string
  text: string
  confidence: number
  lines: OCRLine[]
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

export type OCRResult = {
  text: string
  blocks: OCRBlock[]
  confidence: number
  processingTime: number
}

export type OCRProgress = {
  status: OCRStatus
  progress: number
  message: string
}

export type OCRStatus =
  | "idle"
  | "loading"
  | "recognizing"
  | "complete"
  | "error"

export type OCRError = {
  code: "NO_TEXT_FOUND" | "PROCESSING_FAILED" | "WORKER_ERROR" | "UNKNOWN"
  message: string
}
