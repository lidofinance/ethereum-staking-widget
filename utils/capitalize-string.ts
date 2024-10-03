export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
};
