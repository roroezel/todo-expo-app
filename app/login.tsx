import React, { useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error(error);
            let message = 'Une erreur est survenue.';
            if (error.code === 'auth/email-already-in-use') message = 'Cet email est déjà utilisé.';
            if (error.code === 'auth/invalid-credential') message = 'Email ou mot de passe incorrect.';
            if (error.code === 'auth/weak-password') message = 'Le mot de passe est trop court.';

            Alert.alert('Erreur', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <LinearGradient
                    colors={Colors.light.gradientPrimary}
                    style={styles.background}
                />

                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <IconSymbol name="checkmark.circle.fill" size={60} color={Colors.light.primary} />
                        </View>
                        <ThemedText type="title" style={styles.title}>
                            {isLogin ? 'Connexion' : 'Inscription'}
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            {isLogin ? 'Content de vous revoir !' : 'Commencez à organiser votre vie.'}
                        </ThemedText>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <IconSymbol name="envelope.fill" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Email"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <IconSymbol name="lock.fill" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Mot de passe"
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.buttonText}>
                                    {isLogin ? 'Se connecter' : "S'inscrire"}
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsLogin(!isLogin)}
                            style={styles.switchButton}
                        >
                            <ThemedText style={styles.switchText}>
                                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '40%',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
    },
    button: {
        backgroundColor: Colors.light.primary,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    switchButton: {
        alignItems: 'center',
        marginTop: 10,
    },
    switchText: {
        color: Colors.light.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
