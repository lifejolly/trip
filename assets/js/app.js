(function () {
  const data = window.DESTINATIONS || [];

  function $(id) {
    return document.getElementById(id);
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('trip_favorites') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveFavorites(list) {
    localStorage.setItem('trip_favorites', JSON.stringify(list));
  }

  function toggleFavorite(slug) {
    const list = getFavorites();
    const idx = list.indexOf(slug);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(slug);
    }
    saveFavorites(list);
    return list.includes(slug);
  }

  function isFavorite(slug) {
    return getFavorites().includes(slug);
  }

  function escapeHtml(text) {
    return String(text || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatCard(item) {
    const tags = [item.area, item.season, item.priceLevel, ...item.crowd.slice(0, 2)]
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join('');
    return `
      <article class="card">
        <img loading="lazy" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.name)}">
        <div class="card-body">
          <h3>${escapeHtml(item.name)}</h3>
          <p class="meta">${escapeHtml(item.city)} | 评分 ${item.rating} | 建议 ${escapeHtml(item.days)}</p>
          <p>${escapeHtml(item.summary)}</p>
          <div class="tags">${tags}</div>
          <div style="display:flex; gap:.5rem; margin-top:auto;">
            <a class="btn" href="guide.html?slug=${encodeURIComponent(item.slug)}">查看攻略</a>
            <button class="secondary" data-fav="${escapeHtml(item.slug)}">${isFavorite(item.slug) ? '已收藏' : '收藏'}</button>
          </div>
        </div>
      </article>
    `;
  }

  function bindCardActions(root) {
    root.querySelectorAll('[data-fav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-fav');
        const on = toggleFavorite(slug);
        btn.textContent = on ? '已收藏' : '收藏';
      });
    });
  }

  function applyGlobalSearch() {
    const input = $('globalSearch');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = encodeURIComponent(input.value.trim());
        window.location.href = `destinations.html?q=${q}`;
      }
    });
  }

  function parseParams() {
    return new URLSearchParams(window.location.search);
  }

  function renderHome() {
    const hot = [...data].sort((a, b) => b.hot - a.hot).slice(0, 6);
    const cards = $('hotCards');
    if (!cards) return;
    cards.innerHTML = hot.map(formatCard).join('');
    bindCardActions(cards);

    const seasonal = $('seasonalTips');
    if (seasonal) {
      seasonal.innerHTML = `
        <li>春季推荐：杭州西湖、黄山、桂林漓江</li>
        <li>秋季推荐：九寨沟、北京故宫、长城</li>
        <li>冬季推荐：三亚亚龙湾、丽江古城</li>
      `;
    }
  }

  function renderList() {
    const listEl = $('listCards');
    if (!listEl) return;

    const params = parseParams();
    const state = {
      q: params.get('q') || '',
      area: params.get('area') || '',
      season: params.get('season') || '',
      crowd: params.get('crowd') || '',
      sort: params.get('sort') || 'hot'
    };

    $('searchInput').value = state.q;
    $('areaSelect').value = state.area;
    $('seasonSelect').value = state.season;
    $('crowdSelect').value = state.crowd;
    $('sortSelect').value = state.sort;

    function run() {
      const q = $('searchInput').value.trim().toLowerCase();
      const area = $('areaSelect').value;
      const season = $('seasonSelect').value;
      const crowd = $('crowdSelect').value;
      const sort = $('sortSelect').value;

      let rows = data.filter((x) => {
        const hitQ = !q || `${x.name} ${x.city} ${x.summary} ${x.crowd.join(' ')}`.toLowerCase().includes(q);
        const hitArea = !area || x.area === area;
        const hitSeason = !season || x.season.includes(season);
        const hitCrowd = !crowd || x.crowd.includes(crowd);
        return hitQ && hitArea && hitSeason && hitCrowd;
      });

      if (sort === 'rating') rows.sort((a, b) => b.rating - a.rating);
      else if (sort === 'update') rows.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
      else rows.sort((a, b) => b.hot - a.hot);

      if (!rows.length) {
        listEl.innerHTML = '<div class="empty">没有匹配项，换个关键词试试。</div>';
        return;
      }

      listEl.innerHTML = rows.map(formatCard).join('');
      bindCardActions(listEl);

      const next = new URLSearchParams({ q, area, season, crowd, sort });
      history.replaceState({}, '', `${window.location.pathname}?${next.toString()}`);
    }

    ['searchInput', 'areaSelect', 'seasonSelect', 'crowdSelect', 'sortSelect'].forEach((id) => {
      const node = $(id);
      node.addEventListener('input', run);
      node.addEventListener('change', run);
    });

    run();
  }

  function renderGuide() {
    const params = parseParams();
    const slug = params.get('slug') || '';
    const item = data.find((x) => x.slug === slug);

    if (!item) {
      const wrap = $('guideWrap');
      if (wrap) wrap.innerHTML = '<div class="empty">未找到该景点攻略，请返回列表页重试。</div>';
      return;
    }

    document.title = `${item.name}详细攻略 | Trip`;
    const wrap = $('guideWrap');
    wrap.innerHTML = `
      <section class="guide-hero">
        <img loading="lazy" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.name)}">
        <div style="padding:1rem 1rem 1.3rem;">
          <h1 style="margin:.2rem 0 .4rem;">${escapeHtml(item.name)}详细攻略</h1>
          <p class="meta">${escapeHtml(item.city)} | 评分 ${item.rating} | 建议游玩 ${escapeHtml(item.days)} | 最近更新 ${escapeHtml(item.lastUpdated)}</p>
          <p>${escapeHtml(item.summary)}</p>
          <div style="display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.7rem;">
            <button id="favBtn">${isFavorite(item.slug) ? '已收藏' : '收藏攻略'}</button>
            <button class="secondary" id="shareBtn">复制分享链接</button>
          </div>
        </div>
      </section>

      <section class="guide-content">
        <div class="grid">
          <article class="info-panel"><h3>最佳出行时间</h3><p>${escapeHtml(item.bestSeason)}</p></article>
          <article class="info-panel"><h3>到达方式</h3><p>${escapeHtml(item.transport)}</p></article>
          <article class="info-panel"><h3>门票与开放时间</h3><p>${escapeHtml(item.ticket)}</p><p class="meta">${escapeHtml(item.openTime)}</p></article>

          <article class="info-panel">
            <h3>玩法路线</h3>
            <div class="row">
              <div><strong>1日路线</strong><ul class="timeline">${item.routes.oneDay.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
              <div><strong>2日路线</strong><ul class="timeline">${item.routes.twoDay.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
              <div><strong>3日路线</strong><ul class="timeline">${item.routes.threeDay.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
            </div>
          </article>

          <article class="info-panel"><h3>住宿建议</h3><p>${escapeHtml(item.hotels)}</p></article>
          <article class="info-panel"><h3>美食推荐</h3><p>${escapeHtml(item.foods)}</p></article>

          <article class="info-panel">
            <h3>预算清单（人均）</h3>
            <div class="row">
              <div><strong>经济</strong><p>${escapeHtml(item.budget.low)}</p></div>
              <div><strong>舒适</strong><p>${escapeHtml(item.budget.mid)}</p></div>
              <div><strong>高端</strong><p>${escapeHtml(item.budget.high)}</p></div>
            </div>
          </article>

          <article class="info-panel">
            <h3>避坑指南</h3>
            <ul>${item.tips.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
          </article>

          <article class="info-panel"><h3>实用信息</h3><p>${escapeHtml(item.facilities)}</p></article>
          <article class="info-panel"><h3>FAQ</h3>${item.faq.map((x) => `<p><strong>${escapeHtml(x.q)}</strong><br>${escapeHtml(x.a)}</p>`).join('')}</article>
        </div>

        <aside class="grid">
          <article class="info-panel">
            <h3>信息来源</h3>
            <p>${escapeHtml(item.source)}</p>
          </article>
          <article class="info-panel notice">
            <strong>提示</strong>
            <p>出行前请再次核对官方公告，门票政策与开放时间可能调整。</p>
          </article>
          <article class="info-panel">
            <h3>相关目的地</h3>
            ${data.filter((x) => x.slug !== item.slug).slice(0, 4).map((x) => `<p><a href="guide.html?slug=${encodeURIComponent(x.slug)}">${escapeHtml(x.name)}</a></p>`).join('')}
          </article>
        </aside>
      </section>
    `;

    $('favBtn').addEventListener('click', function () {
      const on = toggleFavorite(item.slug);
      this.textContent = on ? '已收藏' : '收藏攻略';
    });

    $('shareBtn').addEventListener('click', async function () {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        this.textContent = '已复制';
        setTimeout(() => (this.textContent = '复制分享链接'), 1200);
      } catch (_) {
        alert('复制失败，请手动复制链接。');
      }
    });
  }

  function renderFavorites() {
    const el = $('favCards');
    if (!el) return;
    const fav = getFavorites();
    const rows = data.filter((x) => fav.includes(x.slug));
    if (!rows.length) {
      el.innerHTML = '<div class="empty">你还没有收藏攻略，去景点页添加吧。</div>';
      return;
    }
    el.innerHTML = rows.map(formatCard).join('');
    bindCardActions(el);
  }

  applyGlobalSearch();
  renderHome();
  renderList();
  renderGuide();
  renderFavorites();
})();
