import { Bell, Plus, Trash2 } from "lucide-react";
import type { ReminderNode } from "../types";
import {
  clampReminderSeconds,
  createReminderNode,
  minuteSecondToSeconds,
  secondsToMinuteSecond,
} from "../utils/time";

const QUICK_REMINDER_SECONDS = [5 * 60, 3 * 60, 60, 30] as const;

interface ReminderConfigProps {
  reminders: ReminderNode[];
  totalSeconds: number;
  disabled: boolean;
  asCard?: boolean;
  showTitle?: boolean;
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

function getDefaultNewReminderSeconds(totalSeconds: number): number {
  if (totalSeconds > 30) {
    return 30;
  }

  return Math.max(0, totalSeconds - 1);
}

export function ReminderConfig({
  reminders,
  totalSeconds,
  disabled,
  asCard = true,
  showTitle = true,
  onChange,
  onAdd,
  onRemove,
}: ReminderConfigProps) {
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

  function addReminderAt(seconds: number): void {
    onAdd(createReminderNode(seconds, formatReminderLabel(seconds)));
  }

  const canAddReminder = !disabled && totalSeconds > 1;

  const content = (
    <>
      {showTitle ? (
        <div className="settings-group-title">
          <Bell aria-hidden="true" size={18} />
          <h2>提醒</h2>
        </div>
      ) : null}

      <div className="reminder-toolbar" aria-label="常用提醒节点">
        <span className="reminder-toolbar-title">常用节点</span>
        <div className="reminder-quick-list">
          {QUICK_REMINDER_SECONDS.map((seconds) => (
            <button
              className="reminder-chip"
              type="button"
              key={seconds}
              disabled={!canAddReminder || seconds >= totalSeconds}
              data-testid={`quick-reminder-${seconds}`}
              onClick={() => addReminderAt(seconds)}
            >
              {formatReminderLabel(seconds)}
            </button>
          ))}
        </div>
      </div>

      <div className="reminder-list">
        {reminders.length === 0 ? <p className="empty-text">暂无提醒节点</p> : null}
        {reminders.map((reminder) => {
          const reminderTime = secondsToMinuteSecond(reminder.seconds);
          const isEnabled = reminder.enabled && reminder.seconds > 0;
          const isInvalid = reminder.enabled && reminder.seconds >= totalSeconds;
          const rowClassName = [
            "reminder-row",
            !isEnabled ? "reminder-row--off" : "",
            isInvalid ? "reminder-row--invalid" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div className={rowClassName} key={reminder.id}>
              <div className="reminder-row-header">
                <label className="reminder-enable">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    disabled={disabled || reminder.seconds === 0}
                    data-testid={`reminder-enabled-${reminder.id}`}
                    onChange={(event) =>
                      onChange(reminder.id, { ...reminder, enabled: event.target.checked && reminder.seconds > 0 })
                    }
                  />
                  <span className="reminder-row-heading">
                    <span className="reminder-row-title">{reminder.label || formatReminderLabel(reminder.seconds)}</span>
                  </span>
                </label>
                <button
                  className="icon-button icon-button--subtle reminder-remove-button"
                  type="button"
                  title="删除提醒"
                  disabled={disabled}
                  data-testid={`reminder-remove-${reminder.id}`}
                  onClick={() => onRemove(reminder.id)}
                >
                  <Trash2 aria-hidden="true" size={18} />
                </button>
              </div>

              <label className="reminder-label-field">
                <input
                  className="text-input reminder-name"
                  value={reminder.label}
                  disabled={disabled}
                  aria-label="提醒文案"
                  data-testid={`reminder-label-${reminder.id}`}
                  onChange={(event) => onChange(reminder.id, { ...reminder, label: event.target.value })}
                />
              </label>

              <div className="reminder-time-editor">
                <span className="reminder-time-prefix">剩余</span>
                <label className="reminder-time-field">
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
                  <span>分</span>
                </label>
                <label className="reminder-time-field">
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
                  <span>秒</span>
                </label>
              </div>
              <p className={isInvalid ? "reminder-hint reminder-hint--danger" : "reminder-hint"}>
                {isInvalid ? "提醒时间需小于总时长才会触发" : isEnabled ? "已启用" : "未启用"}
              </p>
            </div>
          );
        })}
      </div>

      <button
        className="secondary-action"
        type="button"
        disabled={!canAddReminder}
        data-testid="add-reminder"
        onClick={() => addReminderAt(getDefaultNewReminderSeconds(totalSeconds))}
      >
        <Plus aria-hidden="true" size={18} />
        <span>添加自定义提醒</span>
      </button>
    </>
  );

  if (!asCard) {
    return content;
  }

  return (
    <section className="settings-card">
      {content}
    </section>
  );
}
