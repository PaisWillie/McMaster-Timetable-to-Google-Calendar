import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';

const Popup = () => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  const [tableData, setTableData] = useState<string[][]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const checkUrl = async () => {
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

      const urlPattern = /mcmaster\.ca.*STUDENT_CENTER/;

      if (tab.url && urlPattern.test(tab.url)) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    };

    checkUrl();
  }, []);

  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    const urlPattern = /mcmaster\.ca.*STUDENT_CENTER/;

    if (tab.url && urlPattern.test(tab.url)) {
      await chrome.scripting
        .executeScript({
          target: { tabId: tab.id! },
          files: ['/content-runtime/index.iife.js'],
        })
        .catch(err => {
          if (err.message.includes('Cannot access a chrome:// URL')) {
            alert('You cannot inject script here!');
          }
        });
    } else {
      alert('This script can only be injected on Mosaic Student Center.');
    }
  };

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        <p>
          Edit <code>pages/popup/src/Popup.tsx</code>
        </p>
        <button
          className={
            'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
            (isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white')
          }
          onClick={injectContentScript}
          disabled={isButtonDisabled}>
          Click to inject Content Script
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
        (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
      }
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
