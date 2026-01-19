"use client"

import { useState } from "react"
import {
  ImageIcon,
  FileText,
  Video,
  Download,
  Eye,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Asset {
  id: string
  name: string
  type: "image" | "document" | "video"
  url: string
  thumbnailUrl?: string
  size: string
  uploadedAt: Date
  uploadedBy: string
  event?: string
}

interface AssetGalleryProps {
  assets: Asset[]
  onDownload?: (asset: Asset) => void
}

export function AssetGallery({ assets, onDownload }: AssetGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filter, setFilter] = useState<"all" | Asset["type"]>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const getIcon = (type: Asset["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-primary" />
      case "document":
        return <FileText className="h-5 w-5 text-accent" />
      case "video":
        return <Video className="h-5 w-5 text-chart-3" />
    }
  }

  const getTypeColor = (type: Asset["type"]) => {
    switch (type) {
      case "image":
        return "bg-primary/20 text-primary"
      case "document":
        return "bg-accent/20 text-accent"
      case "video":
        return "bg-chart-3/20 text-chart-3"
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesFilter = filter === "all" || asset.type === filter
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.event?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Asset Library
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter assets</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("image")}>
                  Images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("document")}>
                  Documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("video")}>
                  Videos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <Dialog key={asset.id}>
                <DialogTrigger asChild>
                  <div
                    className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 cursor-pointer transition-all"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {asset.type === "image" && asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl || "/placeholder.svg"}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        {getIcon(asset.type)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                      <Badge className={`text-xs mt-1 ${getTypeColor(asset.type)}`}>
                        {asset.type}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownload?.(asset)
                        }}
                      >
                        <Download className="h-3 w-3" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{asset.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {asset.type === "image" ? (
                      <img
                        src={asset.url || "/placeholder.svg"}
                        alt={asset.name}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        {getIcon(asset.type)}
                        <span className="ml-2 text-muted-foreground">Preview not available</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Size: {asset.size}</p>
                        <p className="text-muted-foreground">
                          Uploaded by {asset.uploadedBy} on{" "}
                          {asset.uploadedAt.toLocaleDateString()}
                        </p>
                        {asset.event && (
                          <p className="text-muted-foreground">Event: {asset.event}</p>
                        )}
                      </div>
                      <Button onClick={() => onDownload?.(asset)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {getIcon(asset.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.size} • {asset.uploadedAt.toLocaleDateString()}
                    {asset.event && ` • ${asset.event}`}
                  </p>
                </div>
                <Badge className={getTypeColor(asset.type)}>{asset.type}</Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDownload?.(asset)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-2">No assets found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
