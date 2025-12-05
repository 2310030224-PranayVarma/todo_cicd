import React, { useEffect, useState, useMemo, useRef } from 'react';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import Clock from './Clock';
import Calendar from './Calendar';

const STORAGE_KEY = 'todoist.tasks.v1';

function playCompleteTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.02;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, 120);
  } catch (e) {
    // ignore if audio not allowed
  }
}

export default function TodoApp({ theme }) {
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [sortBy, setSortBy] = useState('priority'); // priority | deadline | newest
  const searchRef = useRef(null);

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) setTasks(JSON.parse(raw));
  },[]);

  // listen for external updates coming from H2Console
  useEffect(()=>{
    function onExternal(e){
      try {
        if(e?.detail?.tasks) setTasks(e.detail.tasks);
      } catch {}
    }
    window.addEventListener('todo-updated', onExternal);
    return ()=> window.removeEventListener('todo-updated', onExternal);
  },[]);

  useEffect(()=> localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks]);

  // keyboard shortcut to focus search (Ctrl/Cmd+K)
  useEffect(()=>{
    function onKey(e){
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  function addTask(text, deadline, priority = 'medium') {
    if(!text || !text.trim()) return;
    const t = {
      id: Date.now().toString(),
      text: text.trim(),
      done:false,
      priority,
      deadline: deadline || null,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [t, ...prev]);
  }

  function updateTask(id, data) {
    setTasks(prev => prev.map(t => t.id === id ? {...t, ...data} : t));
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t=>{
      if(t.id!==id) return t;
      const next = {...t, done: !t.done};
      if(!t.done && next.done) playCompleteTone();
      return next;
    }));
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function clearCompleted() {
    setTasks(prev => prev.filter(t => !t.done));
  }

  function exportTasks() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todoist-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importTasksFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if(Array.isArray(imported)) {
          setTasks(imported);
          window.dispatchEvent(new CustomEvent('todo-updated', {detail:{tasks: imported}}));
        }
      } catch (e) {
        // ignore
      }
    };
    reader.readAsText(file);
  }

  const filtered = useMemo(()=>{
    let out = tasks.slice();
    if(query) {
      const q = query.toLowerCase();
      out = out.filter(t => t.text.toLowerCase().includes(q));
    }
    if(filter === 'active') out = out.filter(t => !t.done);
    if(filter === 'completed') out = out.filter(t => t.done);

    if(sortBy === 'priority') {
      const score = p => (p === 'high' ? 0 : p === 'medium' ? 1 : 2);
      out.sort((a,b) => score(a.priority) - score(b.priority) || (a.deadline ? 0 : 1) - (b.deadline ? 0 : 1) || new Date(b.createdAt) - new Date(a.createdAt));
    } else if(sortBy === 'deadline') {
      out.sort((a,b)=>{
        if(a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
        if(a.deadline) return -1;
        if(b.deadline) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      out.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    }
    return out;
  }, [tasks, query, filter, sortBy]);

  return (
    <div className="todo-container" role="application" aria-label="Todoist app">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <h2 style={{margin:0}}>Your Tasks</h2>
          <div style={{color:'#6b7280', fontSize:13}}>({tasks.length})</div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <Clock />
          <Calendar />
        </div>
      </div>

      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:10}}>
        <input
          ref={searchRef}
          placeholder="Search tasks (Ctrl/Cmd+K)"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          style={{padding:8, borderRadius:8, border:'1px solid #e6edf3', flex:1}}
        />
        <div style={{display:'flex', gap:8}}>
          <select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Sort">
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
            <option value="newest">Newest</option>
          </select>
          <button onClick={clearCompleted} title="Remove completed">Clear Completed</button>
        </div>
        <div style={{display:'flex', gap:8, marginLeft:8}}>
          <button onClick={exportTasks}>Export</button>
          <label style={{display:'inline-block', cursor:'pointer', padding:'6px 8px', borderRadius:6, background:'rgba(0,0,0,0.03)'}}>
            Import
            <input type="file" accept="application/json" style={{display:'none'}} onChange={e=>e.target.files && importTasksFromFile(e.target.files[0])} />
          </label>
        </div>
      </div>

      <TodoInput onAdd={addTask} />

      <TodoList
        tasks={filtered}
        onToggle={toggleDone}
        onDelete={removeTask}
        onUpdate={updateTask}
      />
    </div>
  );
}
