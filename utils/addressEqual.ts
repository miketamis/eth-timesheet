export const addressEqual = (a?: string, b?: string) => {
  return (a || "").toLowerCase() === (b || "").toLowerCase();
};
