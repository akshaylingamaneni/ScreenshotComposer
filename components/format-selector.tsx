"use client"
import { EXPORT_FORMATS } from "@/lib/formats"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormatSelectorProps {
  selected: string
  onSelect: (formatId: string) => void
}

export function FormatSelector({ selected, onSelect }: FormatSelectorProps) {
  const socialFormats = EXPORT_FORMATS.filter((f) => f.category === "social")
  const presentationFormats = EXPORT_FORMATS.filter((f) => f.category === "presentation")
  const customFormats = EXPORT_FORMATS.filter((f) => f.category === "custom")

  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-full bg-muted border-border">
        <SelectValue placeholder="Select format" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="text-muted-foreground">Custom</SelectLabel>
          {customFormats.map((format) => (
            <SelectItem key={format.id} value={format.id}>
              {format.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="text-muted-foreground">Social</SelectLabel>
          {socialFormats.map((format) => (
            <SelectItem key={format.id} value={format.id}>
              <span className="flex items-center gap-3">
                <span>{format.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format.width}×{format.height}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="text-muted-foreground">Presentation</SelectLabel>
          {presentationFormats.map((format) => (
            <SelectItem key={format.id} value={format.id}>
              <span className="flex items-center gap-3">
                <span>{format.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format.width}×{format.height}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
