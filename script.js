const questionBank = {
  informatics: {
    name: "Информатика",
    questions: [
      { q: "Компьютердің негізгі есептеу құрылғысы қайсы?", a: ["Монитор", "Процессор", "Пернетақта", "Тінтуір"], correct: 1, explain: "Процессор командаларды орындайды және деректерді өңдейді." },
      { q: "HTML не үшін қолданылады?", a: ["Веб-беттің құрылымын жасауға", "Суретті бояуға ғана", "Компьютерді жөндеуге", "Интернет жылдамдығын арттыруға"], correct: 0, explain: "HTML веб-беттегі тақырып, мәтін, сілтеме сияқты элементтердің құрылымын береді." },
      { q: "Ақпараттың ең кіші өлшем бірлігі қандай?", a: ["Байт", "Килобайт", "Бит", "Мегабайт"], correct: 2, explain: "Бит — ақпараттың ең кіші өлшем бірлігі." },
      { q: "JavaScript көбіне қандай мақсатта қолданылады?", a: ["Веб-бетке интерактивтілік қосу", "Экранды тазалау", "Компьютерді өшіру ғана", "Қағаз басып шығару"], correct: 0, explain: "JavaScript батырмалар, тексерулер және динамикалық мазмұн сияқты әрекеттерді іске асырады." },
      { q: "Қауіпсіз құпиясөздің қайсысы дұрыс мысалға жақын?", a: ["123456", "password", "qwerty", "Kz!7mQ2#pL"], correct: 3, explain: "Ұзын әрі әртүрлі таңбалары бар құпиясөзді болжау қиынырақ." }
    ]
  },
  math: {
    name: "Математика",
    questions: [
      { q: "12 × 8 нешеге тең?", a: ["86", "96", "108", "92"], correct: 1, explain: "12 × 8 = 96." },
      { q: "x + 7 = 15 теңдеуіндегі x мәнін тап.", a: ["7", "8", "9", "22"], correct: 1, explain: "x = 15 − 7 = 8." },
      { q: "Қабырғасы 5 см шаршының периметрі қандай?", a: ["10 см", "15 см", "20 см", "25 см"], correct: 2, explain: "Периметр: 4 × 5 = 20 см." },
      { q: "200 санының 25%-ы нешеге тең?", a: ["25", "40", "50", "75"], correct: 2, explain: "200 × 0,25 = 50." },
      { q: "Үшбұрыш бұрыштарының қосындысы қанша?", a: ["90°", "180°", "270°", "360°"], correct: 1, explain: "Евклид геометриясында үшбұрыш бұрыштарының қосындысы 180°." }
    ]
  },
  english: {
    name: "Ағылшын тілі",
    questions: [
      { q: "Choose the correct form: She ___ a student.", a: ["am", "are", "is", "be"], correct: 2, explain: "He, she, it есімдіктерімен осы шақта 'is' қолданылады." },
      { q: "What is the plural of 'child'?", a: ["childs", "children", "childes", "childrens"], correct: 1, explain: "'Child' сөзінің көпше түрі — 'children'." },
      { q: "Choose the past form of 'go'.", a: ["goed", "gone", "went", "going"], correct: 2, explain: "'Go' етістігінің Past Simple формасы — 'went'." },
      { q: "What does 'beautiful' mean?", a: ["Әдемі", "Жылдам", "Қиын", "Қымбат"], correct: 0, explain: "'Beautiful' қазақша 'әдемі' дегенді білдіреді." },
      { q: "Complete: I have lived here ___ 2020.", a: ["for", "since", "during", "at"], correct: 1, explain: "Белгілі бір басталу уақытымен 'since' қолданылады." }
    ]
  }
};

const $ = (id) => document.getElementById(id);
const screens = ["homeScreen", "quizScreen", "resultScreen"];
let currentSubject = "informatics";
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let studentName = "";
let secondsLeft = 300;
let timerId = null;
let lastResult = null;
const letters = ["A", "B", "C", "D"];

