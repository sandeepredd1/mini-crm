
export const formatCurrency = (
  value: number
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (
  date: string | Date
): string => {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export const isOverdue = (
  dueDate: string | Date,
  completed: boolean
): boolean => {
  if (completed) {
    return false;
  }

  return new Date(dueDate).getTime() < Date.now();
};

export const getInitials = (
  name: string
): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};