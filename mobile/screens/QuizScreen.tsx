import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../App';

type QuizScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
  route: {
    params: {
      quizId: string;
    };
  };
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

const QuizScreen = ({ navigation, route }: QuizScreenProps) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (quiz && !startTime) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
      setStartTime(Date.now());
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      const quizzesJson = await AsyncStorage.getItem('quizzes');
      if (quizzesJson) {
        const quizzes: Quiz[] = JSON.parse(quizzesJson);
        const foundQuiz = quizzes.find((q) => q.id === route.params.quizId);
        if (foundQuiz) {
          setQuiz(foundQuiz);
          setSelectedAnswers(new Array(foundQuiz.questions.length).fill(-1));
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    const score = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

    const result = {
      quizId: quiz.id,
      username: user.username,
      score,
      totalQuestions: quiz.questions.length,
      timeTaken,
      completedAt: new Date().toISOString()
    };

    try {
      const resultsJson = await AsyncStorage.getItem('quiz_results');
      const results = resultsJson ? JSON.parse(resultsJson) : [];
      await AsyncStorage.setItem('quiz_results', JSON.stringify([...results, result]));
      
      navigation.replace('Results', {
        quizId: quiz.id,
        score,
        totalQuestions: quiz.questions.length
      });
    } catch (error) {
      console.error('Error saving results:', error);
      Alert.alert('Error', 'Failed to save results');
    }
  };

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedOption,
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText,
                ]}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6C63FF" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.submitButton, selectedAnswers.includes(-1) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={selectedAnswers.includes(-1)}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, selectedAnswers[currentQuestionIndex] === -1 && styles.disabledButton]}
            onPress={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#6C63FF" />
          </TouchableOpacity>
        )}
      </View>
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5252',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  navButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    marginHorizontal: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default QuizScreen;