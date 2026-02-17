'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function ResultsPage() {
    const router = useRouter();
    const { questions, answers, bestStreak, difficulty, quizFinished, reset } = useQuiz();
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const savedRef = useRef(false);

    const total = questions.length;
    const correct = answers.filter(a => a.correct).length;
    const wrong = answers.filter(a => !a.correct && !a.skipped).length;
    const skipped = answers.filter(a => a.skipped).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    let grade, gradeClass;
    if (pct >= 90) { grade = 'A+'; gradeClass = ''; }
    else if (pct >= 80) { grade = 'A'; gradeClass = ''; }
    else if (pct >= 70) { grade = 'B'; gradeClass = 'grade-b'; }
    else if (pct >= 60) { grade = 'C'; gradeClass = 'grade-c'; }
    else { grade = 'F'; gradeClass = 'grade-f'; }

    // Save to Firestore
    useEffect(() => {
        if (user && quizFinished && total > 0 && !savedRef.current) {
            savedRef.current = true;
            addDoc(collection(db, 'quizHistory'), {
                uid: user.uid,
                difficulty,
                score: correct,
                total,
                percentage: pct,
                grade,
                bestStreak,
                answers: answers.map(a => ({ questionId: a.questionId, correct: a.correct, skipped: a.skipped })),
                createdAt: serverTimestamp(),
            }).then(() => setSaved(true)).catch(console.error);
        }
    }, [user, quizFinished, total, difficulty, correct, pct, grade, bestStreak, answers]);

    // Redirect if no results
    useEffect(() => {
        if (!quizFinished || total === 0) {
            router.replace('/');
        }
    }, [quizFinished, total, router]);

    if (!quizFinished || total === 0) return null;

    return (
        <section className="screen active" id="results">
            <div className="results-content">
                <div className="results-two-col">
                    {/* LEFT */}
                    <motion.div className="results-left" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <div className="results-header">
                            <motion.div
                                className={`result-grade ${gradeClass}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            >
                                {grade}
                            </motion.div>
                            <h2>Quiz Complete!</h2>
                            <p className="result-score">You scored <strong>{correct}</strong> / <strong>{total}</strong></p>
                            <p className="result-percent">{pct}%</p>
                        </div>
                        <div className="results-stats">
                            <div className="rstat"><span className="rstat-num">{correct}</span><span className="rstat-label">Correct</span></div>
                            <div className="rstat"><span className="rstat-num">{wrong}</span><span className="rstat-label">Wrong</span></div>
                            <div className="rstat"><span className="rstat-num">{skipped}</span><span className="rstat-label">Skipped</span></div>
                            <div className="rstat"><span className="rstat-num">{bestStreak}</span><span className="rstat-label">Best Streak</span></div>
                        </div>
                        {user && saved && (
                            <motion.div className="save-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                ✅ Results saved to your history
                            </motion.div>
                        )}
                        <div className="results-actions">
                            <motion.button className="btn-primary" onClick={() => { reset(); router.push('/difficulty'); }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                🔄 Try Again
                            </motion.button>
                            <motion.button className="btn-secondary" onClick={() => { reset(); router.push('/'); }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                🏠 Home
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* RIGHT */}
                    <motion.div className="results-right" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <h3 className="review-title">📝 Question Review</h3>
                        <div className="results-review">
                            {questions.map((q, i) => {
                                const ans = answers[i];
                                if (!ans) return null;
                                let statusClass, icon;
                                if (ans.skipped) { statusClass = 'review-skipped'; icon = '⏭️'; }
                                else if (ans.correct) { statusClass = 'review-correct'; icon = '✅'; }
                                else { statusClass = 'review-wrong'; icon = '❌'; }

                                const selectedText = ans.skipped
                                    ? 'Skipped (time ran out)'
                                    : `Your answer: ${LETTERS[ans.selected]}. ${q.options[ans.selected]}`;
                                const correctText = `Correct: ${LETTERS[q.correctAnswer]}. ${q.options[q.correctAnswer]}`;

                                return (
                                    <ReviewItem key={i} index={i} q={q} statusClass={statusClass} icon={icon} selectedText={selectedText} correctText={correctText} />
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function ReviewItem({ index, q, statusClass, icon, selectedText, correctText }) {
    const [showExp, setShowExp] = useState(false);
    return (
        <div className={`review-item ${statusClass}`}>
            <div className="review-q"><span className="review-icon">{icon}</span> {index + 1}. {q.question}</div>
            <div className="review-answer">{selectedText}<br /><strong>{correctText}</strong></div>
            <button className="review-explain-toggle" onClick={() => setShowExp(!showExp)}>💡 {showExp ? 'Hide' : 'Show'} Explanation</button>
            {showExp && <div className="review-explanation show">{q.explanation}</div>}
        </div>
    );
}
