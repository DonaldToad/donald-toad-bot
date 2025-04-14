/**
 * Crypto Trivia Module for Donald Toad AI
 * 
 * This module manages the crypto trivia game for the Donald Toad AI chatbot
 * loading trivia questions from a JSON file and providing game functionality.
 */

import fs from 'fs';
import path from 'path';
import { storage } from './storage';
import { GameState, InsertGameState } from '@shared/schema';

// Interface for trivia questions structure
interface TriviaQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

// Load trivia questions from JSON file
let triviaQuestions: TriviaQuestion[] = [];

try {
  // Use import.meta.url to get the current module's URL and create a file path
  const moduleURL = new URL(import.meta.url);
  const modulePath = moduleURL.pathname;
  const moduleDir = path.dirname(modulePath);
  const jsonPath = path.join(moduleDir, 'crypto_trivia.json');
  
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  triviaQuestions = JSON.parse(jsonData);
  console.log('Crypto trivia questions loaded successfully!');
} catch (error) {
  console.error('Error loading crypto trivia questions:', error);
  
  // Fallback to at least have something if the file doesn't load
  triviaQuestions = [
    {
      question: "What blockchain is Donald Toad Coin built on?",
      options: ["Ethereum", "Bitcoin", "Solana", "Linea"],
      correct_answer: "Linea",
      explanation: "Donald Toad Coin is built on Linea - the FASTEST, most TREMENDOUS L2 blockchain!"
    }
  ];
}

/**
 * Check if the message is a request to play the trivia game
 */
export function isTriviaRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  return lowerMessage.includes('trivia') || 
         lowerMessage.includes('quiz') || 
         lowerMessage.includes('crypto quiz') ||
         lowerMessage.includes('play trivia') ||
         lowerMessage.includes('crypto trivia');
}

/**
 * Check if the message is a request to exit the trivia game
 */
export function isExitTriviaRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  return lowerMessage.includes('exit trivia') || 
         lowerMessage.includes('quit trivia') || 
         lowerMessage.includes('stop trivia') ||
         lowerMessage.includes('end trivia') ||
         lowerMessage.includes('cancel trivia');
}

/**
 * Start a new trivia game for a user
 */
export async function startTriviaGame(userId: number): Promise<{ response: string, gameState: GameState }> {
  // End any active games first
  await storage.endAllGames(userId);
  
  // Select a random question
  const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
  const questionData = triviaQuestions[randomIndex];
  
  // Create the game state
  const gameState: InsertGameState = {
    userId,
    gameType: 'trivia',
    currentQuestion: questionData.question,
    correctAnswer: questionData.correct_answer,
    metadata: {
      questionIndex: randomIndex,
      options: questionData.options,
      explanation: questionData.explanation,
      score: 0,
      questionsAsked: 1,
      askedQuestions: [randomIndex] // Initialize with the first question index
    }
  };
  
  const newGame = await storage.createGameState(gameState);
  
  // Format the question and options
  const optionsText = questionData.options
    .map((option, index) => `${index + 1}. ${option}`)
    .join('\n');
  
  const response = `🎮 <b>CRYPTO TRIVIA WITH DONALD TOAD!</b> 🎮\n\n${questionData.question}\n\n${optionsText}\n\nAnswer with the number or the full text of your choice! (Or say "exit trivia" to quit)`;
  
  return { response, gameState: newGame };
}

/**
 * Process a user's answer to a trivia question
 */
