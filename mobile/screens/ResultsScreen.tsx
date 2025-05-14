import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Results: { score: number; totalQuestions: number };
};

type ResultsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

const ResultsScreen = ({ navigation, route }: ResultsScreenProps) => {
  const { score, totalQuestions } = route.params;
  const percentage = (score / totalQuestions) * 100;

  const getMessage = () => {
    if (percentage >= 90) return 'Excellent! You\'re a quiz master!';
    if (percentage >= 70) return 'Great job! You know your stuff!';
    if (percentage >= 50) return 'Good effort! Keep practicing!';
    return 'Keep studying! You\'ll do better next time!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons 
          name={percentage >= 70 ? "emoji-events" : "school"} 
          size={80} 
          color={percentage >= 70 ? "#FFD700" : "#6C63FF"} 
        />
        
        <Text style={styles.title}>Quiz Complete!</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {score} / {totalQuestions}
          </Text>
          <Text style={styles.percentageText}>
            {percentage.toFixed(1)}%
          </Text>
        </View>

        <Text style={styles.message}>{getMessage()}</Text>

        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="home" size={24} color="#fff" />
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 32,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 24,
    color: '#666',
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  homeButton: {
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ResultsScreen;