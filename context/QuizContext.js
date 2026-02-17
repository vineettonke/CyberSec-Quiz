'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
import { QUESTIONS } from '@/data/questions';

const QuizContext = createContext({});

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const TIMER_MAP = { easy: 30, medium: 45, hard: 60 };
const QUESTION_COUNT = 10;

const initialState = {
    difficulty: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answers: [],
    timeLeft: 0,
    answered: false,
    quizActive: false,
    quizFinished: false,
};

function quizReducer(state, action) {
    switch (action.type) {
        case 'START_QUIZ': {
            const pool = QUESTIONS.filter(q => q.difficulty === action.difficulty);
            const questions = shuffle(pool).slice(0, QUESTION_COUNT);
            return {
                ...initialState,
                difficulty: action.difficulty,
                questions,
                timeLeft: TIMER_MAP[action.difficulty],
                quizActive: true,
                quizFinished: false,
            };
        }
        case 'ANSWER_QUESTION': {
            if (state.answered) return state;
            const q = state.questions[state.currentIndex];
            const isCorrect = action.index === q.correctAnswer;
            const newStreak = isCorrect ? state.streak + 1 : 0;
            const bestStreak = Math.max(state.bestStreak, newStreak);
            const streakBonus = newStreak >= 3 ? Math.floor(newStreak / 3) : 0;
            const scoreAdd = isCorrect ? 10 + streakBonus : 0;
            return {
                ...state,
                answered: true,
                streak: newStreak,
                bestStreak,
                score: state.score + scoreAdd,
                answers: [...state.answers, {
                    questionId: q.id,
                    selected: action.index,
                    correct: isCorrect,
                    skipped: false,
                }],
            };
        }
        case 'TIMEOUT': {
            if (state.answered) return state;
            const q = state.questions[state.currentIndex];
            return {
                ...state,
                answered: true,
                streak: 0,
                timeLeft: 0,
                answers: [...state.answers, {
                    questionId: q.id,
                    selected: -1,
                    correct: false,
                    skipped: true,
                }],
            };
        }
        case 'NEXT_QUESTION': {
            const nextIndex = state.currentIndex + 1;
            if (nextIndex >= state.questions.length) {
                return { ...state, quizActive: false, quizFinished: true };
            }
            return {
                ...state,
                currentIndex: nextIndex,
                answered: false,
                timeLeft: TIMER_MAP[state.difficulty],
            };
        }
        case 'TICK': {
            if (state.timeLeft <= 0) return state;
            return { ...state, timeLeft: state.timeLeft - 1 };
        }
        case 'RESET': {
            return { ...initialState };
        }
        default:
            return state;
    }
}

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, initialState);

    const startQuiz = useCallback((difficulty) => {
        dispatch({ type: 'START_QUIZ', difficulty });
    }, []);

    const answerQuestion = useCallback((index) => {
        dispatch({ type: 'ANSWER_QUESTION', index });
    }, []);

    const nextQuestion = useCallback(() => {
        dispatch({ type: 'NEXT_QUESTION' });
    }, []);

    const timeout = useCallback(() => {
        dispatch({ type: 'TIMEOUT' });
    }, []);

    const tick = useCallback(() => {
        dispatch({ type: 'TICK' });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return (
        <QuizContext.Provider value={{
            ...state,
            startQuiz, answerQuestion, nextQuestion, timeout, tick, reset,
            totalQuestions: QUESTIONS.length,
            totalDomains: new Set(QUESTIONS.map(q => q.domain)).size,
        }}>
            {children}
        </QuizContext.Provider>
    );
}

export const useQuiz = () => useContext(QuizContext);
