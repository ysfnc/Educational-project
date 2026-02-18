// Lotto ball color based on Korean Lotto number ranges
function getBallColor(num) {
    if (num <= 10) return ['#fbbf24', '#f59e0b']; // yellow
    if (num <= 20) return ['#60a5fa', '#3b82f6']; // blue
    if (num <= 30) return ['#f87171', '#ef4444']; // red
    if (num <= 40) return ['#a78bfa', '#8b5cf6']; // purple
    return ['#34d399', '#10b981']; // green
}

class LottoNumbers extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.numbers = new Set();
        this.generateNumbers();
        this.render();
    }

    generateNumbers() {
        this.numbers.clear();
        while (this.numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            this.numbers.add(randomNumber);
        }
    }

    render(animate = false) {
        const sortedNumbers = Array.from(this.numbers).sort((a, b) => a - b);

        this.shadowRoot.innerHTML = `
            <style>
                .numbers-container {
                    display: flex;
                    justify-content: center;
                    gap: 0.7rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }
                .ball {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.3rem;
                    font-weight: 800;
                    font-family: 'Inter', -apple-system, sans-serif;
                    color: #fff;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                    position: relative;
                    opacity: ${animate ? 0 : 1};
                    transform: ${animate ? 'scale(0) rotate(-180deg)' : 'scale(1) rotate(0)'};
                    transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .ball::after {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 12px;
                    width: 18px;
                    height: 8px;
                    background: rgba(255,255,255,0.35);
                    border-radius: 50%;
                    transform: rotate(-20deg);
                }
                .ball.show {
                    opacity: 1;
                    transform: scale(1) rotate(0);
                }
            </style>
            <div class="numbers-container">
                ${sortedNumbers.map((num, i) => {
                    const [c1, c2] = getBallColor(num);
                    return `<div class="ball ${animate ? '' : 'show'}"
                        style="background: linear-gradient(145deg, ${c1}, ${c2});
                               box-shadow: 0 4px 15px ${c2}66;
                               transition-delay: ${animate ? i * 0.1 : 0}s;">${num}</div>`;
                }).join('')}
            </div>
        `;

        if (animate) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.shadowRoot.querySelectorAll('.ball').forEach(ball => {
                        ball.classList.add('show');
                    });
                });
            });
        }
    }
}

customElements.define('lotto-numbers', LottoNumbers);

document.getElementById('generator-btn').addEventListener('click', () => {
    const lottoNumbersElement = document.querySelector('lotto-numbers');
    lottoNumbersElement.generateNumbers();
    lottoNumbersElement.render(true);
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
});
