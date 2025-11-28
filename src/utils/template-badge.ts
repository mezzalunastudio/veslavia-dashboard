export type TemplateName = string;

export const TEMPLATE_STYLES: Record<string, string> = {
  valoria: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  valverra: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  veloura: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  veralice: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  verlisse: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  vernella: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  veylora: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  volette: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const getTemplateColor = (name: TemplateName) => {
  const key = name.toLowerCase().trim();

  if (TEMPLATE_STYLES[key]) return TEMPLATE_STYLES[key];

  // Auto-generate grayscale
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }

  const level = 80 + (hash % 30); // grayscale tone 80—110
  return `bg-gray-${level} text-gray-900 dark:bg-gray-${900 - level} dark:text-gray-200`;
};

export const getTemplateLabel = (name: TemplateName) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};