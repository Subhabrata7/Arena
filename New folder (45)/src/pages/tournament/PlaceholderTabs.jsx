import React from "react";
import EmptyState from "../../components/EmptyState";

export function BracketTab() {
  return <EmptyState title="Bracket not generated" subtitle="This will show knockout rounds visually (Module 4/5)." />;
}
export function AnnouncementsTab() {
  return <EmptyState title="No announcements" subtitle="Organizer posts matchday announcements (Module 5)." />;
}
export function SupportTab() {
  return <EmptyState title="Support inbox" subtitle="Private player ↔ admin chat (Module 5)." />;
}
export function AdminTab() {
  return <EmptyState title="Admin tools" subtitle="Participants approvals, fixtures generator, disputes, strikes (Module 4/5)." />;
}
