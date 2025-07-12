export const formatMoney = (amount: number): string => {
  if (isNaN(amount)) {
    return "R$ 0,00";
  }

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
