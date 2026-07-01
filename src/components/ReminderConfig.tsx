import { Bell, Plus, Trash2 } from "lucide-react";
import type { ReminderNode } from "../types";
import {
  clampReminderSeconds,
  createReminderNode,
  minuteSecondToSeconds,
  secondsToMinuteSecond,
} from "../utils/time";

interface ReminderConfigProps {
  reminders: ReminderNode[];
  disabled: boolean;
  onChange: (id: string, nextReminder: ReminderNode) => void;
  onAdd: (reminder: ReminderNode) => void;
  onRemove: (id: string) => void;
}

export function ReminderConfig({ reminders, disabled, onChange, onAdd, onRemove }: ReminderConfigProps) {
  return (
    <section className="settings-group">
      <div className="settings-group-title">
        <Bell aria-hidden="true" size={18} />
        <h2>提醒节点</h2>
      </div>

      <div className="reminder-list">
        {reminders.length === 0 ? <p className="empty-text">暂无提醒节点</p> : null}
        {reminders.map((reminder) => {
          const reminderTime = secondsToMinuteSecond(reminder.seconds);

          return (
            <div className="reminder-row" key={reminder.id}>
              <div className="reminder-main">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    disabled={disabled}
                    data-testid={`reminder-enabled-${reminder.id}`}
                    onChange={(event) => onChange(reminder.id, { ...reminder, enabled: event.target.checked })}
                  />
                  <span>启用</span>
                </label>
                <input
                  className="text-input reminder-name"
                  value={reminder.label}
                  disabled={disabled}
                  aria-label="提醒名称"
                  data-testid={`reminder-label-${reminder.id}`}
                  onChange={(event) => onChange(reminder.id, { ...reminder, label: event.target.value })}
                />
                <button
                  className="icon-button icon-button--subtle"
                  type="button"
                  title="删除提醒"
                  disabled={disabled}
                  data-testid={`reminder-remove-${reminder.id}`}
                  onClick={() => onRemove(reminder.id)}
                >
                  <Trash2 aria-hidden="true" size={18} />
                </button>
              </div>
              <div className="reminder-time-fields">
                <label className="number-field reminder-number">
                  <span>分</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={reminderTime.minutes}
                    disabled={disabled}
                    data-testid={`reminder-minutes-${reminder.id}`}
                    onChange={(event) =>
                      onChange(reminder.id, {
                        ...reminder,
                        seconds: clampReminderSeconds(
                          minuteSecondToSeconds(Number(event.target.value), reminderTime.seconds)
                        ),
                      })
                    }
                  />
                </label>
                <label className="number-field reminder-number">
                  <span>秒</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={reminderTime.seconds}
                    disabled={disabled}
                    data-testid={`reminder-seconds-${reminder.id}`}
                    onChange={(event) =>
                      onChange(reminder.id, {
                        ...reminder,
                        seconds: minuteSecondToSeconds(reminderTime.minutes, Number(event.target.value)),
                      })
                    }
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="secondary-action"
        type="button"
        disabled={disabled}
        data-testid="add-reminder"
        onClick={() => onAdd(createReminderNode())}
      >
        <Plus aria-hidden="true" size={18} />
        <span>添加提醒</span>
      </button>
    </section>
  );
}
