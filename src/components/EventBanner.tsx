import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, X, ChevronRight, Sparkles } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  url: string;
}

const CALENDAR_URL = 'https://calendar.google.com/calendar/embed?src=c_02916cf18d360ab381023fabc7b420ec226d7579ae2a08ce0507e574cc1c1a96%40group.calendar.google.com&ctz=America%2FLos_Angeles';

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dateFormatted = d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
  const timeFormatted = d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'America/Los_Angeles'
  });

  if (diffDays <= 1) return `Today · ${timeFormatted} PT`;
  if (diffDays <= 2) return `Tomorrow · ${timeFormatted} PT`;
  return `${dateFormatted} · ${timeFormatted} PT`;
}

export function EventBanner() {
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('event-banner-dismissed')) {
      setDismissed(true);
      setLoaded(true);
      return;
    }

    fetch('/api/events')
      .then(r => r.json())
      .then(data => {
        if (data.events?.length > 0) setEvent(data.events[0]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Push the fixed nav down by the banner height
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('[data-nav="main"]');
    if (!nav) return;
    if (!dismissed && event && bannerRef.current) {
      const h = bannerRef.current.offsetHeight;
      nav.style.top = `${h}px`;
    } else {
      nav.style.top = '0px';
    }
    return () => { nav.style.top = '0px'; };
  }, [dismissed, event, loaded]);

  const handleDismiss = () => {
    sessionStorage.setItem('event-banner-dismissed', '1');
    setDismissed(true);
    const nav = document.querySelector<HTMLElement>('[data-nav="main"]');
    if (nav) nav.style.top = '0px';
  };

  if (!loaded || dismissed || !event) return null;

  return (
    <div ref={bannerRef} className="w-full bg-brand-dark text-white fixed top-0 left-0 right-0 z-[150]">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-primary hidden sm:block">
            Event
          </span>
        </div>

        {/* Event details */}
        <a
          href={event.url || CALENDAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0 hover:opacity-90 transition-opacity"
        >
          <span className="text-sm font-extrabold text-white truncate leading-tight">
            {event.title}
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs text-white/60 font-medium whitespace-nowrap">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {formatEventDate(event.start)}
            </span>
            {event.location && (
              <span className="hidden md:flex items-center gap-1 text-xs text-white/60 font-medium">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[220px]">{event.location.split(',')[0]}</span>
              </span>
            )}
          </div>
        </a>

        {/* CTA + close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={event.url || CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 bg-primary text-brand-dark text-xs font-black px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            RSVP
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
