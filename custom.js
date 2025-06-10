document.addEventListener('DOMContentLoaded', () => {
  // Таймер тесту
  const timerContainer = document.getElementById('timer');
  const testForm = document.getElementById('testForm');

  // Записуємо початок проходження (мс)
  const startTimestamp = Date.now();
  if (testForm) {
    const startInput = document.getElementById('startTimestamp');
    if (startInput) startInput.value = startTimestamp;
  }

  if (timerContainer && testForm) {
    const timeLimit = parseInt(timerContainer.getAttribute('data-limit')) * 60;
    if (!isNaN(timeLimit) && timeLimit > 0) {
      let remaining = timeLimit;
      const interval = setInterval(() => {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        timerContainer.innerText = `Залишилось: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (remaining <= 10) {
          timerContainer.style.color = 'red';
        }

        if (remaining <= 0) {
          clearInterval(interval);
          alert('Час вийшов! Ваша форма буде надіслана автоматично.');
          testForm.submit();
        }
        remaining--;
      }, 1000);
    }
  }
});

document.getElementById('addQuestionBtn').addEventListener('click', () => {
  const container = document.getElementById('questionContainer');
  const index = container.children.length;
  
  const newQuestion = `
    <div class="question-block mb-3">
      <div class="mb-3">
        <label class="form-label">Текст питання:</label>
        <input type="text" name="questions[${index}][text]" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Варіанти відповідей (через кому):</label>
        <input type="text" name="questions[${index}][options]">
      </div>
      <div class="mb-3">
        <label class="form-label">Правильна відповідь:</label>
        <input type="text" name="questions[${index}][correctAnswer]" required>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', newQuestion);
});
