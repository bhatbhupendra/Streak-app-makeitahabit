import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import CalendarView from "../../components/CalendarView";

import {
    getLogs,
    getTasks,
    removeTaskLogByDate,
    Task,
    TaskLog,
    upsertTaskLogByDate,
} from "../../src/storage/taskStorage";

import {
    calculateCurrentStreak,
    calculateLongestStreak,
} from "../../src/utils/streakUtils";

export default function TaskDetail() {
    const { id } = useLocalSearchParams();

    const [task, setTask] = useState<Task | null>(null);
    const [logs, setLogs] = useState<TaskLog[]>([]);

    const [selectedDate, setSelectedDate] = useState("");
    const [valueInput, setValueInput] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const allTasks = await getTasks();
        const allLogs = await getLogs();

        const foundTask = allTasks.find((t) => t.id === id);

        setTask(foundTask || null);
        setLogs(allLogs);
    };

    const openDateModal = (date: string) => {
        if (!task) return;

        const existingLog = logs.find(
            (log) => log.taskId === task.id && log.date === date
        );

        setSelectedDate(date);
        setValueInput(existingLog?.value?.toString() || "");
        setModalVisible(true);
    };

    const saveDateValue = async () => {
        if (!task || !selectedDate) return;

        const value = Number(valueInput || 0);

        if (isNaN(value) || value < 0) {
            Alert.alert("Invalid Value", "Please enter a valid number.");
            return;
        }

        await upsertTaskLogByDate(task.id, selectedDate, value);

        setModalVisible(false);
        setSelectedDate("");
        setValueInput("");

        await loadData();
    };

    const removeDateCompletion = async () => {
        if (!task || !selectedDate) return;

        Alert.alert("Remove Completion", "Remove completion for this date?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    await removeTaskLogByDate(task.id, selectedDate);

                    setModalVisible(false);
                    setSelectedDate("");
                    setValueInput("");

                    await loadData();
                },
            },
        ]);
    };

    if (!task) {
        return (
            <View style={styles.container}>
                <Text>Loading task...</Text>
            </View>
        );
    }

    const currentStreak = calculateCurrentStreak(logs, task.id);
    const longestStreak = calculateLongestStreak(logs, task.id);

    const selectedLog = logs.find(
        (log) => log.taskId === task.id && log.date === selectedDate
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{task.name}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{currentStreak}</Text>
                    <Text style={styles.statLabel}>Current 🔥</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{longestStreak}</Text>
                    <Text style={styles.statLabel}>Longest 🏆</Text>
                </View>
            </View>

            <CalendarView
                taskId={task.id}
                logs={logs}
                valueLabel={task.valueLabel}
                onSelectDate={openDateModal}
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            {selectedLog ? "Edit Completion" : "Add Completion"}
                        </Text>

                        <Text style={styles.modalSubtitle}>{selectedDate}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={`Enter value ${task.valueLabel || ""}`}
                            keyboardType="numeric"
                            value={valueInput}
                            onChangeText={setValueInput}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={saveDateValue}>
                            <Text style={styles.saveText}>
                                {selectedLog ? "Update Value" : "Save Completion"}
                            </Text>
                        </TouchableOpacity>

                        {selectedLog && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={removeDateCompletion}
                            >
                                <Text style={styles.removeText}>Remove Completion</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8fafc",
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: 18,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        alignItems: "center",
    },
    statNumber: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0f172a",
    },
    statLabel: {
        marginTop: 4,
        color: "#64748b",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
    },
    modalBox: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0f172a",
    },
    modalSubtitle: {
        marginTop: 6,
        marginBottom: 16,
        color: "#64748b",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
    },
    saveButton: {
        backgroundColor: "#22c55e",
        padding: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    saveText: {
        color: "#fff",
        fontWeight: "800",
    },
    removeButton: {
        marginTop: 10,
        backgroundColor: "#fee2e2",
        padding: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    removeText: {
        color: "#dc2626",
        fontWeight: "800",
    },
    cancelButton: {
        marginTop: 12,
        alignItems: "center",
    },
    cancelText: {
        color: "#64748b",
        fontWeight: "700",
    },
});