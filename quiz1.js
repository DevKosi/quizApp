document.addEventListener("DOMContentLoaded", async () => {
  const reg = localStorage.getItem("regNumber") || "TEST123";
  const quizContainer = document.getElementById("quizContent");
  const loadingState = document.getElementById("loadingState");
  const timerElement = document.getElementById("timer");
  const timerContainer = document.getElementById("timerContainer");

  quizContainer.classList.add("hidden");
  loadingState.classList.remove("hidden");

  if (localStorage.getItem(`quizSubmitted_${reg}`) === "true") {
    alert("You have already submitted the quiz. Returning to dashboard.");
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const response = await fetch("https://backbone-1.onrender.com/api/quiz");
    if (!response.ok) throw new Error("Failed to fetch quiz");
    let quizData = await response.json();

    if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error("No quiz questions found");
    }

    if (window.location.search.includes('random')) {
      quizData = [...quizData].sort(() => Math.random() - 0.5);
    }

    const questionsToShow = 15;

    function shuffleArray(array) {
      return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    quizData = shuffleArray(quizData).slice(0, Math.min(questionsToShow, quizData.length));

    let currentIndex = 0;
    const answers = new Array(quizData.length).fill(null);
    let timeLeft = 300;
    let timerInterval;

    const progressBar = document.createElement("div");
    progressBar.className = "w-full bg-gray-200 rounded-full h-2.5 mb-6";
    progressBar.innerHTML = `
      <div id="progressFill" class="bg-blue-600 h-2.5 rounded-full progress-bar" style="width: 0%"></div>
    `;
    quizContainer.parentElement.insertBefore(progressBar, quizContainer);

    renderQuestion();
    startTimer();

    loadingState.classList.add("hidden");
    quizContainer.classList.remove("hidden");

    function renderQuestion() {
      const question = quizData[currentIndex];
      const percent = ((currentIndex + 1) / quizData.length) * 100;
      document.getElementById("progressFill").style.width = `${percent}%`;

      quizContainer.innerHTML = `
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Question ${currentIndex + 1} of ${quizData.length}</h2>
          <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <p class="text-lg font-medium text-gray-700">${question.question}</p>
          </div>
          
          <div class="space-y-3">
            ${question.options.map((opt, i) => `
              <div>
                <input type="radio" name="option" value="${i}" id="option-${i}" 
                  class="hidden option-radio" ${answers[currentIndex] === i ? 'checked' : ''}>
                <label for="option-${i}" class="option-label block p-4 border border-gray-200 rounded-lg cursor-pointer bg-white">
                  ${opt}
                </label>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="mt-6 flex justify-between">
          <button ${currentIndex === 0 ? 'disabled' : ''} 
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg flex items-center ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
            onclick="prevQuestion()">
            <i class="fas fa-arrow-left mr-2"></i> Previous
          </button>
          
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center" 
            onclick="nextQuestion()">
            ${currentIndex === quizData.length - 1 ?
          '<i class="fas fa-paper-plane mr-2"></i> Submit' :
          'Next <i class="fas fa-arrow-right ml-2"></i>'}
          </button>
        </div>
      `;
    }

    function startTimer() {
      updateTimerDisplay();
      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 60) {
          timerContainer.classList.remove("bg-blue-100", "text-blue-700");
          timerContainer.classList.add("bg-red-100", "text-red-700", "pulse-warning");
        }

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          submitQuiz();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    window.nextQuestion = function () {
      const selected = document.querySelector('input[name="option"]:checked');
      if (selected) answers[currentIndex] = parseInt(selected.value);

      if (currentIndex < quizData.length - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        submitQuiz();
      }
    };

    window.prevQuestion = function () {
      const selected = document.querySelector('input[name="option"]:checked');
      if (selected) answers[currentIndex] = parseInt(selected.value);

      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    };

    async function submitQuiz() {
      clearInterval(timerInterval);

      const total = quizData.length;
      let score = 0;
      for (let i = 0; i < total; i++) {
        if (answers[i] === quizData[i].correctAnswer) score++;
      }

      quizContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <div class="animate-bounce mb-6">
            <i class="fas fa-paper-plane text-blue-500 text-5xl"></i>
          </div>
          <p class="text-lg font-medium text-gray-700 mb-4">Submitting your answers...</p>
        </div>
      `;

      try {
        const submissionData = {
          regNumber: reg,
          score,
          total,
          timestamp: new Date().toISOString(),
          department: localStorage.getItem("department")
        };

        // Only add fullName if it exists in localStorage
        const fullName = localStorage.getItem("fullName");
        if (fullName) {
          submissionData.fullName = fullName;
        }

        const res = await fetch("https://backbone-1.onrender.com/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData)
        });

        if (!res.ok) throw new Error("Failed to submit results");

        localStorage.setItem(`quizSubmitted_${reg}`, "true");
        sessionStorage.setItem(`quizCompleted_${reg}`, "true");
        localStorage.setItem("lastSubmissionTime", Date.now());
        document.cookie = `quizSubmitted_${reg}=true; max-age=${60 * 60 * 24 * 30}`;

        quizContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i class="fas fa-check text-green-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Quiz Submitted Successfully!</h3>
            <p class="text-gray-600 mb-6">Your score: <span class="font-bold">${score} / ${total}</span></p>
            <button onclick="window.location.href='dashboard.html'" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center">
              <i class="fas fa-home mr-2"></i> Back to Dashboard
            </button>
          </div>
        `;
      } catch (err) {
        quizContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Submission Error</h3>
            <p class="text-gray-600 mb-4">${err.message}</p>
            <button onclick="window.location.href='dashboard.html'" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center">
              <i class="fas fa-home mr-2"></i> Back to Dashboard
            </button>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error("Error loading quiz:", err);
    loadingState.innerHTML = `
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-1">Error Loading Quiz</h3>
        <p class="text-gray-600 mb-4">${err.message}</p>
        <button onclick="window.location.href='dashboard.html'" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center mx-auto">
          <i class="fas fa-home mr-2"></i> Back to Dashboard
        </button>
      </div>
    `;
  }
});
