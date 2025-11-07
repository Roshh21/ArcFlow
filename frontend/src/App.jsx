import React, { useState } from 'react';
import WelcomePage from './pages/WelcomePage.jsx';
import HomePage from './pages/HomePage.jsx';
import StoryPage from './pages/StoryPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SettingsModal from './components/SettingsModal.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [storyMode, setStoryMode] = useState('user');

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const showHeader = currentPage !== 'welcome';

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            setCurrentPage={setCurrentPage}
            onStartStory={(mode) => {
              setStoryMode(mode);
              setCurrentPage('story');
            }}
          />
        );
      case 'story':
        return <StoryPage setCurrentPage={setCurrentPage} mode={storyMode} />;
      case 'history':
        return <HistoryPage setCurrentPage={setCurrentPage} />;
      default:
        return <WelcomePage onLogin={() => setCurrentPage('home')} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-screen font-sans bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 text-white transition-colors duration-500">
      {showHeader && (
        <header className="flex justify-between items-center p-4 shadow-lg z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-700 text-white transition-colors duration-500">
          <h1
            className="text-3xl font-bold cursor-pointer transition-transform transform hover:scale-105 text-purple-500"
            onClick={() => setCurrentPage('welcome')}
          >
            Arcflow
          </h1>
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('home')}
              className="transition-colors duration-300 hover:text-purple-400 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className="transition-colors duration-300 hover:text-purple-400 font-medium"
            >
              History
            </button>
            <button
              onClick={toggleSettings}
              className="transition-colors duration-300 hover:text-purple-400 font-medium"
            >
              Settings
            </button>
          </nav>
        </header>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8">{renderPage()}</main>

      {isSettingsOpen && <SettingsModal onClose={toggleSettings} />}
    </div>
  );
}

export default App;