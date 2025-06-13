// On load, check if Unduck new tab is enabled
chrome.storage.sync.get({ enableUnduckNewTab: true }, (data) => {
  if (!data.enableUnduckNewTab) {
    window.location.replace('https://www.google.com');
    return;
  }
  // If enabled, continue loading Unduck new tab
  loadBangs(renderBangs);
});

// Helper: Load bangs from storage
function loadBangs(callback) {
  chrome.storage.sync.get({ customBangs: {} }, (data) => {
    callback(data.customBangs);
  });
}

// Render the list of custom bangs
function renderBangs(bangs) {
  const list = document.getElementById('bangs-list');
  list.innerHTML = '';
  Object.entries(bangs).forEach(([bang, url]) => {
    const li = document.createElement('li');
    li.textContent = `${bang} → ${url}`;
    list.appendChild(li);
  });
}

// Initial render
loadBangs(renderBangs);

// Search form handler (with custom bangs)
document.getElementById('unduck-search-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('unduck-search-input').value.trim();
  if (!query) return;
  loadBangs((bangs) => {
    const words = query.split(/\s+/);
    let foundBang = null;
    let bangIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (bangs[words[i]]) {
        foundBang = words[i];
        bangIndex = i;
        break;
      }
    }
    if (foundBang) {
      const rest = words.slice(0, bangIndex).concat(words.slice(bangIndex + 1)).join(' ');
      const url = bangs[foundBang].replace('%s', encodeURIComponent(rest));
      window.location.href = url;
    } else {
      const url = `https://unduck.link?q=${encodeURIComponent(query)}`;
      window.location.href = url;
    }
  });
});

// Recently visited sites logic
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function renderRecentSites(sites) {
  const container = document.getElementById('recent-sites');
  container.innerHTML = '';
  sites.forEach(site => {
    const a = document.createElement('a');
    a.className = 'recent-site';
    a.href = site.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const favicon = document.createElement('img');
    favicon.className = 'recent-site-favicon';
    favicon.src = `https://www.google.com/s2/favicons?domain=${getDomain(site.url)}&sz=64`;
    favicon.alt = '';

    const title = document.createElement('div');
    title.className = 'recent-site-title';
    title.textContent = site.title || getDomain(site.url);

    const urlDiv = document.createElement('div');
    urlDiv.className = 'recent-site-url';
    urlDiv.textContent = getDomain(site.url);

    a.appendChild(favicon);
    a.appendChild(title);
    a.appendChild(urlDiv);
    container.appendChild(a);
  });
}

// Fetch 8 most recent unique sites
chrome.history.search({ text: '', maxResults: 50 }, function(results) {
  const unique = [];
  const seen = new Set();
  for (const item of results) {
    const domain = getDomain(item.url);
    if (!seen.has(domain) && !item.url.startsWith('chrome://')) {
      seen.add(domain);
      unique.push(item);
    }
    if (unique.length >= 8) break;
  }
  renderRecentSites(unique);
}); 