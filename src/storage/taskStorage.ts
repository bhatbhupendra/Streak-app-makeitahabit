import AsyncStorage from "@react-native-async-storage/async-storage";

export type Task = {
    id: string;
    name: string;
    createdAt: string;
    valueLabel?: string;
};

export type TaskLog = {
    id: string;
    taskId: string;
    date: string;
    isCompleted: boolean;
    value?: number;
};

const TASKS_KEY = "STREAK_TASKS";
const LOGS_KEY = "STREAK_TASK_LOGS";

export const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
};

export const getTasks = async (): Promise<Task[]> => {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTasks = async (tasks: Task[]) => {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const addTask = async (name: string, valueLabel: string = "") => {
    const tasks = await getTasks();

    const newTask: Task = {
        id: Date.now().toString(),
        name,
        valueLabel,
        createdAt: getTodayDate(),
    };

    await saveTasks([newTask, ...tasks]);
    return newTask;
};

export const deleteTask = async (taskId: string) => {
    const tasks = await getTasks();
    const logs = await getLogs();

    await saveTasks(tasks.filter((task) => task.id !== taskId));
    await saveLogs(logs.filter((log) => log.taskId !== taskId));
};

export const getLogs = async (): Promise<TaskLog[]> => {
    const data = await AsyncStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveLogs = async (logs: TaskLog[]) => {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const completeTaskToday = async (taskId: string, value: number = 0) => {
    const logs = await getLogs();
    const today = getTodayDate();

    const alreadyCompleted = logs.some(
        (log) => log.taskId === taskId && log.date === today && log.isCompleted
    );

    if (alreadyCompleted) {
        return {
            success: false,
            message: "Task already completed today",
        };
    }

    const newLog: TaskLog = {
        id: Date.now().toString(),
        taskId,
        date: today,
        isCompleted: true,
        value,
    };

    await saveLogs([newLog, ...logs]);

    return {
        success: true,
        message: "Task completed",
    };
};

// calinder mark and dismark

export const toggleTaskLogByDate = async (taskId: string, date: string) => {
    const logs = await getLogs();

    const existingLog = logs.find(
        (log) => log.taskId === taskId && log.date === date
    );

    if (existingLog) {
        const updatedLogs = logs.filter((log) => log.id !== existingLog.id);
        await saveLogs(updatedLogs);

        return {
            success: true,
            message: "Completion removed",
        };
    }

    const newLog: TaskLog = {
        id: Date.now().toString(),
        taskId,
        date,
        isCompleted: true,
    };

    await saveLogs([newLog, ...logs]);

    return {
        success: true,
        message: "Completion added",
    };
};

export const upsertTaskLogByDate = async (
    taskId: string,
    date: string,
    value: number = 0
) => {
    const logs = await getLogs();

    const existingLog = logs.find(
        (log) => log.taskId === taskId && log.date === date
    );

    if (existingLog) {
        const updatedLogs = logs.map((log) =>
            log.id === existingLog.id
                ? { ...log, isCompleted: true, value }
                : log
        );

        await saveLogs(updatedLogs);
        return { success: true, message: "Completion updated" };
    }

    const newLog: TaskLog = {
        id: Date.now().toString(),
        taskId,
        date,
        isCompleted: true,
        value,
    };

    await saveLogs([newLog, ...logs]);
    return { success: true, message: "Completion added" };
};

export const removeTaskLogByDate = async (taskId: string, date: string) => {
    const logs = await getLogs();

    const updatedLogs = logs.filter(
        (log) => !(log.taskId === taskId && log.date === date)
    );

    await saveLogs(updatedLogs);

    return { success: true, message: "Completion removed" };
};

//export impoart

export const exportBackupData = async () => {
    const tasks = await getTasks();
    const logs = await getLogs();

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
        logs,
    };
};

export const importBackupData = async (backup: any) => {
    if (!backup || !Array.isArray(backup.tasks) || !Array.isArray(backup.logs)) {
        throw new Error("Invalid backup file");
    }

    await saveTasks(backup.tasks);
    await saveLogs(backup.logs);

    return true;
};