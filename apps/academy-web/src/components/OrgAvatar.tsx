"use client"
import React from 'react'

export function OrgAvatar({ name, className }: { name?: string, className?: string }) {
  const init = name ? name.charAt(0).toUpperCase() : 'O'
  return (
    <div className={`flex items-center justify-center bg-zinc-800 text-white rounded-full ${className || 'w-8 h-8 text-sm'}`}>
      {init}
    </div>
  )
}
