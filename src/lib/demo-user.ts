import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DEMO_EMAIL = 'user@yopmail.com';

export const isDemoEmail = (email?: string | null) =>
  !!email && email.toLowerCase() === DEMO_EMAIL;

export const useIsDemoUser = () => {
  const { user } = useAuth();
  return isDemoEmail(user?.email);
};

// Module-level cache so all hook consumers share a single fetch + value.
let cachedSettings: { demo_editable: boolean; is_creator: boolean } | null = null;
let inflight: Promise<{ demo_editable: boolean; is_creator: boolean } | null> | null = null;
const listeners = new Set<(s: { demo_editable: boolean; is_creator: boolean }) => void>();

const fetchSettings = async () => {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-settings', {
        method: 'GET',
      });
      if (error || !data) return null;
      const value = {
        demo_editable: !!data.demo_editable,
        is_creator: !!data.is_creator,
      };
      cachedSettings = value;
      listeners.forEach((l) => l(value));
      return value;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
};

export const refreshAdminSettings = () => {
  cachedSettings = null;
  return fetchSettings();
};

export const useAdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(cachedSettings);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      return;
    }
    const listener = (s: { demo_editable: boolean; is_creator: boolean }) =>
      setSettings(s);
    listeners.add(listener);
    if (!cachedSettings) {
      fetchSettings();
    } else {
      setSettings(cachedSettings);
    }
    return () => {
      listeners.delete(listener);
    };
  }, [user]);

  return settings;
};

export const useDemoReadOnly = () => {
  const isDemo = useIsDemoUser();
  const settings = useAdminSettings();
  if (!isDemo) return false;
  // While settings haven't loaded yet, default to read-only (safer)
  if (!settings) return true;
  return !settings.demo_editable;
};
