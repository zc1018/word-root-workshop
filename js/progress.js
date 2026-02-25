/**
 * 进度页面逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
  loadProgressData();
});

/**
 * 加载进度数据
 */
function loadProgressData() {
  const progress = StorageManager.getProgress();
  const achievements = StorageManager.getAchievements();

  // 更新统计数据
  document.getElementById('levelDisplay').textContent = `Lv.${progress.level}`;
  document.getElementById('masteredDisplay').textContent = progress.masteredRoots.length;
  document.getElementById('streakDisplay').textContent = progress.studyStreak;

  // 计算整体进度百分比
  const percentage = Math.round((progress.masteredRoots.length / 300) * 100);
  document.getElementById('progressPercentage').textContent = `${percentage}%`;
  document.getElementById('overallProgressBar').style.width = `${percentage}%`;

  // 计算距离下一级的词根数
  const currentLevelRoots = (progress.level - 1) * 10;
  const nextLevelRoots = progress.level * 10;
  const toNextLevel = nextLevelRoots - progress.masteredRoots.length;
  document.getElementById('toNextLevel').textContent = Math.max(0, toNextLevel);

  // 学习记录
  const lastStudy = new Date(progress.lastStudyDate);
  document.getElementById('lastStudyDate').textContent = formatDate(lastStudy);
  document.getElementById('sessionCount').textContent = progress.sessionCount;
  document.getElementById('totalScore').textContent = progress.totalScore;

  // 渲染成就
  renderAchievements(achievements);
}

/**
 * 渲染成就列表
 */
function renderAchievements(achievements) {
  const container = document.getElementById('achievementsList');
  const noAchievements = document.getElementById('noAchievements');

  if (achievements.length === 0) {
    noAchievements.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  }

  noAchievements.classList.add('hidden');
  container.classList.remove('hidden');

  container.innerHTML = achievements.map(achievement => `
    <div class="achievement-badge clay-card bg-gradient-to-br from-primary/10 to-success/10 p-4">
      <div class="flex items-start space-x-3">
        <div class="text-4xl">${achievement.icon}</div>
        <div class="flex-1">
          <h4 class="font-heading font-bold text-primary mb-1">${achievement.title}</h4>
          <p class="text-sm text-textMain/70 mb-2">${achievement.description}</p>
          <p class="text-xs text-textMain/50">${formatDate(new Date(achievement.unlockedAt))}</p>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * 格式化日期
 */
function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

/**
 * 导出进度数据
 */
function exportProgress() {
  const data = StorageManager.exportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `词根词缀记忆工坊_进度备份_${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);

  alert('✅ 数据已导出！\n\n请妥善保存备份文件，可以在其他设备导入恢复进度。');
}

/**
 * 导入进度数据
 */
function importProgress() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        StorageManager.importData(data);
        alert('✅ 数据导入成功！页面即将刷新。');
        window.location.reload();
      } catch (error) {
        alert('❌ 数据格式错误，导入失败！\n\n请确保选择了正确的备份文件。');
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// 绑定全局函数
window.exportProgress = exportProgress;
window.importProgress = importProgress;
