import slugify from "slugify";
import { format } from "date-fns";

export function albumSlug(title: string, date: Date, spot: string): string {
  const base = slugify(`${format(date, "yyyy-MM-dd")}-${spot}-${title}`, {
    lower: true,
    strict: true,
  });
  return base.slice(0, 80) || `album-${Date.now()}`;
}
