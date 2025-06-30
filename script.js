// ========== DATA ========== //
const questions = [
    {
        question: "Apa nama ibukota Indonesia?",
        options: ["Jakarta", "Bandung", "Surabaya"],
        answer: "Jakarta"
    },
    {
        question: "2 + 2 * 2 = ?",
        options: ["3", "4", "6"],
        answer: "6"
    },
    {
        question: "1 + 1 * 0 = ?",
        options: ["1", "0", "2"],
        answer: "1"
    },
    {
        question: "7 + 3 * 2 : 2 = ?",
        options: ["10", "9", "8"],
        answer: "10"
    },
    {
        question: "Penulis novel 'Laskar Pelangi'?",
        options: ["Tere Liye", "Andrea Hirata", "Dee Lestari"],
        answer: "Andrea Hirata"
    }
];

let users = JSON.parse(localStorage.getItem("quizUsers")) || [];
let scores = JSON.parse(localStorage.getItem("quizScores")) || [];
let currentUser = localStorage.getItem("currentUser");
let currentQuestion = 0;
let score = 0;

// ========== AUTH SYSTEM ========== //
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();

    if (username) {
        localStorage.setItem("currentUser", username);
        // Set flag agar quiz.html tahu harus autoplay musik
        localStorage.setItem("playQuizMusic", "yes");
        window.location.href = "quiz.html";
    } else {
        document.getElementById("authError").textContent = "Masukkan username!";
    }
});

// ========== QUIZ SYSTEM ========== //
if (window.location.pathname.includes("quiz.html")) {
    if (!currentUser) window.location.href = "index.html";

    const scoreDisplay = document.getElementById("score-display");
    let selectedAnswer = null;
    let isAnswered = false;
    
    function loadQuestion() {
        selectedAnswer = null;
        isAnswered = false;
        document.getElementById("next-btn").style.display = "none";
        
        const question = questions[currentQuestion];
        document.getElementById("quiz-progress").textContent = `Soal ${currentQuestion + 1} / ${questions.length}`;
        
        let optionsHTML = '';
        question.options.forEach((option, idx) => {
            optionsHTML += `
                <div class="option-box" data-answer="${option}">
                    ${option}
                </div>
            `;
        });
        
        document.getElementById("question-container").innerHTML = `
            <h3>${question.question}</h3>
            <div class="options">${optionsHTML}</div>
        `;

        // Event listener untuk opsi jawaban
        document.querySelectorAll('.option-box').forEach(box => {
            box.addEventListener('click', () => {
                if (isAnswered) return;
                
                selectedAnswer = box.dataset.answer;
                const isCorrect = selectedAnswer === question.answer;
                
                // Tandai jawaban benar/salah
                box.classList.add(isCorrect ? 'correct' : 'incorrect');
                
                // Update skor jika benar
                if (isCorrect) {
                    score += 20;
                    scoreDisplay.textContent = `Skor: ${score}`;
                }
                
                // Tampilkan tombol "Lanjut"
                document.getElementById("next-btn").style.display = "block";
                isAnswered = true;
                clearInterval(timerInterval); // Stop timer saat sudah dijawab
            });
        });

        // MULAI TIMER SETIAP SOAL
        startTimer(15); // <-- ubah ke 15 detik
    }

    document.getElementById("next-btn").addEventListener("click", () => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            // Simpan skor dan redirect ke leaderboard
            scores.push({ username: currentUser, score });
            localStorage.setItem("quizScores", JSON.stringify(scores));
            window.location.href = "leaderboard.html";
        }
    });

    // Timer Quiz
    let timerInterval;
    let timeLeft = 15; // waktu dalam detik (misal: 60 detik per soal atau total)

    function startTimer(duration = 15) {
        clearInterval(timerInterval);
        timeLeft = duration;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Otomatis lanjut soal berikutnya atau akhiri quiz
                handleTimeUp();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
            const sec = String(timeLeft % 60).padStart(2, '0');
            timerEl.textContent = `Waktu: ${min}:${sec}`;
        }
    }

    // Fungsi jika waktu habis
    function handleTimeUp() {
        // Otomatis klik tombol next jika ada
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
        }
    }

    loadQuestion();

    const qm = document.getElementById('qm');
    const musicBtn = document.getElementById('musicBtn');

    if (qm) {
        qm.volume = 0.5;

        // Coba autoplay jika flag ada
        if (localStorage.getItem("playQuizMusic") === "yes") {
            qm.play().catch(() => {});
            localStorage.removeItem("playQuizMusic");
        }

        // Kontrol tombol play/pause
        if (musicBtn) {
            musicBtn.addEventListener("click", () => {
                if (qm.paused) {
                    qm.play();
                    musicBtn.textContent = "🔇";
                } else {
                    qm.pause();
                    musicBtn.textContent = "🔊";
                }
            });
            // Sinkron label tombol dengan status musik
            qm.onpause = () => { musicBtn.textContent = "🔊"; };
            qm.onplay = () => { musicBtn.textContent = "🔇"; };
        }
    }

}

