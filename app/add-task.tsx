import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { addTask } from "../src/storage/taskStorage";

export default function AddTask() {
    const [taskName, setTaskName] = useState("");
    const [valueLabel, setValueLabel] = useState("");
    const router = useRouter();

    const handleAddTask = async () => {
        if (!taskName.trim()) {
            Alert.alert("Error", "Please enter task name");
            return;
        }

        await addTask(taskName.trim(), valueLabel.trim());
        router.back();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Task</Text>
            <Text style={styles.subtitle}>
                Create a habit and choose what value you want to track.
            </Text>

            <Text style={styles.label}>Task Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Example: Study, Pushups, 10k Walk"
                value={taskName}
                onChangeText={setTaskName}
            />

            <Text style={styles.label}>Value Unit / Label</Text>
            <TextInput
                style={styles.input}
                placeholder="Example: hours, steps, reps, pages"
                value={valueLabel}
                onChangeText={setValueLabel}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddTask}>
                <Text style={styles.saveText}>Save Task</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
    title: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
    subtitle: { marginTop: 6, marginBottom: 24, color: "#64748b" },
    label: { fontWeight: "700", marginBottom: 8, color: "#334155" },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 14,
        borderRadius: 14,
        marginBottom: 18,
    },
    saveButton: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});