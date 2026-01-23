"use client"

import { useEffect, useCallback } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OCRProgress } from "@/components/ocr-progress"
import { OCRTextSelector } from "@/components/ocr-text-selector"
import { useOCR } from "@/hooks/use-ocr"

type OCRExtractorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSource: string | null
  onTextExtracted: (text: string) => void
}

export function OCRExtractor({
  open,
  onOpenChange,
  imageSource,
  onTextExtracted,
}: OCRExtractorProps) {
  const { result, error, status, progress, extractText, reset } = useOCR()

  useEffect(() => {
    if (open && imageSource && status === "idle") {
      extractText(imageSource)
    }
  }, [open, imageSource, status, extractText])

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleRetry = useCallback(() => {
    if (imageSource) {
      reset()
      extractText(imageSource)
    }
  }, [imageSource, reset, extractText])

  const handleTextSelect = useCallback(
    (selectedText: string) => {
      onTextExtracted(selectedText)
      onOpenChange(false)
    },
    [onTextExtracted, onOpenChange]
  )

  const isProcessing = status === "loading" || status === "recognizing"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Extract Text from Image</DialogTitle>
          <DialogDescription>
            {isProcessing
              ? "Analyzing image for text content..."
              : status === "complete"
              ? "Select the text you want to include in your text card."
              : status === "error"
              ? "There was a problem extracting text."
              : "Starting text extraction..."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[200px]">
          {isProcessing && <OCRProgress progress={progress} />}

          {status === "error" && error && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Extraction Failed</span>
              </div>
              <p className="text-sm text-center text-muted-foreground max-w-sm">
                {error.message}
              </p>
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {status === "complete" && result && (
            <OCRTextSelector result={result} onSelect={handleTextSelect} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
