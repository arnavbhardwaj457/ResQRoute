'use client';

import anime from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { env } from '../env';
import { useRouteStore } from '../store/useRouteStore';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

function getRuleResponse(input: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes('help')) {
    return 'I can help with emergency assistance, live tracking, nearest hospitals, and reroute support.';
  }

  if (normalized.includes('track')) {
    return 'Open the Tracking page to view the live ambulance marker, ETA countdown, and route progress.';
  }

  if (normalized.includes('nearest hospital')) {
    return 'Open Dashboard to see nearest hospital details and route metrics.';
  }

  return null;
}

export function ChatWidget() {
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { emergencyLocation, emergencyTriggeredAt } = useRouteStore();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Emergency assistant online. Ask for help, tracking, or nearest hospital guidance.',
    },
  ]);

  const emergencyContext = useMemo(() => {
    if (!emergencyLocation || !emergencyTriggeredAt) {
      return 'No active emergency context provided.';
    }

    return `Active emergency at ${emergencyLocation.lat.toFixed(6)}, ${emergencyLocation.lng.toFixed(6)} triggered at ${new Date(emergencyTriggeredAt).toLocaleTimeString()}.`;
  }, [emergencyLocation, emergencyTriggeredAt]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    anime.remove(panel);
    anime({
      targets: panel,
      opacity: isOpen ? [0, 1] : [1, 0],
      translateY: isOpen ? [18, 0] : [0, 18],
      scale: isOpen ? [0.96, 1] : [1, 0.96],
      duration: 260,
      easing: 'easeOutCubic',
      begin: () => {
        if (isOpen) {
          panel.style.pointerEvents = 'auto';
        }
      },
      complete: () => {
        if (!isOpen) {
          panel.style.pointerEvents = 'none';
        }
      },
    });
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const requestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const localRuleReply = getRuleResponse(content);
    if (localRuleReply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: localRuleReply }]);
      return;
    }

    setIsLoading(true);

    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    requestTimeoutRef.current = setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              history: messages.slice(-6),
              context: emergencyContext,
            }),
          });

          if (!response.ok) {
            throw new Error('Chat service unavailable');
          }

          const data = (await response.json()) as { reply?: string };
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: data.reply ?? 'I was unable to process that. Please try again.',
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Assistant is temporarily unavailable. Please try again shortly.',
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 300);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <div
        ref={panelRef}
        className="pointer-events-none w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-white/15 bg-slate-900/85 opacity-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Emergency Assistant</p>
          <p className="mt-1 text-sm text-slate-200">Rule-based + OpenAI support</p>
        </div>

        <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${
                message.role === 'assistant'
                  ? 'bg-blue-500/15 text-blue-100'
                  : 'ml-auto bg-red-500/20 text-red-100'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading ? (
            <div className="max-w-[88%] animate-pulse rounded-xl bg-blue-500/15 px-3 py-2 text-sm text-blue-100">
              Thinking...
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void sendMessage();
                }
              }}
              placeholder="Ask for help..."
              className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => {
                void sendMessage();
              }}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-red-500 px-3 py-2 text-sm font-semibold text-white"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-blue-500 to-red-500 text-xs font-semibold text-white shadow-xl"
      >
        {isOpen ? 'X' : 'Chat'}
      </button>
    </div>
  );
}
