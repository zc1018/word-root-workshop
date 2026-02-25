/**
 * 词根索引页面逻辑
 */

// 状态
let currentFilter = 'all';
let searchQuery = '';
let allRoots = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  allRoots = WordRoots || [];

  // 绑定事件
  bindEvents();

  // 渲染词根
  renderRoots();
});

// 绑定事件
function bindEvents() {
  // 搜索框
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderRoots();
  });

  // 分类筛选按钮
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 更新active状态
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 更新筛选条件
      currentFilter = tab.dataset.filter;
      renderRoots();
    });
  });

  // 词根卡片点击（跳转到词根详情页面）
  document.getElementById('rootsGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.root-card');
    if (card) {
      const rootId = parseInt(card.dataset.id);
      // 跳转到词根详情页面
      window.location.href = `root-detail.html?id=${rootId}`;
    }
  });
}

// 渲染词根
function renderRoots() {
  const grid = document.getElementById('rootsGrid');
  const emptyState = document.getElementById('emptyState');
  const displayCount = document.getElementById('displayCount');

  // 筛选词根
  let filteredRoots = filterRoots(allRoots);

  // 更新统计
  displayCount.textContent = filteredRoots.length;

  // 显示/隐藏空状态
  if (filteredRoots.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  } else {
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
  }

  // 渲染卡片
  grid.innerHTML = filteredRoots.map(root => createRootCard(root)).join('');
}

// 筛选词根
function filterRoots(roots) {
  return roots.filter(root => {
    // 分类筛选
    let passFilter = true;
    if (currentFilter !== 'all') {
      passFilter = matchCategory(root, currentFilter);
    }

    // 搜索筛选
    let passSearch = true;
    if (searchQuery) {
      passSearch = matchSearch(root, searchQuery);
    }

    return passFilter && passSearch;
  });
}

// 匹配分类
function matchCategory(root, category) {
  const rootName = root.root.toLowerCase().trim();

  // 判断词根类型
  const isPrefix = rootName.endsWith('-') && !rootName.startsWith('-');
  const isSuffix = rootName.startsWith('-');
  const isRoot = !isPrefix && !isSuffix;

  if (category === 'prefix') {
    return isPrefix;
  } else if (category === 'suffix') {
    return isSuffix;
  } else if (category === 'root') {
    return isRoot;
  }

  return true;
}

// 匹配搜索
function matchSearch(root, query) {
  // 搜索词根名称
  if (root.root.toLowerCase().includes(query)) {
    return true;
  }

  // 搜索含义
  if (root.meaning.toLowerCase().includes(query)) {
    return true;
  }

  if (root.meaningEn && root.meaningEn.toLowerCase().includes(query)) {
    return true;
  }

  // 搜索例词
  if (root.examples && root.examples.length > 0) {
    const hasMatchingExample = root.examples.some(ex =>
      ex.word.toLowerCase().includes(query) ||
      ex.meaning.toLowerCase().includes(query)
    );
    if (hasMatchingExample) {
      return true;
    }
  }

  return false;
}

// 创建词根卡片
function createRootCard(root) {
  const examples = root.examples ? root.examples.slice(0, 4) : [];
  const exampleTags = examples.map(ex =>
    `<span class="example-tag">${ex.word}</span>`
  ).join('');

  return `
    <div class="root-card" data-id="${root.id}">
      <div class="root-header">
        <div class="root-name">${root.root}</div>
        <div class="root-origin">${root.origin}</div>
      </div>
      <div class="root-meaning">${root.meaning}</div>
      <div class="root-examples">
        ${exampleTags}
        ${examples.length > 0 ? '' : '<span class="example-tag">暂无例词</span>'}
      </div>
      <div class="root-id">#${root.id}</div>
    </div>
  `;
}
