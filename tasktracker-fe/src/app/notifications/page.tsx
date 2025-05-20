import { Metadata } from "next";
import FamilyNotificationHub from "@/components/notifications/FamilyNotificationHub";

export const metadata: Metadata = {
  title: "Notifications | TaskTracker",
  description: "Family notification center for TaskTracker",
};

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <FamilyNotificationHub />
    </div>
  );
} 