import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../App';

type AdminScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Admin'>;
};

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  timeLimit: number; // in minutes
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizResult {
  quizId: string;
  username: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  completedAt: string;
}

const AdminScreen = ({ navigation }: AdminScreenProps) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('30'); // default 30 minutes
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  useEffect(() => {
    verifyAndCleanStorage();
    loadQuizzes();
    loadResults();
  }, []);

  const verifyAndCleanStorage = async () => {
    try {
      console.log('Verifying storage data...');
      
      // Check quizzes storage
      const quizzesJson = await AsyncStorage.getItem('quizzes');
      if (quizzesJson) {
        try {
          const parsedQuizzes = JSON.parse(quizzesJson);
          if (!Array.isArray(parsedQuizzes)) {
            console.log('Invalid quizzes data, resetting...');
            await AsyncStorage.setItem('quizzes', JSON.stringify([]));
          } else {
            console.log('Valid quizzes data found:', parsedQuizzes.length, 'quizzes');
          }
        } catch (e) {
          console.log('Error parsing quizzes, resetting...');
          await AsyncStorage.setItem('quizzes', JSON.stringify([]));
        }
      } else {
        console.log('No quizzes data found, initializing...');
        await AsyncStorage.setItem('quizzes', JSON.stringify([]));
      }

      // Check results storage
      const resultsJson = await AsyncStorage.getItem('quiz_results');
      if (resultsJson) {
        try {
          const parsedResults = JSON.parse(resultsJson);
          if (!Array.isArray(parsedResults)) {
            console.log('Invalid results data, resetting...');
            await AsyncStorage.setItem('quiz_results', JSON.stringify([]));
          } else {
            console.log('Valid results data found:', parsedResults.length, 'results');
          }
        } catch (e) {
          console.log('Error parsing results, resetting...');
          await AsyncStorage.setItem('quiz_results', JSON.stringify([]));
        }
      } else {
        console.log('No results data found, initializing...');
        await AsyncStorage.setItem('quiz_results', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error verifying storage:', error);
    }
  };

  const loadQuizzes = async () => {
    try {
      const quizzesJson = await AsyncStorage.getItem('quizzes');
      console.log('Loading quizzes from storage:', quizzesJson);
      
      if (quizzesJson) {
        const parsedQuizzes = JSON.parse(quizzesJson);
        if (Array.isArray(parsedQuizzes)) {
          console.log('Successfully loaded quizzes:', parsedQuizzes.length);
          setQuizzes(parsedQuizzes);
        } else {
          console.log('Invalid quizzes data format, resetting...');
          await AsyncStorage.setItem('quizzes', JSON.stringify([]));
          setQuizzes([]);
        }
      } else {
        console.log('No quizzes found, initializing empty array');
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setQuizzes([]);
    }
  };

  const loadResults = async () => {
    try {
      const resultsJson = await AsyncStorage.getItem('quiz_results');
      if (resultsJson) {
        setResults(JSON.parse(resultsJson));
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(opt => !opt)) {
      Alert.alert('Error', 'Please fill in all question fields');
      return;
    }

    setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }]);
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setTitle(quiz.title);
    setDescription(quiz.description);
    setTimeLimit(quiz.timeLimit.toString());
    setQuestions(quiz.questions);
    setIsEditing(true);
    setEditingQuizId(quiz.id);
    setSelectedQuiz(quiz);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    console.log('Attempting to delete quiz:', quizId, 'Type:', typeof quizId);
    
    Alert.alert(
      'Delete Quiz',
      'Are you sure you want to delete this quiz? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting delete process for quiz:', quizId);
              
              // Get current quizzes
              const quizzesJson = await AsyncStorage.getItem('quizzes');
              console.log('Raw quizzes from storage:', quizzesJson);
              
              if (!quizzesJson) {
                console.log('No quizzes found in storage');
                await AsyncStorage.setItem('quizzes', JSON.stringify([]));
                setQuizzes([]);
                return;
              }

              let currentQuizzes;
              try {
                currentQuizzes = JSON.parse(quizzesJson);
                if (!Array.isArray(currentQuizzes)) {
                  throw new Error('Invalid quizzes data format');
                }
              } catch (e) {
                console.log('Error parsing quizzes, resetting storage...');
                await AsyncStorage.setItem('quizzes', JSON.stringify([]));
                setQuizzes([]);
                return;
              }

              // Find the quiz to delete
              const quizToDelete = currentQuizzes.find(q => String(q.id) === String(quizId));
              console.log('Quiz to delete:', quizToDelete);

              if (!quizToDelete) {
                console.log('Quiz not found in storage');
                Alert.alert('Error', 'Quiz not found');
                return;
              }

              // Remove the quiz
              const updatedQuizzes = currentQuizzes.filter(q => String(q.id) !== String(quizId));
              console.log('Quizzes after deletion:', updatedQuizzes);

              // Save to storage
              await AsyncStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
              console.log('Updated quizzes saved to storage');

              // Force reload from storage to ensure sync
              const quizzesReloaded = await AsyncStorage.getItem('quizzes');
              if (quizzesReloaded) {
                setQuizzes(JSON.parse(quizzesReloaded));
                console.log('Quizzes reloaded from storage:', quizzesReloaded);
              } else {
                setQuizzes([]);
                console.log('No quizzes found after deletion');
              }

              // Delete associated results
              try {
                const resultsJson = await AsyncStorage.getItem('quiz_results');
                if (resultsJson) {
                  const allResults = JSON.parse(resultsJson);
                  if (Array.isArray(allResults)) {
                    const updatedResults = allResults.filter(result => 
                      String(result.quizId) !== String(quizId)
                    );
                    await AsyncStorage.setItem('quiz_results', JSON.stringify(updatedResults));
                    console.log('Quiz results cleaned up');
                  }
                }
              } catch (resultsError) {
                console.log('Error cleaning up results:', resultsError);
              }

              console.log('Quiz deleted successfully');
              Alert.alert('Success', 'Quiz deleted successfully');
            } catch (error: any) {
              console.error('Error deleting quiz:', error);
              Alert.alert('Error', `Failed to delete quiz: ${error?.message || 'Unknown error'}`);
            }
          }
        }
      ]
    );
  };

  const handleSaveQuiz = async () => {
    if (!title || !description || questions.length === 0 || !timeLimit) {
      Alert.alert('Error', 'Please fill in all fields and add at least one question');
      return;
    }

    const timeLimitNum = parseInt(timeLimit);
    if (isNaN(timeLimitNum) || timeLimitNum <= 0) {
      Alert.alert('Error', 'Please enter a valid time limit');
      return;
    }

    const quizData: Quiz = {
      id: editingQuizId || Date.now().toString(),
      title,
      description,
      questions,
      timeLimit: timeLimitNum,
      createdAt: isEditing ? selectedQuiz?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    try {
      let updatedQuizzes;
      if (isEditing) {
        updatedQuizzes = quizzes.map(q => q.id === editingQuizId ? quizData : q);
      } else {
        updatedQuizzes = [...quizzes, quizData];
      }

      await AsyncStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
      setQuizzes(updatedQuizzes);
      resetForm();
      Alert.alert('Success', `Quiz ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} quiz`);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTimeLimit('30');
    setQuestions([]);
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setIsEditing(false);
    setEditingQuizId(null);
    setSelectedQuiz(null);
  };

  const viewResults = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowResults(true);
  };

  const getQuizResults = (quizId: string) => {
    return results.filter(result => result.quizId === quizId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all quizzes and results? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              const keys = await AsyncStorage.getAllKeys();
              console.log('Found keys to clear:', keys);
              
              if (keys.length > 0) {
                await AsyncStorage.multiRemove(keys);
                console.log('All keys removed');
              }

              // Clear localStorage for web
              if (typeof window !== 'undefined') {
                window.localStorage.clear();
                console.log('localStorage cleared');
              }

              // Update state
              setQuizzes([]);
              setResults([]);

              // Reload data
              await loadQuizzes();
              await loadResults();

              Alert.alert('Success', 'All data has been cleared successfully');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Access Denied</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllData}
        >
          <MaterialIcons name="delete-sweep" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter quiz title"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter quiz description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time Limit (minutes)</Text>
            <TextInput
              style={styles.input}
              value={timeLimit}
              onChangeText={setTimeLimit}
              placeholder="Enter time limit"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.questionsContainer}>
            <Text style={styles.sectionTitle}>Questions</Text>
            
            {questions.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.text}
                </Text>
                {question.options.map((option, optIndex) => (
                  <Text
                    key={optIndex}
                    style={[
                      styles.optionText,
                      optIndex === question.correctAnswer && styles.correctOption
                    ]}
                  >
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </Text>
                ))}
              </View>
            ))}

            <View style={styles.newQuestionContainer}>
              <Text style={styles.label}>New Question</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentQuestion.text}
                onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, text })}
                placeholder="Enter question"
                multiline
              />

              {currentQuestion.options.map((option, index) => (
                <View key={index} style={styles.optionContainer}>
                  <TextInput
                    style={styles.optionInput}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...currentQuestion.options];
                      newOptions[index] = text;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                  <TouchableOpacity
                    style={[
                      styles.correctButton,
                      currentQuestion.correctAnswer === index && styles.correctButtonActive
                    ]}
                    onPress={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                  >
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={currentQuestion.correctAnswer === index ? '#fff' : '#6C63FF'}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addQuestionButton}
                onPress={addQuestion}
              >
                <Text style={styles.addQuestionButtonText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSaveQuiz}
          >
            <Text style={styles.createButtonText}>
              {isEditing ? 'Update Quiz' : 'Create Quiz'}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
            >
              <Text style={styles.cancelButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Existing Quizzes</Text>
          {quizzes.map((quiz) => (
            <View key={quiz.id} style={styles.quizCard}>
              <View style={styles.quizInfo}>
                <Text style={styles.quizTitle}>{quiz.title}</Text>
                <Text style={styles.quizDescription}>{quiz.description}</Text>
                <Text style={styles.quizStats}>
                  {quiz.questions.length} questions • {quiz.timeLimit} minutes
                </Text>
              </View>
              <View style={styles.quizActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditQuiz(quiz)}
                >
                  <MaterialIcons name="edit" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    console.log('Delete button pressed for quiz:', quiz.id);
                    handleDeleteQuiz(quiz.id);
                  }}
                >
                  <MaterialIcons name="delete" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resultsButton]}
                  onPress={() => viewResults(quiz)}
                >
                  <MaterialIcons name="bar-chart" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showResults}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResults(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Results: {selectedQuiz?.title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowResults(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.resultsList}>
              {selectedQuiz && getQuizResults(selectedQuiz.id).map((result, index) => (
                <View key={index} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultUsername}>{result.username}</Text>
                    <Text style={styles.resultDate}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultScore}>
                      Score: {result.score}/{result.totalQuestions}
                    </Text>
                    <Text style={styles.resultTime}>
                      Time: {formatTime(result.timeTaken)}
                    </Text>
                  </View>
                </View>
              ))}
              {selectedQuiz && getQuizResults(selectedQuiz.id).length === 0 && (
                <Text style={styles.noResults}>No results yet</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  questionsContainer: {
    marginTop: 20,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
    marginBottom: 4,
  },
  correctOption: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  newQuestionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctButtonActive: {
    backgroundColor: '#6C63FF',
  },
  addQuestionButton: {
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addQuestionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quizCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  quizActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  editButton: {
    backgroundColor: '#6C63FF',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  resultsButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultScore: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  resultTime: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 40,
  },
  backButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  clearButton: {
    padding: 8,
    marginLeft: 'auto',
  },
});

export default AdminScreen; 