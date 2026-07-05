"use client"

import { useCallback, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Play, MessageSquare, Zap, Clock, ChevronLeft, Save, PlayCircle } from 'lucide-react'

// Custom Nodes
function TriggerNode({ data }: { data: any }) {
  return (
    <div className="bg-purple-600 border border-purple-500 shadow-xl rounded-xl p-4 w-64 text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <h3 className="font-bold">WhatsApp Trigger</h3>
      </div>
      <p className="text-xs text-purple-200">Activates when: {data.condition}</p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
    </div>
  )
}

function MessageNode({ data }: { data: any }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/20 shadow-xl rounded-xl p-4 w-64 text-white">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <MessageSquare className="w-4 h-4" />
        </div>
        <h3 className="font-bold">Send Template</h3>
      </div>
      <p className="text-xs text-white/50 bg-white/5 p-2 rounded-lg truncate">{data.message}</p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
    </div>
  )
}

function DelayNode({ data }: { data: any }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/20 shadow-xl rounded-xl p-4 w-64 text-white">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Clock className="w-4 h-4" />
        </div>
        <h3 className="font-bold">Wait</h3>
      </div>
      <p className="text-xs text-white/50">{data.duration}</p>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
    </div>
  )
}

const nodeTypes = {
  trigger: TriggerNode,
  message: MessageNode,
  delay: DelayNode
}

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { condition: 'Keyword "HI" received' } },
  { id: '2', type: 'message', position: { x: 250, y: 200 }, data: { message: 'Welcome to Grekam! How can we help?' } },
  { id: '3', type: 'delay', position: { x: 250, y: 350 }, data: { duration: 'Wait 24 Hours' } },
  { id: '4', type: 'message', position: { x: 250, y: 500 }, data: { message: 'Did you get a chance to review?' } },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#a855f7' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#a855f7' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#a855f7' } },
]

export default function WhatsAppFlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [activeNode, setActiveNode] = useState<Node | null>(null)

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a855f7' } }, eds)), [setEdges])
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setActiveNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setActiveNode(null)
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white overflow-hidden">
      
      {/* Header */}
      <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold tracking-tight text-sm">Flow: Welcome Sequence</h1>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> ACTIVE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> Test Flow
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Save className="w-4 h-4" /> Save Automation
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Node Library Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col shrink-0 relative z-10">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Add Nodes</h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center gap-3 transition-all">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white/80">Send Message</span>
              </button>
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center gap-3 transition-all">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">Time Delay</span>
              </button>
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center gap-3 transition-all">
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/80">Condition</span>
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-4 bg-black/20">
            {activeNode ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">Node Settings</h3>
                
                {activeNode.type === 'message' && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-white/40">Template ID</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50">
                      <option>Welcome_Template_V1</option>
                      <option>Follow_Up_V2</option>
                    </select>
                    
                    <label className="text-[10px] uppercase font-bold text-white/40 block mt-3">Message Preview</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none text-white/60" 
                      rows={4} 
                      disabled
                      value={activeNode.data.message}
                    />
                  </div>
                )}

                {activeNode.type === 'delay' && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-white/40">Wait For</label>
                    <div className="flex gap-2">
                      <input type="number" defaultValue="24" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50" />
                      <select className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500/50">
                        <option>Hours</option>
                        <option>Days</option>
                        <option>Minutes</option>
                      </select>
                    </div>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-white/20 text-xs">
                Select a node on the canvas<br/>to configure it
              </div>
            )}
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-[#050505] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#050505]"
          >
            <Background color="#ffffff" gap={20} size={1} opacity={0.05} />
            <Controls className="bg-white/5 border-white/10 fill-white" />
          </ReactFlow>
        </main>

      </div>
    </div>
  )
}
