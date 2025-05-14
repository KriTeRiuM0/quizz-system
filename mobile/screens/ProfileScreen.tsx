import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../App';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

interface QuizResult {
  quizId: string;
  username: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: string;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { user, signOut } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const resultsJson = await AsyncStorage.getItem('quiz_results');
      if (resultsJson) {
        const allResults: QuizResult[] = JSON.parse(resultsJson);
        const userResults = allResults.filter(result => result.username === user?.username);
        setResults(userResults);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user.username}</Text>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user.isAdmin ? 'Admin' : 'User'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiz Results</Text>
          {results.length > 0 ? (
            results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <Text style={styles.resultScore}>
                  Score: {result.score}/{result.totalQuestions}
                </Text>
                <Text style={styles.resultTime}>
                  Time: {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.resultDate}>
                  {new Date(result.completedAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>No quiz results yet</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  resultTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: '#FF5252',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen; 