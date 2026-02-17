'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';

const difficulties = [
    { key: 'easy', icon: '🟢', label: 'Easy', desc: 'Fundamentals & basics. Great for beginners or warm-up rounds.', timer: 30, questions: 10, detail: '💡 Core concepts' },
    { key: 'medium', icon: '🟡', label: 'Medium', desc: 'Intermediate concepts. Apply your knowledge to real scenarios.', timer: 45, questions: 10, detail: '🔧 Practical application' },
    { key: 'hard', icon: '🔴', label: 'Hard', desc: 'Advanced challenges. Deep expertise and edge cases.', timer: 60, questions: 10, detail: '🧠 Expert level' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const card = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function DifficultyPage() {
    const router = useRouter();
    const { startQuiz } = useQuiz();

    const handleStart = (diff) => {
        startQuiz(diff);
        router.push('/quiz');
    };

    return (
        <section className="screen active" style={{ minHeight: 'calc(100vh - 60px)' }}>
            <div className="screen-header">
                <button className="btn-back" onClick={() => router.push('/')}>← Back</button>
                <h2>Select Difficulty</h2>
            </div>
            <motion.div className="difficulty-grid" variants={container} initial="hidden" animate="show">
                {difficulties.map((d) => (
                    <motion.div key={d.key} className="diff-card" data-difficulty={d.key} variants={card} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                        <div className="diff-icon">{d.icon}</div>
                        <h3>{d.label}</h3>
                        <p>{d.desc}</p>
                        <ul className="diff-details">
                            <li>⏱️ {d.timer} seconds per question</li>
                            <li>📝 {d.questions} questions</li>
                            <li>{d.detail}</li>
                        </ul>
                        <motion.button
                            className="btn-start"
                            data-difficulty={d.key}
                            onClick={() => handleStart(d.key)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Start
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
