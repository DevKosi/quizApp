document.addEventListener("DOMContentLoaded", () => {
  const reg = localStorage.getItem("regNumber");
  const name = localStorage.getItem("fullName");
  const userDisplay = document.getElementById("userName");
  const startBtn = document.getElementById("startQuizBtn");
  const resultBtn = document.getElementById("viewResultBtn");
  const quizStatus = document.getElementById("quizStatus");

  // Check if user is logged in
  if (!reg) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  // Show name
  userDisplay.textContent = name;

  // Add loading spinner
  startBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Checking status...';
  startBtn.disabled = true;

  // Always check from server on page load
  // Only use localStorage to determine if quiz is already submitted
  if (localStorage.getItem(`quizSubmitted_${reg}`) === "true") {
    disableQuizButton(startBtn);
    resultBtn?.classList.remove("hidden");
    quizStatus?.classList.remove("hidden");
  } else {
    enableQuizButton(startBtn);
  }
})

function disableQuizButton(btn) {
  btn.disabled = true;
  btn.classList.remove("bg-blue-600", "hover:bg-blue-700", "pulse-animation");
  btn.classList.add("bg-gray-400", "cursor-not-allowed");
  btn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Quiz Completed';
}

function enableQuizButton(btn) {
  btn.disabled = false;
  btn.classList.add("bg-blue-600", "hover:bg-blue-700", "pulse-animation");
  btn.classList.remove("bg-gray-400", "cursor-not-allowed");
  btn.innerHTML = '<i class="fas fa-play-circle mr-2"></i> Start Quiz';
}

function startQuiz() {
  window.location.href = "quiz1.html?random=" + Math.random();
}

function viewResult() {
  window.location.href = "result.html";
}

function logout() {
  localStorage.removeItem("regNumber");
  localStorage.removeItem("department");
  localStorage.removeItem("quizSubmitted");
  window.location.href = "login.html";
}
