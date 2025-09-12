import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Upload } from 'lucide-react';

interface CVTailoringError {
  type: 'file_format' | 'file_size' | 'content_extraction' | 'ai_processing' | 'network' | 'unknown';
  message: string;
  suggestion?: string;
}

interface CVTailoringErrorHandlerProps {
  error: CVTailoringError;
  onRetry?: () => void;
  onUploadNew?: () => void;
  onDismiss?: () => void;
}

export const CVTailoringErrorHandler = ({ 
  error, 
  onRetry, 
  onUploadNew, 
  onDismiss 
}: CVTailoringErrorHandlerProps) => {
  const getErrorConfig = (error: CVTailoringError) => {
    switch (error.type) {
      case 'file_format':
        return {
          title: 'Unsupported File Format',
          description: error.message,
          suggestion: 'Please upload your resume in PDF, DOCX, or TXT format for best results.',
          showUploadNew: true,
          showRetry: false
        };
      
      case 'file_size':
        return {
          title: 'File Size Issue',
          description: error.message,
          suggestion: 'Please reduce the file size or use a different format.',
          showUploadNew: true,
          showRetry: false
        };
      
      case 'content_extraction':
        return {
          title: 'Content Reading Issue',
          description: error.message,
          suggestion: 'Try converting your resume to a different format (TXT or DOCX recommended) or ensure the file is not corrupted.',
          showUploadNew: true,
          showRetry: true
        };
      
      case 'ai_processing':
        return {
          title: 'AI Processing Error',
          description: error.message,
          suggestion: 'This is usually temporary. Please try again in a few moments.',
          showUploadNew: false,
          showRetry: true
        };
      
      case 'network':
        return {
          title: 'Connection Issue',
          description: error.message,
          suggestion: 'Please check your internet connection and try again.',
          showUploadNew: false,
          showRetry: true
        };
      
      default:
        return {
          title: 'Unexpected Error',
          description: error.message,
          suggestion: 'Please try uploading a different file or contact support if the issue persists.',
          showUploadNew: true,
          showRetry: true
        };
    }
  };

  const config = getErrorConfig(error);

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-500" />
      <AlertDescription className="text-red-700">
        <div className="space-y-3">
          <div>
            <p className="font-medium">{config.title}</p>
            <p className="text-sm mt-1">{config.description}</p>
          </div>
          
          {config.suggestion && (
            <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
              <strong>Solution:</strong> {config.suggestion}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            {config.showRetry && onRetry && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
            
            {config.showUploadNew && onUploadNew && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onUploadNew}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload Different File
              </Button>
            )}
            
            {onDismiss && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDismiss}
                className="text-red-600 hover:bg-red-100"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Utility function to categorize errors
export const categorizeError = (error: Error | string): CVTailoringError => {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('format') || lowerMessage.includes('supported') || lowerMessage.includes('type')) {
    return {
      type: 'file_format',
      message,
      suggestion: 'Upload a PDF, DOCX, or TXT file'
    };
  }

  if (lowerMessage.includes('size') || lowerMessage.includes('large') || lowerMessage.includes('small')) {
    return {
      type: 'file_size',
      message,
      suggestion: 'Check file size requirements'
    };
  }

  if (lowerMessage.includes('read') || lowerMessage.includes('extract') || lowerMessage.includes('content') || lowerMessage.includes('empty')) {
    return {
      type: 'content_extraction',
      message,
      suggestion: 'Try a different file format'
    };
  }

  if (lowerMessage.includes('ai') || lowerMessage.includes('processing') || lowerMessage.includes('analyze')) {
    return {
      type: 'ai_processing',
      message,
      suggestion: 'Wait a moment and try again'
    };
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('timeout')) {
    return {
      type: 'network',
      message,
      suggestion: 'Check your internet connection'
    };
  }

  return {
    type: 'unknown',
    message,
    suggestion: 'Try again or contact support'
  };
};