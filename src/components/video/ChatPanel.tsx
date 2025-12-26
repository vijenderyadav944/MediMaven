"use client"

import * as React from "react"
import { getMessages, sendMessage, markMessagesAsRead } from "@/app/actions/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X } from "lucide-react"
import { format } from "date-fns"

interface ChatPanelProps {
  appointmentId: string
  currentUserId: string
  isOpen: boolean
  onClose: () => void
}

export function ChatPanel({ appointmentId, currentUserId, isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = React.useState<any[]>([])
  const [newMessage, setNewMessage] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  
  // Load messages on mount and poll for new messages
  React.useEffect(() => {
    const loadMessages = async () => {
      if (!appointmentId) return
      
      const result = await getMessages(appointmentId)
      if (result.success && result.messages) {
        setMessages(result.messages)
        // Mark messages as read
        await markMessagesAsRead(appointmentId)
      }
    }
    
    loadMessages()
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [appointmentId])
  
  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      const result = await sendMessage(appointmentId, newMessage.trim())
      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="w-80 h-full border-l border-neutral-700 bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-white">Chat</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-neutral-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-neutral-500 text-center text-sm py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId || msg.senderId?._id === currentUserId
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-neutral-800 text-neutral-100"
                    }`}
                  >
                    <p className="text-sm wrap-break-word">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-neutral-500"}`}>
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
