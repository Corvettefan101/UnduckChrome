// Helper: Load bangs from storage
function loadBangs(callback) {
  chrome.storage.sync.get({ customBangs: {} }, (data) => {
    callback(data.customBangs);
  });
}

// Helper: Save bangs to storage
function saveBangs(bangs, callback) {
  chrome.storage.sync.set({ customBangs: bangs }, callback);
}

// Render the list of custom bangs
function renderBangs(bangs) {
  const list = document.getElementById('bangs-list');
  list.innerHTML = '';
  Object.entries(bangs).forEach(([bang, url]) => {
    const li = document.createElement('li');
    li.textContent = `${bang} → ${url}`;
    const delBtn = document.createElement('button');
    delBtn.textContent = '✖';
    delBtn.className = 'delete-bang-btn';
    delBtn.onclick = () => {
      delete bangs[bang];
      saveBangs(bangs, () => renderBangs(bangs));
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Add bang form handler
const addBangForm = document.getElementById('add-bang-form');
addBangForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const key = document.getElementById('bang-key').value.trim();
  const url = document.getElementById('bang-url').value.trim();
  if (!key.startsWith('!') || !url.includes('%s')) {
    alert('Bang must start with ! and URL must include %s');
    return;
  }
  loadBangs((bangs) => {
    bangs[key] = url;
    saveBangs(bangs, () => {
      renderBangs(bangs);
      addBangForm.reset();
    });
  });
});

// --- Tab UI Logic ---
const mainTabBtn = document.getElementById('main-tab-btn');
const settingsTabBtn = document.getElementById('settings-tab-btn');
const mainTab = document.getElementById('main-tab');
const settingsTab = document.getElementById('settings-tab');

mainTabBtn.addEventListener('click', () => {
  mainTabBtn.classList.add('active');
  settingsTabBtn.classList.remove('active');
  mainTab.style.display = '';
  settingsTab.style.display = 'none';
});
settingsTabBtn.addEventListener('click', () => {
  settingsTabBtn.classList.add('active');
  mainTabBtn.classList.remove('active');
  settingsTab.style.display = '';
  mainTab.style.display = 'none';
});

// --- New Tab toggle logic ---
const toggleNewTab = document.getElementById('toggle-newtab');
const reloadWarning = document.getElementById('reload-warning');

// Initialize toggle state from storage
chrome.storage.sync.get({ enableUnduckNewTab: true }, (data) => {
  toggleNewTab.checked = !!data.enableUnduckNewTab;
});

toggleNewTab.addEventListener('change', () => {
  chrome.storage.sync.set({ enableUnduckNewTab: toggleNewTab.checked }, () => {
    reloadWarning.style.display = 'block';
    reloadBtn.style.display = 'inline-block';
  });
});

// --- Reload Extension Button ---
const reloadBtn = document.getElementById('reload-extension-btn');
if (reloadBtn) {
  reloadBtn.addEventListener('click', () => {
    // Open chrome://extensions and highlight this extension
    const extId = chrome.runtime.id;
    const url = `chrome://extensions/?id=${extId}`;
    chrome.tabs.create({ url });
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
    // Find if any custom bang is present in the query
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
      // Remove the bang from the query and join the rest
      const rest = words.slice(0, bangIndex).concat(words.slice(bangIndex + 1)).join(' ');
      const url = bangs[foundBang].replace('%s', encodeURIComponent(rest));
      chrome.tabs.create({ url });
    } else {
      const url = `https://unduck.link?q=${encodeURIComponent(query)}`;
      chrome.tabs.create({ url });
    }
  });
}); 