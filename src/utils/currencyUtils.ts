
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  CRC: '₡',
  GBP: '£',
  CAD: 'C$',
  JPY: '¥',
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = currencySymbols[currency] || '$';
  
  // Format with proper thousand separators
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  });
  
  return `${symbol}${formattedAmount}`;
};

export const getCurrencySymbol = (currency: string): string => {
  return currencySymbols[currency] || '$';
};

export const parseCurrencyInput = (input: string): number => {
  // Remove currency symbols and parse as number
  const cleaned = input.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};
