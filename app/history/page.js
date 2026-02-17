'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HistoryPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [history, setHistory] = useState([]);
    const [fetching, setFetching] = useState(true);

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
                setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error('Failed to fetch history:', err);
            }
            setFetching(false);
        }
        fetchHistory();
    }, [user, loading]);

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
                            return (
                                <motion.div
                                    key={h.id}
                                    className="history-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <div className="history-card-header">
                                        <span className={`diff-badge ${h.difficulty !== 'easy' ? h.difficulty : ''}`}>
                                            {h.difficulty?.charAt(0).toUpperCase() + h.difficulty?.slice(1)}
                                        </span>
                                        <span className="history-date">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="history-card-body">
                                        <div className={`history-grade ${h.percentage < 60 ? 'grade-f' : h.percentage < 70 ? 'grade-c' : h.percentage < 80 ? 'grade-b' : ''}`}>
                                            {h.grade}
                                        </div>
                                        <div className="history-stats">
                                            <span className="history-score">{h.score}/{h.total}</span>
                                            <span className="history-pct">{h.percentage}%</span>
                                        </div>
                                        <div className="history-streak">🔥 {h.bestStreak}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </section>
    );
}
