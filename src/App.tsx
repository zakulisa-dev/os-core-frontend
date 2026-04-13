import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { TopBar } from '@Components/TopBar/TopBar';
import { BottomPanel } from '@Components/BottomPanel/BottomPanel';
import { Login } from '@Pages/Login/Login';
import { Registration } from '@Pages/Registration/Registration';
import { Main } from '@Pages/Main/Main';
import { Theme } from '@Features/settings/enums';
import { useTheme } from '@Settings/stores/settings.store';

if (import.meta.env.DEV) {
  import('react').then((React) => {
    window.React = React.default;
  });
  import('react-dom').then((ReactDOM) => {
    window.ReactDOM = ReactDOM.default;
  });
}

const App = () => {
  const theme = useTheme();
  const [themeStyle, setThemeStyle] = useState('darkTheme');
  const [height, setHeight] = useState(document.documentElement.clientHeight);

  useEffect(() => {
    const body = document.body;

    switch (theme) {
      case Theme.Dark: {
        setThemeStyle('darkTheme');
        body.setAttribute('data-theme', 'dark');
        break;
      }
      case Theme.Light: {
        setThemeStyle('lightTheme');
        body.setAttribute('data-theme', 'light');
        break;
      }
      case Theme.Blue: {
        setThemeStyle('blueTheme');
        body.setAttribute('data-theme', 'blue');
        break;
      }
      case Theme.Green: {
        setThemeStyle('greenTheme');
        body.setAttribute('data-theme', 'green');
        break;
      }
      default: {
        setThemeStyle('darkTheme');
        body.setAttribute('data-theme', 'dark');
      }
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <AnimatePresence>
        <div className={themeStyle} style={{ height: height }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route
              path="/"
              element={
                <>
                  <TopBar />
                  <Main />
                  <BottomPanel />
                </>
              }
            />
          </Routes>
        </div>
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
