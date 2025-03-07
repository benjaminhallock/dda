import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { getEmailStatus, resendValidationEmail, updateUserSettings } from "@/api/settings";

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailStatus, setEmailStatus] = useState<{ email: string; isValidated: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmailStatus();
  }, []);

  const loadEmailStatus = async () => {
    try {
      const status = await getEmailStatus();
      setEmailStatus(status);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load email status",
      });
    }
  };

  const handleResendValidation = async () => {
    try {
      setLoading(true);
      const response = await resendValidationEmail();
      toast({
        title: "Success",
        description: response.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend validation email",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserSettings({
        field: 'notifications',
        value: {
          email: emailNotifications,
          push: pushNotifications
        }
      });
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your tasks
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications about task updates
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="flex items-center gap-4">
              <Input
                type="email"
                value={emailStatus?.email || ''}
                disabled
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                {emailStatus?.isValidated ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Validated</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-yellow-500 font-medium">Pending Validation</span>
                  </>
                )}
              </div>
            </div>
            {!emailStatus?.isValidated && (
              <Button
                variant="outline"
                onClick={handleResendValidation}
                disabled={loading}
                className="mt-2"
              >
                {loading ? "Sending..." : "Resend Validation Email"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" placeholder="Confirm new password" />
          </div>
          <Button onClick={handleSave}>Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}