import React from 'react';
import TodoItem from './TodoItem';

export default function TodoList({ tasks, onToggle, onDelete, onUpdate }) {
  if(!tasks || tasks.length === 0) return <div style={{color:'#6b7280'}}>No tasks yet — add one!</div>;

  return (
    <div className="todo-list" role="list">
      {tasks.map(t=>(
        <TodoItem key={t.id} task={t} onToggle={()=>onToggle(t.id)} onDelete={()=>onDelete(t.id)} onUpdate={(id,data)=>onUpdate && onUpdate(id,data)} />
      ))}
    </div>
  );
}
