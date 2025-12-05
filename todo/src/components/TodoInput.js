import React, { useState } from 'react';

export default function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  function submit(e){
    e.preventDefault();
    onAdd(text, deadline || null, priority);
    setText('');
    setDeadline('');
    setPriority('medium');
  }

  return (
    <form className="todo-input-row" onSubmit={submit}>
      <input
        type="text"
        placeholder="Add a task (e.g. Write report)"
        value={text}
        onChange={e=>setText(e.target.value)}
      />
      <input
        type="datetime-local"
        value={deadline}
        onChange={e=>setDeadline(e.target.value)}
        aria-label="Deadline"
      />
      <select value={priority} onChange={e=>setPriority(e.target.value)} aria-label="Priority">
        <option value="high">High 🔥</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button className="btn-add" type="submit">Add</button>
    </form>
  );
}
