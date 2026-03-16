# trip

一个基于静态 HTML/CSS/JS 的旅行攻略网站示例，包含中国 10 大热门景点详细攻略页面。

## 页面
- `index.html` 首页
- `destinations.html` 景点列表（搜索/筛选/排序）
- `guide.html?slug=...` 景点详情攻略
- `favorites.html` 我的收藏（LocalStorage）

## 运行方式
1. 直接双击 `index.html` 打开。
2. 或在项目目录执行：
   - `python -m http.server 8080`
   - 浏览器访问 `http://localhost:8080`

## 已实现能力
- 中国 10 大热门景点数据与攻略内容
- 景点卡片展示
- 关键词搜索
- 地区/季节/人群筛选
- 热度/评分/更新时间排序
- 收藏与取消收藏（本地存储）
- 详情页复制分享链接
- 响应式布局（移动端与桌面端）
