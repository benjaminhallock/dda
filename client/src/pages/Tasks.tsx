import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTasks, completeTask } from "@/api/tasks";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.tasks);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tasks",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast({
        title: "Success",
        description: "Task completed successfully",
      });
      loadTasks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete task",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
      </div>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              {getStatusIcon(task.status)}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Due Date: {format(new Date(task.dueDate), 'PP')}
                  </p>
                  <p className="text-sm font-medium">
                    Earnings: ${task.earnings}
                  </p>
                </div>
                {task.status !== 'completed' && (
                  <Button
                    onClick={() => handleCompleteTask(task._id)}
                    className="ml-auto"
                  >
                    Complete Task
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}