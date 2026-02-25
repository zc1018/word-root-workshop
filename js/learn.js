/**
 * 学习页面核心逻辑
 */

let currentRootIndex = 0;
let currentRoot = null;
let sessionProgress = 0;
const SESSION_GOAL = 5; // 每次学习目标：5个词根

// 页面加载初始化
document.addEventListener('DOMContentLoaded', () => {
  initLearnPage();
});

/**
 * 初始化学习页面
 */
function initLearnPage() {
  // 获取进度数据
  const progress = StorageManager.getProgress();
  currentRootIndex = progress.currentRootIndex || 0;

  // 更新顶部状态栏
  updateStatusBar(progress);

  // 加载第一个词根
  loadRoot(currentRootIndex);
}

/**
 * 更新顶部状态栏
 */
function updateStatusBar(progress) {
  document.getElementById('currentLevel').textContent = `Lv.${progress.level}`;
  document.getElementById('masteredCount').textContent = progress.masteredRoots.length;
}

/**
 * 加载词根
 */
function loadRoot(index) {
  // 循环回到开头
  if (index >= WordRoots.length) {
    index = 0;
  }

  currentRoot = WordRoots[index];

  // 显示加载状态
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('rootContent').classList.add('hidden');

  // 模拟加载延迟（让用户感受到"正在准备"）
  setTimeout(() => {
    renderRoot(currentRoot);
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('rootContent').classList.remove('hidden');
  }, 500);
}

/**
 * 渲染词根内容
 */
function renderRoot(root) {
  // 更新标题
  document.getElementById('rootName').textContent = root.root;
  document.getElementById('rootMeaning').textContent = `= ${root.meaning} (${root.meaningEn})`;
  document.getElementById('rootDescription').textContent = root.description;

  // 渲染例词列表
  const wordList = document.getElementById('wordList');
  wordList.innerHTML = root.examples.map(example => `
    <div class="word-card">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <div class="word-breakdown mb-1">
            ${example.breakdown.prefix ? `<span class="prefix">${example.breakdown.prefix}</span>` : ''}
            <span class="root">${example.breakdown.root}</span>
            ${example.breakdown.suffix ? `<span class="suffix">${example.breakdown.suffix}</span>` : ''}
          </div>
          <div class="font-bold text-lg text-primary">${example.word}</div>
        </div>
        <div class="text-right">
          <div class="text-textMain font-bold">${example.meaning}</div>
        </div>
      </div>
      <div class="text-sm text-textMain/70 bg-background rounded-lg p-2">
        ${example.explanation}
      </div>
    </div>
  `).join('');

  // 渲染测试题
  renderQuiz(root.quiz);
}

/**
 * 渲染测试题
 */
function renderQuiz(quiz) {
  document.getElementById('quizQuestion').textContent = quiz.question;

  const optionsContainer = document.getElementById('quizOptions');
  optionsContainer.innerHTML = quiz.options.map((option, index) => `
    <button
      class="option-button"
      data-index="${index}"
      onclick="checkAnswer(${index})"
    >
      ${String.fromCharCode(65 + index)}. ${option}
    </button>
  `).join('');

  // 隐藏反馈和按钮
  document.getElementById('feedback').classList.add('hidden');
  document.getElementById('correctFeedback').classList.add('hidden');
  document.getElementById('wrongFeedback').classList.add('hidden');
  document.getElementById('nextBtn').classList.add('hidden');
  document.getElementById('retryBtn').classList.add('hidden');
}

/**
 * 检查答案
 */
function checkAnswer(selectedIndex) {
  const quiz = currentRoot.quiz;
  const isCorrect = selectedIndex === quiz.correctAnswer;

  // 禁用所有选项
  const options = document.querySelectorAll('.option-button');
  options.forEach(btn => {
    btn.disabled = true;
  });

  // 高亮选中的选项
  const selectedBtn = options[selectedIndex];

  if (isCorrect) {
    // 答对了
    selectedBtn.classList.add('correct');
    document.getElementById('correctFeedback').classList.remove('hidden');
    document.getElementById('nextBtn').classList.remove('hidden');

    // 标记为已掌握
    const progress = StorageManager.markRootAsMastered(currentRoot.id);

    // 检查成就
    const masteredCount = progress.masteredRoots.length;
    if (masteredCount === 1) {
      StorageManager.unlockAchievement('firstRoot');
    } else if (masteredCount === 50) {
      StorageManager.unlockAchievement('roots50');
    } else if (masteredCount === 100) {
      StorageManager.unlockAchievement('roots100');
    }

    // 更新状态栏
    updateStatusBar(progress);

    // 更新本次进度
    sessionProgress++;
    updateSessionProgress();

  } else {
    // 答错了
    selectedBtn.classList.add('wrong');
    document.getElementById('wrongFeedback').classList.remove('hidden');
    document.getElementById('retryBtn').classList.remove('hidden');

    // 显示正确答案
    setTimeout(() => {
      options[quiz.correctAnswer].classList.add('correct');
    }, 400);
  }

  document.getElementById('feedback').classList.remove('hidden');
}

/**
 * 更新本次学习进度
 */
function updateSessionProgress() {
  const percentage = (sessionProgress / SESSION_GOAL) * 100;
  document.getElementById('progressBar').style.width = `${percentage}%`;
  document.getElementById('sessionProgress').textContent = `${sessionProgress}/${SESSION_GOAL}`;

  // 达到目标
  if (sessionProgress >= SESSION_GOAL) {
    showCongratulations();
  }
}

/**
 * 显示祝贺信息
 */
function showCongratulations() {
  const notification = document.createElement('div');
  notification.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
  notification.innerHTML = `
    <div class="clay-card bg-white p-8 max-w-md mx-4 text-center">
      <div class="text-6xl mb-4">🎉</div>
      <h2 class="text-3xl font-heading font-bold text-primary mb-2">恭喜完成！</h2>
      <p class="text-textMain/80 mb-6">
        你已经掌握了 ${sessionProgress} 个词根！
        <br>
        坚持就是胜利 💪
      </p>
      <button
        class="clay-button bg-success text-white px-8 py-3 font-bold cursor-pointer border-green-600"
        onclick="this.closest('.fixed').remove()"
      >
        继续学习
      </button>
    </div>
  `;
  document.body.appendChild(notification);
}

/**
 * 下一个词根
 */
function nextRoot() {
  currentRootIndex++;

  // 保存进度
  const progress = StorageManager.getProgress();
  progress.currentRootIndex = currentRootIndex;
  StorageManager.saveProgress(progress);

  // 加载下一个
  loadRoot(currentRootIndex);

  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 重试测试
 */
function retryQuiz() {
  renderQuiz(currentRoot.quiz);
}

// 绑定全局函数
window.checkAnswer = checkAnswer;
window.nextRoot = nextRoot;
window.retryQuiz = retryQuiz;

// 绑定按钮事件
document.getElementById('nextBtn')?.addEventListener('click', nextRoot);
document.getElementById('retryBtn')?.addEventListener('click', retryQuiz);
