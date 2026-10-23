import { Injectable, signal, computed } from '@angular/core';
import { SupportedLang, TRANSLATIONS } from '../i18n/translations';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'cash_reconciliation_language';

  // Default language is 'es' (Spanish) as required
  private readonly langSignal = signal<SupportedLang>(this.getInitialLanguage());

  readonly currentLang = this.langSignal.asReadonly();
  readonly isSpanish = computed(() => this.langSignal() === 'es');
  readonly isEnglish = computed(() => this.langSignal() === 'en');

  private getInitialLanguage(): SupportedLang {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    return 'es'; // Spanish by default
  }

  setLanguage(lang: SupportedLang): void {
    this.langSignal.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  translate(key: string): string {
    const lang = this.langSignal();
    const dictionary = TRANSLATIONS[lang];
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    // Fallback to Spanish if missing in target
    if (TRANSLATIONS.es[key]) {
      return TRANSLATIONS.es[key];
    }
    return key;
  }
}
