"use client"

import { useState } from "react"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  CreditCard, 
  Save, 
  Eye, 
  ChevronLeft,
  GripVertical,
  Settings,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
type BlockType = 'HERO' | 'TEXT' | 'IMAGE_GRID' | 'PRICING'

interface Block {
  id: string
  type: BlockType
  title: string
}

// Available Blocks (Sidebar)
const AVAILABLE_BLOCKS = [
  { type: 'HERO', title: 'Hero Section', icon: Layout },
  { type: 'TEXT', title: 'Rich Text', icon: Type },
  { type: 'IMAGE_GRID', title: 'Image Grid', icon: ImageIcon },
  { type: 'PRICING', title: 'Pricing Table', icon: CreditCard },
]

// Canvas Items Component
function SortableCanvasBlock({ block, activeId, setActiveId, onRemove }: { block: Block, activeId: string | null, setActiveId: (id: string) => void, onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isActive = activeId === block.id

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative rounded-xl border-2 transition-colors",
        isActive ? "border-purple-500" : "border-dashed border-white/20 hover:border-white/40",
        "bg-white/5 group"
      )}
      onClick={() => setActiveId(block.id)}
    >
      {/* Block Controls */}
      <div className={cn(
        "absolute -top-3 -right-3 flex items-center gap-1 bg-[#1a1a1a] rounded-lg border border-white/10 p-1 shadow-xl transition-opacity",
        isActive || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button 
          {...attributes} 
          {...listeners}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded">
          <Settings className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Block Render Mock */}
      <div className="p-8 flex items-center justify-center min-h-[150px] text-white/30">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            {block.type === 'HERO' && <Layout className="w-6 h-6" />}
            {block.type === 'TEXT' && <Type className="w-6 h-6" />}
            {block.type === 'IMAGE_GRID' && <ImageIcon className="w-6 h-6" />}
            {block.type === 'PRICING' && <CreditCard className="w-6 h-6" />}
          </div>
          <p className="font-medium text-white/60">{block.title} Placeholder</p>
        </div>
      </div>
    </div>
  )
}

export default function CMSPageBuilder() {
  const [canvasBlocks, setCanvasBlocks] = useState<Block[]>([
    { id: 'b1', type: 'HERO', title: 'Hero Section' },
    { id: 'b2', type: 'TEXT', title: 'Rich Text' }
  ])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setCanvasBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addBlock = (type: BlockType, title: string) => {
    const newBlock: Block = { id: `b-${Date.now()}`, type, title }
    setCanvasBlocks([...canvasBlocks, newBlock])
    setActiveBlockId(newBlock.id)
  }

  const removeBlock = (id: string) => {
    setCanvasBlocks(canvasBlocks.filter(b => b.id !== id))
    if (activeBlockId === id) setActiveBlockId(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold tracking-tight text-sm">Landing Page: 2024 Tech Summit</h1>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> DRAFT
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Save className="w-4 h-4" /> Publish Page
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Component Sidebar */}
        <aside className="w-72 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_BLOCKS.map(block => (
                <button
                  key={block.type}
                  onClick={() => addBlock(block.type as BlockType, block.title)}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all group"
                >
                  <block.icon className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" />
                  <span className="text-xs font-medium text-white/60 group-hover:text-white">{block.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeBlockId ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">Block Settings</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/40">Section ID</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50" defaultValue={`section-${activeBlockId}`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/40">Background Color</label>
                    <div className="flex gap-2">
                      <button className="w-6 h-6 rounded-full bg-transparent border-2 border-white" />
                      <button className="w-6 h-6 rounded-full bg-white/5" />
                      <button className="w-6 h-6 rounded-full bg-purple-900/50" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/40">Padding</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50">
                      <option>Small (py-8)</option>
                      <option>Medium (py-16)</option>
                      <option>Large (py-24)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-white/20 text-xs">
                Select a block on the canvas<br/>to edit its settings
              </div>
            )}
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-black overflow-y-auto p-8 lg:p-12">
          <div className="max-w-4xl mx-auto min-h-full">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={canvasBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {canvasBlocks.map((block) => (
                    <SortableCanvasBlock 
                      key={block.id} 
                      block={block} 
                      activeId={activeBlockId} 
                      setActiveId={setActiveBlockId}
                      onRemove={removeBlock}
                    />
                  ))}
                  
                  {canvasBlocks.length === 0 && (
                    <div className="h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/30">
                      <Layout className="w-12 h-12 mb-3 opacity-50" />
                      <p>Click elements in the sidebar to add them to your page</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </main>

      </div>
    </div>
  )
}
