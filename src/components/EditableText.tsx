import React, { useState, useEffect } from 'react';
import { Settings } from '../types';

interface EditableTextProps {
  settingKey: string;
  defaultText: string;
  settings: Settings;
  isLoggedIn: boolean;
  className?: string;
  as?: React.ElementType;
}

export function EditableText({ 
  settingKey, 
  defaultText, 
  settings, 
  isLoggedIn, 
  className = '', 
  as: Component = 'span' 
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(settings[settingKey] || defaultText);

  useEffect(() => {
    setText(settings[settingKey] || defaultText);
  }, [settings, settingKey, defaultText]);

  const handleSave = async () => {
    setIsEditing(false);
    if (text !== (settings[settingKey] || defaultText)) {
      try {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [settingKey]: text })
        });
      } catch (error) {
        console.error('Failed to save setting:', error);
      }
    }
  };

  if (isLoggedIn) {
    if (isEditing) {
      return (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setText(settings[settingKey] || defaultText);
              setIsEditing(false);
            }
          }}
          className={`bg-black/50 border border-cyan-500 rounded px-2 py-1 text-white focus:outline-none w-full min-w-[100px] ${className}`}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <Component 
        className={`cursor-pointer hover:ring-2 hover:ring-cyan-500 hover:ring-offset-2 hover:ring-offset-transparent rounded transition-all ${className}`}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        title="انقر لتعديل النص"
      >
        {settings[settingKey] || defaultText}
      </Component>
    );
  }

  return <Component className={className}>{settings[settingKey] || defaultText}</Component>;
}
