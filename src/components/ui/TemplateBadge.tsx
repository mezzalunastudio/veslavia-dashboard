"use client";
import { Badge } from "@/components/ui/badge";
import { getTemplateColor, getTemplateLabel, TemplateName } from "@/utils/template-badge";

export default function TemplateBadge({ name }: { name: TemplateName }) {
  return (
    <Badge
      variant="secondary"
      className={`px-2 py-0.5 text-xs font-medium rounded-md ${getTemplateColor(name)}`}
    >
      {getTemplateLabel(name)}
    </Badge>
  );
}