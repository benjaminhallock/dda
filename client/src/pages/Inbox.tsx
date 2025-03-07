import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInboxMessages, markMessageAsRead } from "@/api/inbox";
import { format } from "date-fns";
import { Mail, Circle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getInboxMessages();
      setMessages(data.messages);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
      loadMessages();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark message as read",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
      <div className="grid gap-4">
        {messages.map((message) => (
          <Card
            key={message._id}
            className={`transition-colors hover:bg-accent ${
              !message.read ? "border-l-4 border-l-primary" : ""
            }`}
            onClick={() => !message.read && handleMarkAsRead(message._id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2">
                {!message.read && <Circle className="h-2 w-2 fill-primary text-primary" />}
                {message.title}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {format(new Date(message.date), 'PP')}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{message.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}