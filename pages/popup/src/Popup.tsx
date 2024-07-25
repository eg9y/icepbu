import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

import { ComponentPropsWithoutRef } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);

  const getOdometer = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: 'getOdometerData' }, (response: any) => {
        console.log(response, 'responsesendMessage');

        if (response) {
          console.log('response:', response);
          openNewTab(response);
        }
      });
    });
  };

  function openNewTab(responseData: any) {
    chrome.tabs.create({ url: 'data:text/html;charset=utf-8,' + encodeURIComponent(getHTMLContent(responseData)) });
  }
  function getHTMLContent(dataGrid: any) {
    const mappedData = dataGrid.map((item: any) => {
      return {
        ...item,
        Price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.Price),
        Quantity: item.Quantity.toString(),
        TotalAmount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.TotalAmount),
      };
    });

    const columns = [
      {
        field: 'TransactionDateTime',
        text: 'Trans. Date',
        size: '150px',
        sortable: true,
        info: true,
        frozen: false,
      },
      { field: 'PoolId', text: 'Account No.', size: '100px', sortable: true, searchable: 'text' },
      { field: 'PoolName', text: 'Account Name', size: '300px', sortable: true, searchable: 'text' },
      { field: 'CardNo', text: 'Card No.', size: '100px', sortable: true, searchable: 'text' },
      { field: 'Odometer', text: 'Odometer', size: '100px', sortable: true, searchable: 'text' },
      { field: 'CardHolder', text: 'Card Holder', size: '200px', sortable: true, searchable: 'text' },
      { field: 'VehicleNo', text: 'Vehicle No.', size: '100px', sortable: true, searchable: 'text' },
      { field: 'Station', text: 'Station', size: '250px', sortable: true, searchable: 'text' },
      {
        field: 'Quantity',
        text: 'Qty (Liters)',
        size: '100px',
        sortable: true,
        searchable: 'text',
      },
      { field: 'Price', text: 'Price', size: '100px', sortable: true, searchable: 'text' },
      {
        field: 'TotalAmount',
        text: 'Total Transaction',
        size: '100px',
        sortable: true,
        searchable: 'text',
      },
      { field: 'Description', text: 'Description', size: '250px', sortable: true, searchable: 'text' },
      { field: 'Source', text: 'Source POS', size: '250px', sortable: true, searchable: 'text' },
    ];
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>My HTML Page</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
        text-align: center;
        padding-top: 50px;
      }
    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/w2ui/1.5.3/kickstart.min.js"> </script>
    <link rel="stylesheet" type="text/css" href="https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.min.css">
    <script>
      $(document).ready(function() {
        $('body').append('<p>Data IMPAS!</p>');
      });
    </script>
     <script type="module">
      import { w2grid, w2alert, query } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.js';

      let grid = new w2grid({
        name: 'grid',
        box: '#grid',
        show: {
          selectColumn: true
        },
        columns: ${JSON.stringify(columns)},
        records: ${JSON.stringify(mappedData)},
        onSelect(event) {
          console.log(event);
          query('#log').html(\`
            <span style="color: #777">Multiple:</span> \${event.detail.multiple},
            <span style="color: #777">All:</span> \${event.detail.all ?? 'false'},
            <span style="color: #777">Recids:</span> \${event.detail.recids ?? []}
          \`);
        }
      });

      window.action = function (method, param1, param2, param3) {
        grid[method](param1, param2, param3);
      };

      window.showSelection = function () {
        w2alert(grid.getSelection());
      };
    </script>

  </head>
  <body>
    <div id="grid" style="width: 100%; height: 250px;"></div>
    <div id="log"></div>
  </body>
  </html>`;
  }

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#eee' : '#222',
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#222' : '#eee' }}>
        <button
          className="p-4 bg-green-300 text-emerald-950 rounded-md font-bold hover:font-extrabold"
          onClick={getOdometer}>
          Update Odometer
        </button>
        <ToggleButton>Toggle theme</ToggleButton>
      </header>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  return (
    <button
      className={
        props.className +
        ' ' +
        'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
        (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
