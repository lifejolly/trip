# trip

A sample travel guide website built with static HTML/CSS/JS, including detailed guide pages for 10 popular attractions in China.

## Pages
- `index.html` Home
- `destinations.html` Attractions list (search/filter/sort)
- `guide.html?slug=...` Attraction guide details
- `favorites.html` My favorites (LocalStorage)

## How to run
1. Open `index.html` directly (double-click).
2. Or run in the project directory:
   - `python -m http.server 8080`
   - Then visit `http://localhost:8080` in your browser.

## Implemented features
- Data and guide content for 10 popular attractions in China
- Attraction card layout
- Keyword search
- Filters by region / season / audience
- Sorting by popularity / rating / last updated
- Add/remove favorites (local storage)
- Copy share link on the details page
- Responsive layout (mobile & desktop)
