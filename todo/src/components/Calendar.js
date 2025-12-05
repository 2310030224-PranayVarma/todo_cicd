import React, { useState } from 'react';

export default function Calendar() {
  const [d, setD] = useState('');
  return (
    <div style={{display:'flex', gap:8, alignItems:'center'}}>
      <input
        type="date"
        value={d}
        onChange={(e)=> setD(e.target.value)}
        aria-label="Pick date"
        style={{padding:6, borderRadius:6, border:'1px solid #e6edf3'}}
      />
      <div style={{fontSize:12, color:'#6b7280'}}>{d ? new Date(d).toLocaleDateString() : 'no date'}</div>
    </div>
  );
}
