import { useState, useEffect } from "react";
import type { Alert } from "@war/shared";

interface GeoEvent {
  date: string;
  category: string;
  icon: string;
  title: Record<string, string>;
  detail: Record<string, string>;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/alerts.json").then(r => r.json()),
      fetch("/data/events.json").then(r => r.json()),
    ]).then(([a, e]) => {
      setAlerts(a);
      setEvents(e);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { alerts, events, loading };
}
