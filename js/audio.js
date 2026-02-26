/**
 * 发音模块 - 使用 Web Speech API
 * 支持英语单词发音
 */

const AudioPlayer = {
  // 检查浏览器是否支持语音合成
  isSupported: function() {
    return 'speechSynthesis' in window;
  },

  // 语音合成实例
  synthesis: window.speechSynthesis,

  // 获取可用的英语语音
  getEnglishVoice: function() {
    const voices = this.synthesis.getVoices();
    // 优先选择美式英语或英式英语
    return voices.find(v => v.lang === 'en-US') ||
           voices.find(v => v.lang === 'en-GB') ||
           voices.find(v => v.lang.startsWith('en')) ||
           voices[0];
  },

  /**
   * 播放单词发音
   * @param {string} word - 要发音的单词
   * @param {function} onStart - 开始播放时的回调
   * @param {function} onEnd - 播放结束时的回调
   */
  speak: function(word, onStart, onEnd) {
    if (!this.isSupported()) {
      console.warn('浏览器不支持语音合成');
      return false;
    }

    // 取消之前的语音
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.voice = this.getEnglishVoice();
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // 稍慢一点，便于学习
    utterance.pitch = 1;
    utterance.volume = 1;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    this.synthesis.speak(utterance);
    return true;
  },

  /**
   * 停止播放
   */
  stop: function() {
    if (this.isSupported()) {
      this.synthesis.cancel();
    }
  },

  /**
   * 预加载语音（解决某些浏览器需要用户交互后才能播放的问题）
   */
  preload: function() {
    if (this.isSupported()) {
      // 触发语音列表加载
      this.synthesis.getVoices();
    }
  }
};

// 页面加载时预加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AudioPlayer.preload());
} else {
  AudioPlayer.preload();
}

// 语音列表可能在异步加载完成后才可用
if (AudioPlayer.isSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    AudioPlayer.getEnglishVoice();
  };
}
