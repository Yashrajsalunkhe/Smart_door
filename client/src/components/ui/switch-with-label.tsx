import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SwitchWithLabelProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function SwitchWithLabel({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: SwitchWithLabelProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={id} className="text-md font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
