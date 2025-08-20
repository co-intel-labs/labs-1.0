import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Monitor, AlertCircle, CheckCircle, RefreshCw, Code } from 'lucide-react';
import CodeEditor from './CodeEditor';

interface LabEnvironmentProps {
  labTitle: string;
  labUrl: string;
  onClose: () => void;
}

const LabEnvironment: React.FC<LabEnvironmentProps> = ({ labTitle, labUrl, onClose }) => {
  const [windowRef, setWindowRef] = useState<Window | null>(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [windowStatus, setWindowStatus] = useState<'opening' | 'open' | 'closed' | 'blocked'>('opening');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const checkInterval = useRef<NodeJS.Timeout>();
  const [showInlineCodeEditor, setShowInlineCodeEditor] = useState(false);

  useEffect(() => {
    // Open the lab in a new window
    openLabWindow();

    // Cleanup on unmount
    return () => {
      if (windowRef) {
        windowRef.close();
      }
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInlineCodeEditor) {
          setShowInlineCodeEditor(false);
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showInlineCodeEditor]);

  const openLabWindow = () => {
    // Handle code editor special case
    if (labUrl === 'code-editor') {
      setShowInlineCodeEditor(true);
      setWindowStatus('open');
      return;
    }
    
    try {
      const newWindow = window.open(
        labUrl,
        'lab-environment',
        'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=yes,menubar=yes,location=yes'
      );

      if (newWindow) {
        setWindowRef(newWindow);
        setIsWindowOpen(true);
        setWindowStatus('open');

        // Check if window is still open periodically
        checkInterval.current = setInterval(() => {
          if (newWindow.closed) {
            setIsWindowOpen(false);
            setWindowStatus('closed');
            if (checkInterval.current) {
              clearInterval(checkInterval.current);
            }
          }
        }, 1000);

        // Try to focus the new window
        newWindow.focus();
      } else {
        setWindowStatus('blocked');
      }
    } catch (error) {
      console.error('Failed to open lab window:', error);
      setWindowStatus('blocked');
    }
  };

  const handleClose = () => {
    if (windowRef && !windowRef.closed) {
      windowRef.close();
    }
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
    }
    onClose();
  };

  const handleRefresh = () => {
    if (windowRef && !windowRef.closed) {
      windowRef.location.reload();
    } else {
      openLabWindow();
    }
  };

  const handleFocus = () => {
    if (windowRef && !windowRef.closed) {
      windowRef.focus();
    }
  };

  const getStatusInfo = () => {
    switch (windowStatus) {
      case 'opening':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          message: 'Opening lab environment...',
          description: 'Please wait while we launch your lab'
        };
      case 'open':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          message: 'Lab environment is running',
          description: isWindowOpen ? 'Lab window is open and ready' : 'Lab window was closed'
        };
      case 'closed':
        return {
          icon: AlertCircle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          message: 'Lab window was closed',
          description: 'You can reopen the lab or close this panel'
        };
      case 'blocked':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          message: 'Pop-up blocked',
          description: 'Please allow pop-ups for this site and try again'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          message: 'Unknown status',
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // If showing inline code editor, render it directly
  if (showInlineCodeEditor) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
        {/* Header with back button */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInlineCodeEditor(false)}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="mr-2" />
              Back to Lab Catalog
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Code size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{labTitle}</h2>
                <p className="text-sm text-gray-600">Interactive Code Editor</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            title="Close Lab"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor />
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{labTitle}</h2>
              <p className="text-sm text-gray-600">Lab Environment Controller</p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Status Display */}
          <div className={`${statusInfo.bgColor} rounded-xl p-6 mb-6`}>
            <div className="flex items-center mb-4">
              <StatusIcon size={24} className={`${statusInfo.color} mr-3`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{statusInfo.message}</h3>
                <p className="text-gray-600">{statusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Lab Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Lab Environment Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Lab Title:</span>
                <span className="font-medium">{labTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-medium">GitHub Codespaces</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${statusInfo.color}`}>
                  {windowStatus.charAt(0).toUpperCase() + windowStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {windowStatus === 'blocked' && (
              <button
                onClick={openLabWindow}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-semibold"
              >
                <ExternalLink size={20} className="mr-2" />
                Try Opening Lab Again
              </button>
            )}
            
            {(windowStatus === 'open' || windowStatus === 'closed') && (
              <>
                {isWindowOpen ? (
                  <button
                    onClick={handleFocus}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center font-semibold"
                  >
                    <Monitor size={20} className="mr-2" />
                    Focus Lab Window
                  </button>
                ) : (
                  <button
                    onClick={openLabWindow}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center font-semibold"
                  >
                    <ExternalLink size={20} className="mr-2" />
                    Reopen Lab
                  </button>
                )}
                
                <button
                  onClick={handleRefresh}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center font-semibold"
                >
                  <RefreshCw size={20} className="mr-2" />
                  Refresh Lab
                </button>
              </>
            )}
            
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center font-semibold"
            >
              Close Controller
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The lab opens in a separate window for full functionality</li>
              <li>• Use "Focus Lab Window" to bring the lab to front</li>
              <li>• Use "Refresh Lab" if the environment becomes unresponsive</li>
              <li>• This controller stays open to help you manage the lab</li>
              <li>• Press ESC or click "Close Controller" when done</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabEnvironment;