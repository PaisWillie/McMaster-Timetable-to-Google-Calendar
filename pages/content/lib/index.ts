import { toggleTheme } from '@lib/toggleTheme';

function formatDateToGoogleCalendar(date: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-indexed
  const day = pad(date.getDate());

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

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

      const parentTable = iframe.contentDocument?.querySelector('table.PSLEVEL1GRIDWBO');
      const grandParent = parentTable?.parentElement;

      if (table && parentTable && grandParent) {
        // Wrap the table element with a div element with styling
        const tableContainer = document.createElement('div');
        tableContainer.id = 'table-container';
        grandParent.appendChild(tableContainer);

        tableContainer.style.display = 'flex';
        tableContainer.style.flexDirection = 'column';
        tableContainer.style.alignItems = 'center';

        const calendarSettingsDiv = document.createElement('div');
        calendarSettingsDiv.id = 'calendar-settings';
        calendarSettingsDiv.style.marginBottom = '20px';
        calendarSettingsDiv.style.display = 'flex';
        calendarSettingsDiv.style.flexDirection = 'column';
        tableContainer.appendChild(calendarSettingsDiv);
        tableContainer.appendChild(parentTable);

        const settingsTitle = document.createElement('h3');
        settingsTitle.id = 'settings-title';
        settingsTitle.innerText = 'Timetable to Google Calendar';
        settingsTitle.style.textAlign = 'center';
        calendarSettingsDiv.appendChild(settingsTitle);

        const startDateInput = document.createElement('input');
        startDateInput.id = 'start-date';
        startDateInput.type = 'date';
        startDateInput.name = 'start-date';

        const startDateLabel = document.createElement('label');
        startDateLabel.innerText = 'Start Date';
        startDateLabel.htmlFor = 'start-date';

        calendarSettingsDiv.appendChild(startDateLabel);
        calendarSettingsDiv.appendChild(startDateInput);

        const endDateInput = document.createElement('input');
        endDateInput.id = 'end-date';
        endDateInput.type = 'date';
        endDateInput.name = 'end-date';

        const endDateLabel = document.createElement('label');
        endDateLabel.innerText = 'End Date';
        endDateLabel.htmlFor = 'end-date';
        endDateLabel.style.marginTop = '10px';

        calendarSettingsDiv.appendChild(endDateLabel);
        calendarSettingsDiv.appendChild(endDateInput);

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

            // Set up event data for a new Google Calendar event
            // where the event will be a weekly repeating event
            // Starting from a specific date
            // Ending on a specific date
            // Repeats on the specified days of the week from `classTimingDays` at `classTimingTime`

            const button = document.createElement('button');
            button.innerText = 'Add to Calendar';

            // When pressed, open a blank new tab
            button.addEventListener('click', () => {
              // window.open('https://calendar.google.com', '_blank');

              // console.log(formatDateToGoogleCalendar(new Date(startDateInput.value)));

              const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
              const title = encodeURIComponent(`${classCode} ${classSection}`);
              const location = encodeURIComponent(classLocation);

              // Convert "TuThFr" to "TU,TH,FR"
              const recurrenceByDay = classTimingDays
                .match(/([A-Z][a-z]+)/g)
                ?.map(day => day)
                .join(',');
              const recurrenceStart = formatDateToGoogleCalendar(new Date(startDateInput.value));
              const recurrenceEnd = formatDateToGoogleCalendar(new Date(endDateInput.value));

              // convert classTimingTime (where classTimingTime is formatted like "11:30AM - 12:20PM") to YYYYMMDDTHHMMSSZ,
              // with the date set to the start date
              console.log(new Date(classTimingTime.split(' - ')[0]));

              console.log('title: ', title);
              console.log('location: ', location);
              console.log('recurrenceByDay: ', recurrenceByDay);
              console.log('recurrenceStart: ', recurrenceStart);
              console.log('recurrenceEnd: ', recurrenceEnd);

              const recurrenceRule = encodeURIComponent(
                `RRULE:FREQ=WEEKLY;BYDAY=${recurrenceByDay};UNTIL=${recurrenceEnd}`,
              );

              // Get event start in the format "YYYYMMDDTHHMMSSZ"
              //

              const url = `${baseUrl}&text=${title}&location=${location}&dates=${recurrenceStart}/${recurrenceEnd}&recur=${recurrenceRule}`;

              // open url in new tab
              window.open(url, '_blank');
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
