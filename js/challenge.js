/**
 * 闯关模式逻辑
 */

let currentStageLevel = 1;
let currentQuestionIndex = 0;
let totalQuestions = 10;
let correctAnswers = 0;
let challengeQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
  // 默认进入关卡 1
  startChallenge(1);
});

/**
 * 开始闯关
 */
function startChallenge(stageLevel) {
  currentStageLevel = stageLevel;
  currentQuestionIndex = 0;
  correctAnswers = 0;

  // 隐藏关卡选择，显示游戏
  document.getElementById('stageSelection')?.classList.add('hidden');
  document.getElementById('challengeGame').classList.remove('hidden');
  document.getElementById('challengeResult').classList.add('hidden');

  // 生成题目
  generateQuestions();

  // 更新顶部状态
  document.getElementById('currentStage').textContent = `${stageLevel}-1`;
  document.getElementById('currentScore').textContent = correctAnswers * 10;

  // 显示第一题
  showQuestion(0);
}

/**
 * 生成题目
 */
function generateQuestions() {
  // 根据关卡选择词根（初级：前10个）
  const roots = WordRoots.slice(0, 10);

  challengeQuestions = [];

  // 生成10道题
  for (let i = 0; i < totalQuestions; i++) {
    const root = roots[i % roots.length];

    // 随机选择题型
    const questionType = Math.random() > 0.5 ? 'word-meaning' : 'root-identification';

    if (questionType === 'word-meaning') {
      // 题型1: 给单词，选择意思
      const correctExample = root.examples[Math.floor(Math.random() * root.examples.length)];
      const wrongOptions = getRandomOptions(root, correctExample.meaning, 3);

      challengeQuestions.push({
        type: 'word-meaning',
        question: `单词 "${correctExample.word}" 的意思是？`,
        options: shuffle([correctExample.meaning, ...wrongOptions]),
        correctAnswer: correctExample.meaning,
        explanation: correctExample.explanation
      });

    } else {
      // 题型2: 给词根含义，选择包含该词根的单词
      const correctExample = root.examples[0];
      const wrongWords = getRandomWords(root.root, 3);

      challengeQuestions.push({
        type: 'root-identification',
        question: `下列哪个单词包含词根 "${root.root}" (${root.meaning})？`,
        options: shuffle([correctExample.word, ...wrongWords]),
        correctAnswer: correctExample.word,
        explanation: `${correctExample.word} = ${correctExample.explanation}`
      });
    }
  }
}

/**
 * 显示题目
 */
function showQuestion(index) {
  if (index >= challengeQuestions.length) {
    showResult();
    return;
  }

  const question = challengeQuestions[index];

  // 更新进度
  document.getElementById('questionProgress').textContent = `${index + 1}/${totalQuestions}`;
  const percentage = ((index + 1) / totalQuestions) * 100;
  document.getElementById('challengeProgressBar').style.width = `${percentage}%`;

  // 更新题目
  document.getElementById('challengeQuestion').textContent = question.question;

  // 渲染选项
  const optionsContainer = document.getElementById('challengeOptions');
  optionsContainer.innerHTML = question.options.map((option, i) => `
    <button
      class="option-button text-lg"
      onclick="selectAnswer('${escapeHtml(option)}')"
    >
      ${String.fromCharCode(65 + i)}. ${option}
    </button>
  `).join('');

  // 隐藏反馈和按钮
  document.getElementById('challengeFeedback').classList.add('hidden');
  document.getElementById('challengeCorrect').classList.add('hidden');
  document.getElementById('challengeWrong').classList.add('hidden');
  document.getElementById('nextQuestionBtn').classList.add('hidden');
}

/**
 * 选择答案
 */
