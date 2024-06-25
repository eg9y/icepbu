import { toggleTheme } from '@lib/toggleTheme';
import { getOdometer } from './getOdometer';

// console.log('content script loaded');

void toggleTheme();
void getOdometer();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getOdometer') {
    console.log('init getOdometer');

    chrome.runtime.sendMessage({ action: 'getCookie' }, (response: any) => {
      if (response.cookie) {
        // Select the elements using querySelector
        const accountNumberElement = document.querySelector('#grid_grid_filter_data_0_1');
        const periodRangeElement = document.querySelector('#grid_grid_filter_data_1_1');

        let accountNumber: any;
        let periodRange: any;

        // Check if the elements exist and get their text content
        if (accountNumberElement) {
          accountNumber = accountNumberElement.textContent?.trim();
          // console.log('accountNumber:', accountNumber);
        } else {
          // console.log('accountNumber element not found');
        }

        if (periodRangeElement) {
          const periodRangeText = periodRangeElement.textContent?.trim();
          periodRange = periodRangeText?.split(' s.d ');
          // console.log('periodRange:', periodRange);
        } else {
          // console.log('periodRange element not found');
        }

        if (!accountNumber || !periodRange) {
          throw new Error('Account dan Period harus di select dulu.');
        }

        // console.log("ASPXAUTH Cookie value:", response.cookie);
        const form = new FormData();
        form.append('PoolData', `'${accountNumber}'`);
        form.append('StartDate', periodRange[0]);
        form.append('EndDate', periodRange[1]);
        form.append('StationData', '');

        const options = {
          method: 'POST',
          headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'en-US,en;q=0.9',
            cookie: `.ASPXAUTH=${response.cookie}; ErrorCookie=`,
            origin: 'https://impas.pertamina.com',
            priority: 'u=0, i',
            referer: 'https://impas.pertamina.com/Reporting/FuelUsageHist',
            'sec-ch-ua': '"Google Chrome";v="125 "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
          },
          body: form,
        };

        // console.log('options', options);

        // Fetch from the first endpoint
        fetch('https://impas.pertamina.com/Reporting/TransactionData', options)
          .then(response => response.json())
          .then(mainData => {

            // Fetch from the second endpoint
            fetch(
              `http://localhost:3000/transactions?accountNumber=${accountNumber}&startDate=${periodRange[0]}&endDate=${periodRange[1]}`,
            )
              .then(response => response.json())
              .then(odometerData => {
                // console.log('Odometer data:', odometerData);

                // Create a mapping from Card_Number to Odometer
                const odometerMap = new Map(odometerData.map((item: any) => [item.Card_Number, item.Odometer]));
                console.log(odometerMap, 'odometerMap');

                // Iterate over the rows and fill in the odometer data
                mainData.forEach((item: any) => {
                  const odometer = (odometerMap.get(item.CardNo) as string | null) || 'N/A';
                  const rowId = `grid_grid_trans_rec_${item.recid}`;
                  const rowElement = document.querySelector(`#${rowId}`);
                  if (rowElement) {
                    const odometerCell = rowElement.querySelector(`[id^="grid_grid_trans_data_"][id$="_4"]`);
                    if (odometerCell) {
                      odometerCell.textContent = odometer;
                    }
                  }
                });

                const dataToCopy = mainData.map((item: any) => {
                  return {
                    ...item,
                    odometer: odometerMap.get(item.CardNo) || 'N/A',
                  };
                });

                function jsonToCSV(jsonData: any[]) {
                  // Extract column headers from the first object
                  const headers = Object.keys(jsonData[0]);
                  console.log(jsonData, 'jsonData');

                  // Create a CSV header row
                  let csvContent = headers.join('\t') + '\n';

                  // Create CSV rows
                  jsonData.forEach(rowObject => {
                    const row = headers.map(header => rowObject[header]);
                    csvContent += row.join('\t') + '\n';
                  });

                  return csvContent;
                }
                function downloadCSV(csvContent: string, filename:string) {
                  // const csvContent = jsonToCSV(data);

                  // Create a blob with the CSV data
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

                  // Create a link element to trigger the download
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', filename);

                  document.body.appendChild(link);
                  link.click();

                  // Cleanup
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }

                const csvData = jsonToCSV(dataToCopy);
                const dateTime = new Date().toISOString().split('T')[0];
                downloadCSV(csvData, `data-${dateTime}.csv`);

                sendResponse({ status: 'Odometer data filled in the DOM' });
               
              })
              .catch(err => console.error('Error fetching odometer data:', err));
          })
          .catch(err => console.error('Error fetching main data:', err));

        return true; // Indicates asynchronous response
      } else {
        return false; // console.log("ASPXAUTH Cookie not found");
      }
      return false;
    });

    return true; // Indicates asynchronous response
  }
  return false;
});
