'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuiz } from '@/context/QuizContext';

const phrases = [
  'initializing security modules...',
  'loading vulnerability database...',
  'scanning knowledge vectors...',
  'ready for assessment...',
  'select difficulty to begin...'
];

export default function LandingPage() {
  const router = useRouter();
  const { totalQuestions, totalDomains } = useQuiz();
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let pi = 0, ci = 0, deleting = false;
    let timeout;

    function tick() {
      const phrase = phrases[pi];
      if (!deleting) {
        setTypedText(phrase.slice(0, ci + 1));
        ci++;
        if (ci === phrase.length) {
          deleting = true;
          timeout = setTimeout(tick, 2000);
          return;
        }
      } else {
        setTypedText(phrase.slice(0, ci - 1));
        ci--;
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      timeout = setTimeout(tick, deleting ? 30 : 60);
    }
    tick();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="screen active" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="terminal-bg">
        <div className="scan-line" />
      </div>
      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="logo-wrapper">
          <motion.div
            className="shield-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            🛡️
          </motion.div>
          <h1 className="glitch-text" data-text="CyberSec Arena">CyberSec Arena</h1>
          <p className="tagline">
            Test your cybersecurity knowledge across{' '}
            <span className="highlight-count">{totalDomains}+</span> domains
          </p>
        </div>

        <motion.div
          className="stats-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-item">
            <span className="stat-num">{totalQuestions}</span>
            <span className="stat-label">Questions</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{totalDomains}</span>
            <span className="stat-label">Domains</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">3</span>
            <span className="stat-label">Difficulty Levels</span>
          </div>
        </motion.div>

        <motion.button
          className="btn-primary pulse-glow"
          onClick={() => router.push('/difficulty')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="btn-icon">⚡</span> Test Me
        </motion.button>

        <div className="terminal-prompt">
          <span className="prompt-symbol">$</span>
          <span className="typing-text">{typedText}</span>
          <span className="cursor-blink">_</span>
        </div>
      </motion.div>
    </section>
  );
}
