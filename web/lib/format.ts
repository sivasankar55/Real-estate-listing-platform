export function formatAmount(value: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatPrice(value: string, listingType: "SALE" | "RENT") {
  const formatted = formatAmount(value);
  return listingType === "RENT" ? `${formatted}/month` : formatted;
}