function selectAnswer(selectedAnswer) {
  const question = challengeQuestions[currentQuestionIndex];
  const isCorrect = selectedAnswer === question.correctAnswer;

  // 禁用所有按钮
  const buttons = document.querySelectorAll('.option-button');
  buttons.forEach(btn => {
    btn.disabled = true;

    // 高亮正确答案
    if (btn.textContent.includes(question.correctAnswer)) {
      btn.classList.add('correct');
    }

    // 高亮错误选择
    if (!isCorrect && btn.textContent.includes(selectedAnswer)) {
      btn.classList.add('wrong');
    }
  });

  // 显示反馈
  document.getElementById('challengeFeedback').classList.remove('hidden');

  if (isCorrect) {
    correctAnswers++;
    document.getElementById('challengeCorrect').classList.remove('hidden');

    // 更新得分
    document.getElementById('currentScore').textContent = correctAnswers * 10;
  } else {
    document.getElementById('challengeWrong').classList.remove('hidden');
    document.getElementById('challengeWrongMsg').innerHTML = `
      ❌ 正确答案是: ${question.correctAnswer}
      <br>
      <span class="text-sm">${question.explanation || ''}</span>
    `;
  }

  // 显示下一题按钮
  document.getElementById('nextQuestionBtn').classList.remove('hidden');
}

/**
 * 下一题
 */
function nextQuestion() {
  currentQuestionIndex++;
  showQuestion(currentQuestionIndex);
}

/**
 * 显示闯关结果
 */
function showResult() {
  document.getElementById('challengeGame').classList.add('hidden');
  document.getElementById('challengeResult').classList.remove('hidden');

  const percentage = (correctAnswers / totalQuestions) * 100;

  // 根据正确率显示不同的图标和文案
  let icon, title, message;

  if (percentage === 100) {
    icon = '🏆';
    title = '完美通关！';
    message = `你全对了！太厉害了！`;
  } else if (percentage >= 80) {
    icon = '🎉';
    title = '恭喜通关！';
    message = `你答对了 <span class="text-success font-bold">${correctAnswers}/${totalQuestions}</span> 题，表现优秀！`;
  } else if (percentage >= 60) {
    icon = '😊';
    title = '通关成功！';
    message = `你答对了 <span class="text-success font-bold">${correctAnswers}/${totalQuestions}</span> 题，继续努力！`;
  } else {
    icon = '💪';
    title = '再试一次！';
    message = `你答对了 <span class="text-success font-bold">${correctAnswers}/${totalQuestions}</span> 题，多练习就会进步！`;
  }

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultMessage').innerHTML = message;
}

/**
 * 重新挑战
 */
function retryChallenge() {
  startChallenge(currentStageLevel);
}

/**
 * 下一关（暂时只是重新挑战）
 */
function nextStage() {
  alert('更多关卡正在开发中，敬请期待！🚀');
  startChallenge(currentStageLevel);
}

/**
 * 获取随机错误选项（单词意思）
 */
function getRandomOptions(excludeRoot, excludeMeaning, count) {
  const allMeanings = [];

  WordRoots.forEach(root => {
    if (root.id !== excludeRoot.id) {
      root.examples.forEach(ex => {
        if (ex.meaning !== excludeMeaning) {
          allMeanings.push(ex.meaning);
        }
      });
    }
  });

  return shuffle(allMeanings).slice(0, count);
}

/**
 * 获取随机错误单词
 */
function getRandomWords(excludeRoot, count) {
  const allWords = [];

  WordRoots.forEach(root => {
    if (root.root !== excludeRoot) {
      root.examples.forEach(ex => {
        allWords.push(ex.word);
      });
    }
  });

  return shuffle(allWords).slice(0, count);
}

/**
 * 数组乱序
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * HTML 转义（防止 XSS）
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 绑定按钮事件
document.getElementById('nextQuestionBtn')?.addEventListener('click', nextQuestion);

// 绑定全局函数
window.startChallenge = startChallenge;
window.selectAnswer = selectAnswer;
window.retryChallenge = retryChallenge;
window.nextStage = nextStage;
