'use client';

import { useEffect, useRef } from 'react';

export default function CRTOverlay() {
    const canvasRef = useRef(null);
    const glitchRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = Math.floor(window.innerWidth / 3);
            canvas.height = Math.floor(window.innerHeight / 3);
        }
        resize();
        window.addEventListener('resize', resize);

        let animId;
        function drawNoise() {
            const w = canvas.width;
            const h = canvas.height;
            const imageData = ctx.createImageData(w, h);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = Math.random() * 18;
            }
            ctx.putImageData(imageData, 0, 0);
        }

        function renderLoop() {
            drawNoise();
            animId = requestAnimationFrame(renderLoop);
        }
        renderLoop();

        const bar = glitchRef.current;
        let glitchTimeout;
        function triggerGlitch() {
            if (!bar) return;
            const y = Math.random() * 100;
            const h = 1 + Math.random() * 4;
            const skew = (Math.random() - 0.5) * 20;
            const color = Math.random() > 0.5
                ? `rgba(0, 255, 136, ${0.08 + Math.random() * 0.12})`
                : `rgba(0, 229, 255, ${0.06 + Math.random() * 0.1})`;
            bar.style.cssText = `top:${y}%;height:${h}px;background:${color};transform:skewX(${skew}deg) translateX(${(Math.random() - 0.5) * 10}%);opacity:1;display:block;`;
            setTimeout(() => {
                bar.style.opacity = '0';
                setTimeout(() => { bar.style.display = 'none'; }, 100);
            }, 50 + Math.random() * 100);
            glitchTimeout = setTimeout(triggerGlitch, 2000 + Math.random() * 5000);
        }
        glitchTimeout = setTimeout(triggerGlitch, 1000 + Math.random() * 3000);

        let burstTimeout;
        function burst() {
            canvas.style.opacity = '0.15';
            setTimeout(() => { canvas.style.opacity = ''; }, 80 + Math.random() * 120);
            burstTimeout = setTimeout(burst, 4000 + Math.random() * 8000);
        }
        burstTimeout = setTimeout(burst, 3000 + Math.random() * 5000);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
            clearTimeout(glitchTimeout);
            clearTimeout(burstTimeout);
        };
    }, []);

    return (
        <>
            <canvas ref={canvasRef} className="static-overlay" />
            <div className="crt-overlay">
                <div className="crt-scanlines" />
                <div className="crt-flicker" />
                <div className="crt-vignette" />
            </div>
            <div ref={glitchRef} className="glitch-bar" />
        </>
    );
}
