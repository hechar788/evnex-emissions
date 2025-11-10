/**
 * @fileoverview View mode tabs component for comparison view.
 *
 * @module components/dashboard/compare/ViewModeTabs
 */

import { ChartColumnBig, LayoutGrid } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ViewModeTabsProps {
  viewMode: 'grid' | 'chart'
  onViewModeChange: (mode: 'grid' | 'chart') => void
}

/**
 * View mode tabs component.
 */
export function ViewModeTabs({ viewMode, onViewModeChange }: ViewModeTabsProps) {
  return (
    <div className="flex justify-end">
      <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as 'grid' | 'chart')}>
        <TabsList>
          <TabsTrigger 
            value="grid" 
            className="gap-2 cursor-pointer hover:bg-primary/[0.025] transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Grid</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chart" 
            className="gap-2 cursor-pointer hover:bg-primary/[0.025] transition-all"
          >
            <ChartColumnBig className="h-4 w-4" />
            <span>Chart</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

