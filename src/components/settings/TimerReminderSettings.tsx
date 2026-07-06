import type { ReminderNode, TimerSettings as TimerSettingsType, TimerStatus } from "../../types";
import { ReminderConfig } from "../ReminderConfig";

interface TimerReminderSettingsProps {
  settings: TimerSettingsType;
  status: TimerStatus;
  onReminderChange: (id: string, reminder: ReminderNode) => void;
  onReminderAdd: (reminder: ReminderNode) => void;
  onReminderRemove: (id: string) => void;
}

export function TimerReminderSettings({
  settings,
  status,
  onReminderChange,
  onReminderAdd,
  onReminderRemove,
}: TimerReminderSettingsProps) {
  return (
    <ReminderConfig
      reminders={settings.reminders}
      totalSeconds={settings.totalSeconds}
      disabled={status === "running"}
      asCard={false}
      showTitle={false}
      onChange={onReminderChange}
      onAdd={onReminderAdd}
      onRemove={onReminderRemove}
    />
  );
}
