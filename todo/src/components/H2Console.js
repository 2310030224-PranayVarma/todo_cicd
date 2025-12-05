import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'todoist.tasks.v1';
const BACKEND_BASE = 'http://localhost:6750'; // example backend port, ensure server has CORS enabled

export default function H2Console({ onClose }) {
  const [text, setText] = useState('');
  const [log, setLog] = useState('');

  useEffect(()=> {
    const current = localStorage.getItem(STORAGE_KEY) || '[]';
    setText(current);
  }, []);

  function refresh() {
    const current = localStorage.getItem(STORAGE_KEY) || '[]';
    setText(current);
    appendLog('refreshed from localStorage');
  }

  function saveToStorage() {
    try {
      JSON.parse(text); // validate
      localStorage.setItem(STORAGE_KEY, text);
      appendLog('saved to localStorage');
      // notify app
      const tasks = JSON.parse(text);
      window.dispatchEvent(new CustomEvent('todo-updated', {detail:{tasks}}));
    } catch (e) {
      appendLog('invalid JSON, save failed');
    }
  }

  function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
    appendLog('localStorage cleared');
    window.dispatchEvent(new CustomEvent('todo-updated', {detail:{tasks: []}}));
    setText('[]');
  }

  function importFile(file) {
    const r = new FileReader();
    r.onload = () => {
      setText(r.result);
      appendLog('imported file content');
    };
    r.readAsText(file);
  }

  function exportFile() {
    const blob = new Blob([text], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'h2console-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
    appendLog('exported file');
  }

  async function loadFromBackend() {
    appendLog(`attempt backend GET ${BACKEND_BASE}/tasks`);
    try {
      const res = await fetch(`${BACKEND_BASE}/tasks`, { method: 'GET' });
      if(!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const txt = JSON.stringify(data, null, 2);
      setText(txt);
      appendLog('loaded tasks from backend');
      // notify app
      window.dispatchEvent(new CustomEvent('todo-updated', {detail:{tasks: data}}));
    } catch (e) {
      appendLog('backend load failed: ' + e.message);
    }
  }

  async function saveToBackend() {
    appendLog(`attempt backend POST ${BACKEND_BASE}/tasks`);
    try {
      const payload = JSON.parse(text);
      const res = await fetch(`${BACKEND_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error(`status ${res.status}`);
      appendLog('saved tasks to backend');
    } catch (e) {
      appendLog('backend save failed: ' + e.message);
    }
  }

  function appendLog(m) {
    setLog(l => `${new Date().toLocaleTimeString()} — ${m}\n` + l);
  }

  return (
    <div className="h2-console" role="dialog" aria-label="H2 Console">
      <div className="h2-header">
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <strong>H2 Console (bridge)</strong>
          <div className="h2-stats">local key: {STORAGE_KEY} • backend: {BACKEND_BASE}</div>
        </div>
        <div className="h2-actions">
          <input type="file" accept="application/json" onChange={e=>e.target.files && importFile(e.target.files[0])} />
          <button onClick={refresh}>Refresh (local)</button>
          <button onClick={saveToStorage}>Save (local)</button>
          <button onClick={exportFile}>Export</button>
          <button onClick={clearStorage}>Clear</button>
          <button onClick={loadFromBackend}>Load from backend</button>
          <button onClick={saveToBackend}>Save to backend</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>

      <textarea value={text} onChange={e=>setText(e.target.value)} />

      <div className="h2-log" aria-live="polite">{log || 'log empty'}</div>
    </div>
  );
}
