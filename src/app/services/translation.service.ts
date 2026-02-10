import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type Translations = Record<string, any>;

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);

  currentLanguage = signal<string>('en');
  translations = signal<Translations>({});

  async init() {
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = browserLang === 'fr' ? 'fr' : 'en';
    await this.setLanguage(defaultLang);
  }

  async setLanguage(lang: string) {
    try {
      const data = await firstValueFrom(this.http.get<Translations>(`assets/i18n/${lang}.json`));
      this.translations.set(data);
      this.currentLanguage.set(lang);
      document.documentElement.lang = lang;
    } catch (error) {
      console.error(`Could not load translations for language ${lang}`, error);
      // Fallback to English if loading fails and we weren't already trying to load English
      if (lang !== 'en') {
        await this.setLanguage('en');
      }
    }
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations();

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    return value as string;
  }
}
