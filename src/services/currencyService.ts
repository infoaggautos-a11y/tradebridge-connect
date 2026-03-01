export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: string;
}

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    NGN: 1500,
    CAD: 1.36,
    AUD: 1.53,
    JPY: 149.5,
    CNY: 7.24,
  },
  EUR: {
    USD: 1.09,
    GBP: 0.86,
    NGN: 1635,
    CAD: 1.48,
    AUD: 1.66,
    JPY: 162.7,
    CNY: 7.88,
  },
  GBP: {
    USD: 1.27,
    EUR: 1.16,
    NGN: 1900,
    CAD: 1.72,
    AUD: 1.93,
    JPY: 189.2,
    CNY: 9.16,
  },
  NGN: {
    USD: 0.00067,
    EUR: 0.00061,
    GBP: 0.00053,
    CAD: 0.00091,
    AUD: 0.00102,
    JPY: 0.0997,
    CNY: 0.0048,
  },
};

class CurrencyService {
  private provider: 'wise' | 'flutterwave' | 'custom' | null = null;
  private ratesCache: Map<string, { rates: Record<string, number>; timestamp: number }> = new Map();
  private cacheDuration = 60 * 60 * 1000;

  initialize(provider: 'wise' | 'flutterwave' | 'custom'): void {
    this.provider = provider;
  }

  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    if (from === to) {
      return { from, to, rate: 1, timestamp: new Date().toISOString() };
    }

    const cacheKey = `${from}_${to}`;
    const cached = this.ratesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return { from, to, rate: cached.rates[to], timestamp: new Date(cached.timestamp).toISOString() };
    }

    const rate = !this.provider ? this.getMockRate(from, to) : await this.fetchLiveRate(from, to);
    const timestamp = new Date().toISOString();
    
    this.ratesCache.set(cacheKey, { rates: { [to]: rate }, timestamp: Date.now() });

    return { from, to, rate, timestamp };
  }

  private getMockRate(from: string, to: string): number {
    if (EXCHANGE_RATES[from]?.[to]) return EXCHANGE_RATES[from][to];
    
    if (EXCHANGE_RATES[from]) {
      for (const intermediate of Object.keys(EXCHANGE_RATES[from])) {
        if (EXCHANGE_RATES[intermediate]?.[to]) {
          return EXCHANGE_RATES[from][intermediate] * EXCHANGE_RATES[intermediate][to];
        }
      }
    }
    return 1;
  }

  private async fetchLiveRate(from: string, to: string): Promise<number> {
    try {
      const response = await fetch(`/api/fx/rate?from=${from}&to=${to}`);
      const data = await response.json();
      return data.rate;
    } catch {
      return this.getMockRate(from, to);
    }
  }

  async convert(amount: number, from: string, to: string): Promise<CurrencyConversion> {
    const rateInfo = await this.getExchangeRate(from, to);
    return {
      from, to, amount,
      convertedAmount: amount * rateInfo.rate,
      rate: rateInfo.rate,
      timestamp: rateInfo.timestamp,
    };
  }

  async convertWithFee(
    amount: number,
    from: string,
    to: string,
    feePercent: number = 0.5
  ): Promise<{
    originalAmount: number;
    fee: number;
    amountAfterFee: number;
    exchangeRate: number;
    convertedAmount: number;
    currency: string;
  }> {
    const fee = amount * (feePercent / 100);
    const amountAfterFee = amount - fee;
    const conversion = await this.convert(amountAfterFee, from, to);

    return {
      originalAmount: amount,
      fee,
      amountAfterFee,
      exchangeRate: conversion.rate,
      convertedAmount: conversion.convertedAmount,
      currency: to,
    };
  }

  async getAllRatesForCurrency(currency: string): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};
    const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD', 'JPY', 'CNY'];
    
    for (const targetCurrency of currencies) {
      if (targetCurrency !== currency) {
        const rateInfo = await this.getExchangeRate(currency, targetCurrency);
        rates[targetCurrency] = rateInfo.rate;
      }
    }
    return rates;
  }

  async getHistoricalRate(from: string, to: string, date: string): Promise<ExchangeRate> {
    try {
      const response = await fetch(`/api/fx/historical?from=${from}&to=${to}&date=${date}`);
      const data = await response.json();
      return { from, to, rate: data.rate, timestamp: date };
    } catch {
      const mockRate = this.getMockRate(from, to);
      return { from, to, rate: mockRate || 1, timestamp: date };
    }
  }

  async getRateTrend(from: string, to: string, days: number = 7): Promise<{ date: string; rate: number }[]> {
    const trend: { date: string; rate: number }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const rateInfo = await this.getHistoricalRate(from, to, dateStr);
      trend.push({ date: dateStr, rate: rateInfo.rate });
    }
    return trend;
  }

  formatCurrency(amount: number, currency: string, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  }

  getSupportedCurrencies(): { code: string; name: string; symbol: string; flag?: string }[] {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
      { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    ];
  }

  isSupportedCurrency(code: string): boolean {
    return this.getSupportedCurrencies().some(c => c.code === code);
  }

  getCurrencyForRegion(region: string): string {
    const regionToCurrency: Record<string, string> = {
      'ng': 'NGN', 'nigeria': 'NGN', 'us': 'USD', 'usa': 'USD',
      'uk': 'GBP', 'eu': 'EUR', 'europe': 'EUR', 'de': 'EUR',
      'fr': 'EUR', 'it': 'EUR', 'ca': 'CAD', 'australia': 'AUD',
      'jp': 'JPY', 'china': 'CNY',
    };
    return regionToCurrency[region.toLowerCase()] || 'USD';
  }
}

export const currencyService = new CurrencyService();
