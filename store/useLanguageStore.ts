import { create } from 'zustand';

export type Language = 'sq' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'sq',
  setLanguage: (language) => set({ language }),
  toggleLanguage: () => set({ language: get().language === 'sq' ? 'en' : 'sq' }),
}));
