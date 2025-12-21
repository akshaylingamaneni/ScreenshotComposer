export interface ExportFormat {
  id: string
  name: string
  width: number
  height: number
  category: "social" | "presentation" | "custom"
}

export const EXPORT_FORMATS: ExportFormat[] = [
  // Social Media
  { id: "twitter-post", name: "Twitter Post", width: 1200, height: 675, category: "social" },
  { id: "twitter-header", name: "Twitter Header", width: 1500, height: 500, category: "social" },
  { id: "instagram-square", name: "Instagram Square", width: 1080, height: 1080, category: "social" },
  { id: "instagram-portrait", name: "Instagram Portrait", width: 1080, height: 1350, category: "social" },
  { id: "instagram-story", name: "Instagram Story", width: 1080, height: 1920, category: "social" },
  { id: "linkedin-post", name: "LinkedIn Post", width: 1200, height: 627, category: "social" },
  { id: "facebook-post", name: "Facebook Post", width: 1200, height: 630, category: "social" },
  { id: "youtube-thumbnail", name: "YouTube Thumbnail", width: 1280, height: 720, category: "social" },

  // Presentations
  { id: "presentation-16-9", name: "16:9 Slide", width: 1920, height: 1080, category: "presentation" },
  { id: "presentation-4-3", name: "4:3 Slide", width: 1600, height: 1200, category: "presentation" },

  // Custom / Auto
  { id: "auto", name: "Auto (Original)", width: 0, height: 0, category: "custom" },
]

export function getFormatById(id: string): ExportFormat | undefined {
  return EXPORT_FORMATS.find((f) => f.id === id)
}
