import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export const QuizCard = ({ question, options, onAnswer, currentIndex, totalQuestions }) => {
  const [selected, setSelected] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const handleSelect = (index) => {
    setSelected(index);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        onAnswer(index);
        setSelected(null);
      }, 500);
    });
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${((currentIndex + 1) / totalQuestions) * 100}%` }]} />
        </View>
        <Text style={styles.questionCount}>
          {currentIndex + 1}/{totalQuestions}
        </Text>
      </View>

      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            style={[
              styles.option,
              selected === index && styles.selectedOption,
            ]}
            onPress={() => handleSelect(index)}
          >
            <Text style={[
              styles.optionText,
              selected === index && styles.selectedOptionText
            ]}>
              {option}
            </Text>
            {selected === index && (
              <MaterialIcons name="check-circle" size={24} color="#fff" />
            )}
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 12,
  },
  progress: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  questionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#6C63FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
});