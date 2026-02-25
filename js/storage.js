/**
 * LocalStorage 数据管理
 * 无需登录，所有数据保存在浏览器本地
 */

const StorageManager = {
  KEYS: {
    PROGRESS: 'wordRootProgress',
    SETTINGS: 'wordRootSettings',
    ACHIEVEMENTS: 'wordRootAchievements'
  },

  /**
   * 获取学习进度数据
   */
  getProgress() {
    const data = localStorage.getItem(this.KEYS.PROGRESS);
    if (!data) {
      return this.initProgress();
    }
    return JSON.parse(data);
  },

  /**
   * 初始化进度数据
   */
  initProgress() {
    const initialData = {
      level: 1,
      masteredRoots: [], // 已掌握的词根 ID 列表
      currentRootIndex: 0,
      totalScore: 0,
      lastStudyDate: new Date().toISOString(),
      studyStreak: 0, // 连续学习天数
      sessionCount: 0 // 学习次数
    };
    this.saveProgress(initialData);
    return initialData;
  },

  /**
   * 保存进度数据
   */
  saveProgress(data) {
    localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(data));
  },

  /**
   * 标记词根为已掌握
   */
  markRootAsMastered(rootId) {
    const progress = this.getProgress();
    if (!progress.masteredRoots.includes(rootId)) {
      progress.masteredRoots.push(rootId);
      progress.totalScore += 10;

      // 检查是否升级
      const newLevel = Math.floor(progress.masteredRoots.length / 10) + 1;
      if (newLevel > progress.level) {
        progress.level = newLevel;
        this.unlockAchievement('levelUp', newLevel);
      }

      this.saveProgress(progress);
    }
    return progress;
  },

  /**
   * 更新连续学习天数
   */
  updateStudyStreak() {
    const progress = this.getProgress();
    const today = new Date().toDateString();
    const lastStudy = new Date(progress.lastStudyDate).toDateString();

    if (today !== lastStudy) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastStudy === yesterdayStr) {
        // 连续学习
        progress.studyStreak += 1;
      } else {
        // 中断了，重新开始
        progress.studyStreak = 1;
      }

      progress.lastStudyDate = new Date().toISOString();
      progress.sessionCount += 1;

      // 检查连续学习成就
      if (progress.studyStreak === 7) {
        this.unlockAchievement('streak7');
      } else if (progress.studyStreak === 30) {
        this.unlockAchievement('streak30');
      }

      this.saveProgress(progress);
    }

    return progress.studyStreak;
  },

  /**
   * 获取成就列表
   */
  getAchievements() {
    const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 解锁成就
   */
  unlockAchievement(type, value = null) {
    const achievements = this.getAchievements();
    const timestamp = new Date().toISOString();

    let newAchievement = null;

    switch (type) {
      case 'levelUp':
        newAchievement = {
          id: `level_${value}`,
          type: 'level',
          title: `等级 ${value}`,
          description: `恭喜升级到 Lv.${value}！`,
          icon: '⭐',
          unlockedAt: timestamp
        };
        break;

      case 'streak7':
        newAchievement = {
          id: 'streak_7',
          type: 'streak',
          title: '七日修行',
          description: '连续学习 7 天',
          icon: '🔥',
          unlockedAt: timestamp
        };
        break;

      case 'streak30':
        newAchievement = {
          id: 'streak_30',
          type: 'streak',
          title: '月度大师',
          description: '连续学习 30 天',
          icon: '👑',
          unlockedAt: timestamp
        };
        break;

      case 'firstRoot':
        newAchievement = {
          id: 'first_root',
          type: 'milestone',
          title: '初出茅庐',
          description: '掌握第一个词根',
          icon: '🌱',
          unlockedAt: timestamp
        };
        break;

      case 'roots50':
        newAchievement = {
          id: 'roots_50',
          type: 'milestone',
          title: '小有所成',
          description: '掌握 50 个词根',
          icon: '🎯',
          unlockedAt: timestamp
        };
        break;

      case 'roots100':
        newAchievement = {
          id: 'roots_100',
          type: 'milestone',
          title: '百词宗师',
          description: '掌握 100 个词根',
          icon: '💎',
          unlockedAt: timestamp
        };
        break;
    }

    if (newAchievement && !achievements.find(a => a.id === newAchievement.id)) {
      achievements.push(newAchievement);
      localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

      // 显示成就通知
      this.showAchievementNotification(newAchievement);
    }
  },

  /**
   * 显示成就解锁通知
   */
  showAchievementNotification(achievement) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-4 z-50 clay-card bg-white p-4 animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-3xl">${achievement.icon}</span>
        <div>
          <div class="font-heading font-bold text-primary">🎉 成就解锁！</div>
          <div class="text-sm text-textMain/80">${achievement.title}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // 3秒后移除
    setTimeout(() => {
      notification.style.transition = 'opacity 300ms';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  /**
   * 导出数据（用于备份或迁移）
   */
  exportData() {
    return {
      progress: this.getProgress(),
      achievements: this.getAchievements(),
      exportDate: new Date().toISOString()
    };
  },

  /**
   * 导入数据
   */
  importData(data) {
    if (data.progress) {
      this.saveProgress(data.progress);
    }
    if (data.achievements) {
      localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
    }
  },

  /**
   * 清除所有数据（重置）
   */
  clearAll() {
    if (confirm('确定要清除所有学习数据吗？此操作不可恢复！')) {
      localStorage.removeItem(this.KEYS.PROGRESS);
      localStorage.removeItem(this.KEYS.ACHIEVEMENTS);
      localStorage.removeItem(this.KEYS.SETTINGS);
      window.location.reload();
    }
  }
};

// 页面加载时更新学习连续性
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.updateStudyStreak();
});
