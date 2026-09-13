import { useLanguageStore } from '@/store/useLanguageStore';
import { translations, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.sq[key] || String(key);
  };

  return { t, language, setLanguage, toggleLanguage };
}
