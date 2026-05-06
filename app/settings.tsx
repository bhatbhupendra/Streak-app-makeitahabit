import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";


import {
    exportBackupData,
    importBackupData,
} from "../src/storage/taskStorage";

export default function SettingsScreen() {
    const handleExport = async () => {
        try {
            const backup = await exportBackupData();

            const fileName = `streak-backup-${Date.now()}.json`;

            const fileUri =
                (FileSystem.documentDirectory || FileSystem.cacheDirectory) + fileName;

            await FileSystem.writeAsStringAsync(
                fileUri,
                JSON.stringify(backup, null, 2),
                {
                    encoding: FileSystem.EncodingType.UTF8,
                }
            );

            const canShare = await Sharing.isAvailableAsync();

            if (!canShare) {
                Alert.alert("Export Ready", `Backup saved at:\n${fileUri}`);
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: "application/json",
                dialogTitle: "Export Streak Backup",
                UTI: "public.json",
            });
        } catch (error: any) {
            Alert.alert("Export Failed", error?.message || "Could not export backup.");
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;

            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const backup = JSON.parse(fileContent);

            await importBackupData(backup);

            Alert.alert("Success", "Backup imported successfully.");

        } catch (error) {
            Alert.alert("Import Failed", "Invalid or broken backup file.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Backup & Restore</Text>
            <Text style={styles.subtitle}>
                Export your tasks and logs, then import them later.
            </Text>

            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                <Text style={styles.buttonText}>Export Data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.importButton} onPress={handleImport}>
                <Text style={styles.buttonText}>Import Data</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8fafc",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0f172a",
    },
    subtitle: {
        marginTop: 8,
        marginBottom: 30,
        color: "#64748b",
        fontSize: 15,
    },
    exportButton: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginBottom: 14,
    },
    importButton: {
        backgroundColor: "#22c55e",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
});