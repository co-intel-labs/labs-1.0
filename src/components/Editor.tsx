import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'javascript' | 'python';
  height?: string;
}

const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  language, 
  height = '60vh' 
}) => {
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return [javascript({ jsx: true, typescript: true })];
      case 'python':
        return [python()];
      default:
        return [];
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <CodeMirror
        value={value}
        onChange={(val) => onChange(val)}
        theme={oneDark}
        extensions={getLanguageExtension()}
        height={height}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
        }}
      />
    </div>
  );
};

export default Editor;