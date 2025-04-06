let questions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;
let autoNextTimeout;
let username = localStorage.getItem("quizUser") || "Guest";

console.log("✅ script.js loaded");

// Handle screen transitions
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  const screenToShow = document.getElementById(id);
  if (screenToShow) {
    screenToShow.classList.add("active");
  }
}

// Load JSON and start quiz
async function startQuiz() {
  console.log("🚀 startQuiz() triggered");
  score = 0;
  currentQuestionIndex = 0;
  clearInterval(timer);
  clearTimeout(autoNextTimeout);
  document.getElementById("message").innerText = "";

  const category = document.getElementById("category-select")?.value || "any";
  const difficulty = document.getElementById("difficulty-select")?.value || "any";

  try {
    const res = await fetch("data.json");
    questions = await res.json();
  } catch (err) {
    console.error("❌ Failed to load data.json", err);
    alert("Error loading questions.");
    return;
  }

  filteredQuestions = questions.filter(q => {
    const catMatch = category === "any" || q.category === category;
    const diffMatch = difficulty === "any" || q.difficulty === difficulty;
    return catMatch && diffMatch;
  });

  if (filteredQuestions.length === 0) {
    alert("No questions found for the selected filters. Try again!");
    location.reload();
    return;
  }

  filteredQuestions = shuffleArray(filteredQuestions).slice(0, 10);

  showScreen("quiz-screen");
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timer);
  clearTimeout(autoNextTimeout);
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("message").innerText = "";

  const question = filteredQuestions[currentQuestionIndex];
  document.getElementById("question").innerText = `Q${currentQuestionIndex + 1}. ${question.question}`;

  document.body.classList.remove("easy", "medium", "hard");
  document.body.classList.add(question.difficulty);

  timeLeft = question.difficulty === "easy" ? 25 : question.difficulty === "medium" ? 20 : 15;
  document.getElementById("time").innerText = timeLeft;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  const shuffledOptions = shuffleArray(question.options);
  shuffledOptions.forEach(option => {
    const button = document.createElement("button");
    button.innerText = option;
    button.onclick = () => checkAnswer(option);
    optionsContainer.appendChild(button);
  });

  startTimer();
}

function startTimer() {
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.getElementById("time").innerText = timeLeft;
    } else {
      clearInterval(timer);
      timeUp();
    }
  }, 1000);
}

function timeUp() {
  document.getElementById("time").innerText = "0";
  document.getElementById("timer").style.color = "red";
  checkAnswer("Time's Up");
}

function checkAnswer(selectedOption) {
  clearInterval(timer);
  clearTimeout(autoNextTimeout);

  const correctAnswer = filteredQuestions[currentQuestionIndex].answer;
  const buttons = document.querySelectorAll("#options button");

  buttons.forEach(button => {
    if (button.innerText === correctAnswer) {
      button.style.backgroundColor = "#4CAF50";
    } else if (button.innerText === selectedOption) {
      button.style.backgroundColor = "#f44336";
    }
    button.disabled = true;
  });

  const message = document.getElementById("message");

  if (selectedOption === correctAnswer) {
    score++;
    playSound("correct");
    message.innerText = "✅ Correct!";
    message.className = "message correct";
  } else if (selectedOption === "Time's Up") {
    playSound("wrong");
    message.innerText = "⏰ Time’s Up!";
    message.className = "message times-up";
  } else {
    playSound("wrong");
    message.innerText = "❌ Wrong!";
    message.className = "message wrong";
  }

  document.getElementById("next-btn").style.display = "inline-block";

  autoNextTimeout = setTimeout(() => {
    message.innerText = "";
    nextQuestion();
  }, 5000);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < filteredQuestions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  clearInterval(timer);
  clearTimeout(autoNextTimeout);

  showScreen("result-screen");

  const percent = Math.round((score / filteredQuestions.length) * 100);
  document.getElementById("score-text").innerText = `${username}, you scored ${score}/${filteredQuestions.length} (${percent}%)`;

  const bestScore = parseInt(localStorage.getItem("highScore")) || 0;
  if (score > bestScore) {
    localStorage.setItem("highScore", score);
  }
  document.getElementById("high-score").innerText = `Best Score: ${localStorage.getItem("highScore")}`;

  if (percent >= 70) {
    const voices = ["audio/naruto.mp3", "audio/goku.mp3", "audio/luffy.mp3"];
    const randomVoice = voices[Math.floor(Math.random() * voices.length)];
    const audio = new Audio(randomVoice);
    audio.play();
  }

  saveToLeaderboard(username, score);
  document.body.classList.remove("easy", "medium", "hard");
}

function playSound(type) {
  const audio = new Audio(type === "correct" ? "audio/correct.mp3" : "audio/wrong.mp3");
  audio.play();
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function saveToLeaderboard(user, score) {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ user, score, date: new Date().toLocaleString() });
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

window.startQuiz = startQuiz;

function goToHomepage() {
  window.location.href = "index.html";
}

