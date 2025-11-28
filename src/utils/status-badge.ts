export type StatusType =
  | "draft"
  | "review"
  | "published"
  | "closed"
  | "archived"
  | string;

export const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-400 text-white dark:bg-slate-700",
  review: "bg-slate-500 text-white dark:bg-slate-800",
  published: "bg-green-700 text-white dark:bg-green-800",
  closed: "bg-red-600 text-white dark:bg-red-800",
  archived: "bg-gray-700 text-white dark:bg-gray-900",

  default: "bg-gray-700 text-white dark:bg-gray-900",
};

export const getStatusColor = (status: StatusType) => {
  const key = status?.toLowerCase()?.trim();
  return STATUS_STYLES[key] || STATUS_STYLES["default"];
};

export const getStatusLabel = (status: StatusType) => {
  switch (status.toLowerCase()) {
    case "draft": return "Draft";
    case "review": return "Review";
    case "published": return "Published";
    case "closed": return "Closed";
    case "archived": return "Archived";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};
