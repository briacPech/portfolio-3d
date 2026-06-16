"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, X, MessageCircle, Sparkles } from "lucide-react"

type FloatingChatProps = {
  apiPath?: string
  title?: string
  subtitle?: string
  defaultOpen?: boolean
}

function getMessageText(parts: { type: string; text?: string }[]): string {
  if (!parts) return ""
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")
}

export function FloatingChat({
  apiPath = "/api/chat",
  title = "Le Capitaine",
  subtitle = "",
  defaultOpen = false,
}: FloatingChatProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [input, setInput] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Import gameState here to avoid circular dependency issues at top level
    import("../scene/gameState").then(({ gameState }) => {
      setIsModalOpen(gameState.currentIsland !== null);
      gameState.subscribe(() => {
        setIsModalOpen(gameState.currentIsland !== null);
      });
    });
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: apiPath }),
  })

  const isBusy = status === "submitted" || status === "streaming"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isBusy) return
    sendMessage({ text })
    setInput("")
  }

  if (!open) {
    if (isModalOpen && window.matchMedia("(max-width: 768px)").matches) return null;
    return (
      <div className="fixed z-50 top-[20px] left-[20px] flex items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir l'assistant IA"
          className="flex h-12 md:h-16 items-center gap-2 md:gap-3 rounded-full border border-[rgba(216,175,58,0.5)] bg-[#0E1B2E]/95 px-4 md:px-6 text-[#F0C674] shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all hover:scale-105 hover:border-[rgba(216,175,58,0.8)] hover:bg-[#0E1B2E] animate-bounce-slow"
          style={{ animation: 'pulse 3s infinite' }}
        >
          <MessageCircle className="h-5 w-5 text-[#F0C674]" strokeWidth={2} />
          <span className="font-semibold max-md:text-sm md:hidden">Chat</span>
          <span className="max-md:hidden font-semibold" style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.1rem" }}>Le Capitaine</span>
        </button>

        {/* Bulle d'incitation */}
        <div 
          className="ml-4 px-4 py-2 rounded-xl border border-[rgba(216,175,58,0.3)] bg-[#0E1B2E]/80 backdrop-blur-sm shadow-lg max-md:hidden opacity-0 animate-[fadeIn_0.5s_ease-out_3s_forwards]"
          style={{
            position: "relative",
          }}
        >
          {/* Petite flèche */}
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 border-l border-b border-[rgba(216,175,58,0.3)] bg-[#0E1B2E] rotate-45" />
          
          <span className="text-[#F5EFE1] text-sm italic tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
            Une question sur mon profil ? Discutez avec le Capitaine !
          </span>
        </div>
        
        {/* CSS pour l'animation de la bulle d'incitation */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    )
  }

  // Si la modale du chat est ouverte, on la place proprement
  return (
    <div
      className="fixed max-md:top-[80px] max-md:right-4 max-md:left-4 max-md:h-[60vh] md:top-20 md:left-8 z-50 flex h-[40rem] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[rgba(216,175,58,0.3)] bg-[#0E1B2E]/75 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      role="dialog"
      aria-label="Le Capitaine"
    >
      <header className="flex items-center justify-between border-b border-[rgba(216,175,58,0.2)] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(216,175,58,0.4)] bg-[rgba(216,175,58,0.1)]">
            <Sparkles className="h-4 w-4 text-[#F0C674]" strokeWidth={1.5} />
          </span>
          <div className="flex flex-col">
            <h2
              className="text-lg leading-none text-[#F0C674]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {title}
            </h2>
            {subtitle ? (
              <span className="mt-1 text-xs text-[#C9C2B6]">{subtitle}</span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#C9C2B6] transition-colors hover:bg-[rgba(216,175,58,0.1)] hover:text-[#F5EFE1]"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-sm leading-relaxed text-[#C9C2B6]">
              Bienvenue à bord ! Je suis votre capitaine virtuel. Posez-moi vos questions sur le parcours, les compétences ou les projets de Briac.
            </p>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user"
            return (
              <div
                key={message.id}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isUser
                      ? "max-w-[80%] rounded-2xl rounded-br-sm border border-[rgba(216,175,58,0.4)] bg-[#D8AF3A]/20 px-4 py-2.5 text-sm leading-relaxed text-[#F5EFE1]"
                      : "max-w-[80%] rounded-2xl rounded-bl-sm border border-[rgba(216,175,58,0.15)] bg-[#071326]/80 px-4 py-2.5 text-sm leading-relaxed text-[#F5EFE1] backdrop-blur-sm"
                  }
                  style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                  {getMessageText(message.parts) || "…"}
                </div>
              </div>
            )
          })}

          {isBusy && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[rgba(216,175,58,0.15)] bg-[#071326]/80 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D8AF3A] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D8AF3A] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D8AF3A]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-[rgba(216,175,58,0.2)] px-4 py-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message…"
          aria-label="Message"
          className="h-11 flex-1 rounded-xl border border-[rgba(216,175,58,0.25)] bg-[#071326]/80 px-4 text-sm text-[#F5EFE1] outline-none transition-colors placeholder:text-[#C9C2B6]/60 focus:border-[rgba(216,175,58,0.6)] focus:ring-2 focus:ring-[rgba(216,175,58,0.4)]"
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isBusy}
          aria-label="Envoyer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(216,175,58,0.4)] bg-[#D8AF3A]/15 text-[#F0C674] transition-all hover:bg-[#D8AF3A]/30 hover:border-[rgba(216,175,58,0.7)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </form>
    </div>
  )
}
