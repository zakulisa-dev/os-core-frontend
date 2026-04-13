import { useState } from 'react';
import styles from './browser.module.css';

export const Browser = () => {
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');

  const loadUrl = () => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    setCurrentUrl(formattedUrl);
  };

  return (
    <div className={styles.browser}>
      <div className={styles.addressBar}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadUrl()}
        />
        <button onClick={loadUrl}>Go</button>
      </div>
      <iframe
        src={currentUrl}
        width="100%"
        height="100%"
        title="browser-frame"
      />
    </div>
  );
};