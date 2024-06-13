import 'webextension-polyfill';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'apps/chrome-extension/lib/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getCookie") {
    chrome.cookies.get({
      url: "https://impas.pertamina.com",
      name: ".ASPXAUTH"
    }, (cookie) => {
      if (cookie) {
        sendResponse({cookie: cookie.value});
      } else {
        sendResponse({cookie: null});
      }
    });
    return true; // Indicates asynchronous response
  }
});

// Make sure listeners are registered immediately
chrome.runtime.onInstalled.addListener(() => {
  console.log("Service Worker Installed");
});
chrome.runtime.onStartup.addListener(() => {
  console.log("Service Worker Started");
});