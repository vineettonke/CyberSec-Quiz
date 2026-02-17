'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

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

    useEffect(() => {
        if (user && supabase && quizFinished && total > 0 && !savedRef.current) {
            savedRef.current = true;
            supabase.from('quiz_history').insert({
                user_id: user.id,
                difficulty,
                score: correct,
                total,
                percentage: pct,
                grade,
                best_streak: bestStreak,
                answers: answers.map(a => ({ questionId: a.questionId, selected: a.selected, correct: a.correct, skipped: a.skipped })),
            }).then(({ error }) => {
                if (error) console.error('Failed to save quiz:', error.message);
                else setSaved(true);
            });
        }
    }, [user, quizFinished, total, difficulty, correct, pct, grade, bestStreak, answers]);

    useEffect(() => {
        if (!quizFinished || total === 0) {
            router.replace('/');
        }
    }, [quizFinished, total, router]);

    if (!quizFinished || total === 0) return null;

    const [showExplanations, setShowExplanations] = useState({});
    const toggleExplanation = (idx) => setShowExplanations(prev => ({ ...prev, [idx]: !prev[idx] }));

    return (
        <section id="results" className="screen active">
            <div className="results-content">
                <div className="screen-header">
                    <h2>📊 Mission Report</h2>
                </div>
                <div className="results-two-col">
                    <div className="results-left">
                        <div className="results-header">
                            <div className={`result-grade ${gradeClass}`}>{grade}</div>
                            <h2>Mission {pct >= 70 ? 'Success' : 'Failed'}</h2>
                            <div className="result-score">
                                <strong>{correct}</strong> / {total} correct
                            </div>
                            <div className="result-percent">{pct}%</div>
                        </div>
                        <div className="results-stats">
                            <div className="rstat"><span className="rstat-num">{correct}</span><span className="rstat-label">Correct</span></div>
                            <div className="rstat"><span className="rstat-num">{wrong}</span><span className="rstat-label">Wrong</span></div>
                            <div className="rstat"><span className="rstat-num">{skipped}</span><span className="rstat-label">Timeout</span></div>
                            <div className="rstat"><span className="rstat-num">{bestStreak}</span><span className="rstat-label">Best Streak</span></div>
                        </div>
                        {saved && <div className="save-indicator">✓ Results saved to profile</div>}
                        <div className="results-actions">
                            <button className="btn-primary" onClick={() => { reset(); router.push('/difficulty'); }}>
                                🔄 Try Again
                            </button>
                            <button className="btn-secondary" onClick={() => { reset(); router.push('/'); }}>
                                🏠 Home
                            </button>
                        </div>
                    </div>
                    <div className="results-right">
                        <h3 className="review-title">📋 Question Review</h3>
                        <div className="results-review">
                            {answers.map((a, i) => {
                                const q = questions[i];
                                if (!q) return null;
                                const statusClass = a.skipped ? 'review-skipped' : a.correct ? 'review-correct' : 'review-wrong';
                                const icon = a.skipped ? '⏱️' : a.correct ? '✅' : '❌';
                                return (
                                    <div key={i} className={`review-item ${statusClass}`}>
                                        <div className="review-q">
                                            <span className="review-icon">{icon}</span>
                                            <span>{i + 1}. {q.question}</span>
                                        </div>
                                        <div className="review-answer">
                                            Your answer: <strong>{a.selected >= 0 ? `${LETTERS[a.selected]}. ${q.options[a.selected]}` : 'Time expired'}</strong>
                                            <br />
                                            Correct: <strong>{LETTERS[q.correctAnswer]}. {q.options[q.correctAnswer]}</strong>
                                        </div>
                                        <button className="review-explain-toggle" onClick={() => toggleExplanation(i)}>
                                            💡 {showExplanations[i] ? 'Hide' : 'Show'} Explanation
                                        </button>
                                        {showExplanations[i] && (
                                            <div className="review-explanation">{q.explanation}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
