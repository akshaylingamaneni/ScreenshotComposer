import { createWorker, type Worker } from "tesseract.js"
import type { OCRResult, OCRBlock, OCRLine, OCRWord, OCRProgress } from "./ocr-types"

let workerInstance: Worker | null = null
let workerPromise: Promise<Worker> | null = null

type ProgressCallback = (progress: OCRProgress) => void

export async function getOCRWorker(onProgress?: ProgressCallback): Promise<Worker> {
  if (workerInstance) {
    return workerInstance
  }

  if (workerPromise) {
    return workerPromise
  }

  workerPromise = createWorker("eng", undefined, {
    logger: (info) => {
      if (onProgress && info.status) {
        const progress = typeof info.progress === "number" ? info.progress : 0
        let message = "Initializing..."

        if (info.status === "loading tesseract core") {
          message = "Loading OCR engine..."
        } else if (info.status === "initializing tesseract") {
          message = "Initializing OCR..."
        } else if (info.status === "loading language traineddata") {
          message = "Loading language data..."
        } else if (info.status === "initializing api") {
          message = "Preparing for recognition..."
        } else if (info.status === "recognizing text") {
          message = `Recognizing text... ${Math.round(progress * 100)}%`
        }

        onProgress({
          status: info.status === "recognizing text" ? "recognizing" : "loading",
          progress,
          message,
        })
      }
    },
  })

  try {
    workerInstance = await workerPromise
    return workerInstance
  } catch (error) {
    workerPromise = null
    throw error
  }
}

export async function terminateOCRWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
    workerPromise = null
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function transformWord(word: Tesseract.Word): OCRWord {
  return {
    id: generateId(),
    text: word.text,
    confidence: word.confidence,
    bbox: {
      x0: word.bbox.x0,
      y0: word.bbox.y0,
      x1: word.bbox.x1,
      y1: word.bbox.y1,
    },
  }
}

function transformLine(line: Tesseract.Line): OCRLine {
  return {
    id: generateId(),
    text: line.text,
    confidence: line.confidence,
    words: line.words.map(transformWord),
    bbox: {
      x0: line.bbox.x0,
      y0: line.bbox.y0,
      x1: line.bbox.x1,
      y1: line.bbox.y1,
    },
  }
}

function transformBlock(block: Tesseract.Block): OCRBlock {
  const lines = block.paragraphs.flatMap((paragraph) =>
    paragraph.lines.map(transformLine)
  )

  return {
    id: generateId(),
    text: block.text,
    confidence: block.confidence,
    lines,
    bbox: {
      x0: block.bbox.x0,
      y0: block.bbox.y0,
      x1: block.bbox.x1,
      y1: block.bbox.y1,
    },
  }
}

export async function extractTextFromImage(
  imageSource: string,
  onProgress?: ProgressCallback
): Promise<OCRResult> {
  const startTime = performance.now()

  const worker = await getOCRWorker(onProgress)

  onProgress?.({
    status: "recognizing",
    progress: 0,
    message: "Starting text recognition...",
  })

  const result = await worker.recognize(imageSource, {}, {
    text: true,
    blocks: true,
  })

  const processingTime = performance.now() - startTime

  const ocrResult: OCRResult = {
    text: result.data.text,
    blocks: result.data.blocks?.map(transformBlock) ?? [],
    confidence: result.data.confidence,
    processingTime,
  }

  onProgress?.({
    status: "complete",
    progress: 1,
    message: "Text extraction complete",
  })

  return ocrResult
}
