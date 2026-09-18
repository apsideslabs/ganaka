import {
  PlatformSettings,
  WorkspaceSettings,
  PanchangaSettings,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_WORKSPACE_SETTINGS,
  DEFAULT_PANCHANGA_SETTINGS,
} from './types';

const STORAGE_KEYS = {
  PLATFORM: 'ganaka_platform_settings_v1',
  WORKSPACE: 'ganaka_workspace_settings_v1',
  PANCHANGA: 'ganaka_panchanga_settings_v1',
};

const SETTINGS_EVENT_NAME = 'ganaka_settings_updated';

// Helper to safely dispatch change event
export function notifySettingsUpdated(scope: 'platform' | 'workspace' | 'panchanga') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SETTINGS_EVENT_NAME, {
        detail: { scope, timestamp: Date.now() },
      })
    );
  }
}

// Subscribe helper
export function subscribeToSettings(callback: (scope: 'platform' | 'workspace' | 'panchanga') => void) {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ scope: 'platform' | 'workspace' | 'panchanga' }>;
    callback(customEvent.detail?.scope || 'platform');
  };

  window.addEventListener(SETTINGS_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(SETTINGS_EVENT_NAME, handler);
  };
}

// Platform Settings
export function getPlatformSettings(): PlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM);
    if (!stored) return DEFAULT_PLATFORM_SETTINGS;
    const parsed = JSON.parse(stored);
    
    let defaultLocation = parsed.defaultLocation;
    if (!defaultLocation || typeof defaultLocation.latitude !== 'number') {
      defaultLocation = DEFAULT_PLATFORM_SETTINGS.defaultLocation;
    }

    const language = parsed.language || 'english';

    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...parsed,
      defaultLocation,
      language,
    };
  } catch (err) {
    console.warn('Failed to parse platform settings from localStorage', err);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export function savePlatformSettings(settings: Partial<PlatformSettings>): PlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_SETTINGS;
  try {
    const current = getPlatformSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.PLATFORM, JSON.stringify(updated));

    // Keep workspace, panchanga, and chart params ayanamsha in lockstep if defaultAyanamsha changed
    if (settings.defaultAyanamsha) {
      try {
        const wsRaw = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
        const wsParsed = wsRaw ? JSON.parse(wsRaw) : {};
        wsParsed.ayanamsha = settings.defaultAyanamsha;
        localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(wsParsed));

        const panRaw = localStorage.getItem(STORAGE_KEYS.PANCHANGA);
        const panParsed = panRaw ? JSON.parse(panRaw) : {};
        panParsed.ayanamsha = settings.defaultAyanamsha;
        localStorage.setItem(STORAGE_KEYS.PANCHANGA, JSON.stringify(panParsed));

        const chartRaw = localStorage.getItem('ganaka_chart_params');
        const chartParsed = chartRaw ? JSON.parse(chartRaw) : {};
        chartParsed.ayanamsha = settings.defaultAyanamsha;
        localStorage.setItem('ganaka_chart_params', JSON.stringify(chartParsed));
      } catch {}
      notifySettingsUpdated('workspace');
      notifySettingsUpdated('panchanga');
    }

    // Keep chart params location in sync if defaultLocation changed
    if (settings.defaultLocation && typeof settings.defaultLocation.latitude === 'number') {
      try {
        const chartRaw = localStorage.getItem('ganaka_chart_params');
        const chartParsed = chartRaw ? JSON.parse(chartRaw) : {};
        chartParsed.cityName = settings.defaultLocation.name;
        chartParsed.latitude = settings.defaultLocation.latitude;
        chartParsed.longitude = settings.defaultLocation.longitude;
        chartParsed.timezone = settings.defaultLocation.timezoneOffsetHours;
        localStorage.setItem('ganaka_chart_params', JSON.stringify(chartParsed));
      } catch {}
      notifySettingsUpdated('workspace');
      notifySettingsUpdated('panchanga');
    }

    notifySettingsUpdated('platform');
    return updated;
  } catch (err) {
    console.error('Failed to save platform settings to localStorage', err);
    return getPlatformSettings();
  }
}

export function resetPlatformSettings(): PlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_SETTINGS;
  try {
    localStorage.removeItem(STORAGE_KEYS.PLATFORM);
    notifySettingsUpdated('platform');
    notifySettingsUpdated('workspace');
    notifySettingsUpdated('panchanga');
    return DEFAULT_PLATFORM_SETTINGS;
  } catch (err) {
    console.error('Failed to reset platform settings', err);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

// Workspace Settings
export function getWorkspaceSettings(): WorkspaceSettings {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
    const platAyan = getPlatformSettings().defaultAyanamsha;
    if (!stored) {
      return { ...DEFAULT_WORKSPACE_SETTINGS, ayanamsha: platAyan || DEFAULT_WORKSPACE_SETTINGS.ayanamsha };
    }
    const parsed = JSON.parse(stored);
    const ayanamsha = parsed.ayanamsha || platAyan || DEFAULT_WORKSPACE_SETTINGS.ayanamsha;
    return { ...DEFAULT_WORKSPACE_SETTINGS, ...parsed, ayanamsha };
  } catch (err) {
    console.warn('Failed to parse workspace settings from localStorage', err);
    return DEFAULT_WORKSPACE_SETTINGS;
  }
}

