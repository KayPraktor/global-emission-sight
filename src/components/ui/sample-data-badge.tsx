import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SampleDataBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="warning" className="gap-1 cursor-help">
            <Info className="h-3 w-3" />
            Sample Data
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This data is for demonstration purposes only</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
