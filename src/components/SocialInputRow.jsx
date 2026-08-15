// src/components/SocialInputRow.jsx
import React, { useEffect, useState } from 'react';

export const SocialInputRow = ({ socialKey, label, placeholder, initialValue, onSave, onChangeGlobal, saveStatus }) => {
  const [localVal, setLocalVal] = React.useState(initialValue || "");

  React.useEffect(() => {
    setLocalVal(initialValue || "");
  }, [initialValue]);

  const isSocialSaveDisabled = saveStatus === "saving" || !localVal.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: '600', color: '#222', display: 'block' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={placeholder}
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
          }} />
        <button
          type="button"
          onClick={() => {
            const sanitizedVal = localVal.trim();
            if (onChangeGlobal) onChangeGlobal(socialKey, sanitizedVal);
            onSave(socialKey, sanitizedVal);
          }}
          disabled={isSocialSaveDisabled}
          style={{
            padding: '10px 16px',
            backgroundColor: saveStatus === "saved" ? '#27ae60' : saveStatus === "error" ? '#e74c3c' : '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isSocialSaveDisabled ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            minWidth: '85px',
            transition: 'all 0.2s ease'
          }}>
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Linked" : "Save"}
        </button>
      </div>
    </div>
  );
};
