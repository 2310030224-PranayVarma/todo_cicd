import React from 'react';

export default function About() {
  return (
    <div className="todo-container about">
      <h2>About Todo-ist</h2>
      <p>
        Todo-ist is a lightweight React-based todo app demo. Create tasks, choose deadlines,
        and mark them complete. Tasks persist in your browser via localStorage.
      </p>
      <h3>Features</h3>
      <ul>
        <li>Add tasks with optional deadlines (datetime-local).</li>
        <li>Animated header and small live clock.</li>
        <li>Simple WebAudio 'complete' tone when tasks are marked done.</li>
        <li>Deadlines shown with relative time (due in / overdue).</li>
      </ul>
      <p style={{marginTop:12, color:'#6b7280'}}>Built with ❤️ and React.</p>
    </div>
  );
}
