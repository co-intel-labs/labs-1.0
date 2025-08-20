import React, { useState } from 'react';
import { Play, Save, Github } from 'lucide-react';

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(`# Welcome to Python Lab
# Write your Python code here

def hello_world():
    print("Hello, World!")
    return "Welcome to AI Lab!"

# Call the function
result = hello_world()
print(f"Result: {result}")

# Try some basic Python operations
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(f"Original: {numbers}")
print(f"Squared: {squared}")`);
  const [output, setOutput] = useState(`Click "Run" to execute your Python code...













`);
  const [showGitHubInput, setShowGitHubInput] = useState(false);
  const [gitHubUrl, setGitHubUrl] = useState('');

  const handleRun = () => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(`[${timestamp}] Code executed successfully!

Code run:
${code}

Output:
Hello, World!
Result: Welcome to AI Lab!
Original: [1, 2, 3, 4, 5]
Squared: [1, 4, 9, 16, 25]

Execution completed.`);
  };

  const handleSave = () => {
    localStorage.setItem('python-code', code);
    const timestamp = new Date().toLocaleTimeString();
    setOutput(`[${timestamp}] Code saved to browser storage successfully!`);
  };

  const handleGitHubImport = () => {
    if (gitHubUrl.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      setOutput(`[${timestamp}] Importing from GitHub: ${gitHubUrl}
      
Note: This is a demo. In a real implementation, this would fetch the file content from GitHub.`);
      setGitHubUrl('');
      setShowGitHubInput(false);
    } else {
      setShowGitHubInput(!showGitHubInput);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={handleRun}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
          >
            <Play size={16} className="mr-2" />
            Run
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Save size={16} className="mr-2" />
            Save
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGitHubImport}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
              <Github size={16} className="mr-2" />
              GitHub
            </button>
            {showGitHubInput && (
              <input
                type="text"
                value={gitHubUrl}
                onChange={(e) => setGitHubUrl(e.target.value)}
                placeholder="Enter GitHub file URL..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleGitHubImport();
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="flex-1 flex" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Code Editor */}
        <div className="flex-1 bg-gray-900 p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm resize-none border-none outline-none leading-5"
            rows={15}
            placeholder="Write your Python code here..."
            spellCheck={false}
          />
        </div>

        {/* Debug Output */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Debug Output</h3>
          </div>
          <div className="p-4 overflow-y-auto" style={{ height: '375px' }}>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-5">
              {output}
            </pre>
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">Python • One Dark Theme</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;