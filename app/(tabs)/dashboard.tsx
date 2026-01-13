import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTasks } from '@/hooks/useTasks';

export default function DashboardScreen() {
    const { tasks, loading, logout } = useTasks();
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        active: 0,
        highPriority: 0,
        completionRate: 0,
    });

    useEffect(() => {
        if (!loading) {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const active = total - completed;
            const highPriority = tasks.filter(t => !t.completed && t.priority === 'High').length;

            setStats({
                total,
                completed,
                active,
                highPriority,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            });
        }
    }, [tasks, loading]);

    const StatCard = ({ title, value, icon, color, subtext, gradient }: any) => {
        const GradientComponent = gradient ? LinearGradient : View;
        const gradientProps = gradient ? { colors: gradient, style: [styles.card, styles.gradientCard] } : { style: styles.card };

        // If gradient, text should be white
        const textColor = gradient ? '#fff' : Colors.light.text;
        const iconColor = gradient ? '#fff' : color;
        const subtextColor = gradient ? 'rgba(255,255,255,0.8)' : Colors.light.textSecondary;

        return (
            // @ts-ignore
            <GradientComponent {...gradientProps}>
                <View style={[styles.iconContainer, !gradient && { backgroundColor: color + '20' }]}>
                    <IconSymbol name={icon} size={24} color={iconColor} />
                </View>
                <View style={styles.cardContent}>
                    <ThemedText style={[styles.cardValue, { color: textColor }]}>{value}</ThemedText>
                    <ThemedText style={[styles.cardTitle, { color: subtextColor }]}>{title}</ThemedText>
                    {subtext && <ThemedText style={[styles.cardSubtext, { color: subtextColor }]}>{subtext}</ThemedText>}
                </View>
            </GradientComponent>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <ThemedText type="title" style={styles.title}>Productivité</ThemedText>
                        <ThemedText style={styles.subtitle}>Vos statistiques en temps réel</ThemedText>
                    </View>
                    <Pressable onPress={logout} style={styles.logoutButton}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <IconSymbol name="person.circle.fill" size={18} color="#666" />
                            <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#ff3b30" />
                        </View>
                    </Pressable>
                </View>
            </ThemedView>

            <View style={styles.grid}>
                <View style={styles.row}>
                    <StatCard
                        title="Tâches Terminées"
                        value={stats.completed}
                        icon="checkmark.circle.fill"
                        color={Colors.light.success}
                        subtext={`Sur ${stats.total} tâches`}
                        gradient={Colors.light.gradientSecondary}
                    />
                    <StatCard
                        title="Taux de réussite"
                        value={`${stats.completionRate}%`}
                        icon="chart.pie.fill"
                        color="#4a90e2"
                    />
                </View>
                <View style={styles.row}>
                    <StatCard
                        title="À Faire"
                        value={stats.active}
                        icon="list.bullet"
                        color={Colors.light.textSecondary}
                    />
                    <StatCard
                        title="Priorité Haute"
                        value={stats.highPriority}
                        icon="exclamationmark.triangle.fill"
                        color="#FF3B30"
                        subtext="Restantes"
                    />
                </View>
            </View>

            <View style={styles.motivationSection}>
                <IconSymbol name="star.fill" size={40} color="#FFD700" style={{ marginBottom: 10 }} />
                <ThemedText style={styles.motivationTitle}>
                    {stats.completionRate === 100 ? "Incroyable !" :
                        stats.completionRate > 75 ? "Excellent travail !" :
                            stats.completionRate > 50 ? "Bon début !" : "Courage !"}
                </ThemedText>
                <ThemedText style={styles.motivationText}>
                    {stats.completionRate === 100 ? "Vous avez tout terminé. Prenez une pause !" :
                        "Continuez comme ça pour atteindre vos objectifs."}
                </ThemedText>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
        padding: 20,
    },
    header: {
        marginBottom: 24,
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    grid: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        alignItems: 'flex-start',
        minHeight: 140,
        justifyContent: 'space-between',
    },
    gradientCard: {
        // Remove bg color if gradient
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginBottom: 12,
    },
    cardContent: {
        alignItems: 'flex-start',
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
    },
    cardSubtext: {
        fontSize: 11,
        color: Colors.light.textSecondary,
        marginTop: 4,
        opacity: 0.7,
    },
    motivationSection: {
        marginTop: 32,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    motivationTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        color: Colors.light.text,
    },
    motivationText: {
        textAlign: 'center',
        color: Colors.light.textSecondary,
        lineHeight: 20,
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
    },
});
