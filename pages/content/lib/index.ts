import { toggleTheme } from '@lib/toggleTheme';
import { getOdometer } from './getOdometer';

console.log('content script loaded');

void toggleTheme();
void getOdometer();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getOdometer') {
      chrome.runtime.sendMessage({action: "getCookie"}, (response) => {
        if (response.cookie) {
          console.log("ASPXAUTH Cookie value:", response.cookie);
          const form = new FormData();
          form.append("PoolData", "'238'");
          form.append("StartDate", "2024-06-12\n");
          form.append("EndDate", "2024-06-13");
          form.append("StationData", "");
  
          const options = {
            method: 'POST',
            headers: {
              accept: 'application/json, text/javascript, */*; q=0.01',
              'accept-language': 'en-US,en;q=0.9',
              cookie: `.ASPXAUTH=${response.cookie}; ErrorCookie=`,
              origin: 'https://impas.pertamina.com',
              priority: 'u=0, i',
              referer: 'https://impas.pertamina.com/Reporting/FuelUsageHist',
              'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"macOS"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
              'x-requested-with': 'XMLHttpRequest'
            },
            body: form
          };
  
          console.log('options', options);
          fetch('https://impas.pertamina.com/Reporting/TransactionData', options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));
        } else {
          console.log("ASPXAUTH Cookie not found");
        }
      });
      return true; // Indicates asynchronous response
    }
  });