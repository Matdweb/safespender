
export const getStoredTheme = (): 'light' | 'dark' | 'system' => {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  
  return 'system';
};

export const setStoredTheme = (theme: 'light' | 'dark' | 'system'): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
};

export const applyTheme = (theme: 'light' | 'dark' | 'system'): void => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(systemTheme);
  } else {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
};
