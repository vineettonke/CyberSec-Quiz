'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QUESTIONS } from '@/data/questions';

const LETTERS = ['A', 'B', 'C', 'D'];
const QUESTIONS_MAP = {};
QUESTIONS.forEach(q => { QUESTIONS_MAP[q.id] = q; });

export default function HistoryPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [history, setHistory] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (loading) return;
        if (!user) { setFetching(false); return; }

        async function fetchHistory() {
            try {
                const q = query(
                    collection(db, 'quizHistory'),
                    where('uid', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const snap = await getDocs(q);
                setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error('Failed to fetch history:', err);
            }
            setFetching(false);
        }
        fetchHistory();
    }, [user, loading]);

    async function handleDelete(entryId) {
        if (deletingId) return;
        setDeletingId(entryId);
        try {
            await deleteDoc(doc(db, 'quizHistory', entryId));
            setHistory(prev => prev.filter(h => h.id !== entryId));
            if (expandedId === entryId) setExpandedId(null);
        } catch (err) {
            console.error('Failed to delete:', err);
        }
        setDeletingId(null);
    }


    const totalQuizzes = history.length;
    const avgScore = totalQuizzes > 0 ? Math.round(history.reduce((sum, h) => sum + (h.percentage || 0), 0) / totalQuizzes) : 0;
    const bestResult = totalQuizzes > 0 ? history.reduce((best, h) => (h.percentage || 0) > (best.percentage || 0) ? h : best, history[0]) : null;
    const totalAnswered = history.reduce((sum, h) => sum + (h.total || 0), 0);


    if (loading || fetching) {
        return (
            <section className="screen active" style={{ minHeight: 'calc(100vh - 60px)' }}>
                <div className="history-loading">
                    <div className="loading-spinner" />
                    <p>Loading history...</p>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="screen active" style={{ minHeight: 'calc(100vh - 60px)' }}>
                <motion.div className="history-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="empty-icon">🔒</div>
                    <h2>Sign In Required</h2>
                    <p>Sign in with Google to view your quiz history and track your progress over time.</p>
                    <button className="btn-secondary" onClick={() => router.push('/')}>← Back to Home</button>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="screen active" style={{ minHeight: 'calc(100vh - 60px)' }}>
            <motion.div className="history-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="screen-header">
                    <button className="btn-back" onClick={() => router.push('/')}>← Back</button>
                    <h2>📊 Quiz History</h2>
                </div>


                {totalQuizzes > 0 && (
                    <motion.div className="history-overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="ho-stat">
                            <span className="ho-num">{totalQuizzes}</span>
                            <span className="ho-label">Quizzes</span>
                        </div>
                        <div className="ho-divider" />
                        <div className="ho-stat">
                            <span className="ho-num">{avgScore}%</span>
                            <span className="ho-label">Avg Score</span>
                        </div>
                        <div className="ho-divider" />
                        <div className="ho-stat">
                            <span className="ho-num">{bestResult?.grade || '—'}</span>
                            <span className="ho-label">Best Grade</span>
                        </div>
                        <div className="ho-divider" />
                        <div className="ho-stat">
                            <span className="ho-num">{totalAnswered}</span>
                            <span className="ho-label">Questions</span>
                        </div>
                    </motion.div>
                )}

                {history.length === 0 ? (
                    <div className="history-empty">
                        <div className="empty-icon">📋</div>
                        <h3>No quizzes yet</h3>
                        <p>Complete a quiz to see your results here.</p>
                        <button className="btn-primary" onClick={() => router.push('/difficulty')}>Start a Quiz</button>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((h, i) => {
                            const date = h.createdAt?.toDate?.() || new Date();
                            const isExpanded = expandedId === h.id;


                            const correctCount = h.answers?.filter(a => a.correct).length || 0;
                            const wrongCount = h.answers?.filter(a => !a.correct && !a.skipped).length || 0;

                            const domainMap = {};
                            h.answers?.forEach(a => {
                                const q = QUESTIONS_MAP[a.questionId];
                                if (!q) return;
                                if (!domainMap[q.domain]) domainMap[q.domain] = { total: 0, correct: 0 };
                                domainMap[q.domain].total++;
                                if (a.correct) domainMap[q.domain].correct++;
                            });

                            return (
                                <motion.div
                                    key={h.id}
                                    className={`history-card ${isExpanded ? 'expanded' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <div className="history-card-header" onClick={() => setExpandedId(isExpanded ? null : h.id)} style={{ cursor: 'pointer' }}>
                                        <div className="hch-left">
                                            <span className={`diff-badge ${h.difficulty !== 'easy' ? h.difficulty : ''}`}>
                                                {h.difficulty?.charAt(0).toUpperCase() + h.difficulty?.slice(1)}
                                            </span>
                                            <span className="history-date">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {' · '}
                                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="history-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                                    </div>

                                    <div className="history-card-body">
                                        <div className={`history-grade ${h.percentage < 60 ? 'grade-f' : h.percentage < 70 ? 'grade-c' : h.percentage < 80 ? 'grade-b' : ''}`}>
                                            {h.grade}
                                        </div>
                                        <div className="history-stats">
                                            <span className="history-score">{h.score}/{h.total}</span>
                                            <span className="history-pct">{h.percentage}%</span>
                                        </div>
                                        <div className="history-mini-stats">
                                            <span className="hms correct">✓ {correctCount}</span>
                                            <span className="hms wrong">✗ {wrongCount}</span>
                                        </div>
                                        <div className="history-streak">🔥 {h.bestStreak}</div>
                                    </div>

                                    {Object.keys(domainMap).length > 0 && (
                                        <div className="history-domains">
                                            {Object.entries(domainMap).map(([domain, stats]) => (
                                                <span key={domain} className={`domain-pill ${stats.correct === stats.total ? 'perfect' : stats.correct === 0 ? 'missed' : ''}`}>
                                                    {domain} <strong>{stats.correct}/{stats.total}</strong>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                className="history-detail"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="history-detail-inner">
                                                    <h4 className="hd-title">📝 Question Review</h4>
                                                    <div className="hd-questions">
                                                        {h.answers?.map((a, qi) => {
                                                            const q = QUESTIONS_MAP[a.questionId];
                                                            if (!q) return null;
                                                            let statusClass, icon;
                                                            if (a.skipped) { statusClass = 'review-skipped'; icon = '⏭️'; }
                                                            else if (a.correct) { statusClass = 'review-correct'; icon = '✅'; }
                                                            else { statusClass = 'review-wrong'; icon = '❌'; }

                                                            const selectedText = a.skipped
                                                                ? 'Skipped (time ran out)'
                                                                : `Your answer: ${LETTERS[a.selected] || '?'}. ${q.options?.[a.selected] || 'N/A'}`;
                                                            const correctText = `Correct: ${LETTERS[q.correctAnswer]}. ${q.options[q.correctAnswer]}`;

                                                            return (
                                                                <HistoryReviewItem
                                                                    key={qi}
                                                                    index={qi}
                                                                    question={q}
                                                                    statusClass={statusClass}
                                                                    icon={icon}
                                                                    selectedText={selectedText}
                                                                    correctText={correctText}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <button
                                                        className="btn-delete-entry"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
                                                        disabled={deletingId === h.id}
                                                    >
                                                        {deletingId === h.id ? '⏳ Deleting...' : '🗑️ Delete This Entry'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </section>
    );
}

function HistoryReviewItem({ index, question, statusClass, icon, selectedText, correctText }) {
    const [showExp, setShowExp] = useState(false);
    return (
        <div className={`review-item ${statusClass}`}>
            <div className="review-q"><span className="review-icon">{icon}</span> {index + 1}. {question.question}</div>
            <div className="review-answer">{selectedText}<br /><strong>{correctText}</strong></div>
            <button className="review-explain-toggle" onClick={() => setShowExp(!showExp)}>💡 {showExp ? 'Hide' : 'Show'} Explanation</button>
            {showExp && <div className="review-explanation show">{question.explanation}</div>}
        </div>
    );
}
