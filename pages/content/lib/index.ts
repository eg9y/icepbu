import { toggleTheme } from '@lib/toggleTheme';
import { getOdometer } from './getOdometer';

// console.log('content script loaded');

void toggleTheme();
void getOdometer();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getOdometerData') {
    console.log('init getOdometerData', request);

    chrome.runtime.sendMessage({ action: 'getCookie' }, async (response: { cookie: string; domain: string }) => {
      console.log('getCookie response:', response);

      try {
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
          //       fetch('https://impas.pertamina.com/Reporting/TransactionData', options)
          //         .then(response => response.json())
          //         .then(mainData => {
          //           // Fetch from the second endpoint
          //           fetch(
          //             `http://localhost:3000/transactions?accountNumber=${accountNumber}&startDate=${periodRange[0]}&endDate=${periodRange[1]}`,
          //           )
          //             .then(response => response.json())
          //             .then(odometerData => {
          //               // console.log('Odometer data:', odometerData);

          //               // Create a mapping from Card_Number to Odometer
          //               const odometerMap = new Map(odometerData.map((item: any) => [item.Card_Number, item.Odometer]));
          //               console.log(odometerMap, 'odometerMap');

          //               // Iterate over the rows and fill in the odometer data
          //               mainData.forEach((item: any) => {
          //                 const odometer = (odometerMap.get(item.CardNo) as string | null) || 'N/A';
          //                 const rowId = `grid_grid_trans_rec_${item.recid}`;
          //                 const rowElement = document.querySelector(`#${rowId}`);
          //                 if (rowElement) {
          //                   const odometerCell = rowElement.querySelector(`[id^="grid_grid_trans_data_"][id$="_4"]`);
          //                   if (odometerCell) {
          //                     odometerCell.textContent = odometer;
          //                   }
          //                 }
          //               });

          //               const dataToCopy = mainData.map((item: any) => {
          //                 return {
          //                   ...item,
          //                   odometer: odometerMap.get(item.CardNo) || 'N/A',
          //                 };
          //               });
          //               function getHTMLContent(dataGrid: any[]) {
          //                 const mappedData = dataGrid.map((item: any) => {
          //                   return {
          //                     ...item,
          //                     Price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.Price),
          //                     Quantity: item.Quantity.toString(),
          //                     TotalAmount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
          //                       item.TotalAmount,
          //                     ),
          //                   };
          //                 });
          //                 const columns = [
          //                   {
          //                     field: 'TransactionDateTime',
          //                     caption: 'Trans. Date',
          //                     size: '150px',
          //                     sortable: true,
          //                     info: true,
          //                     frozen: false,
          //                   },
          //                   { field: 'PoolId', caption: 'Account No.', size: '100px', sortable: true, searchable: 'text' },
          //                   { field: 'PoolName', caption: 'Account Name', size: '300px', sortable: true, searchable: 'text' },
          //                   { field: 'CardNo', caption: 'Card No.', size: '100px', sortable: true, searchable: 'text' },
          //                   { field: 'Odometer', caption: 'Odometer', size: '100px', sortable: true, searchable: 'text' },
          //                   {
          //                     field: 'CardHolder',
          //                     caption: 'Card Holder',
          //                     size: '200px',
          //                     sortable: true,
          //                     searchable: 'text',
          //                   },
          //                   { field: 'VehicleNo', caption: 'Vehicle No.', size: '100px', sortable: true, searchable: 'text' },
          //                   { field: 'Station', caption: 'Station', size: '250px', sortable: true, searchable: 'text' },
          //                   {
          //                     field: 'Quantity',
          //                     caption: 'Qty (Liters)',
          //                     size: '100px',
          //                   },
          //                   { field: 'Price', caption: 'Price', size: '100px', sortable: true, searchable: 'text' },
          //                   {
          //                     field: 'TotalAmount',
          //                     caption: 'Total Transaction',
          //                     size: '100px',
          //                     sortable: true,
          //                     searchable: 'text',
          //                   },
          //                   {
          //                     field: 'Description',
          //                     caption: 'Description',
          //                     size: '250px',
          //                     sortable: true,
          //                     searchable: 'text',
          //                   },
          //                   { field: 'Source', caption: 'Source POS', size: '250px', sortable: true, searchable: 'text' },
          //                 ];
          //                 return `
          // <!DOCTYPE html>
          // <html>
          // <head>
          //   <title>My HTML Page</title>
          //   <style>
          //     body {
          //       font-family: Arial, sans-serif;
          //       background-color: #f0f0f0;
          //       text-align: center;
          //       padding-top: 50px;
          //     }
          //   </style>
          //   <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
          //   <script src="https://cdnjs.cloudflare.com/ajax/libs/w2ui/1.5.3/kickstart.min.js"> </script>
          //   <link rel="stylesheet" type="text/css" href="https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.css">
          //   <script>
          //     $(document).ready(function() {
          //       $('body').append('<p>Data IMPAS!</p>');
          //     });
          //   </script>
          //    <script type="module">
          //     import { w2grid, w2alert, query } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.js';

          //     let grid = new w2grid({
          //       name: 'grid',
          //       box: '#grid',
          //       show: {
          //         selectColumn: true
          //       },
          //       columns: ${JSON.stringify(columns)},
          //       records: ${JSON.stringify(mappedData)},
          //       onSelect(event) {
          //         console.log(event);
          //         query('#log').html(\`
          //           <span style="color: #777">Multiple:</span> \${event.detail.multiple},
          //           <span style="color: #777">All:</span> \${event.detail.all ?? 'false'},
          //           <span style="color: #777">Recids:</span> \${event.detail.recids ?? []}
          //         \`);
          //       }
          //     });

          //     window.action = function (method, param1, param2, param3) {
          //       grid[method](param1, param2, param3);
          //     };

          //     window.showSelection = function () {
          //       w2alert(grid.getSelection());
          //     };
          //   </script>

          // </head>
          // <body>
          //   <div id="grid" style="width: 100%; height: 250px;"></div>
          //   <div id="log"></div>
          // </body>
          // </html>`;
          //               }
          //               console.log(chrome, 'chrome');

          //               // chrome.tabs.create({
          //               //   url: 'data:text/html;charset=utf-8,' + encodeURIComponent(getHTMLContent(dataToCopy)),
          //               // });
          //               // window.open('data:text/html;charset=utf-8,' + encodeURIComponent(getHTMLContent(dataToCopy)), '_blank');
          //             })
          //             .catch(err => console.error('Error fetching odometer data:', err));
          //         })
          //         .catch(err => console.error('Error fetching main data:', err));

          const responseJson = await fetch('https://impas.pertamina.com/Reporting/TransactionData', options);
          const mainData = await responseJson.json();
          const odometerDataJson = await fetch(
            `http://localhost:3000/transactions?accountNumber=${accountNumber}&startDate=${periodRange[0]}&endDate=${periodRange[1]}`,
          );
          const odometerData = await odometerDataJson.json();
          const odometerMap = new Map(odometerData.map((item: any) => [item.Card_Number, item.Odometer]));

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
              Odometer: odometerMap.get(item.CardNo) || 'N/A',
            };
          });
          sendResponse(dataToCopy);
          console.log('response sent');
          return dataToCopy;
        } else {
          return false; // console.log("ASPXAUTH Cookie not found");
        }
      } catch (error) {
        console.log(error, 'error');
        return false;
      }
    });
    console.log('getOdometer done');
  }
  return true;
});
