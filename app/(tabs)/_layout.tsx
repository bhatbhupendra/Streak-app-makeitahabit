import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="add-task"
        options={{ title: "Add Task" }}
      />

      <Stack.Screen
        name="task/[id]"
        options={{ title: "Task Detail" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Backup & Restore" }}
      />
    </Stack>
  );
}