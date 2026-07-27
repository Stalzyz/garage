"use client"

import { useState, useTransition } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@grekam/ui/components/button"
import { Input } from "@grekam/ui/components/input"
import { Badge } from "@grekam/ui/components/badge"
import { GripVertical, Plus, Trash2, Video, FileText, FileDown, Layers } from "lucide-react"
import { createModule, updateModule, deleteModule, reorderModules, createLesson, updateLesson, deleteLesson, reorderLessons } from "../actions"

type Lesson = { id: string, title: string, type: string, sortOrder: number }
type Module = { id: string, title: string, sortOrder: number, lessons: Lesson[] }

const TypeIcons = {
  VIDEO: <Video className="w-4 h-4" />,
  TEXT: <FileText className="w-4 h-4" />,
  PDF: <FileDown className="w-4 h-4" />,
  RICH_TEXT: <FileText className="w-4 h-4" />,
}

function SortableLesson({ lesson, onUpdate, onDelete }: { lesson: Lesson, onUpdate: any, onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-background border rounded-md group">
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-muted-foreground">
        {(TypeIcons as any)[lesson.type] || <FileText className="w-4 h-4" />}
      </div>
      <div className="flex-1">
        <Input 
          value={lesson.title} 
          onChange={(e) => onUpdate(lesson.id, e.target.value)}
          className="h-8 border-transparent hover:border-input focus:border-input bg-transparent"
        />
      </div>
      <Badge variant="outline" className="text-[10px]">{lesson.type}</Badge>
      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => onDelete(lesson.id)}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  )
}

function SortableModule({ module, onUpdateModule, onDeleteModule, onAddLesson, onUpdateLesson, onDeleteLesson, onReorderLessons }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((l: any) => l.id === active.id)
      const newIndex = module.lessons.findIndex((l: any) => l.id === over.id)
      onReorderLessons(module.id, arrayMove(module.lessons, oldIndex, newIndex))
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-muted/30 border rounded-lg overflow-hidden mb-6">
      <div className="flex items-center gap-3 p-4 bg-muted/50 border-b">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <Input 
            value={module.title} 
            onChange={(e) => onUpdateModule(module.id, e.target.value)}
            className="font-semibold border-transparent hover:border-input focus:border-input bg-transparent"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDeleteModule(module.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      
      <div className="p-4 space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={module.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
            {module.lessons.map((lesson: any) => (
              <SortableLesson 
                key={lesson.id} 
                lesson={lesson} 
                onUpdate={onUpdateLesson}
                onDelete={onDeleteLesson}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onAddLesson(module.id, "VIDEO")}>
            <Plus className="w-4 h-4 mr-1" /> Add Video
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddLesson(module.id, "RICH_TEXT")}>
            <Plus className="w-4 h-4 mr-1" /> Add Article
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CourseBuilderClient({ courseId, initialModules }: { courseId: string, initialModules: Module[] }) {
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((m) => m.id === active.id)
        const newIndex = items.findIndex((m) => m.id === over.id)
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        startTransition(() => {
          reorderModules(courseId, newArray.map(m => m.id))
        })
        
        return newArray
      })
    }
  }

  const handleAddModule = () => {
    startTransition(async () => {
      await createModule(courseId, "New Section")
    })
  }

  const handleUpdateModule = (id: string, title: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, title } : m))
    startTransition(() => updateModule(id, title))
  }

  const handleDeleteModule = (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return
    setModules(modules.filter(m => m.id !== id))
    startTransition(() => deleteModule(id))
  }

  // Lesson handlers
  const handleAddLesson = (moduleId: string, type: string) => {
    startTransition(async () => {
      await createLesson(moduleId, "New Lesson", type)
    })
  }

  const handleUpdateLesson = (id: string, title: string) => {
    setModules(modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === id ? { ...l, title } : l)
    })))
    startTransition(() => updateLesson(id, { title }))
  }

  const handleDeleteLesson = (id: string) => {
    setModules(modules.map(m => ({
      ...m,
      lessons: m.lessons.filter(l => l.id !== id)
    })))
    startTransition(() => deleteLesson(id))
  }

  const handleReorderLessons = (moduleId: string, newLessons: Lesson[]) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: newLessons } : m))
    startTransition(() => {
      reorderLessons(courseId, newLessons.map(l => l.id))
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Curriculum Outline
        </h3>
        <Button onClick={handleAddModule} disabled={isPending}>
          <Plus className="w-4 h-4 mr-2" /> Add Section
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {modules.map(module => (
            <SortableModule
              key={module.id}
              module={module}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
              onAddLesson={handleAddLesson}
              onUpdateLesson={handleUpdateLesson}
              onDeleteLesson={handleDeleteLesson}
              onReorderLessons={handleReorderLessons}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {modules.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
          No curriculum sections yet. Click "Add Section" to begin.
        </div>
      )}
    </div>
  )
}
