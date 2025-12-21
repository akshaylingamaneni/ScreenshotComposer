"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Check, Copy, Download, Eye, EyeOff, Shuffle, Upload } from "lucide-react"
import { BackgroundSelector } from "@/components/background-selector"
import { FormatSelector } from "@/components/format-selector"
import { ScreenshotShellProvider } from "@/components/screenshot-shell-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { getFormatById } from "@/lib/formats"
import { getRandomPattern } from "@/lib/patterns"

function getExportCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const logicalWidth = Number.parseInt(canvas.dataset.logicalWidth ?? "", 10)
  const logicalHeight = Number.parseInt(canvas.dataset.logicalHeight ?? "", 10)

  if (!Number.isFinite(logicalWidth) || !Number.isFinite(logicalHeight)) {
    return canvas
  }

  if (canvas.width === logicalWidth && canvas.height === logicalHeight) {
    return canvas
  }

  const exportCanvas = document.createElement("canvas")
  exportCanvas.width = logicalWidth
  exportCanvas.height = logicalHeight

  const ctx = exportCanvas.getContext("2d")
  if (!ctx) {
    return canvas
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(canvas, 0, 0, logicalWidth, logicalHeight)
  return exportCanvas
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [image, setImage] = useState<string | null>(null)
  const [padding, setPadding] = useState([64])
  const [cornerRadius, setCornerRadius] = useState([12])
  const [shadow, setShadow] = useState([40])
  const [selectedBackground, setSelectedBackground] = useState("top-gradient-radial")
  const [selectedFormat, setSelectedFormat] = useState("auto")
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const [copied, setCopied] = useState(false)
  const [showBackgroundOnly, setShowBackgroundOnly] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string)
        setShowBackgroundOnly(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string)
        setShowBackgroundOnly(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleExport = () => {
    if (canvasRef) {
      const format = getFormatById(selectedFormat)
      const filename =
        format && format.id !== "auto"
          ? `screenshot-${format.name.toLowerCase().replace(/\s+/g, "-")}.png`
          : "screenshot.png"

      const exportCanvas = getExportCanvas(canvasRef)
      const link = document.createElement("a")
      link.download = filename
      link.href = exportCanvas.toDataURL("image/png", 1.0)
      link.click()
    }
  }

  const handleCopyToClipboard = async () => {
    if (canvasRef) {
      try {
        const exportCanvas = getExportCanvas(canvasRef)
        const blob = await new Promise<Blob>((resolve) => {
          exportCanvas.toBlob((result) => {
            if (result) resolve(result)
          }, "image/png")
        })
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setCanvasRef(canvas)
  }, [])

  const handleTogglePreview = () => {
    setShowBackgroundOnly((current) => !current)
  }

  const handleRandomize = () => {
    const randomPattern = getRandomPattern()
    setSelectedBackground(randomPattern.id)
  }

  const showCanvas = Boolean(image || showBackgroundOnly)

  return (
    <ScreenshotShellProvider
      value={{
        image,
        padding: padding[0],
        cornerRadius: cornerRadius[0],
        shadow: shadow[0],
        background: selectedBackground,
        format: selectedFormat,
        showBackgroundOnly,
        showCanvas,
        handleImageUpload,
        handleCanvasReady,
      }}
    >
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-4 py-3 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-foreground" viewBox="0 0 76 65" fill="currentColor">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Screenshot</span>
          </div>
          {showCanvas && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button onClick={handleExport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </header>

        <div className="flex-1">
          <div className="grid gap-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-6">
            <aside className="min-w-0 rounded-lg border border-border bg-background/80 p-4 lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</Label>
                  <FormatSelector selected={selectedFormat} onSelect={setSelectedFormat} />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Padding</Label>
                  <div className="flex items-center gap-3">
                    <Slider min={0} max={160} step={8} value={padding} onValueChange={setPadding} className="flex-1" />
                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{padding[0]}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Radius</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={48}
                      step={4}
                      value={cornerRadius}
                      onValueChange={setCornerRadius}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{cornerRadius[0]}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shadow</Label>
                  <div className="flex items-center gap-3">
                    <Slider min={0} max={100} step={5} value={shadow} onValueChange={setShadow} className="flex-1" />
                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{shadow[0]}</span>
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</Label>
                  <BackgroundSelector selected={selectedBackground} onSelect={setSelectedBackground} />
                </div>

                <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                  <Button variant="outline" size="sm" onClick={handleRandomize} className="flex-1 bg-transparent">
                    <Shuffle className="h-3.5 w-3.5 mr-2" />
                    Random
                  </Button>
                  <Button
                    variant={showBackgroundOnly ? "default" : "outline"}
                    size="sm"
                    onClick={handleTogglePreview}
                    className={showBackgroundOnly ? "" : "bg-transparent"}
                  >
                    {showBackgroundOnly ? (
                      <EyeOff className="h-3.5 w-3.5 mr-2" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 mr-2" />
                    )}
                    {showBackgroundOnly ? "Image" : "BG"}
                  </Button>
                </div>

                {image && (
                  <div className="pt-4 border-t border-border sm:col-span-2 lg:col-span-1">
                    <label htmlFor="image-reupload">
                      <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                        <span className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Change Image
                        </span>
                      </Button>
                    </label>
                    <input
                      id="image-reupload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </aside>

            <main
              className="min-w-0 flex min-h-[60vh] items-center justify-center rounded-lg border border-border bg-muted/30 p-4 sm:p-6 lg:p-8"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </ScreenshotShellProvider>
  )
}
