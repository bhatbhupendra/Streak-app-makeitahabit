import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TaskLog } from "../src/storage/taskStorage";

type Props = {
    taskId: string;
    logs: TaskLog[];
    valueLabel?: string;
    onSelectDate: (date: string) => void;
};

export default function CalendarView({
    taskId,
    logs,
    valueLabel,
    onSelectDate,
}: Props) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const totalDays = lastDay.getDate();
    const startDay = firstDay.getDay();

    // IMPORTANT: Local date formatter, do not use toISOString()
    const formatLocalDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");

        return `${y}-${m}-${d}`;
    };

    const todayString = formatLocalDate(today);

    const taskLogs = logs.filter(
        (log) => log.taskId === taskId && log.isCompleted
    );

    const formatDate = (day: number) => {
        return formatLocalDate(new Date(year, month, day));
    };

    const days: (number | null)[] = [];

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= totalDays; day++) days.push(day);

    return (
        <View style={styles.container}>
            <Text style={styles.monthTitle}>
                {today.toLocaleString("default", { month: "long" })} {year}
            </Text>

            <View style={styles.weekRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <Text key={day} style={styles.weekText}>
                        {day}
                    </Text>
                ))}
            </View>

            <View style={styles.grid}>
                {days.map((day, index) => {
                    if (day === null) {
                        return <View key={index} style={styles.dayBox} />;
                    }

                    const dateString = formatDate(day);
                    const log = taskLogs.find((item) => item.date === dateString);

                    const isCompleted = !!log;
                    const isToday = dateString === todayString;
                    const isFuture = dateString > todayString;
                    const isPastMissed = dateString < todayString && !isCompleted;

                    return (
                        <TouchableOpacity
                            key={index}
                            disabled={isFuture}
                            onPress={() => onSelectDate(dateString)}
                            style={[
                                styles.dayBox,
                                isCompleted && styles.completedDay,
                                isPastMissed && styles.missedDay,
                                isToday && styles.todayDay,
                                isFuture && styles.futureDay,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isCompleted && styles.completedText,
                                    isFuture && styles.futureText,
                                ]}
                            >
                                {day}
                            </Text>

                            {isCompleted && (
                                <Text style={styles.valueText}>
                                    {log?.value || 0}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.helpText}>
                Tap a date to add, edit, or remove completion.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    monthTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 15,
        color: "#0f172a",
    },
    weekRow: {
        flexDirection: "row",
        marginBottom: 10,
    },
    weekText: {
        flex: 1,
        textAlign: "center",
        fontWeight: "700",
        color: "#64748b",
        fontSize: 12,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayBox: {
        width: "14.28%",
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        borderRadius: 10,
    },
    dayText: {
        color: "#111827",
        fontWeight: "700",
    },
    valueText: {
        fontSize: 10,
        color: "#fff",
        marginTop: 2,
        fontWeight: "700",
    },
    completedDay: {
        backgroundColor: "#22c55e",
    },
    completedText: {
        color: "#fff",
    },
    missedDay: {
        backgroundColor: "#e5e7eb",
    },
    todayDay: {
        borderWidth: 2,
        borderColor: "#2563eb",
    },
    futureDay: {
        backgroundColor: "#f8fafc",
    },
    futureText: {
        color: "#cbd5e1",
    },
    helpText: {
        marginTop: 12,
        textAlign: "center",
        color: "#64748b",
        fontSize: 12,
    },
});