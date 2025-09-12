
'use strict';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_CONTEXT') {
    if (request.projectId && request.data) {
      chrome.storage.local.set({ [request.projectId]: request.data }, () => {
        sendResponse({ status: 'success' });
      });
    }
    return true; // Indicates that the response is sent asynchronously
  }

  if (request.type === 'LOAD_CONTEXT') {
    if (request.projectId) {
      chrome.storage.local.get(request.projectId, (result) => {
        if (chrome.runtime.lastError) {
          sendResponse({ data: null });
        } else {
          sendResponse({ data: result[request.projectId] || null });
        }
      });
    }
    return true; // Indicates that the response is sent asynchronously
  }
});
