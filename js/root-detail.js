/**
 * 词根详情页面逻辑
 */

let currentRoot = null;
let selectedAnswer = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 获取 URL 参数中的词根 ID
  const urlParams = new URLSearchParams(window.location.search);
  const rootId = parseInt(urlParams.get('id'));

  if (!rootId) {
    // 如果没有 ID，跳转回词根索引
    window.location.href = 'roots.html';
    return;
  }

  // 查找对应的词根
  currentRoot = WordRoots.find(root => root.id === rootId);

  if (!currentRoot) {
    // 如果找不到词根，跳转回词根索引
    alert('未找到该词根');
    window.location.href = 'roots.html';
    return;
  }

  // 渲染页面
  renderRootDetail();
});

// 渲染词根详情
function renderRootDetail() {
  // 设置页面标题
  document.title = `${currentRoot.root} - 词根详情 - 词根词缀记忆工坊`;

  // 渲染头部信息
  document.getElementById('rootName').textContent = currentRoot.root;
  document.getElementById('rootOrigin').textContent = currentRoot.origin;
  document.getElementById('rootMeaning').textContent = currentRoot.meaning;

  // 渲染详细说明
  document.getElementById('rootDescription').textContent = currentRoot.description;

  // 渲染例词列表
  renderExamples();

  // 渲染测试题
  renderQuiz();
}

// 渲染例词列表
function renderExamples() {
  const grid = document.getElementById('examplesGrid');

  if (!currentRoot.examples || currentRoot.examples.length === 0) {
    grid.innerHTML = '<p style="color: var(--color-text-secondary);">暂无例词</p>';
    return;
  }

  grid.innerHTML = currentRoot.examples.map(example => createExampleCard(example)).join('');
}

// 创建例词卡片
function createExampleCard(example) {
  const breakdown = example.breakdown || {};
  const parts = [];

  if (breakdown.prefix) {
    parts.push(`<span class="breakdown-part prefix">${breakdown.prefix}</span>`);
  }
  if (breakdown.root) {
    parts.push(`<span class="breakdown-part root">${breakdown.root}</span>`);
  }
  if (breakdown.suffix) {
    parts.push(`<span class="breakdown-part suffix">${breakdown.suffix}</span>`);
  }

  return `
    <div class="example-card">
      <div class="example-word">${example.word}</div>
      <div class="example-breakdown">
        ${parts.join('<span class="breakdown-arrow">+</span>')}
      </div>
      <div class="example-meaning">${example.meaning}</div>
      <div class="example-explanation">${example.explanation}</div>
    </div>
  `;
}

// 渲染测试题
function renderQuiz() {
  if (!currentRoot.quiz) {
    document.querySelector('.quiz-section').innerHTML = '<p style="color: var(--color-text-secondary);">暂无测试题</p>';
    return;
  }

  const quiz = currentRoot.quiz;

  // 渲染问题
  document.getElementById('quizQuestion').textContent = quiz.question;

  // 渲染选项
  const optionsContainer = document.getElementById('quizOptions');
  optionsContainer.innerHTML = quiz.options.map((option, index) =>
    `<button class="quiz-option" onclick="selectAnswer(${index})">${option}</button>`
  ).join('');
}

// 选择答案
function selectAnswer(index) {
  if (selectedAnswer !== null) {
    // 已经回答过了，不允许再选择
    return;
  }

  selectedAnswer = index;
  const quiz = currentRoot.quiz;
  const isCorrect = index === quiz.correctAnswer;

  // 更新选项样式
  const options = document.querySelectorAll('.quiz-option');
  options.forEach((option, i) => {
    option.disabled = true;
    // 重置样式，移除 hover 残留效果
    option.style.borderColor = '';
    option.style.background = '';

    if (i === quiz.correctAnswer) {
      option.classList.add('correct');
    } else if (i === index && !isCorrect) {
      option.classList.add('wrong');
    }
  });

  // 显示反馈
  const feedbackContainer = document.getElementById('quizFeedback');
  if (isCorrect) {
    feedbackContainer.innerHTML = `
      <div class="quiz-feedback correct">
        ✓ 回答正确！
      </div>
    `;
  } else {
    feedbackContainer.innerHTML = `
      <div class="quiz-feedback wrong">
        ✗ 回答错误。正确答案是：${quiz.options[quiz.correctAnswer]}
      </div>
    `;
  }
}
