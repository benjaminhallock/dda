import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMarketplaceTasks, submitBid, getJobs } from "@/api/marketplace";
import { DollarSign, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Marketplace() {
  const [tasks, setTasks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
    loadJobs();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getMarketplaceTasks();
      setTasks(data.tasks);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load marketplace tasks"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data.jobs);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job listings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (taskId: string) => {
    try {
      await submitBid(taskId, {
        amount: 750,
        proposal: "I can complete this task efficiently...",
        timeframe: 7
      });
      toast({
        title: "Success",
        description: "Bid submitted successfully"
      });
      loadTasks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit bid"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Task Marketplace</h2>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{task.title}</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>${task.budget.min} - ${task.budget.max}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{task.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {task.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{task.bids} bids</span>
                </div>
              </div>

              <Button onClick={() => handleBid(task._id)} className="w-full">
                Submit Bid
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-3xl font-bold tracking-tight">Job Listings</h2>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{job.title}</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>${job.salary}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}