export async function processTriviaAnswer(userId: number, message: string, gameState: GameState): Promise<string> {
  const options = (gameState.metadata as any)?.options || [];
  const correctAnswer = gameState.correctAnswer || '';
  const explanation = (gameState.metadata as any)?.explanation || '';
  
  // Parse the user's answer (either the option number or the text)
  let userAnswer = message.trim();
  
  // If they entered a number, convert it to the option text
  if (/^[1-4]$/.test(userAnswer)) {
    const index = parseInt(userAnswer) - 1;
    if (index >= 0 && index < options.length) {
      userAnswer = options[index];
    }
  }
  
  // Check if their answer is correct
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  
  // Update score
  let score = (gameState.metadata as any)?.score || 0;
  let questionsAsked = (gameState.metadata as any)?.questionsAsked || 1;
  
  if (isCorrect) {
    score++;
  }
  
  // Generate response based on correctness
  let response = '';
  
  if (isCorrect) {
    response = `✅ CORRECT! TREMENDOUS answer! ${correctAnswer} is right!\n\n${explanation}\n\nYour score: ${score}/${questionsAsked}`;
  } else {
    response = `❌ WRONG! SAD! The correct answer is ${correctAnswer}.\n\n${explanation}\n\nYour score: ${score}/${questionsAsked}`;
  }
  
  // Totally redesigned question selection logic
  console.log("Selecting a new trivia question...");
  
  // Get the previously asked questions from metadata, or initialize an empty array
  const askedQuestions = (gameState.metadata as any)?.askedQuestions || [];
  
  // Log the current state for debugging
  console.log(`Current question index: ${(gameState.metadata as any)?.questionIndex}`);
  console.log(`Previously asked questions: ${JSON.stringify(askedQuestions)}`);
  
  // Add the current question index to the list of asked questions if it exists
  if ((gameState.metadata as any)?.questionIndex !== undefined) {
    // Make sure we don't add duplicates
    if (!askedQuestions.includes((gameState.metadata as any)?.questionIndex)) {
      askedQuestions.push((gameState.metadata as any)?.questionIndex);
      console.log(`Added question ${(gameState.metadata as any)?.questionIndex} to asked list`);
    }
  }
  
  // Check if we've used almost all questions
  if (askedQuestions.length >= triviaQuestions.length - 1) {
    console.log("Almost all questions have been used, resetting the pool");
    askedQuestions.length = 0; // Clear the array
  }
  
  // Create an array of available indices (questions we haven't asked yet)
  const availableIndices: number[] = [];
  for (let i = 0; i < triviaQuestions.length; i++) {
    if (!askedQuestions.includes(i)) {
      availableIndices.push(i);
    }
  }
  
  console.log(`Available question indices: ${JSON.stringify(availableIndices)}`);
  
  // Select a random question from the available ones
  let randomIndex: number;
  
  if (availableIndices.length > 0) {
    // Randomly select from available questions
    const randomPosition = Math.floor(Math.random() * availableIndices.length);
    randomIndex = availableIndices[randomPosition];
    console.log(`Selected new question at index ${randomIndex}`);
  } else {
    // As a fallback, just pick a completely random question
    randomIndex = Math.floor(Math.random() * triviaQuestions.length);
    console.log(`No available questions, selected random index ${randomIndex}`);
  }
  
  const nextQuestion = triviaQuestions[randomIndex];
  
  // Update the game state
  await storage.updateGameState(gameState.id, {
    currentQuestion: nextQuestion.question,
    correctAnswer: nextQuestion.correct_answer,
    metadata: {
      ...gameState.metadata as any,
      questionIndex: randomIndex,
      options: nextQuestion.options,
      explanation: nextQuestion.explanation,
      score,
      questionsAsked: questionsAsked + 1,
      askedQuestions: askedQuestions // Store the history of asked questions
    }
  });
  
  // Add the next question to the response
  const optionsText = nextQuestion.options
    .map((option, index) => `${index + 1}. ${option}`)
    .join('\n');
  
  response += `\n\n🎮 <b>NEXT QUESTION:</b>\n\n${nextQuestion.question}\n\n${optionsText}\n\nAnswer with the number or the full text of your choice! (Or say "exit trivia" to quit)`;
  
  return response;
}

/**
 * End the trivia game and provide a summary
 */
export async function endTriviaGame(userId: number, gameState: GameState): Promise<string> {
  // Deactivate the game
  await storage.updateGameState(gameState.id, {
    isActive: false
  });
  
  // Generate a summary
  const score = (gameState.metadata as any)?.score || 0;
  const questionsAsked = (gameState.metadata as any)?.questionsAsked || 1;
  const percentage = Math.round((score / (questionsAsked - 1)) * 100) || 0;
  
  let assessment = '';
  if (percentage >= 90) {
    assessment = "TREMENDOUS job! You're almost as smart as me about crypto! The best scores, maybe ever! 🐸";
  } else if (percentage >= 70) {
    assessment = "Pretty good! Not quite at my level yet, but you're learning! Keep studying and you'll be making TREMENDOUS crypto decisions soon! 🐸";
  } else if (percentage >= 50) {
    assessment = "Not bad, but you need to learn more about crypto! Read more, maybe buy my book 'The Art of the Crypto Deal' - it's the best book on crypto ever written! 🐸";
  } else {
    assessment = "SAD performance! You need to study crypto much more! Very important knowledge for Making Your Bags Great Again! I suggest following me for the best crypto advice! 🐸";
  }
  
  return `🎮 <b>CRYPTO TRIVIA GAME ENDED</b> 🎮\n\nFinal Score: ${score}/${questionsAsked - 1} (${percentage}%)\n\n${assessment}\n\nSay "trivia" anytime to play again!`;
}

/**
 * Get a trivia introduction message
 */
export function getTriviaIntroMessage(): string {
  return "I've got the BEST crypto trivia game, really tremendous questions about crypto, blockchain, and of course, Donald Toad Coin! Just say 'trivia' to start playing and test your crypto knowledge! 🐸";
}