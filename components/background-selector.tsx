"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { gridPatterns, PATTERN_CATEGORIES, type CategoryId } from "@/lib/patterns"

interface BackgroundSelectorProps {
  selected: string
  onSelect: (background: string) => void
}

export function BackgroundSelector({ selected, onSelect }: BackgroundSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedPattern = gridPatterns.find((p) => p.id === selected)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectPattern = (patternId: string) => {
    onSelect(patternId)
  }

  const filteredPatterns =
    activeCategory === "all" ? gridPatterns : gridPatterns.filter((p) => p.category === activeCategory)

  const getCleanStyle = (style: React.CSSProperties): React.CSSProperties => {
    const clean: React.CSSProperties = {}
    if (style.background) clean.background = style.background
    if (style.backgroundImage) clean.backgroundImage = style.backgroundImage
    if (style.backgroundColor) clean.backgroundColor = style.backgroundColor
    if (style.backgroundSize) clean.backgroundSize = style.backgroundSize
    if (style.WebkitMaskImage) clean.WebkitMaskImage = style.WebkitMaskImage
    if (style.maskImage) clean.maskImage = style.maskImage
    return clean
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {/* Selected preview + dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 rounded-lg border border-border hover:border-muted-foreground transition-colors text-left"
      >
        <div
          className="w-10 h-10 rounded-md border border-border/50 shrink-0"
          style={selectedPattern ? getCleanStyle(selectedPattern.style) : { background: "#000" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{selectedPattern?.name || "Select Background"}</p>
          <p className="text-xs text-muted-foreground capitalize">{selectedPattern?.category || "Pattern"}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="rounded-lg border border-border bg-background shadow-lg overflow-hidden">
          {/* Category tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {PATTERN_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors",
                  activeCategory === category.id
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Pattern grid */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {filteredPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => handleSelectPattern(pattern.id)}
                  title={pattern.name}
                  className={cn(
                    "aspect-square rounded-md border transition-all hover:scale-105 relative",
                    selected === pattern.id
                      ? "border-foreground ring-2 ring-foreground ring-offset-1 ring-offset-background"
                      : "border-border/50 hover:border-muted-foreground",
                  )}
                  style={getCleanStyle(pattern.style)}
                >
                  {pattern.badge && (
                    <span className="absolute top-0.5 right-0.5 px-1 py-0.5 text-[8px] font-medium bg-foreground text-background rounded">
                      {pattern.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
