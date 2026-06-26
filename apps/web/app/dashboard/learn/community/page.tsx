"use client"

import { useState, useEffect } from "react"
import { MessageSquare, ThumbsUp, Search, Plus, Hash, Pin, MoreHorizontal, CornerDownRight } from "lucide-react"

export default function CommunityForumsPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isComposing, setIsComposing] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  
  const [mockUserId, setMockUserId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch mock user ID for testing
    fetch('http://localhost:4000/api/v1/auth/me')
      .then(res => res.json())
      .catch(() => {
        // Fallback to fetching any student user from DB to mock auth
        fetch('http://localhost:4000/api/v1/lms/assignments/mock-context')
          .then(res => res.json())
          .then(data => {
            if (data.studentId) setMockUserId(data.studentId)
          })
      })

    // Fetch categories
    fetch('http://localhost:4000/api/v1/academy/forums/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data.data || [])
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchPosts(activeCategory)
  }, [activeCategory])

  const fetchPosts = (catId: string | null) => {
    const url = catId 
      ? `http://localhost:4000/api/v1/academy/forums/posts?categoryId=${catId}`
      : `http://localhost:4000/api/v1/academy/forums/posts`
      
    fetch(url)
      .then(res => res.json())
      .then(data => setPosts(data.data || []))
  }

  const handlePost = async () => {
    if (!newTitle || !newContent || !activeCategory || !mockUserId) return alert("Please fill all fields and select a category")
    
    try {
      const res = await fetch('http://localhost:4000/api/v1/academy/forums/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: activeCategory,
          authorId: mockUserId, // Would be from auth context
          title: newTitle,
          content: newContent
        })
      })
      
      if (res.ok) {
        setNewTitle("")
        setNewContent("")
        setIsComposing(false)
        fetchPosts(activeCategory)
        alert("Posted successfully! +5 XP awarded.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
      {/* Sidebar - Categories */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-black text-lg text-slate-900">Community</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === null ? 'bg-[#49ABC9]/10 text-[#49ABC9]' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2"><Hash className="w-4 h-4 opacity-50" /> All Discussions</span>
          </button>
          
          <div className="pt-4 pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3">Categories</span>
          </div>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id ? 'bg-[#49ABC9]/10 text-[#49ABC9]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <div className={`w-2 h-2 rounded-full ${cat.color || 'bg-slate-300'}`} /> 
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{cat._count?.posts || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Feed */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              placeholder="Search discussions..." 
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#49ABC9]/20"
            />
          </div>
          <button 
            onClick={() => setIsComposing(!isComposing)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#49ABC9] text-white rounded-xl text-sm font-bold hover:bg-[#398FA8] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          {isComposing && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
              <input 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Discussion Title"
                className="w-full text-xl font-bold bg-transparent border-none outline-none placeholder:text-slate-300 mb-4"
              />
              <textarea 
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="What's on your mind? Share code, ask for help, or discuss a topic..."
                className="w-full h-32 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none focus:border-[#49ABC9]/50 resize-none mb-4"
              />
              <div className="flex items-center justify-between">
                <select 
                  value={activeCategory || ""}
                  onChange={e => setActiveCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setIsComposing(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handlePost} className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800">Post</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {posts.length === 0 && !isLoading && (
              <div className="text-center py-20 text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No discussions found in this category.
              </div>
            )}
            
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#49ABC9]/20 to-blue-500/20 flex items-center justify-center shrink-0 border border-[#49ABC9]/10">
                    <span className="text-[#49ABC9] font-bold text-sm">{post.author?.firstName?.charAt(0)}{post.author?.lastName?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{post.author?.firstName} {post.author?.lastName}</span>
                      {post.author?.role !== 'STUDENT' && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{post.author?.role}</span>}
                      <span className="text-slate-400 text-xs ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      {post.isPinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${post.category?.color || 'bg-slate-300'}`} />
                        {post.category?.name}
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-[#49ABC9] transition-colors">
                        <MessageSquare className="w-4 h-4" /> {post._count?.replies || 0} Replies
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                        <ThumbsUp className="w-4 h-4" /> {post.upvotes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
