import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreSettings } from '@app/types';
import { StorePrintInfo } from '../printer/EscPosBuilder';

const STORE_SETTINGS_STORAGE_KEY = '@redcat_store_settings_v1';

export interface StoreProfileConfig extends StorePrintInfo {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  gstin?: string;
  googleReviewLink?: string;
  settings?: StoreSettings;
}

export const DEFAULT_STORE_CONFIG: StoreProfileConfig = {
  storeName: 'RC Electronics Hub',
  storeAddress: '123 Business Avenue, Tech Park',
  storePhone: '+1 (555) 812-3456',
  gstin: '29AAAAA0000A1Z5',
  googleReviewLink: '',
};

/**
 * Extracts and cleans the Google review link from store settings or store object.
 * Priority: store.settings.googleReviewLink -> store.googleReviewLink -> storeInfo.googleReviewLink.
 * Returns empty string if not configured or empty. Never returns undefined/null.
 */
export const extractGoogleReviewLink = (storeOrConfig?: any): string => {
  if (!storeOrConfig) return '';
  const rawLink =
    storeOrConfig?.settings?.googleReviewLink ??
    storeOrConfig?.googleReviewLink ??
    '';
  return typeof rawLink === 'string' ? rawLink.trim() : '';
};

export class StoreSettingsService {
  private static cachedConfig: StoreProfileConfig | null = null;

  /**
   * Loads persisted store settings from AsyncStorage.
   * Merges with DEFAULT_STORE_CONFIG.
   */
  static async getStoreConfig(): Promise<StoreProfileConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    try {
      const stored = await AsyncStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const resolved: StoreProfileConfig = {
          ...DEFAULT_STORE_CONFIG,
          ...parsed,
          settings: {
            ...DEFAULT_STORE_CONFIG.settings,
            ...parsed.settings,
            googleReviewLink: extractGoogleReviewLink(parsed),
          },
          googleReviewLink: extractGoogleReviewLink(parsed),
        };
        this.cachedConfig = resolved;
        return resolved;
      }
    } catch (error) {
      console.warn('Failed to load store config from storage:', error);
    }

    this.cachedConfig = { ...DEFAULT_STORE_CONFIG };
    return this.cachedConfig;
  }

  /**
   * Persists updated store configuration to AsyncStorage and refreshes cache.
   */
  static async saveStoreConfig(
    partial: Partial<StoreProfileConfig>
  ): Promise<StoreProfileConfig> {
    try {
      const current = await this.getStoreConfig();
      const updatedReviewLink =
        partial.settings?.googleReviewLink !== undefined
          ? partial.settings.googleReviewLink
          : partial.googleReviewLink !== undefined
          ? partial.googleReviewLink
          : current.googleReviewLink;

      const cleanReviewLink = typeof updatedReviewLink === 'string' ? updatedReviewLink.trim() : '';

      const updated: StoreProfileConfig = {
        ...current,
        ...partial,
        googleReviewLink: cleanReviewLink,
        settings: {
          ...current.settings,
          ...partial.settings,
          googleReviewLink: cleanReviewLink,
        },
      };

      await AsyncStorage.setItem(
        STORE_SETTINGS_STORAGE_KEY,
        JSON.stringify(updated)
      );
      this.cachedConfig = updated;
      return updated;
    } catch (error) {
      console.error('Failed to save store config to storage:', error);
      throw error;
    }
  }

  /**
   * Resets the cached store configuration in memory (useful for testing or logout).
   */
  static clearCache(): void {
    this.cachedConfig = null;
  }
}
