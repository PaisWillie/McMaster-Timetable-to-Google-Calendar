import { toggleTheme } from '@lib/toggleTheme';

const scrapeTableData = () => {
  const data: string[][] = [];

  const iframe = document.querySelectorAll('iframe')[0]; // Adjust the selector to target the correct iframe

  if (iframe) {
    iframe.addEventListener('load', () => {
      // inject styling to change the background color of the td with the "PSLEVEL3GRID" class
      const style = document.createElement('style');
      // style.innerHTML = `
      //   .PSLEVEL3GRID {
      //     background-color: #f0f0f0;
      //   }
      // `;
      iframe.contentDocument?.head.appendChild(style);

      const table = iframe.contentDocument?.querySelector('table.PSLEVEL1GRID'); // Adjust the selector to target the correct table

      if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
          const cells = row.querySelectorAll('td');
          const rowData = Array.from(cells).map(cell => cell.innerText);
          data.push(rowData);

          // Add a <button> to the end of each row
          if (index === 0) {
            // inject a th element
            const th = document.createElement('th');

            // Add the following properties to the element:
            // scope="col" abbr="Schedule" width="111" align="CENTER" class="PSLEVEL3GRIDCOLUMNHDR"
            th.setAttribute('scope', 'col');
            th.setAttribute('abbr', 'Schedule');
            th.setAttribute('width', '111');
            th.setAttribute('align', 'CENTER');
            th.setAttribute('class', 'PSLEVEL3GRIDCOLUMNHDR');

            th.innerText = 'Add to Google Calendar';
            row.appendChild(th);
          }

          if (index !== 0) {
            // Extract data
            const [classData, scheduleData] = rowData;

            // Extract class schedule timings and location
            const [classTimings, classLocation] = scheduleData.split('\n');

            // console.log("classTimings", classTimings);

            // Extract days of week & time
            const [classTimingDays, ...classTimingsTimeParts] = classTimings.split(' ');
            const classTimingTime = classTimingsTimeParts.join(' ');

            // Extract class code, section and type
            const [classCodeAndSection, classType] = classData.split('\n');
            const [classCode, classSection] = classCodeAndSection.split('-');

            // Example data
            // classCode: SFWRENG 4G06A
            // classSection: C01
            // classType: LEC (3068)
            // classLocation: PGCLL M21
            // classTimingDays: TuThFr
            // classTimingTime: 11:30AM - 12:20PM

            const button = document.createElement('button');
            button.innerText = 'Click me';

            // When pressed, open a blank new tab
            button.addEventListener('click', () => {
              window.open('https://calendar.google.com', '_blank');
            });

            const td = document.createElement('td');

            // Add the respective classes to cell to match the table style
            if (index % 2 === 0) {
              td.setAttribute('class', 'PSLEVEL2GRIDEVENROW');
            } else {
              td.setAttribute('class', `PSLEVEL3GRID`);
            }

            // Center the button
            td.style.textAlign = 'center';

            td.appendChild(button);
            row.appendChild(td);
          }
        });
        console.log('data', data);
      } else {
        console.error('Child table not found');
      }
    });
  } else {
    console.error('iframe not found');
  }
};

// const sendTableDataToPopup = () => {
//   const tableData = scrapeTableData();
//   chrome.runtime.sendMessage({ type: 'TABLE_DATA', data: tableData });
// };

console.log('Mosaic Student Center detected! Content script loaded');
scrapeTableData();
void toggleTheme();

/*
import { mount } from '@lib/root';

const scrapeTableData = () => {
  const tables = document.querySelectorAll('table'); // Adjust the id as needed
  console.log('document', document);
  const table = tables[22]; // Adjust the index as needed
  console.log("tables", tables);
  const data: string[][] = [];
  console.log("Searching for parent table");
  if (table) {
      console.log("Found nested table");
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => cell.innerText);
        data.push(rowData);
      });
  }
  console.log("data", data);
  return data;
};

const sendTableDataToPopup = () => {
  const tableData = scrapeTableData();
  chrome.runtime.sendMessage({ type: 'TABLE_DATA', data: tableData });
};

mount();
console.log('Running content script');

// Scrape and send the table data after the script is loaded
sendTableDataToPopup();
*/
