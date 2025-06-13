chrome.omnibox.onInputEntered.addListener((text) => {
  const url = `https://unduck.link?q=${encodeURIComponent(text)}`;
  chrome.tabs.create({ url });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'search-unduck',
    title: 'Search with Unduck',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'search-unduck' && info.selectionText) {
    const url = `https://unduck.link?q=${encodeURIComponent(info.selectionText)}`;
    chrome.tabs.create({ url });
  }
}); 