import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../App';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(username, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color="#6C63FF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  signupButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#6C63FF',
    fontSize: 16,
  },
});

export default SignupScreen; 