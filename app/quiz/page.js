'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
    const router = useRouter();
    const {
        questions, currentIndex, score, streak, difficulty,
        timeLeft, answered, quizActive, quizFinished, answers,
        answerQuestion, nextQuestion, timeout, tick,
    } = useQuiz();
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        if (!quizActive && !quizFinished) {
            router.replace('/difficulty');
        }
    }, [quizActive, quizFinished, router]);

    useEffect(() => {
        if (quizFinished) {
            router.push('/results');
        }
    }, [quizFinished, router]);

    useEffect(() => {
        if (!quizActive || answered) return;
        const interval = setInterval(() => {
            tick();
        }, 1000);
        return () => clearInterval(interval);
    }, [quizActive, answered, tick]);

    useEffect(() => {
        if (timeLeft <= 0 && quizActive && !answered) {
            timeout();
        }
    }, [timeLeft, quizActive, answered, timeout]);

    useEffect(() => {
        setShowExplanation(false);
    }, [currentIndex]);

    const handleNext = useCallback(() => {
        nextQuestion();
    }, [nextQuestion]);

    if (!quizActive || !questions.length) return null;

    const q = questions[currentIndex];
    const progress = (currentIndex / questions.length) * 100;
    const diffLabel = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : '';
    const currentAnswer = answers[currentIndex];

    return (
        <section className="screen active quiz-screen-wrapper">
            <div className="quiz-header">
                <div className="quiz-meta">
                    <span className="domain-badge">{q.domain}</span>
                    <span className={`diff-badge${difficulty !== 'easy' ? ' ' + difficulty : ''}`}>{diffLabel}</span>
                </div>
                <div className="quiz-progress">
                    <span>{currentIndex + 1} / {questions.length}</span>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-fill"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>
                <div className={`quiz-timer${timeLeft <= 10 ? ' warning' : ''}`}>
                    <span className="timer-icon">⏱️</span>
                    <span>{timeLeft}</span>s
                </div>
            </div>

            <div className="quiz-body">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="question-card">
                            <p className="question-text">{q.question}</p>
                        </div>

                        <div className="options-grid">
                            {q.options.map((opt, i) => {
                                let cls = 'option-btn';
                                if (answered && currentAnswer) {
                                    cls += ' disabled';
                                    if (i === q.correctAnswer) cls += ' correct';
                                    if (i === currentAnswer.selected && !currentAnswer.correct) cls += ' wrong';
                                }
                                return (
                                    <motion.button
                                        key={i}
                                        className={cls}
                                        onClick={() => !answered && answerQuestion(i)}
                                        whileHover={!answered ? { scale: 1.01 } : {}}
                                        whileTap={!answered ? { scale: 0.98 } : {}}
                                        disabled={answered}
                                    >
                                        <span className="option-letter">{LETTERS[i]}</span>
                                        <span>{opt}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="quiz-actions">
                    {answered && (
                        <>
                            <motion.button
                                className="btn-explain"
                                onClick={() => setShowExplanation(!showExplanation)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                💡 Explanation
                            </motion.button>
                            <motion.button
                                className="btn-next"
                                onClick={handleNext}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {currentIndex + 1 >= questions.length ? 'Finish →' : 'Next →'}
                            </motion.button>
                        </>
                    )}
                </div>

                <AnimatePresence>
                    {showExplanation && (
                        <motion.div
                            className="explanation-box"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="explanation-header">
                                <span>📖 Explanation</span>
                                <button className="close-explain" onClick={() => setShowExplanation(false)}>✕</button>
                            </div>
                            <p>{q.explanation}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="score-bar">
                <span>Score: <strong>{score}</strong></span>
                <span>Streak: <strong>{streak}</strong> 🔥</span>
            </div>
        </section>
    );
}
