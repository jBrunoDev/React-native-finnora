import dayjs from "dayjs";

export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback: simple formatting if Intl fails
    const formattedValue = value.toFixed(2).replace('.', ',');
    return `${currency === 'BRL' ? 'R$' : currency} ${formattedValue}`;
  }
};


export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};