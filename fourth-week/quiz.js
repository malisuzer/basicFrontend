// Task 4.2: Q-Line HR Assessment Logic

// 1. Veri Yapısı (Data Structure) - Array of Objects
const quizData = [
  {
    id: 1,
    question:
      "Hangisi geçerli bir JavaScript değişken tanımlama anahtar kelimesi DEĞİLDİR?",
    options: ["var", "let", "const", "integer"],
    correctAnswer: "integer",
    points: 25,
  },
  {
    id: 2,
    question:
      "HTML elementlerini JavaScript ile seçmek için hangisi kullanılır?",
    options: [
      "document.getElementById",
      "window.selectComponent",
      "console.log",
      "body.getElement",
    ],
    correctAnswer: "document.getElementById",
    points: 25,
  },
  {
    id: 3,
    question: "CSS'de 'margin: 10px 20px' ifadesi ne anlama gelir?",
    options: [
      "Her yönden 10px boşluk",
      "Üst/Alt: 10px, Sağ/Sol: 20px",
      "Üst/Alt: 20px, Sağ/Sol: 10px",
      "Sadece Üst: 10px, Sol: 20px",
    ],
    correctAnswer: "Üst/Alt: 10px, Sağ/Sol: 20px",
    points: 25,
  },
  {
    id: 4,
    question: "Hangi array metodu dizinin sonuna eleman ekler?",
    options: ["pop()", "shift()", "push()", "unshift()"],
    correctAnswer: "push()",
    points: 25,
  },
];

// State Management
let currentQuestionIndex = 0;
let totalScore = 0;

// DOM Elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const questionNumberEl = document.getElementById("question-number");
const scoreBoardEl = document.getElementById("score-board");
const questionTextEl = document.getElementById("question-text");
const optionsContainerEl = document.getElementById("options-container");
const finalScoreEl = document.getElementById("final-score");
const feedbackTextEl = document.getElementById("feedback-text");

// 2. Akış Kontrolü (Event Handling)

// Başlat Butonu
startBtn.addEventListener("click", startQuiz);

function startQuiz() {
  startScreen.classList.add("hidden");
  startScreen.classList.remove("active");

  quizScreen.classList.remove("hidden");
  quizScreen.classList.add("active");

  currentQuestionIndex = 0;
  totalScore = 0;
  updateScoreBoard();
  loadQuestion();
}

function loadQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];

  // Update Progress
  questionNumberEl.textContent = `Soru ${currentQuestionIndex + 1}/${quizData.length}`;

  // Set Question Text
  questionTextEl.textContent = currentQuestion.question;

  // Clear previous options
  optionsContainerEl.innerHTML = "";

  // Create Option Buttons
  currentQuestion.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option-btn");
    btn.onclick = () => selectOption(option);
    optionsContainerEl.appendChild(btn);
  });
}

function selectOption(selectedOption) {
  const currentQuestion = quizData[currentQuestionIndex];

  // 3. Puanlama Sistemi
  if (selectedOption === currentQuestion.correctAnswer) {
    totalScore += currentQuestion.points;
    // Visual Feedback (Simulated via class for a split second before moving)
    // In a real app we might want to show correct/incorrect colors first
  }

  updateScoreBoard();

  // Next Question or End
  currentQuestionIndex++;

  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function updateScoreBoard() {
  scoreBoardEl.textContent = `Puan: ${totalScore}`;
}

function showResults() {
  quizScreen.classList.add("hidden");
  quizScreen.classList.remove("active");

  resultScreen.classList.remove("hidden");
  resultScreen.classList.add("active");

  // Animate Score
  animateValue(finalScoreEl, 0, totalScore, 1000);

  // Feedback Message
  if (totalScore === 100) {
    feedbackTextEl.textContent = "Mükemmel! Tam Puan!";
    feedbackTextEl.style.color = "var(--accent-color)";
  } else if (totalScore >= 75) {
    feedbackTextEl.textContent = "Harika İş! Başarılı oldunuz.";
    feedbackTextEl.style.color = "green";
  } else {
    feedbackTextEl.textContent = "Daha fazla çalışmalısınız.";
    feedbackTextEl.style.color = "red";
  }
}

// Helper: Score Animation
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}
