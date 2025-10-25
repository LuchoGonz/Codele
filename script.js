let challenge = null;
let attempts = 0;
const maxAttempts = 6;
let streak = parseInt(localStorage.getItem("streak")) || 0;
let currentLang = null;
let today = new Date().toDateString();
let alreadyPlayed = false;

// Selección de lenguaje
function chooseLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("currentLang", lang);

  // Comprobar si ya jugó hoy
  const lastPlayed = localStorage.getItem(`lastPlayed-${currentLang}`);
  alreadyPlayed = lastPlayed === today;

  document.getElementById("language-select").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (alreadyPlayed) {
    showFeedback("⏰ Ya jugaste hoy. ¡Volvé mañana!");
    disableGame();
  } else {
    resetGame();
  }
}

// Cargar desafío
async function loadChallenge() {
  const res = await fetch("challenges.json");
  const data = await res.json();
  const langChallenges = data[currentLang];
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000
  );
  challenge = langChallenges[dayOfYear % langChallenges.length];
  document.getElementById("challenge-code").textContent = challenge.code;
  document.querySelector(".subtitle").textContent = `Lenguaje actual: ${currentLang.toUpperCase()}`;
}

// Actualizar info
function updateInfo() {
  document.getElementById("attempts").textContent = attempts;
  document.getElementById("streak").textContent = streak;
}

// Feedback
function showFeedback(msg, ok=false) {
  const fb = document.getElementById("feedback");
  fb.textContent = msg;
  fb.style.color = ok ? "#00ff9d" : "#ff4f4f";
}

// Deshabilitar input
function disableGame() {
  document.getElementById("answer").disabled = true;
  document.getElementById("submit-btn").disabled = true;
}

// Reiniciar juego
function resetGame() {
  attempts = 0;
  document.getElementById("answer").value = "";
  showFeedback("");
  document.getElementById("answer").disabled = false;
  document.getElementById("submit-btn").disabled = false;
  loadChallenge();
  updateInfo();
}

// Modal
function showModal(result) {
  const modal = document.getElementById("modal-next");
  const feedbackText = document.getElementById("modal-feedback");

  feedbackText.textContent = result === "win"
    ? `✅ ¡Acertaste en ${currentLang.toUpperCase()}!`
    : `❌ Fallaste en ${currentLang.toUpperCase()}. La respuesta era: ${challenge.answer}`;

  modal.style.display = "flex";
}

// Cerrar modal
function closeModal() {
  document.getElementById("modal-next").style.display = "none";
}

// Verificar respuesta
function checkAnswer() {
  if (alreadyPlayed) return;

  const ans = document.getElementById("answer").value.trim().toLowerCase();
  if (!ans) return;

  attempts++;
  updateInfo();

  if (ans === challenge.answer.toLowerCase()) {
    streak++;
    localStorage.setItem("streak", streak);
    localStorage.setItem(`lastPlayed-${currentLang}`, today);
    showFeedback(`✅ Correcto en ${currentLang}!`, true);
    disableGame();
    setTimeout(()=>showModal("win"), 500);

  } else if (attempts >= maxAttempts) {
    streak = 0;
    localStorage.setItem("streak", streak);
    localStorage.setItem(`lastPlayed-${currentLang}`, today);
    showFeedback(`❌ Fallaste. Era: ${challenge.answer}`);
    disableGame();
    setTimeout(()=>showModal("lose"), 500);

  } else {
    showFeedback("❌ Incorrecto, probá de nuevo.");
  }

  document.getElementById("answer").value = "";
}

// Botones del modal
document.getElementById("next-lang-btn").addEventListener("click", () => {
  const langs = ["python","javascript"];
  const idx = langs.indexOf(currentLang);
  const next = langs[(idx+1)%langs.length];
  currentLang = next;
  localStorage.setItem("currentLang", currentLang);
  closeModal();
  alreadyPlayed = localStorage.getItem(`lastPlayed-${currentLang}`) === today;
  if (alreadyPlayed) {
    showFeedback("⏰ Ya jugaste hoy. ¡Volvé mañana!");
    disableGame();
  } else {
    resetGame();
  }
});

document.getElementById("stay-btn").addEventListener("click", () => closeModal());

// Botones principales
document.getElementById("submit-btn").addEventListener("click", checkAnswer);
document.getElementById("hint-btn").addEventListener("click", () =>
  showFeedback(`💡 Pista: ${challenge.hint}`)
);
document.getElementById("share-btn").addEventListener("click", () => {
  const text = `#Codele Día ${new Date().getDate()} (${currentLang.toUpperCase()}) — ${
    confirm("¿Lo resolviste?") ? "¡Lo resolví!" : "No pude 😅"
  } — https://tusitio.github.io/codele/`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Texto copiado para compartir 🚀");
  }
});
