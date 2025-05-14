import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../App';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user, signOut } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const quizzesJson = await AsyncStorage.getItem('quizzes');
      if (quizzesJson) {
        setQuizzes(JSON.parse(quizzesJson));
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
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
        <Text style={styles.title}>Quiz App</Text>
        <View style={styles.headerButtons}>
          {user.isAdmin && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('Admin')}
            >
              <MaterialIcons name="admin-panel-settings" size={24} color="#fff" />
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialIcons name="person" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>
      </View>

      {user.isAdmin ? (
        <View style={styles.adminMessage}>
          <MaterialIcons name="admin-panel-settings" size={48} color="#6C63FF" />
          <Text style={styles.adminMessageTitle}>Admin Dashboard</Text>
          <Text style={styles.adminMessageText}>
            Click the Admin button to manage quizzes
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={styles.quizCard}
                onPress={() => navigation.navigate('Quiz', { quizId: quiz.id })}
              >
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizDescription}>{quiz.description}</Text>
                  <Text style={styles.quizStats}>
                    {quiz.questions.length} questions • {quiz.timeLimit} minutes
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#6C63FF" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="quiz" size={48} color="#6C63FF" />
              <Text style={styles.emptyStateTitle}>No Quizzes Available</Text>
              <Text style={styles.emptyStateText}>
                Check back later for new quizzes
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quizInfo: {
    flex: 1,
    marginRight: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quizStats: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  adminMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  adminMessageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  adminMessageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;