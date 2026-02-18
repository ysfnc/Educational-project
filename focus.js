// 집중 타이머 앱

// --- 상태 ---
let timerInterval = null;
let elapsedSeconds = 0;
let isRunning = false;
let sessionStartTime = null;
let midLogs = []; // 진행 중 메모 목록
const MAX_SECONDS = 60 * 60; // 1시간
const STORAGE_KEY = 'focusSessions';

// --- DOM 요소 ---
const timerText = document.getElementById('timer-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const finishBtn = document.getElementById('finish-btn');
const timerScreen = document.getElementById('timer-screen');
const recordScreen = document.getElementById('record-screen');
const historyScreen = document.getElementById('history-screen');
const sessionDuration = document.getElementById('session-duration');
const focusNote = document.getElementById('focus-note');
const saveBtn = document.getElementById('save-btn');
const discardBtn = document.getElementById('discard-btn');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const progressFill = document.querySelector('.progress-ring-fill');
const tabBtns = document.querySelectorAll('.tab-btn');

// 진행 중 메모 요소
const midLogSection = document.getElementById('mid-log-section');
const midLogInput = document.getElementById('mid-log-input');
const midLogAddBtn = document.getElementById('mid-log-add-btn');
const midLogList = document.getElementById('mid-log-list');
const recordMidLogs = document.getElementById('record-mid-logs');
const recordMidLogList = document.getElementById('record-mid-log-list');

// 원 둘레 (프로그레스 링)
const CIRCUMFERENCE = 2 * Math.PI * 108;

// --- 타이머 함수 ---
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateDisplay() {
    timerText.textContent = formatTime(elapsedSeconds);
    const progress = elapsedSeconds / MAX_SECONDS;
    const offset = CIRCUMFERENCE * (1 - progress);
    progressFill.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;

    if (!sessionStartTime) {
        sessionStartTime = new Date();
        midLogs = [];
        renderMidLogs();
    }

    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
    finishBtn.style.display = 'inline-block';
    midLogSection.style.display = 'block';

    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateDisplay();

        if (elapsedSeconds >= MAX_SECONDS) {
            triggerAlarm();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;

    pauseBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = '계속';
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedSeconds = 0;
    sessionStartTime = null;
    midLogs = [];

    updateDisplay();
    startBtn.style.display = 'inline-block';
    startBtn.textContent = '시작';
    pauseBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    finishBtn.style.display = 'none';
    midLogSection.style.display = 'none';
    midLogInput.value = '';
    renderMidLogs();
}

// --- 진행 중 메모 ---
function addMidLog() {
    const text = midLogInput.value.trim();
    if (!text) return;

    midLogs.push({
        time: elapsedSeconds,
        note: text
    });

    midLogInput.value = '';
    renderMidLogs();
    midLogInput.focus();
}

function removeMidLog(index) {
    midLogs.splice(index, 1);
    renderMidLogs();
}

function renderMidLogs() {
    if (midLogs.length === 0) {
        midLogList.innerHTML = '';
        return;
    }

    midLogList.innerHTML = midLogs.map((log, i) => `
        <li class="mid-log-item">
            <span class="mid-log-time">${formatTime(log.time)}</span>
            <span class="mid-log-note">${escapeHtml(log.note)}</span>
            <button class="mid-log-remove" onclick="removeMidLog(${i})">✕</button>
        </li>
    `).join('');
}

// --- 알람 ---
function playAlarmSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const beepTimes = [0, 0.3, 0.6, 1.2, 1.5, 1.8];
    beepTimes.forEach(time => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.value = time < 1 ? 880 : 1047;
        gain.gain.value = 0.3;

        osc.start(audioCtx.currentTime + time);
        osc.stop(audioCtx.currentTime + time + 0.15);
    });
}

function triggerAlarm() {
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;

    playAlarmSound();

    document.querySelector('.focus-container').classList.add('alarm-flash');
    setTimeout(() => {
        document.querySelector('.focus-container').classList.remove('alarm-flash');
    }, 2500);

    showRecordScreen();
}

