import React from 'react';

export default function Header({ page, onNavigate, onToggleTheme, theme }) {
  return (
    <header className="app-header-bar" role="banner">
      <div className="app-title">
        <span style={{fontSize:22}}>🗂️</span>
        <div>
          <div style={{fontSize:16}}>Todo-ist</div>
          <div style={{fontSize:11, color:'#c7d2fe'}}>organize • focus • ship</div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="small-clock" aria-hidden>
          {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </div>
        <nav className="nav-buttons" aria-label="Main navigation">
          <button className={page==='todo'? 'active':''} onClick={()=>onNavigate('todo')}>Tasks</button>
          <button className={page==='about'? 'active':''} onClick={()=>onNavigate('about')}>About</button>
          <button onClick={onToggleTheme} title="Toggle theme" style={{marginLeft:8, padding:'6px 8px', borderRadius:6}}>
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
