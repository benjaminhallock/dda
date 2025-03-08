import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getTasks } from "@/api/tasks";
import { getEarningsStats } from "@/api/earnings";
import { getLocalStatistics, getOnboardingProgress } from "@/api/statistics";
import { format } from 'date-fns';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Circle, PlusCircle } from "lucide-react";
import { DashboardWidget } from "@/components/DashboardWidget";
import { useToast } from "@/hooks/useToast";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

// Define widget types
type WidgetType = "earnings" | "tasks" | "onboarding" | "localStats" | "help";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position?: { x: number; y: number };
}

export function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [localStats, setLocalStats] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // State for widgets
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "earnings-1", type: "earnings", title: "Earnings Overview" },
    { id: "tasks-1", type: "tasks", title: "Recent Tasks" },
    { id: "onboarding-1", type: "onboarding", title: "Onboarding Progress" },
  ]);

  const [availableWidgets, setAvailableWidgets] = useState<{
    type: WidgetType;
    title: string;
  }[]>([
    { type: "earnings", title: "Earnings Overview" },
    { type: "tasks", title: "Recent Tasks" },
    { type: "onboarding", title: "Onboarding Progress" },
    { type: "localStats", title: "Local Statistics" },
    { type: "help", title: "Help & Resources" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, statsData, localStatsData, onboardingData] = await Promise.all([
          getTasks(),
          getEarningsStats(),
          getLocalStatistics(),
          getOnboardingProgress()
        ]);
        setTasks(tasksData.tasks);
        setStats(statsData);
        setLocalStats(localStatsData);
        setOnboarding(onboardingData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWidgetRemove = (id: string) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
    toast({
      title: "Widget removed",
      description: "You can add it back from the widget library",
    });
  };

  const handleWidgetAdd = (type: WidgetType, title: string) => {
    const newId = `${type}-${Date.now()}`;
    setWidgets((current) => [
      ...current,
      { id: newId, type, title }
    ]);
    toast({
      title: "Widget added",
      description: `Added ${title} to your dashboard`,
    });
  };

  const handlePositionChange = (id: string, position: { x: number; y: number }) => {
    setWidgets(current => 
      current.map(widget => 
        widget.id === id ? { ...widget, position } : widget
      )
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="space-y-4 text-center">
          <motion.div
            className="h-12 w-12 rounded-full border-4 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case "earnings":
        return stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-10 w-10 text-green-500 bg-green-50 p-2 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-10 w-10 text-blue-500 bg-blue-50 p-2 rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${stats.monthlyEarnings}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null;

      case "tasks":
        return tasks.length > 0 ? (
          <div className="space-y-4">
            <ul className="space-y-2">
              {tasks.slice(0, 4).map((task: any) => (
                <li 
                  key={task._id} 
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : task.status === 'overdue' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(task.dueDate), 'MMM d')}</span>
                </li>
              ))}
            </ul>
            {tasks.length > 4 && (
              <Button className="w-full" variant="outline" size="sm">
                View All Tasks
              </Button>
            )}
          </div>
        ) : <p className="text-muted-foreground">No tasks found</p>;

      case "onboarding":
        return onboarding ? (
          <div className="space-y-4">
            <Progress value={(onboarding.completed / onboarding.total) * 100} />
            <div className="grid gap-2">
              {onboarding.tasks.slice(0, 3).map((task: any) => (
                <div key={task._id} className="flex items-center gap-2">
                  {task.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "localStats":
        return localStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{localStats.activeUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{localStats.completedTasks}</p>
              </div>
            </div>
          </div>
        ) : null;

      case "help":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-3">
              <h3 className="font-medium mb-1">Getting Started</h3>
              <p className="text-sm text-muted-foreground">Complete your profile and explore the marketplace to get started.</p>
            </div>
            <div className="rounded-lg border p-3">
              <h3 className="font-medium mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground">Contact support or visit our help center for assistance.</p>
            </div>
            <Button variant="outline" className="w-full">Visit Help Center</Button>
          </div>
        );

      default:
        return <p>Unknown widget type</p>;
    }
  };

  return (
    <div className="space-y-6" ref={dashboardRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your activity.
          </p>
        </div>
        <div className="relative group">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Widget
          </Button>
          <div className="absolute right-0 mt-2 w-56 p-2 bg-card rounded-md shadow-lg border hidden group-hover:block z-20">
            <p className="text-xs text-muted-foreground mb-2">Available Widgets</p>
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent"
                onClick={() => handleWidgetAdd(widget.type, widget.title)}
              >
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {widgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              onRemove={handleWidgetRemove}
              onPositionChange={handlePositionChange}
              className="min-h-[180px] md:min-h-[220px]"
            >
              {renderWidgetContent(widget)}
            </DashboardWidget>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}