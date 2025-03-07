import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getWellnessMetrics, getTherapists, bookTherapySession } from "@/api/wellness";
import { Activity, Brain, Calendar } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Wellness() {
  const [metrics, setMetrics] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsData, therapistsData] = await Promise.all([
        getWellnessMetrics(),
        getTherapists()
      ]);
      setMetrics(metricsData);
      setTherapists(therapistsData.therapists);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wellness data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (therapistId: string, date: string, slot: string) => {
    try {
      const result = await bookTherapySession({ therapistId, date, slot });
      toast({
        title: "Success",
        description: `Session booked with ${result.confirmationDetails.therapist} for ${format(
          new Date(`${result.confirmationDetails.date} ${result.confirmationDetails.time}`),
          'PPpp'
        )}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book session"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Wellness Center</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stress Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.stressScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.wellnessScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Session</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full">Schedule Session</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wellness Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.patterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="wellness"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.recommendations.map((rec) => (
              <div
                key={rec._id}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <h3 className="font-medium">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {rec.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Therapists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {therapists.map((therapist) => (
              <div
                key={therapist._id}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{therapist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {therapist.specialization}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium">Rating: {therapist.rating}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Book Session</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book a Session</DialogTitle>
                        <DialogDescription>
                          Choose an available time slot for your session with {therapist.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {therapist.availability.map((av) => (
                          <div key={av.date} className="space-y-2">
                            <h4 className="font-medium">{format(new Date(av.date), 'PP')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {av.slots.map((slot) => (
                                <Button
                                  key={slot}
                                  variant="outline"
                                  onClick={() => handleBookSession(therapist._id, av.date, slot)}
                                >
                                  {slot}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}