export function saveWorkspaceSettings(settings: Partial<WorkspaceSettings>): WorkspaceSettings {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_SETTINGS;
  try {
    const current = getWorkspaceSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(updated));

    // Keep platform defaultAyanamsha, panchanga, and chart params in lockstep
    if (settings.ayanamsha) {
      try {
        const platRaw = localStorage.getItem(STORAGE_KEYS.PLATFORM);
        const platParsed = platRaw ? JSON.parse(platRaw) : {};
        platParsed.defaultAyanamsha = settings.ayanamsha;
        localStorage.setItem(STORAGE_KEYS.PLATFORM, JSON.stringify(platParsed));

        const panRaw = localStorage.getItem(STORAGE_KEYS.PANCHANGA);
        const panParsed = panRaw ? JSON.parse(panRaw) : {};
        panParsed.ayanamsha = settings.ayanamsha;
        localStorage.setItem(STORAGE_KEYS.PANCHANGA, JSON.stringify(panParsed));

        const chartRaw = localStorage.getItem('ganaka_chart_params');
        const chartParsed = chartRaw ? JSON.parse(chartRaw) : {};
        chartParsed.ayanamsha = settings.ayanamsha;
        localStorage.setItem('ganaka_chart_params', JSON.stringify(chartParsed));
      } catch {}
      notifySettingsUpdated('platform');
      notifySettingsUpdated('panchanga');
    }

    notifySettingsUpdated('workspace');
    return updated;
  } catch (err) {
    console.error('Failed to save workspace settings to localStorage', err);
    return getWorkspaceSettings();
  }
}

export function resetWorkspaceSettings(): WorkspaceSettings {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_SETTINGS;
  try {
    localStorage.removeItem(STORAGE_KEYS.WORKSPACE);
    notifySettingsUpdated('workspace');
    return DEFAULT_WORKSPACE_SETTINGS;
  } catch (err) {
    console.error('Failed to reset workspace settings', err);
    return DEFAULT_WORKSPACE_SETTINGS;
  }
}

// Panchanga Settings
export function getPanchangaSettings(): PanchangaSettings {
  if (typeof window === 'undefined') return DEFAULT_PANCHANGA_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PANCHANGA);
    const platAyan = getPlatformSettings().defaultAyanamsha;
    if (!stored) return { ...DEFAULT_PANCHANGA_SETTINGS, ayanamsha: platAyan || DEFAULT_PANCHANGA_SETTINGS.ayanamsha };
    const parsed = JSON.parse(stored);
    const ayanamsha = parsed.ayanamsha || platAyan || DEFAULT_PANCHANGA_SETTINGS.ayanamsha;
    return { ...DEFAULT_PANCHANGA_SETTINGS, ...parsed, ayanamsha };
  } catch (err) {
    console.warn('Failed to parse panchanga settings from localStorage', err);
    return DEFAULT_PANCHANGA_SETTINGS;
  }
}

export function savePanchangaSettings(settings: Partial<PanchangaSettings>): PanchangaSettings {
  if (typeof window === 'undefined') return DEFAULT_PANCHANGA_SETTINGS;
  try {
    const current = getPanchangaSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.PANCHANGA, JSON.stringify(updated));

    // Keep platform and workspace ayanamsha in lockstep if changed
    if (settings.ayanamsha) {
      try {
        const platRaw = localStorage.getItem(STORAGE_KEYS.PLATFORM);
        const platParsed = platRaw ? JSON.parse(platRaw) : {};
        platParsed.defaultAyanamsha = settings.ayanamsha;
        localStorage.setItem(STORAGE_KEYS.PLATFORM, JSON.stringify(platParsed));

        const wsRaw = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
        const wsParsed = wsRaw ? JSON.parse(wsRaw) : {};
        wsParsed.ayanamsha = settings.ayanamsha;
        localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(wsParsed));

        const chartRaw = localStorage.getItem('ganaka_chart_params');
        const chartParsed = chartRaw ? JSON.parse(chartRaw) : {};
        chartParsed.ayanamsha = settings.ayanamsha;
        localStorage.setItem('ganaka_chart_params', JSON.stringify(chartParsed));
      } catch {}
      notifySettingsUpdated('platform');
      notifySettingsUpdated('workspace');
    }

    notifySettingsUpdated('panchanga');
    return updated;
  } catch (err) {
    console.error('Failed to save panchanga settings to localStorage', err);
    return getPanchangaSettings();
  }
}

export function resetPanchangaSettings(): PanchangaSettings {
  if (typeof window === 'undefined') return DEFAULT_PANCHANGA_SETTINGS;
  try {
    localStorage.removeItem(STORAGE_KEYS.PANCHANGA);
    notifySettingsUpdated('panchanga');
    return DEFAULT_PANCHANGA_SETTINGS;
  } catch (err) {
    console.error('Failed to reset panchanga settings', err);
    return DEFAULT_PANCHANGA_SETTINGS;
  }
}
