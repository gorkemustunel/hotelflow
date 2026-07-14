import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { getConciergeReply, SUGGESTED_QUESTIONS, type ConciergeAction } from '@/utils/concierge';
import { hotelInfo } from '@/data/hotelInfo';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  action?: ConciergeAction;
}

let messageSeq = 0;
const nextId = () => `msg-${++messageSeq}`;

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: `Merhaba! Ben ${hotelInfo.hotelName} concierge asistanınızım. Wi-Fi, kahvaltı saatleri, geç çıkış, taksi çağırma gibi konularda hemen yardımcı olabilirim.`,
};

export function ConciergeAssistant({ roomNumber }: { roomNumber: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setDraft('');
    setTyping(true);
    window.setTimeout(
      () => {
        const reply = getConciergeReply(text, roomNumber);
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: reply.text, action: reply.action }]);
        setTyping(false);
      },
      450 + Math.random() * 500,
    );
  };

  const handleAction = (action: ConciergeAction) => {
    setOpen(false);
    navigate(action.href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Concierge asistanı"
        className="flex items-center gap-1.5 rounded-full bg-navy-900/5 p-1.5 text-navy-900 ring-1 ring-line transition hover:bg-navy-900/10"
      >
        <Icon name="Bot" className="h-3.5 w-3.5 text-gold-600" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
            <div
              className="flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-lifted animate-in sm:h-[640px] sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-navy-900/5 bg-cream-50 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-400/30">
                    <Icon name="Bot" className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold leading-tight text-navy-900">Concierge Asistanı</p>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                      <Icon name="CircleDot" className="h-2.5 w-2.5" />
                      Çevrimiçi
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-navy-400 hover:bg-navy-900/5 hover:text-navy-700">
                  <Icon name="X" className="h-5 w-5" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'flex items-start gap-2'}`}>
                      {m.role === 'assistant' && (
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15">
                          <Icon name="Sparkles" className="h-3 w-3 text-gold-600" />
                        </div>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            m.role === 'user' ? 'rounded-tr-sm bg-navy-900 text-cream-50' : 'rounded-tl-sm bg-cream-200 text-navy-800'
                          }`}
                          dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                        />
                        {m.action && (
                          <button
                            onClick={() => handleAction(m.action!)}
                            className="mt-1.5 flex items-center gap-1 rounded-full bg-gold-500/15 px-3 py-1.5 text-xs font-semibold text-gold-700 ring-1 ring-gold-400/30 transition hover:bg-gold-500/25"
                          >
                            {m.action.label}
                            <Icon name="ChevronRight" className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15">
                      <Icon name="Sparkles" className="h-3 w-3 text-gold-600" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-cream-200 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400" style={{ animationDelay: '120ms' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-400" style={{ animationDelay: '240ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {messages.length <= 2 && (
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="shrink-0 rounded-full bg-cream-200 px-3 py-1.5 text-[11px] font-medium text-navy-700 ring-1 ring-line transition hover:bg-cream-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
                className="flex items-center gap-2 border-t border-navy-900/5 bg-cream-50 px-4 py-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Bir mesaj yazın..."
                  className="flex-1 rounded-full bg-cream-200 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 outline-none ring-1 ring-transparent transition focus:ring-gold-400/50"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || typing}
                  aria-label="Gönder"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-cream-50 transition disabled:opacity-30"
                >
                  <Icon name="SendHorizonal" className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
