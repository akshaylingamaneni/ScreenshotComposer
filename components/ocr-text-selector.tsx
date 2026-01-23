"use client"

import { useState, useCallback, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { OCRResult, OCRLine } from "@/lib/ocr/ocr-types"

type OCRTextSelectorProps = {
  result: OCRResult
  onSelect: (selectedText: string) => void
}

export function OCRTextSelector({ result, onSelect }: OCRTextSelectorProps) {
  const allLines = useMemo(() => {
    return result.blocks.flatMap((block) => block.lines)
  }, [result.blocks])

  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(() => {
    return new Set(allLines.map((line) => line.id))
  })

  const handleLineToggle = useCallback((lineId: string, checked: boolean) => {
    setSelectedLineIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(lineId)
      } else {
        next.delete(lineId)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedLineIds(new Set(allLines.map((line) => line.id)))
  }, [allLines])

  const handleDeselectAll = useCallback(() => {
    setSelectedLineIds(new Set())
  }, [])

  const handleConfirm = useCallback(() => {
    const selectedText = allLines
      .filter((line) => selectedLineIds.has(line.id))
      .map((line) => line.text.trim())
      .join("\n")
    onSelect(selectedText)
  }, [allLines, selectedLineIds, onSelect])

  const selectedCount = selectedLineIds.size
  const totalCount = allLines.length

  if (allLines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No text blocks found in the image.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedCount} of {totalCount} lines selected
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={selectedCount === totalCount}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeselectAll}
            disabled={selectedCount === 0}
          >
            Deselect All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-3">
          {allLines.map((line) => (
            <LineItem
              key={line.id}
              line={line}
              checked={selectedLineIds.has(line.id)}
              onCheckedChange={(checked) => handleLineToggle(line.id, checked)}
            />
          ))}
        </div>
      </ScrollArea>

      <Button
        onClick={handleConfirm}
        disabled={selectedCount === 0}
        className="w-full"
      >
        Create Text Card ({selectedCount} lines)
      </Button>
    </div>
  )
}

type LineItemProps = {
  line: OCRLine
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function LineItem({ line, checked, onCheckedChange }: LineItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={line.id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
      <Label
        htmlFor={line.id}
        className="flex-1 text-sm font-mono leading-relaxed cursor-pointer select-none break-all"
      >
        {line.text}
      </Label>
    </div>
  )
}
