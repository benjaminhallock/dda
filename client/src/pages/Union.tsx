import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getUnionInfo, getUnionVotes, submitVote } from "@/api/unions";
import { Users, Vote, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Union() {
  const [unionInfo, setUnionInfo] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUnionData();
  }, []);

  const loadUnionData = async () => {
    try {
      const [info, votesData] = await Promise.all([
        getUnionInfo(),
        getUnionVotes()
      ]);
      setUnionInfo(info);
      setVotes(votesData.votes);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load union data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteId: string, vote: 'for' | 'against') => {
    try {
      await submitVote(voteId, vote);
      toast({
        title: "Success",
        description: "Vote submitted successfully"
      });
      loadUnionData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit vote"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Union Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Union Name</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unionInfo.name}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unionInfo.memberCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{unionInfo.role}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unionInfo.pendingVotes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Votes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {votes.map((vote) => (
            <div key={vote._id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{vote.title}</h3>
                  <p className="text-sm text-muted-foreground">{vote.description}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Deadline: {new Date(vote.deadline).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>For: {vote.votesFor}</span>
                  <span>Against: {vote.votesAgainst}</span>
                </div>
                <Progress 
                  value={(vote.votesFor / (vote.votesFor + vote.votesAgainst)) * 100} 
                />
              </div>

              {vote.status === 'active' && (
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleVote(vote._id, 'for')}
                    className="w-full"
                    variant="default"
                  >
                    Vote For
                  </Button>
                  <Button
                    onClick={() => handleVote(vote._id, 'against')}
                    className="w-full"
                    variant="outline"
                  >
                    Vote Against
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}