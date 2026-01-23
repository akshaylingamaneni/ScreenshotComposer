"use client"

import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { OCRProgress as OCRProgressType } from "@/lib/ocr/ocr-types"

type OCRProgressProps = {
  progress: OCRProgressType
}

export function OCRProgress({ progress }: OCRProgressProps) {
  const progressPercent = Math.round(progress.progress * 100)

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-sm text-center text-muted-foreground">
          {progress.message || "Processing..."}
        </p>
      </div>
    </div>
  )
}
