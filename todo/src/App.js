import './App.css';
import Header from './components/Header';
import TodoApp from './components/TodoApp';
import About from './components/About';
import { useState } from 'react';

function App() {
  const [page, setPage] = useState('todo'); // 'todo' | 'about'
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'

  return (
    <div className={`App ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <Header
        page={page}
        onNavigate={setPage}
        onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        theme={theme}
      />
      <main className="App-main">
        {page === 'todo' ? <TodoApp theme={theme} /> : <About />}
      </main>
    </div>
  );
}

export default App;
