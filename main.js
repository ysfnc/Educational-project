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

    render() {
        const sortedNumbers = Array.from(this.numbers).sort((a, b) => a - b);

        this.shadowRoot.innerHTML = `
            <style>
                .numbers-container {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .number {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    background-image: linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #7ab3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
                }
            </style>
            <div class="numbers-container">
                ${sortedNumbers.map(num => `<div class="number">${num}</div>`).join('')}
            </div>
        `;
    }
}

customElements.define('lotto-numbers', LottoNumbers);

document.getElementById('generator-btn').addEventListener('click', () => {
    const lottoNumbersElement = document.querySelector('lotto-numbers');
    lottoNumbersElement.generateNumbers();
    lottoNumbersElement.render();
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
