import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Polls from './pages/Polls';
import Ideas from './pages/Ideas';
import News from './pages/News';
import About from './pages/About';
import DynamicContentPage from './pages/DynamicContentPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-container">
      {/* Note: Remove currentPage and setCurrentPage from Header props 
         because you are now using the Router's URL to manage state.
      */}
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />
      
      <main className="content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/details/:slug" element={<DynamicContentPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;