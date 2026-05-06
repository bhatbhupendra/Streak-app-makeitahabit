import { TaskLog } from "../storage/taskStorage";

const subtractDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
};

const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
};

export const calculateCurrentStreak = (logs: TaskLog[], taskId: string) => {
    const completedDates = logs
        .filter((log) => log.taskId === taskId && log.isCompleted)
        .map((log) => log.date);

    let streak = 0;
    let checkDate = new Date();

    while (completedDates.includes(formatDate(checkDate))) {
        streak++;
        checkDate = subtractDays(checkDate, 1);
    }

    return streak;
};

export const calculateLongestStreak = (logs: TaskLog[], taskId: string) => {
    const dates = logs
        .filter((log) => log.taskId === taskId && log.isCompleted)
        .map((log) => log.date)
        .sort();

    if (dates.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const currentDate = new Date(dates[i]);

        const diffTime = currentDate.getTime() - prev.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 1;
        }
    }

    return longest;
};

export const isCompletedToday = (logs: TaskLog[], taskId: string) => {
    const today = new Date().toISOString().split("T")[0];

    return logs.some(
        (log) => log.taskId === taskId && log.date === today && log.isCompleted
    );
};