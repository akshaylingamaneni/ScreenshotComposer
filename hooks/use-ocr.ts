"use client"

import { useState, useCallback, useEffect } from "react"
import type { OCRResult, OCRProgress, OCRError, OCRStatus } from "@/lib/ocr/ocr-types"
import { extractTextFromImage, terminateOCRWorker } from "@/lib/ocr/ocr-worker"

export type UseOCRReturn = {
  result: OCRResult | null
  error: OCRError | null
  status: OCRStatus
  progress: OCRProgress
  extractText: (imageSource: string) => Promise<void>
  reset: () => void
}

export function useOCR(): UseOCRReturn {
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<OCRError | null>(null)
  const [status, setStatus] = useState<OCRStatus>("idle")
  const [progress, setProgress] = useState<OCRProgress>({
    status: "idle",
    progress: 0,
    message: "",
  })

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setStatus("idle")
    setProgress({
      status: "idle",
      progress: 0,
      message: "",
    })
  }, [])

  const extractText = useCallback(async (imageSource: string) => {
    reset()
    setStatus("loading")

    try {
      const ocrResult = await extractTextFromImage(imageSource, (progressUpdate) => {
        setProgress(progressUpdate)
        setStatus(progressUpdate.status)
      })

      if (!ocrResult.text.trim()) {
        setError({
          code: "NO_TEXT_FOUND",
          message: "No text was found in the image. Try a clearer image with more visible text.",
        })
        setStatus("error")
        return
      }

      setResult(ocrResult)
      setStatus("complete")
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError({
        code: "PROCESSING_FAILED",
        message: `OCR processing failed: ${message}`,
      })
      setStatus("error")
    }
  }, [reset])

  useEffect(() => {
    return () => {
      terminateOCRWorker()
    }
  }, [])

  return {
    result,
    error,
    status,
    progress,
    extractText,
    reset,
  }
}
