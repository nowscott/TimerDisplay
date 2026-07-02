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
  totalSeconds: number;
  disabled: boolean;
  onChange: (id: string, nextReminder: ReminderNode) => void;
  onAdd: (reminder: ReminderNode) => void;
  onRemove: (id: string) => void;
}

function formatReminderLabel(seconds: number): string {
  const normalizedSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(normalizedSeconds / 60);
  const remainingSeconds = normalizedSeconds % 60;

  if (normalizedSeconds === 0) {
    return "未启用";
  }

  if (minutes > 0 && remainingSeconds > 0) {
    return `剩余${minutes}分${remainingSeconds}秒`;
  }

  if (minutes > 0) {
    return `剩余${minutes}分钟`;
  }

  return `剩余${remainingSeconds}秒`;
}

function shouldSyncReminderLabel(label: string, previousSeconds: number): boolean {
  const normalizedLabel = label.trim();
  const previousLabel = formatReminderLabel(previousSeconds);

  return (
    normalizedLabel === "" ||
    normalizedLabel === previousLabel ||
    normalizedLabel === "未启用" ||
    /^剩余\d+(?:分钟|分|秒)?(?:\d+秒)?$/.test(normalizedLabel)
  );
}

export function ReminderConfig({ reminders, totalSeconds, disabled, onChange, onAdd, onRemove }: ReminderConfigProps) {
  function updateReminderTime(reminder: ReminderNode, nextSeconds: number): void {
    const normalizedSeconds = clampReminderSeconds(nextSeconds);
    const shouldSyncLabel = shouldSyncReminderLabel(reminder.label, reminder.seconds);

    onChange(reminder.id, {
      ...reminder,
      seconds: normalizedSeconds,
      enabled: normalizedSeconds > 0 && (reminder.enabled || reminder.seconds === 0),
      label: shouldSyncLabel ? formatReminderLabel(normalizedSeconds) : reminder.label,
    });
  }

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
          const isInvalid = reminder.enabled && reminder.seconds >= totalSeconds;

          return (
            <div className={isInvalid ? "reminder-row reminder-row--invalid" : "reminder-row"} key={reminder.id}>
              <div className="reminder-main">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={reminder.enabled && reminder.seconds > 0}
                    disabled={disabled || reminder.seconds === 0}
                    data-testid={`reminder-enabled-${reminder.id}`}
                    onChange={(event) =>
                      onChange(reminder.id, { ...reminder, enabled: event.target.checked && reminder.seconds > 0 })
                    }
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
                      updateReminderTime(
                        reminder,
                        minuteSecondToSeconds(Number(event.target.value), reminderTime.seconds)
                      )
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
                      updateReminderTime(
                        reminder,
                        minuteSecondToSeconds(reminderTime.minutes, Number(event.target.value))
                      )
                    }
                  />
                </label>
              </div>
              {isInvalid ? <p className="reminder-hint">提醒时间需小于总时长才会触发</p> : null}
            </div>
          );
        })}
      </div>

      <button
        className="secondary-action"
        type="button"
        disabled={disabled}
        data-testid="add-reminder"
        onClick={() => onAdd(createReminderNode(30, formatReminderLabel(30)))}
      >
        <Plus aria-hidden="true" size={18} />
        <span>添加提醒</span>
      </button>
    </section>
  );
}
