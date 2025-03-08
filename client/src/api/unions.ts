import api from './api';

// Description: Get user's union information
// Endpoint: GET /api/unions/info
// Response: { unionId: string, name: string, role: 'member' | 'leader', memberCount: number, pendingVotes: number }
export const getUnionInfo = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        unionId: "1",
        name: "Digital Workers United",
        role: "member",
        memberCount: 1250,
        pendingVotes: 3
      });
    }, 500);
  });
};

// Description: Get union votes
// Endpoint: GET /api/unions/:id/votes
// Response: { votes: Array<{ _id: string, title: string, description: string, deadline: string, votesFor: number, votesAgainst: number, status: 'active' | 'completed' }> }
export const getUnionVotes = (unionId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        votes: [
          {
            _id: "1",
            title: "Minimum Rate Increase",
            description: "Proposal to increase minimum hourly rate to $25",
            deadline: "2024-04-01",
            votesFor: 850,
            votesAgainst: 150,
            status: "active"
          },
          {
            _id: "2",
            title: "Healthcare Benefits",
            description: "Implementation of basic healthcare coverage",
            deadline: "2024-03-25",
            votesFor: 1100,
            votesAgainst: 100,
            status: "completed"
          }
        ]
      });
    }, 500);
  });
};

// Description: Submit a vote
// Endpoint: POST /api/unions/votes/:id/submit
// Request: { vote: 'for' | 'against' }
// Response: { success: boolean, message: string }
export const submitVote = (voteId: string, vote: 'for' | 'against') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Vote submitted successfully"
      });
    }, 500);
  });
};