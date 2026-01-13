import { useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { Task } from '../app/(tabs)/index';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        // 1. Reference the "tasks" collection filtered by userId
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid)
        );

        // 2. Listen for real-time updates
        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    // Convert Firebase Timestamp back to JS Date
                    dueDate: data.dueDate?.toDate() || new Date(),
                };
            }) as Task[];

            // Sort in Javascript to avoid "Missing Index" error
            const priorityWeights = { High: 3, Medium: 2, Low: 1 };
            const sortedTasks = tasksData.sort((a, b) =>
                (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
            );

            setTasks(sortedTasks);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addTask = async (newTask: Omit<Task, 'id' | 'completed'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'tasks'), {
                ...newTask,
                userId: user.uid,
                completed: false,
                dueDate: Timestamp.fromDate(newTask.dueDate),
                createdAt: Timestamp.now(),
            });
        } catch (e) {
            console.error("Error adding task:", e);
            throw e;
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            const firestoreUpdates = { ...updates };

            if (updates.dueDate) {
                firestoreUpdates.dueDate = Timestamp.fromDate(updates.dueDate) as any;
            }

            await updateDoc(taskRef, firestoreUpdates);
        } catch (e) {
            console.error("Error updating task:", e);
            throw e;
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (e) {
            console.error("Error deleting task:", e);
            throw e;
        }
    };

    const toggleTask = async (task: Task) => {
        return updateTask(task.id, { completed: !task.completed });
    };

    const logout = async () => {
        try {
            await auth.signOut();
        } catch (e) {
            console.error("Logout Error:", e);
        }
    };

    return { tasks, loading, addTask, updateTask, deleteTask, toggleTask, logout };
}
