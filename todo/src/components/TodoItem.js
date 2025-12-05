import React, { useMemo, useState } from 'react';

function relTime(deadline) {
  if(!deadline) return '';
  const d = new Date(deadline);
  const now = new Date();
  const diff = d - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  if (diff > 0) {
    if (mins < 60) return `due in ${mins}m`;
    const hrs = Math.round(mins/60);
    if (hrs < 24) return `due in ${hrs}h`;
    const days = Math.round(hrs/24);
    return `due in ${days}d`;
  } else {
    if (mins < 60) return `overdue ${mins}m`;
    const hrs = Math.round(mins/60);
    if (hrs < 24) return `overdue ${hrs}h`;
    const days = Math.round(hrs/24);
    return `overdue ${days}d`;
  }
}

export default function TodoItem({ task, onToggle, onDelete, onUpdate }) {
  const rel = useMemo(()=> task.deadline ? relTime(task.deadline) : null, [task.deadline]);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.text);
  const [prio, setPrio] = useState(task.priority || 'medium');

  function save() {
    setEditing(false);
    if(value.trim() && (value !== task.text || prio !== task.priority)) {
      onUpdate && onUpdate(task.id, { text: value.trim(), priority: prio });
    }
  }

  return (
    <div className={`todo-item ${task.done ? 'done-anim' : ''}`} role="listitem" aria-label={task.text}>
      <div className="todo-left">
        <input type="checkbox" checked={task.done} onChange={onToggle} aria-label={`Mark ${task.text}`} />
        <div>
          {editing ? (
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <input value={value} onChange={e=>setValue(e.target.value)} style={{padding:6, borderRadius:6, border:'1px solid #e6edf3'}} />
              <select value={prio} onChange={e=>setPrio(e.target.value)}>
                <option value="high">High 🔥</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button onClick={save}>Save</button>
              <button onClick={()=>{ setEditing(false); setValue(task.text); setPrio(task.priority||'medium'); }}>Cancel</button>
            </div>
          ) : (
            <>
              <div className={`todo-text ${task.done ? 'completed' : ''}`} onDoubleClick={()=>setEditing(true)}>{task.text}</div>
              <div className="todo-meta">
                {task.deadline ? `${new Date(task.deadline).toLocaleString()} · ${rel}` : 'no deadline'}
                <span className={`prio-badge prio-${task.priority||'medium'}`} style={{marginLeft:8}}>{task.priority || 'medium'}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button onClick={()=> setEditing(s=>!s)} aria-label={`Edit ${task.text}`} style={{background:'transparent', border:'none', cursor:'pointer'}}>✏️</button>
        <button onClick={onDelete} aria-label={`Delete ${task.text}`} style={{background:'transparent', border:'none', cursor:'pointer'}}>🗑️</button>
        <div style={{fontSize:12, color:'#94a3b8'}}>{new Date(task.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
}