function showScreen(id) {
  screens.forEach(screen => $(screen).classList.toggle("hidden", screen !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem("bilimTestHistory") || "[]"); }
  catch { return []; }
}

function saveHistory(item) {
  const history = getHistory();
  history.unshift(item);
  localStorage.setItem("bilimTestHistory", JSON.stringify(history.slice(0, 20)));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  const container = $("historyList");
  if (!history.length) {
    container.innerHTML = '<div class="empty-state">Әзірге нәтиже жоқ. Алғашқы тестіңді тапсырып көр!</div>';
    return;
  }
  container.innerHTML = history.map(item => `
    <div class="history-item">
      <div><strong>${escapeHTML(item.name)} · ${escapeHTML(item.subject)}</strong>
      <small>${escapeHTML(item.date)} · ${item.correct}/${item.total} дұрыс жауап</small></div>
      <div class="history-score">${item.percent}%</div>
    </div>`).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function startQuiz() {
  currentQuestions = questionBank[currentSubject].questions;
  currentIndex = 0;
  answers = Array(currentQuestions.length).fill(null);
  secondsLeft = 300;
  $("quizSubject").textContent = questionBank[currentSubject].name;
  $("timer").classList.remove("warning");
  showScreen("quizScreen");
  renderQuestion();
  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  updateTimer();
  timerId = setInterval(() => {
    secondsLeft--;
    updateTimer();
    if (secondsLeft <= 0) finishQuiz(true);
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(Math.max(0, secondsLeft) / 60);
  const seconds = Math.max(0, secondsLeft) % 60;
  $("timer").textContent = `◷ ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  $("timer").classList.toggle("warning", secondsLeft <= 60);
}

function renderQuestion() {
  const item = currentQuestions[currentIndex];
  $("questionCount").textContent = `${currentIndex + 1} / ${currentQuestions.length} сұрақ`;
  $("progressBar").style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
  $("questionText").textContent = item.q;
  $("answers").innerHTML = item.a.map((answer, index) => {
    let state = "";
    if (answers[currentIndex] !== null) {
      if (index === item.correct) state = "correct";
      else if (index === answers[currentIndex]) state = "incorrect";
    } else if (index === answers[currentIndex]) state = "selected";
    return `<button type="button" class="answer-option ${state}" data-answer="${index}" ${answers[currentIndex] !== null ? "disabled" : ""}>
      <span class="answer-letter">${letters[index]}</span><span>${escapeHTML(answer)}</span></button>`;
  }).join("");
  $("answers").querySelectorAll("[data-answer]").forEach(button => {
    button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answer)));
  });

  const feedback = $("answerFeedback");
  feedback.className = "feedback";
  if (answers[currentIndex] !== null) {
    const correct = answers[currentIndex] === item.correct;
    feedback.textContent = correct ? "Дұрыс жауап! " + item.explain : "Қате жауап. " + item.explain;
    feedback.classList.add(correct ? "good" : "bad");
  } else {
    feedback.textContent = "";
  }

  $("prevBtn").disabled = currentIndex === 0;
  $("prevBtn").style.opacity = currentIndex === 0 ? ".45" : "1";
  $("nextBtn").classList.toggle("hidden", currentIndex === currentQuestions.length - 1);
  $("finishBtn").classList.toggle("hidden", currentIndex !== currentQuestions.length - 1);
}

function chooseAnswer(index) {
  if (answers[currentIndex] !== null) return;
  answers[currentIndex] = index;
  renderQuestion();
}

function finishQuiz(timeExpired = false) {
  clearInterval(timerId);
  timerId = null;
  const correct = currentQuestions.reduce((total, q, i) => total + (answers[i] === q.correct ? 1 : 0), 0);
  const total = currentQuestions.length;
  const percent = Math.round((correct / total) * 100);
  lastResult = {
    name: studentName,
    subjectKey: currentSubject,
    subject: questionBank[currentSubject].name,
    answers: [...answers],
    correct,
    total,
    percent,
    date: new Date().toLocaleString("kk-KZ", { dateStyle: "short", timeStyle: "short" }),
    timeExpired
  };
  $("resultTitle").textContent = percent >= 80 ? "Өте жақсы, " + studentName + "!" : percent >= 50 ? "Жақсы нәтиже, " + studentName + "!" : "Жаттығуды жалғастыр, " + studentName + "!";
  $("resultSubtitle").textContent = timeExpired ? "Уақыт аяқталды. Тест нәтижесі есептелді." : "Тест аяқталды. Нәтижең төменде көрсетілген.";
  $("scorePercent").textContent = `${percent}%`;
  $("correctCount").textContent = correct;
  $("wrongCount").textContent = total - correct;
  $("scorePoints").textContent = `${correct}/${total}`;
  $("resultSymbol").textContent = percent >= 50 ? "✓" : "↗";
  $("reviewPanel").classList.add("hidden");
  $("reviewBtn").textContent = "Жауаптарды талдау";
  saveHistory({
    name: studentName, subject: questionBank[currentSubject].name, correct, total, percent,
    date: lastResult.date
  });
  showScreen("resultScreen");
}

function renderReview() {
  const list = $("reviewList");
  list.innerHTML = currentQuestions.map((q, index) => {
    const chosen = answers[index];
    const isCorrect = chosen === q.correct;
    const chosenText = chosen === null ? "Жауап берілмеді" : q.a[chosen];
    return `<div class="review-item">
      <h3>${index + 1}. ${escapeHTML(q.q)}</h3>
      <p class="${isCorrect ? "review-correct" : "review-wrong"}">${isCorrect ? "✓ Дұрыс" : "✗ Қате"} — Сенің жауабың: ${escapeHTML(chosenText)}</p>
      <p class="review-correct">Дұрыс жауап: ${escapeHTML(q.a[q.correct])}</p>
      <p>${escapeHTML(q.explain)}</p>
    </div>`;
  }).join("");
  $("reviewPanel").classList.remove("hidden");
  $("reviewBtn").textContent = "Талдауды жасыру";
}

$("startForm").addEventListener("submit", event => {
  event.preventDefault();
  studentName = $("studentName").value.trim();
  if (!studentName) {
    $("studentName").focus();
    return;
  }
  currentSubject = document.querySelector('input[name="subject"]:checked').value;
  startQuiz();
});

$("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) { currentIndex--; renderQuestion(); }
});
$("nextBtn").addEventListener("click", () => {
  if (currentIndex < currentQuestions.length - 1) { currentIndex++; renderQuestion(); }
});
$("finishBtn").addEventListener("click", () => finishQuiz(false));
$("quitBtn").addEventListener("click", () => {
  if (confirm("Тесттен шығасың ба? Ағымдағы жауаптар сақталмайды.")) {
    clearInterval(timerId);
    timerId = null;
    showScreen("homeScreen");
  }
});
$("againBtn").addEventListener("click", startQuiz);
$("homeBtn").addEventListener("click", () => showScreen("homeScreen"));
$("reviewBtn").addEventListener("click", () => {
  if ($("reviewPanel").classList.contains("hidden")) renderReview();
  else {
    $("reviewPanel").classList.add("hidden");
    $("reviewBtn").textContent = "Жауаптарды талдау";
  }
});
$("clearHistoryBtn").addEventListener("click", () => {
  if (getHistory().length && confirm("Барлық сақталған нәтижелерді өшіресің бе?")) {
    localStorage.removeItem("bilimTestHistory");
    renderHistory();
  }
});
$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  $("themeBtn").textContent = dark ? "☀️" : "🌙";
  localStorage.setItem("bilimTestDark", dark ? "1" : "0");
});

if (localStorage.getItem("bilimTestDark") === "1") {
  document.body.classList.add("dark");
  $("themeBtn").textContent = "☀️";
}
renderHistory();
