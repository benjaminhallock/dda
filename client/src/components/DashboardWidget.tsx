import { useState, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Grip, Maximize2, Minimize2, X } from "lucide-react";

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onRemove?: (id: string) => void;
  isDraggable?: boolean;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
}

export function DashboardWidget({
  id,
  title,
  children,
  className,
  onRemove,
  isDraggable = true,
  onPositionChange,
}: DashboardWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      drag={isDraggable}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragEnd={(event, info) => {
        if (onPositionChange) {
          onPositionChange(id, { x: info.point.x, y: info.point.y });
        }
      }}
      className={cn(
        "relative z-10",
        isExpanded ? "fixed inset-4 z-50" : "",
        className
      )}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={cn("h-full overflow-hidden", isExpanded ? "rounded-lg shadow-2xl" : "")}>
        <CardHeader className="p-3 cursor-grab active:cursor-grabbing border-b bg-muted/40 flex-row justify-between items-center">
          <div
            onPointerDown={(e) => {
              if (isDraggable) {
                dragControls.start(e);
              }
            }}
            className="flex items-center gap-2"
          >
            {isDraggable && <Grip className="h-4 w-4 text-muted-foreground" />}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:text-red-500"
                onClick={() => onRemove(id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(
          "p-3",
          isExpanded ? "max-h-[calc(100vh-8rem)] overflow-y-auto" : ""
        )}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
