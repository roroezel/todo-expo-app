import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Alert, Modal, LayoutAnimation, Platform, UIManager, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/theme';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useTasks } from '@/hooks/useTasks';

type Priority = 'High' | 'Medium' | 'Low';

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  category: 'travail' | 'personnel' | 'maison' | 'autres';
  priority: Priority;
  subtasks: Subtask[];
};

export type Filter = 'Toutes' | 'Actives' | 'Terminées';

export default function HomeScreen() {
  const {
    tasks,
    addTask: addTaskToDb,
    updateTask: updateTaskInDb,
    deleteTask: deleteTaskFromDb,
    toggleTask: toggleTaskInDb,
    logout
  } = useTasks();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Toutes');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed'>>({
    title: '',
    description: '',
    dueDate: new Date(),
    category: 'autres',
    priority: 'Medium',
    subtasks: []
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // --- Task Logic ---
  const addTask = async () => {
    if (newTask.title.trim() !== '') {
      try {
        if (editingTask) {
          await updateTaskInDb(editingTask.id, newTask);
          setEditingTask(null);
        } else {
          await addTaskToDb(newTask);
        }
        resetForm();
        setIsModalVisible(false);
      } catch (e) {
        Alert.alert("Erreur", "Impossible d'enregistrer la tâche.");
      }
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date(),
      category: 'autres',
      priority: 'Medium',
      subtasks: []
    });
    setNewSubtaskTitle('');
  };

  const handleEditTask = (task: Task) => {
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: new Date(task.dueDate),
      category: task.category,
      priority: task.priority || 'Medium',
      subtasks: task.subtasks || []
    });
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const toggleTask = (task: Task) => {
    toggleTaskInDb(task);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert(
      "Supprimer",
      "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => deleteTaskFromDb(taskId) }
      ]
    );
  };

  // --- Subtask Logic ---
  const addSubtask = () => {
    if (newSubtaskTitle.trim() === '') return;
    const subtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      completed: false
    };
    setNewTask(prev => ({ ...prev, subtasks: [...prev.subtasks, subtask] }));
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId: string) => {
    setNewTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
    }));
  };

  const removeSubtask = (subtaskId: string) => {
    setNewTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== subtaskId)
    }));
  };

  // --- Helpers ---
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return '#FF3B30';
      case 'Medium': return '#FF9500';
      case 'Low': return '#34C759';
      default: return '#999';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'Toutes' ||
      (filter === 'Terminées' && task.completed) ||
      (filter === 'Actives' && !task.completed);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort specific priority: High > Medium > Low
    const priorityWeights = { High: 3, Medium: 2, Low: 1 };
    return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
  });

  // --- Renderers ---
  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={() => deleteTask(id)}>
        <IconSymbol name="trash" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };



  const renderTaskItem = ({ item }: { item: Task }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      containerStyle={styles.swipeContainer}
    >
      <View style={styles.taskItem}>
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checked]}
          onPress={() => toggleTask(item)}
        >
          {item.completed && <IconSymbol name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.taskText, item.completed && styles.completedTask]}>
              {item.title}
            </ThemedText>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <ThemedText style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority}
              </ThemedText>
            </View>
          </View>

          {item.description ? (
            <ThemedText style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </ThemedText>
          ) : null}

          {/* Subtasks Progress */}
          {item.subtasks && item.subtasks.length > 0 && (
            <View style={styles.subtaskProgress}>
              <IconSymbol name="list.bullet" size={12} color={Colors.light.textSecondary} style={{ marginRight: 4 }} />
              <ThemedText style={styles.subtaskProgressText}>
                {item.subtasks.filter(s => s.completed).length}/{item.subtasks.length}
              </ThemedText>
            </View>
          )}

          <View style={styles.taskMeta}>
            <ThemedText style={styles.taskCategory}>
              {item.category}
            </ThemedText>
            <ThemedText style={styles.taskDate}>
              {item.dueDate.toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.editButton}>
          <IconSymbol name="pencil" size={20} color={Colors.light.icon} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  const renderTaskForm = () => (
    <View style={styles.inputContainer}>
      <View style={styles.modalHeader}>
        <ThemedText style={styles.modalTitle}>
          {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
        </ThemedText>
        <TouchableOpacity
          onPress={() => setIsModalVisible(false)}
          style={styles.closeButton}
        >
          <ThemedText style={styles.closeButtonText}>×</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ maxHeight: '80%' }}>
        <TextInput
          style={styles.input}
          placeholder="Titre de la tâche"
          value={newTask.title}
          onChangeText={(text) => setNewTask({ ...newTask, title: text })}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description (optionnel)"
          value={newTask.description}
          onChangeText={(text) => setNewTask({ ...newTask, description: text })}
          multiline
        />

        <View style={styles.formSection}>
          <ThemedText style={styles.label}>Priorité</ThemedText>
          <View style={styles.prioritySelector}>
            {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  newTask.priority === p && { backgroundColor: getPriorityColor(p) },
                  newTask.priority !== p && { borderColor: getPriorityColor(p) }
                ]}
                onPress={() => setNewTask({ ...newTask, priority: p })}
              >
                <ThemedText style={[
                  styles.priorityButtonText,
                  newTask.priority === p ? { color: '#fff' } : { color: getPriorityColor(p) }
                ]}>
                  {p === 'High' ? 'Haute' : p === 'Medium' ? 'Moyenne' : 'Basse'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.label}>Catégorie</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {['travail', 'personnel', 'maison', 'autres'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  newTask.category === cat && styles.activeCategoryChip
                ]}
                onPress={() => setNewTask({ ...newTask, category: cat as any })}
              >
                <ThemedText style={[
                  styles.categoryChipText,
                  newTask.category === cat && styles.activeCategoryChipText
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <ThemedText style={{ fontSize: 16 }}>{newTask.dueDate.toLocaleDateString()}</ThemedText>
          <IconSymbol name="calendar" size={20} color={Colors.light.primary} />
        </TouchableOpacity>

        {/* Subtasks Section */}
        <View style={styles.subtasksSection}>
          <ThemedText style={styles.label}>Sous-tâches</ThemedText>
          <View style={styles.subtaskInputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Ajouter une étape..."
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={addSubtask}
            />
            <TouchableOpacity onPress={addSubtask} style={styles.addSubtaskBtn}>
              <IconSymbol name="plus.circle.fill" size={32} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          {newTask.subtasks.map((st) => (
            <View key={st.id} style={styles.subtaskItemRow}>
              <TouchableOpacity onPress={() => toggleSubtask(st.id)}>
                <IconSymbol
                  name={st.completed ? "checkmark.square.fill" : "square"}
                  size={20}
                  color={st.completed ? Colors.light.success : Colors.light.textSecondary}
                />
              </TouchableOpacity>
              <ThemedText style={[styles.subtaskRowText, st.completed && styles.completedTask]}>
                {st.title}
              </ThemedText>
              <TouchableOpacity onPress={() => removeSubtask(st.id)}>
                <IconSymbol name="xmark.circle.fill" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={newTask.dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setNewTask({ ...newTask, dueDate: selectedDate });
            }}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={addTask}
      >
        <ThemedText style={styles.addButtonText}>
          {editingTask ? 'Sauvegarder' : 'Créer la tâche'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
              <ThemedText type="title" style={styles.title}>TODO</ThemedText>
              <Pressable onPress={logout} style={styles.logoutButton}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="person.circle.fill" size={18} color="#666" />
                  <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#ff3b30" />
                </View>
              </Pressable>
            </View>
            <ThemedText style={styles.subtitle}>
              {tasks.filter(t => !t.completed).length} tâches restantes
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.mainAddButton}
            onPress={() => {
              setEditingTask(null);
              resetForm();
              setIsModalVisible(true);
            }}
          >
            <LinearGradient
              colors={Colors.light.gradientPrimary}
              style={styles.mainAddButtonGradient}
            >
              <IconSymbol name="plus" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          {/* Simplified Filter visual */}
          {(['Toutes', 'Actives', 'Terminées'] as Filter[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
              onPress={() => setFilter(tab)}
            >
              <ThemedText style={filter === tab ? styles.activeFilterText : styles.filterText}>{tab}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <View key={task.id} style={{ marginBottom: 16 }}>
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                {renderTaskItem({ item: task })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="checkmark.circle" size={64} color="#ddd" />
              <ThemedText style={styles.emptyState}>Aucune tâche trouvée</ThemedText>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {renderTaskForm()}
            </View>
          </View>
        </Modal>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  mainAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  mainAddButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 45,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 10,
    color: Colors.light.icon,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 3,
    borderRadius: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 13,
  },
  activeFilterText: {
    color: Colors.light.text,
    fontWeight: '700',
    fontSize: 13,
  },
  taskList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    opacity: 0.7
  },
  emptyState: {
    marginTop: 16,
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  swipeContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top for better multi-line handling
    padding: 20,
    backgroundColor: '#fff', // Or Colors.light.surface
    minHeight: 110,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent', // Will be overridden dynamically
  },
  taskContent: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  taskText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    lineHeight: 22,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  subtaskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subtaskProgressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  taskDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#E0E0E0',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, // Align with title
  },
  checked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  editButton: {
    padding: 8,
  },
  deleteAction: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  completeAction: {
    backgroundColor: '#34c759',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },

  // Modal & Form overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#eee',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
    marginTop: -2,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.light.textSecondary,
  },
  formSection: {
    marginBottom: 20,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityIndicator: {
    position: 'absolute',
    left: 20,
    top: 20,
    bottom: 20,
    width: 4,
    borderRadius: 2,
    zIndex: 1,
    display: 'none',
  },
  cardBorderHigh: { borderLeftColor: '#FF3B30' },
  cardBorderMedium: { borderLeftColor: '#FF9500' },
  cardBorderLow: { borderLeftColor: '#34C759' },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCategoryChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  icon: {
    marginLeft: 8,
  },
  subtasksSection: {
    marginBottom: 20,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addSubtaskBtn: {
    marginLeft: 10,
  },
  subtaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subtaskRowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30, // Safety margin
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#fff1f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd6d6',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 4,
  },
});
