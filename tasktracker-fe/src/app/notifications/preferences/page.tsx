import { Metadata } from "next";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";

export const metadata: Metadata = {
  title: "Notification Preferences | TaskTracker",
  description: "Manage your notification settings",
};

export default function NotificationPreferencesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Notification Preferences</h1>
      <NotificationPreferences />
    </div>
  );
}
 