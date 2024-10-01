import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Modal } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Image } from 'react-native';

interface AnswerOption {
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  questionText: string;
  codeSnippet: string;
  answerOptions: AnswerOption[];
}

const questions: Question[] = [
  {
    questionText: 'What is the output of the following code?',
    codeSnippet: 'console.log(1 + "2" + "2");',
    answerOptions: [
      { answerText: '"122"', isCorrect: true },
      { answerText: '"32"', isCorrect: false },
      { answerText: '"14"', isCorrect: false },
      { answerText: '"NaN"', isCorrect: false },
    ],
  },
];

const QuizScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false); // Track if the selected answer is correct
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false); // Track if the user clicked "Submit"
  const [explodeConfetti, setExplodeConfetti] = useState<boolean>(false);
  const [showBadgePopup, setShowBadgePopup] = useState<boolean>(false);
  const [showIncorrectPopup, setShowIncorrectPopup] = useState<boolean>(false); // Popup for incorrect answer
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Select answer option without submitting
  const handleAnswerOptionClick = (answerIndex: number): void => {
    setSelectedAnswer(answerIndex);
    setHasSubmitted(false); // Reset submission status when a new answer is selected
  };

  // Submit answer and give feedback
  const submitAnswer = (): void => {
    if (selectedAnswer === null) return; // Ensure an answer is selected before submitting
    const correct = questions[currentQuestionIndex].answerOptions[selectedAnswer].isCorrect;
    setIsCorrect(correct); // Set the state for whether the answer is correct
    setHasSubmitted(true); // Mark the answer as submitted
    setShowFeedback(true);
    setExplodeConfetti(correct);

    if (!correct) {
      triggerShake();
      setTimeout(() => setShowIncorrectPopup(true), 1000); // Show incorrect popup after a small delay
    } else {
      setTimeout(() => {
        setShowBadgePopup(true);
      }, 3000); // Confetti duration is 3 seconds for correct answer
    }

    setTimeout(() => {
      setShowFeedback(false);
      setExplodeConfetti(false);
    }, 3000);
  };

  // Shake animation for incorrect answers
  const triggerShake = (): void => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeBadgePopup = (): void => {
    setShowBadgePopup(false);
  };

  const closeIncorrectPopup = (): void => {
    setShowIncorrectPopup(false);
    setSelectedAnswer(null); // Allow the user to reselect an answer
    setHasSubmitted(false); // Reset submission status
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{questions[currentQuestionIndex].questionText}</Text>
        <Text style={styles.codeSnippet}>{questions[currentQuestionIndex].codeSnippet}</Text>
      </View>

      {/* Display answer options */}
      {questions[currentQuestionIndex].answerOptions.map((answerOption, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            selectedAnswer === index && !hasSubmitted && {
              borderColor: '#6F42C1', // Highlight border when selected before submission
              borderWidth: 2,
            },
            hasSubmitted && selectedAnswer === index && {
              backgroundColor: answerOption.isCorrect ? '#4CAF50' : '#F44336', // Green for correct, Red for incorrect after submission
              borderWidth: 2,
              borderColor: answerOption.isCorrect ? '#4CAF50' : '#F44336',
            },
          ]}
          onPress={() => handleAnswerOptionClick(index)}
        >
          <Text style={styles.buttonText}>{answerOption.answerText}</Text>
        </TouchableOpacity>
      ))}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={submitAnswer}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      {/* Feedback after submission */}
      {showFeedback && (
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <Text style={[styles.feedbackText, { color: isCorrect ? '#4CAF50' : '#F44336' }]}>
            {isCorrect ? 'Correct! Great job!' : "Oops! That's not right."}
          </Text>
        </Animated.View>
      )}

      {/* Confetti for correct answer */}
      {explodeConfetti && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />}

      {/* Badge Popup for Correct Answer */}
      <Modal transparent={true} visible={showBadgePopup} animationType="fade">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
          <Image source={require('./assets/badge.png')} style={{ width: 100, height: 100 }} />
            <Text style={styles.popupText}>You earned a badge!</Text>
            <TouchableOpacity onPress={closeBadgePopup} style={styles.popupButton}>
              <Text style={styles.popupButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Incorrect Popup with Feedback */}
      <Modal transparent={true} visible={showIncorrectPopup} animationType="fade">
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.feedbackText}>
              Hint: "Think about how JavaScript handles different data types."
            </Text>
            <TouchableOpacity onPress={closeIncorrectPopup} style={styles.popupButton}>
              <Text style={styles.popupButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',  // Soft off-white background
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A202C',  // Darker text color for better readability
  },
  codeSnippet: {
    fontFamily: 'Courier New',
    backgroundColor: '#EDEDED',  // Softer gray for background
    padding: 12,
    borderRadius: 6,
    fontSize: 18,
    color: '#4A5568',  // Darker gray for the code snippet text
  },
  button: {
    backgroundColor: '#EDEDED',  // Lighter, subtle blue for default options
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 25,  // More rounded corners for a modern look
    marginBottom: 10,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
  },
  buttonText: {
    textAlign: 'center',
    color: '#1A202C',  
    fontSize: 18,  
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#6F42C1',  
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 25,
    marginBottom: 10,
    marginTop: 20,
  },
  submitButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,  
    fontWeight: 'bold',
  },
  feedbackText: {
    fontSize: 18,
    marginBottom: 10,
    color:'#757575',
  },
  hintText: {
    color: '#888',
    fontSize: 16,
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  popupButton: {
    backgroundColor: '#6F42C1',
    padding: 10,
    borderRadius: 5,
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizScreen;