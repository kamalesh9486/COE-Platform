import { useState, useRef, useEffect, useCallback } from 'react'
import '../command-iq.css'
import Icon from './Icon'
import { useScrollLock } from '../hooks/useScrollLock'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { MicrosoftCopilotStudioService } from '../generated/services/MicrosoftCopilotStudioService'

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'user' | 'ai'

interface Message {
  id: string
  role: Role
  text: string
  time: Date
  context?: string
  done: boolean
}

// ─── Agent config ─────────────────────────────────────────────────────────────

const AGENT_NAME = 'copilots_header_da4fe'

// ─── Greeting ────────────────────────────────────────────────────────────────

function buildGreeting(firstName: string): string {
  const h = new Date().getHours()
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const name = firstName ? `, ${firstName}` : ''
  return `${part}${name}. I'm **Command IQ** — DEWA COE's AI intelligence assistant. Ask me anything about AI adoption, programme health, incidents, governance, finance, or the strategic roadmap.`
}

// ─── Quick prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: 'bi-bar-chart-line-fill', label: 'AI Adoption Rate',   query: 'What is the current AI adoption rate?' },
  { icon: 'bi-shield-exclamation',  label: 'Risk & Governance',  query: 'Show me the risk and governance status' },
  { icon: 'bi-rocket-takeoff',      label: 'Strategic Roadmap',  query: 'Summarise the strategic roadmap progress' },
  { icon: 'bi-currency-dirham',     label: 'Finance Overview',   query: 'What is the current budget and spend status?' },
  { icon: 'bi-people-fill',         label: 'Workforce Readiness',query: 'How is the AI workforce readiness?' },
  { icon: 'bi-graph-up-arrow',      label: 'Business Impact',    query: 'What is the AI impact and ROI so far?' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Convert the limited markdown subset the AI returns to safe HTML.
 * Only <strong> and <br> are allowed — all other HTML is escaped first,
 * so there is no XSS risk from AI-generated or user-supplied content.
 */
function parseMarkdown(text: string): string {
  // 1. Escape any HTML that may already be in the text
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  // 2. Apply our intentional markdown transforms on the now-safe string
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommandIQ() {
  const [open, setOpen]           = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [thinking, setThinking]   = useState(false)
  const [unread, setUnread]       = useState(0)
  const [copiedId, setCopiedId]   = useState<string | null>(null)
  const [greetText, setGreetText] = useState('')
  const [greetDone, setGreetDone] = useState(false)
  const [greetKey, setGreetKey]   = useState(0)
  const { name } = useCurrentUser()
  const firstName = name?.split(' ')[0] || ''
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)
  const streamRef               = useRef<ReturnType<typeof setInterval> | null>(null)
  const greetTimerRef           = useRef<ReturnType<typeof setInterval> | null>(null)
  const greetTimeRef            = useRef(new Date())
  // A fresh UUID on every mount guarantees a new Copilot Studio conversation on each page load.
  // Passing an unrecognised ID forces the backend to create a fresh session rather than
  // resuming the user's last server-side conversation when no ID is provided.
  const conversationIdRef       = useRef<string>(crypto.randomUUID())

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current)  clearInterval(streamRef.current)
      if (greetTimerRef.current) clearInterval(greetTimerRef.current)
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Focus input when opened; bump greetKey to replay animation
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 320)
      setUnread(0)
      setGreetKey(k => k + 1)
    }
  }, [open])

  // Greeting typewriter — fires each time panel opens with an empty chat
  useEffect(() => {
    if (greetKey === 0) return
    if (greetTimerRef.current) clearInterval(greetTimerRef.current)
    setGreetText('')
    setGreetDone(false)
    greetTimeRef.current = new Date()
    const full = buildGreeting(firstName)
    let i = 0
    greetTimerRef.current = setInterval(() => {
      i += 2
      setGreetText(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(greetTimerRef.current!)
        setGreetDone(true)
      }
    }, 18)
    return () => { if (greetTimerRef.current) clearInterval(greetTimerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greetKey])

  // Lock background scroll while panel is open (conditional, reference-counted)
  useScrollLock(open)

  // Typewriter streamer
  const streamMessage = useCallback((id: string, fullText: string) => {
    if (streamRef.current) clearInterval(streamRef.current)
    let i = 0
    streamRef.current = setInterval(() => {
      i += 2 // 2 chars per tick for snappy feel
      setMessages(prev =>
        prev.map(m =>
          m.id === id
            ? { ...m, text: fullText.slice(0, i), done: i >= fullText.length }
            : m
        )
      )
      if (i >= fullText.length) {
        if (streamRef.current) clearInterval(streamRef.current)
      }
    }, 16)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      time: new Date(),
      done: true,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setThinking(true)

    try {
      const result = await MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2(
        AGENT_NAME,
        { message: text.trim(), notificationUrl: 'https://notificationurlplaceholder' },
        conversationIdRef.current
      )

      const data = result.data as Record<string, unknown> | null | undefined

      // Persist conversation ID for multi-turn context
      const convId = (data?.conversationId ?? data?.ConversationId ?? data?.conversationID) as string | undefined
      if (convId) conversationIdRef.current = convId

      const responseText = (
        (data?.lastResponse as string | undefined) ??
        ((data?.responses as string[] | undefined)?.[0]) ??
        'Sorry, I received an empty response.'
      )

      const aiId = `ai-${Date.now()}`
      const aiMsg: Message = {
        id: aiId,
        role: 'ai',
        text: '',
        time: new Date(),
        done: false,
      }
      setThinking(false)
      setMessages(prev => [...prev, aiMsg])
      if (!open) setUnread(n => n + 1)
      streamMessage(aiId, responseText)

    } catch {
      const aiId = `ai-err-${Date.now()}`
      setThinking(false)
      setMessages(prev => [...prev, {
        id: aiId,
        role: 'ai',
        text: 'Sorry, I couldn\'t reach the server right now. Please try again.',
        time: new Date(),
        done: true,
      }])
    }
  }, [thinking, open, streamMessage])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleCopy(msgId: string, text: string) {
    const plain = text.replace(/<[^>]+>/g, '').replace(/\*\*/g, '')
    navigator.clipboard.writeText(plain)
      .then(() => {
        setCopiedId(msgId)
        setTimeout(() => setCopiedId(id => id === msgId ? null : id), 2000)
      })
      .catch(() => console.warn('[CommandIQ] Clipboard write failed'))
  }

  const isEmpty = messages.length === 0

  return (
    <>
      {/* ── Floating Trigger ── */}
      <div className={`ciq-trigger${open ? ' ciq-trigger--open' : ''}`} onClick={() => setOpen(o => !o)}>
        <div className="ciq-trigger-orb">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2.8" fill="white"/>
            <circle cx="12" cy="4"   r="1.8" fill="white" opacity="0.9"/>
            <circle cx="12" cy="20"  r="1.8" fill="white" opacity="0.9"/>
            <circle cx="4"  cy="8"   r="1.8" fill="white" opacity="0.9"/>
            <circle cx="20" cy="8"   r="1.8" fill="white" opacity="0.9"/>
            <circle cx="4"  cy="16"  r="1.8" fill="white" opacity="0.9"/>
            <circle cx="20" cy="16"  r="1.8" fill="white" opacity="0.9"/>
            <line x1="12" y1="5.8"  x2="12" y2="9.2"  stroke="white" strokeWidth="1.2" opacity="0.6"/>
            <line x1="12" y1="14.8" x2="12" y2="18.2" stroke="white" strokeWidth="1.2" opacity="0.6"/>
            <line x1="5.4" y1="8.9"  x2="9.4"  y2="11.1" stroke="white" strokeWidth="1.2" opacity="0.6"/>
            <line x1="14.6" y1="12.9" x2="18.6" y2="15.1" stroke="white" strokeWidth="1.2" opacity="0.6"/>
            <line x1="5.4" y1="15.1" x2="9.4"  y2="12.9" stroke="white" strokeWidth="1.2" opacity="0.6"/>
            <line x1="14.6" y1="11.1" x2="18.6" y2="8.9"  stroke="white" strokeWidth="1.2" opacity="0.6"/>
          </svg>
        </div>
        <div className="ciq-trigger-ripple" />
        <div className="ciq-trigger-ripple ciq-trigger-ripple--2" />
        {unread > 0 && !open && (
          <span className="ciq-unread">{unread}</span>
        )}
        <div className="ciq-trigger-label">Command IQ</div>
      </div>

      {/* ── Panel ── */}
      <div className={`ciq-panel${open ? ' ciq-panel--open' : ''}${fullscreen ? ' ciq-panel--fullscreen' : ''}`}>

        {/* Header */}
        <div className="ciq-header">
          <div className="ciq-header-left">
            <div className="ciq-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2.8" fill="white"/>
                <circle cx="12" cy="4"   r="1.8" fill="white" opacity="0.85"/>
                <circle cx="12" cy="20"  r="1.8" fill="white" opacity="0.85"/>
                <circle cx="4"  cy="8"   r="1.8" fill="white" opacity="0.85"/>
                <circle cx="20" cy="8"   r="1.8" fill="white" opacity="0.85"/>
                <circle cx="4"  cy="16"  r="1.8" fill="white" opacity="0.85"/>
                <circle cx="20" cy="16"  r="1.8" fill="white" opacity="0.85"/>
                <line x1="12" y1="5.8"  x2="12" y2="9.2"  stroke="white" strokeWidth="1.1" opacity="0.55"/>
                <line x1="12" y1="14.8" x2="12" y2="18.2" stroke="white" strokeWidth="1.1" opacity="0.55"/>
                <line x1="5.4" y1="8.9"  x2="9.4"  y2="11.1" stroke="white" strokeWidth="1.1" opacity="0.55"/>
                <line x1="14.6" y1="12.9" x2="18.6" y2="15.1" stroke="white" strokeWidth="1.1" opacity="0.55"/>
                <line x1="5.4" y1="15.1" x2="9.4"  y2="12.9" stroke="white" strokeWidth="1.1" opacity="0.55"/>
                <line x1="14.6" y1="11.1" x2="18.6" y2="8.9"  stroke="white" strokeWidth="1.1" opacity="0.55"/>
              </svg>
            </div>
            <div>
              <div className="ciq-header-title">Command IQ</div>
              <div className="ciq-header-sub">
                <span className="ciq-status-dot" />
                DEWA COE Intelligence
              </div>
            </div>
          </div>
          <div className="ciq-header-actions">
            {messages.length > 0 && (
              <button
                className="ciq-icon-btn"
                title="New conversation"
                aria-label="Start new conversation"
                onClick={() => { setMessages([]); conversationIdRef.current = crypto.randomUUID(); setGreetKey(k => k + 1) }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
              </button>
            )}
            <button className="ciq-icon-btn" title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={() => setFullscreen(f => !f)}>
              {fullscreen ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 1h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 1m9 0h4A1.5 1.5 0 0 1 16 2.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1 0-1M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/>
                </svg>
              )}
            </button>
            <button className="ciq-icon-btn" title="Close" aria-label="Close Command IQ" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ciq-body">

          {/* Empty state — greeting message from bot */}
          {isEmpty && (
            <div className="ciq-welcome">

              {/* AI greeting bubble — types itself out */}
              {greetText && (
                <div className="ciq-msg ciq-msg--ai ciq-msg--greet">
                  <div className="ciq-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="2.5" fill="white"/>
                      <circle cx="12" cy="5"  r="1.6" fill="white" opacity="0.8"/>
                      <circle cx="12" cy="19" r="1.6" fill="white" opacity="0.8"/>
                      <circle cx="5"  cy="8.5"  r="1.6" fill="white" opacity="0.8"/>
                      <circle cx="19" cy="8.5"  r="1.6" fill="white" opacity="0.8"/>
                      <circle cx="5"  cy="15.5" r="1.6" fill="white" opacity="0.8"/>
                      <circle cx="19" cy="15.5" r="1.6" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                  <div className="ciq-msg-col">
                    <div
                      className="ciq-bubble"
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(greetText) + (!greetDone ? '<span class="ciq-cursor">▋</span>' : ''),
                      }}
                    />
                    <div className="ciq-msg-foot">
                      <span className="ciq-msg-time">{fmtTime(greetTimeRef.current)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick prompts — fade in after greeting finishes */}
              {greetDone && (
                <div className="ciq-quick-wrap">
                  <div className="ciq-greet-sep">What would you like to explore?</div>
                  <div className="ciq-quick-grid">
                    {QUICK_PROMPTS.map(p => (
                      <button
                        key={p.label}
                        className="ciq-quick-btn"
                        onClick={() => sendMessage(p.query)}
                      >
                        <span className="ciq-quick-icon"><Icon name={p.icon} /></span>
                        <span className="ciq-quick-label">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message list */}
          {messages.map(msg => (
            <div key={msg.id} className={`ciq-msg ciq-msg--${msg.role}`}>
              {msg.role === 'ai' && (
                <div className="ciq-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="2.5" fill="white"/>
                    <circle cx="12" cy="5"  r="1.6" fill="white" opacity="0.8"/>
                    <circle cx="12" cy="19" r="1.6" fill="white" opacity="0.8"/>
                    <circle cx="5"  cy="8.5"  r="1.6" fill="white" opacity="0.8"/>
                    <circle cx="19" cy="8.5"  r="1.6" fill="white" opacity="0.8"/>
                    <circle cx="5"  cy="15.5" r="1.6" fill="white" opacity="0.8"/>
                    <circle cx="19" cy="15.5" r="1.6" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              )}
              <div className="ciq-msg-col">
                {msg.context && (
                  <div className="ciq-msg-context">
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
                    </svg>
                    {msg.context}
                  </div>
                )}
                <div
                  className="ciq-bubble"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) + (!msg.done ? '<span class="ciq-cursor">▋</span>' : '') }}
                />
                <div className="ciq-msg-foot">
                  <span className="ciq-msg-time">{fmtTime(msg.time)}</span>
                  {msg.role === 'ai' && msg.done && (
                    <button
                      className="ciq-copy-btn"
                      title={copiedId === msg.id ? 'Copied!' : 'Copy'}
                      aria-label={copiedId === msg.id ? 'Copied to clipboard' : 'Copy message'}
                      onClick={() => handleCopy(msg.id, msg.text)}
                    >
                      {copiedId === msg.id ? (
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                        </svg>
                      )}
                      {copiedId === msg.id ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="ciq-msg ciq-msg--ai">
              <div className="ciq-msg-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="2.5" fill="white"/>
                  <circle cx="12" cy="5"  r="1.6" fill="white" opacity="0.8"/>
                  <circle cx="12" cy="19" r="1.6" fill="white" opacity="0.8"/>
                  <circle cx="5"  cy="8.5"  r="1.6" fill="white" opacity="0.8"/>
                  <circle cx="19" cy="8.5"  r="1.6" fill="white" opacity="0.8"/>
                  <circle cx="5"  cy="15.5" r="1.6" fill="white" opacity="0.8"/>
                  <circle cx="19" cy="15.5" r="1.6" fill="white" opacity="0.8"/>
                </svg>
              </div>
              <div className="ciq-msg-col">
                <div className="ciq-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="ciq-input-bar">
          {!isEmpty && (
            <div className="ciq-suggestion-strip">
              {QUICK_PROMPTS.slice(0, 3).map(p => (
                <button key={p.label} className="ciq-suggestion-chip" onClick={() => sendMessage(p.query)}>
                  <Icon name={p.icon} /> {p.label}
                </button>
              ))}
            </div>
          )}
          <div className="ciq-input-row">
            <input
              ref={inputRef}
              className="ciq-input"
              placeholder="Ask Command IQ anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={thinking}
            />
            <button
              className={`ciq-send${input.trim() ? ' ciq-send--active' : ''}`}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || thinking}
              title="Send"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338L1.32 6.295z"/>
              </svg>
            </button>
          </div>
          <div className="ciq-input-hint">Powered by Command IQ · DEWA COE</div>
        </div>
      </div>

      {/* Backdrop (mobile) */}
      {open && <div className="ciq-backdrop" onClick={() => setOpen(false)} />}
    </>
  )
}
