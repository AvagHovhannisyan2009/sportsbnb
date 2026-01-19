// Platform fee configuration
// The platform adds a 5% fee on top of the owner's listed price
// Example: Owner lists $40/hour → Customer pays $42 → Owner receives $40

export const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%

/**
 * Calculate the customer-facing price (owner's price + platform fee)
 * @param ownerPrice - The price the owner lists (what they will receive)
 * @returns The price the customer will pay
 */
export const getCustomerPrice = (ownerPrice: number): number => {
  return Math.ceil(ownerPrice * (1 + PLATFORM_FEE_PERCENTAGE));
};

/**
 * Calculate the platform fee amount from the owner's price
 * @param ownerPrice - The price the owner lists
 * @returns The platform fee amount
 */
export const getPlatformFee = (ownerPrice: number): number => {
  return getCustomerPrice(ownerPrice) - ownerPrice;
};

/**
 * Get the owner's price from the customer-facing price
 * @param customerPrice - The price the customer pays
 * @returns The amount the owner receives
 */
export const getOwnerPrice = (customerPrice: number): number => {
  return Math.floor(customerPrice / (1 + PLATFORM_FEE_PERCENTAGE));
};

/**
 * Format price for display with Armenian Dram symbol
 * @param price - The price to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return `֏${price.toLocaleString()}`;
};
