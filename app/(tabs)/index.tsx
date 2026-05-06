import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  completeTaskToday,
  deleteTask,
  getLogs,
  getTasks,
  Task,
  TaskLog,
} from "../../src/storage/taskStorage";

import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedToday,
} from "../../src/utils/streakUtils";

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const router = useRouter();

  const loadData = async () => {
    setTasks(await getTasks());
    setLogs(await getLogs());
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleComplete = async (task: Task) => {
    Alert.prompt(
      "Complete Task",
      `Enter value${task.valueLabel ? ` (${task.valueLabel})` : ""}`,
      async (text) => {
        const value = Number(text || 0);

        if (isNaN(value) || value < 0) {
          Alert.alert("Invalid Value", "Please enter a valid number.");
          return;
        }

        const result = await completeTaskToday(task.id, value);

        if (!result.success) {
          Alert.alert("Already Completed", result.message);
          return;
        }

        loadData();
      },
      "plain-text",
      "",
      "numeric"
    );
  };

  const handleDelete = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTask(taskId);
          loadData();
        },
      },
    ]);
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [valueInput, setValueInput] = useState("");

  const submitComplete = async () => {
    if (!selectedTask) return;

    const value = Number(valueInput || 0);

    if (isNaN(value) || value < 0) {
      Alert.alert("Invalid Value", "Please enter a valid number.");
      return;
    }

    const result = await completeTaskToday(selectedTask.id, value);

    if (!result.success) {
      Alert.alert("Already Completed", result.message);
      setSelectedTask(null);
      return;
    }

    setSelectedTask(null);
    setValueInput("");
    loadData();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.settingsText}>Backup / Restore</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>Streak App 🔥</Text>
        <Text style={styles.subtitle}>Build habits one day at a time</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-task")}
      >
        <Text style={styles.addButtonText}>+ Add New Task</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>Create your first habit task.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const currentStreak = calculateCurrentStreak(logs, item.id);
          const longestStreak = calculateLongestStreak(logs, item.id);
          const completed = isCompletedToday(logs, item.id);

          const todayLog = logs.find(
            (log) =>
              log.taskId === item.id &&
              log.date === new Date().toISOString().split("T")[0] &&
              log.isCompleted
          );

          const totalValue = logs
            .filter((log) => log.taskId === item.id && log.isCompleted)
            .reduce((sum, log) => sum + (log.value || 0), 0);

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/task/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.cardTop}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.createdText}>Created: {item.createdAt}</Text>
                </View>

                <View style={styles.valueBox}>
                  <View
                    style={[
                      styles.statusPill,
                      completed ? styles.completedBadge : styles.pendingBadge,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {completed ? "Done" : "Today"}
                    </Text>
                  </View>

                  <Text style={styles.valueText} numberOfLines={1}>
                    Today: {todayLog?.value ?? 0} {item.valueLabel || ""}
                  </Text>

                  <Text style={styles.valueText} numberOfLines={1}>
                    Total: {totalValue} {item.valueLabel || ""}
                  </Text>
                </View>
              </View>

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

              <TouchableOpacity
                style={[
                  styles.completeButton,
                  completed && styles.completedButton,
                ]}
                disabled={completed}
                onPress={() => {
                  setSelectedTask(item);
                  setValueInput("");
                }}
              >
                <Text style={styles.completeText}>
                  {completed ? "Completed Today ✅" : "Complete Today"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete Task</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
      <Modal visible={!!selectedTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Complete Task</Text>

            <Text style={styles.modalSubtitle}>
              {selectedTask?.name}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={`Enter value ${selectedTask?.valueLabel || ""}`}
              keyboardType="numeric"
              value={valueInput}
              onChangeText={setValueInput}
            />

            <TouchableOpacity style={styles.completeButton} onPress={submitComplete}>
              <Text style={styles.completeText}>Save Completion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedTask(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748b",
  },
  addButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  taskInfo: {
    flex: 1,
    minWidth: 0,
  },
  taskName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
  },
  valueBox: {
    width: 145,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 10,
    alignItems: "flex-start",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 6,
  },
  createdText: {
    marginTop: 4,
    color: "#64748b",
  },

  completedBadge: {
    backgroundColor: "#dcfce7",
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  completedButton: {
    backgroundColor: "#94a3b8",
  },
  completeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  deleteButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#fee2e2",
  },
  deleteText: {
    color: "#dc2626",
    fontWeight: "700",
  },
  emptyBox: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 50,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 6,
    color: "#64748b",
  },
  //setting buttion
  settingsButton: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  settingsText: {
    color: "#fff",
    fontWeight: "700",
  },
  valueText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 3,
    maxWidth: "100%",
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
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "700",
  },
});