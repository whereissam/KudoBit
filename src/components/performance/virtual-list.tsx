import { useState, useEffect, useRef, useMemo } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const itemsPerView = Math.ceil(containerHeight / itemHeight)
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(items.length, start + itemsPerView + overscan * 2)
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end)
    }
  }, [items, itemHeight, containerHeight, scrollTop, overscan])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return (
    <div
      ref={scrollContainerRef}
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Grid virtualization for product grids
interface VirtualGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  containerWidth: number
  containerHeight: number
  gap?: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 16,
  renderItem,
  className
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap))
  const totalRows = Math.ceil(items.length / columnsPerRow)
  const rowHeight = itemHeight + gap
  
  const { startRow, endRow, visibleItems } = useMemo(() => {
    const rowsPerView = Math.ceil(containerHeight / rowHeight)
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 2)
    const end = Math.min(totalRows, start + rowsPerView + 4)
    
    const startItemIndex = start * columnsPerRow
    const endItemIndex = Math.min(items.length, end * columnsPerRow)
    
    return {
      startRow: start,
      endRow: end,
      visibleItems: items.slice(startItemIndex, endItemIndex)
    }
  }, [items, columnsPerRow, totalRows, rowHeight, containerHeight, scrollTop])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const totalHeight = totalRows * rowHeight
  const offsetY = startRow * rowHeight

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsPerRow}, ${itemWidth}px)`,
            gap: `${gap}px`,
            justifyContent: 'center'
          }}
        >
          {visibleItems.map((item, index) => {
            const originalIndex = startRow * columnsPerRow + index
            return (
              <div key={originalIndex}>
                {renderItem(item, originalIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}