// --- 화면 전환 ---
function showScreen(screenId) {
    [timerScreen, recordScreen, historyScreen].forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showRecordScreen() {
    const duration = formatTime(elapsedSeconds);
    sessionDuration.textContent = `집중 시간: ${duration}`;
    focusNote.value = '';
    showScreen('record-screen');

    // 진행 중 메모가 있으면 요약 표시
    if (midLogs.length > 0) {
        recordMidLogs.style.display = 'block';
        recordMidLogList.innerHTML = midLogs.map(log => `
            <li class="mid-log-item">
                <span class="mid-log-time">${formatTime(log.time)}</span>
                <span class="mid-log-note">${escapeHtml(log.note)}</span>
            </li>
        `).join('');
    } else {
        recordMidLogs.style.display = 'none';
    }

    tabBtns.forEach(btn => btn.classList.remove('active'));
}

function showTimerScreen() {
    showScreen('timer-screen');
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === 'timer');
    });
}

function showHistoryScreen() {
    renderHistory();
    showScreen('history-screen');
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === 'history');
    });
}

// --- 데이터 저장 ---
function getSessions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function saveCurrentSession(note) {
    const sessions = getSessions();
    const endTime = new Date();

    sessions.push({
        id: crypto.randomUUID(),
        startTime: sessionStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsedSeconds,
        note: note.trim(),
        logs: midLogs.slice()
    });

    saveSessions(sessions);
}

function deleteSession(id) {
    const sessions = getSessions().filter(s => s.id !== id);
    saveSessions(sessions);
    renderHistory();
}

function clearAllSessions() {
    if (confirm('모든 기록을 삭제하시겠습니까?')) {
        saveSessions([]);
        renderHistory();
    }
}

// --- 기록 목록 렌더링 ---
function renderHistory() {
    const sessions = getSessions();

    if (sessions.length === 0) {
        historyList.innerHTML = '';
        historyEmpty.style.display = 'block';
        clearHistoryBtn.style.display = 'none';
        return;
    }

    historyEmpty.style.display = 'none';
    clearHistoryBtn.style.display = 'block';

    // 날짜별 그룹핑
    const groups = {};
    sessions.slice().reverse().forEach(session => {
        const date = new Date(session.startTime);
        const dateKey = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(session);
    });

    let html = '';
    for (const [date, items] of Object.entries(groups)) {
        html += `<div class="history-date-group">`;
        html += `<div class="history-date">${date}</div>`;

        items.forEach(session => {
            const startTime = new Date(session.startTime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const duration = formatTime(session.duration);
            const noteHtml = escapeHtml(session.note || '(메모 없음)');
            const logs = session.logs || [];

            let logsHtml = '';
            if (logs.length > 0) {
                logsHtml = `<div class="history-logs">`;
                logs.forEach(log => {
                    logsHtml += `<div class="history-log-item">
                        <span class="history-log-time">${formatTime(log.time)}</span>
                        <span class="history-log-note">${escapeHtml(log.note)}</span>
                    </div>`;
                });
                logsHtml += `</div>`;
            }

            html += `
                <div class="history-card">
                    <div class="history-card-header">
                        <span class="history-time">${startTime}</span>
                        <span class="history-duration">${duration}</span>
                        <button class="history-delete-btn" onclick="deleteSession('${session.id}')" title="삭제">✕</button>
                    </div>
                    ${logsHtml}
                    <div class="history-note">${noteHtml}</div>
                </div>
            `;
        });

        html += `</div>`;
    }

    historyList.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- 이벤트 리스너 ---

// 타이머 컨트롤
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// 종료 버튼 (수동 종료)
finishBtn.addEventListener('click', () => {
    if (elapsedSeconds > 0) {
        triggerAlarm();
    }
});

// 탭 네비게이션
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'timer') showTimerScreen();
        if (tab === 'history') showHistoryScreen();
    });
});

// 진행 중 메모
midLogAddBtn.addEventListener('click', addMidLog);
midLogInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        addMidLog();
    }
});

// 기록 저장
saveBtn.addEventListener('click', () => {
    saveCurrentSession(focusNote.value);
    resetTimer();
    showTimerScreen();
});

discardBtn.addEventListener('click', () => {
    resetTimer();
    showTimerScreen();
});

// 전체 기록 삭제
clearHistoryBtn.addEventListener('click', clearAllSessions);

// --- 테마 토글 ---
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

// --- 초기화 ---
updateDisplay();