// ========== LEADERBOARD ========== //
if (window.location.pathname.includes("leaderboard.html")) {
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const tbody = document.querySelector("#leaderboard tbody");
    
    sortedScores.forEach((user, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${user.username}</td>
            <td>${user.score}</td>
        `;
        tbody.appendChild(row);
    });

}


function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function resetLeaderboard() {
    if (confirm("Yakin ingin reset leaderboard?")) {
        localStorage.removeItem("quizScores");
        location.reload();
    }
}

function startMarioBackground(canvasId = "mario-bg") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- Cloud Data ---
    const clouds = [
        { x: 80, y: 60, speed: 0.2, size: 60 },
        { x: 350, y: 90, speed: 0.15, size: 80 },
        { x: 700, y: 40, speed: 0.18, size: 50 }
    ];

    // --- Draw Functions ---
    function drawSky() {
        ctx.fillStyle = "#5c94fc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawCloud(cloud) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.size, cloud.size/2, 0, 0, Math.PI*2);
        ctx.ellipse(cloud.x+cloud.size/2, cloud.y+10, cloud.size/2, cloud.size/3, 0, 0, Math.PI*2);
        ctx.ellipse(cloud.x-cloud.size/2, cloud.y+10, cloud.size/2, cloud.size/3, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }

    function drawHill(x, y, r, color="#3cb043") {
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#217a2b";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    function drawGround() {
        const blockSize = 48;
        const y = canvas.height - blockSize;
        for (let x = 0; x < canvas.width; x += blockSize) {
            ctx.fillStyle = '#b3541e';
            ctx.fillRect(x, y, blockSize, blockSize);
            ctx.fillStyle = '#ffb347';
            ctx.fillRect(x+4, y+4, blockSize-8, blockSize-8);
            ctx.strokeStyle = "#a85a2e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y + blockSize/2);
            ctx.lineTo(x + blockSize, y + blockSize/2);
            ctx.moveTo(x + blockSize/3, y);
            ctx.lineTo(x + blockSize/3, y + blockSize);
            ctx.moveTo(x + 2*blockSize/3, y);
            ctx.lineTo(x + 2*blockSize/3, y + blockSize);
            ctx.stroke();
        }
    }

    function drawPipe(x, y, height = 64) {
        ctx.fillStyle = "#2ecc40";
        ctx.fillRect(x, y - height, 32, height);
        ctx.fillStyle = "#3dff70";
        ctx.fillRect(x - 8, y - height - 16, 48, 16);
        ctx.strokeStyle = "#169c2b";
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 8, y - height - 16, 48, 16);
    }

    function drawStairs(x, y, steps = 6, block = 24) {
        for (let i = 0; i < steps; i++) {
            for (let j = 0; j <= i; j++) {
                ctx.fillStyle = "#b3541e";
                ctx.fillRect(x + i*block, y - j*block, block, block);
                ctx.fillStyle = "#ffb347";
                ctx.fillRect(x + i*block + 3, y - j*block + 3, block-6, block-6);
            }
        }
    }

    function drawFlagPole(x, y, height = 180) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y - height, 6, height);
        ctx.beginPath();
        ctx.arc(x + 3, y - height, 8, 0, Math.PI*2);
        ctx.fillStyle = "#fff700";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 6, y - height + 10);
        ctx.lineTo(x + 46, y - height + 25);
        ctx.lineTo(x + 6, y - height + 40);
        ctx.closePath();
        ctx.fillStyle = "#e74c3c";
        ctx.fill();
    }

    function drawCastle(x, y) {
        ctx.fillStyle = "#b3541e";
        ctx.fillRect(x, y - 60, 80, 60);
        ctx.fillStyle = "#333";
        ctx.fillRect(x + 32, y - 30, 16, 30);
        ctx.fillStyle = "#b3541e";
        ctx.fillRect(x - 16, y - 80, 24, 40);
        ctx.fillRect(x + 72, y - 80, 24, 40);
        ctx.beginPath();
        ctx.arc(x - 4, y - 80, 12, Math.PI, 2*Math.PI);
        ctx.arc(x + 84, y - 80, 12, Math.PI, 2*Math.PI);
        ctx.fillStyle = "#ffb347";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillRect(x + 10, y - 50, 10, 10);
        ctx.fillRect(x + 60, y - 50, 10, 10);
    }

    function drawTree(x, y) {
        ctx.fillStyle = "#b3541e";
        ctx.fillRect(x + 14, y - 32, 8, 32);
        ctx.beginPath();
        ctx.arc(x + 18, y - 38, 20, Math.PI, 2 * Math.PI);
        ctx.arc(x + 8, y - 28, 12, 0, 2 * Math.PI);
        ctx.arc(x + 28, y - 28, 12, 0, 2 * Math.PI);
        ctx.fillStyle = "#27ae60";
        ctx.fill();
        ctx.strokeStyle = "#145a32";
        ctx.stroke();
    }

    function animate() {
        drawSky();

        clouds.forEach(cloud => {
            drawCloud(cloud);
            cloud.x += cloud.speed;
            if (cloud.x - cloud.size > canvas.width) {
                cloud.x = -cloud.size;
            }
        });

        drawHill(120, canvas.height - 24, 60, "#3cb043");
        drawHill(300, canvas.height - 16, 40, "#5fd068");
        drawHill(canvas.width - 200, canvas.height - 20, 70, "#3cb043");

        drawGround();

        drawPipe(200, canvas.height - 48, 80);

        drawStairs(canvas.width - 320, canvas.height - 48, 6, 24);

        drawFlagPole(canvas.width - 120, canvas.height - 48, 180);

        drawCastle(canvas.width - 60, canvas.height - 48);

        drawTree(400, canvas.height - 48);
        drawTree(canvas.width - 500, canvas.height - 48);

        requestAnimationFrame(animate);
    }
    animate();
}

// Jalankan otomatis jika ada canvas mario-bg
window.addEventListener("DOMContentLoaded", () => {
    startMarioBackground("mario-bg");
});