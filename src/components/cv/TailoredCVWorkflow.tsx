
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, Building, Brain, Download } from 'lucide-react';
import { ResumeUploadStep } from './workflow/ResumeUploadStep';
import { JobSelectionStep } from './workflow/JobSelectionStep';
import { AIAnalysisStep } from './workflow/AIAnalysisStep';
import { DownloadStep } from './workflow/DownloadStep';
import { Job } from '@/types';

interface TailoredCVWorkflowProps {
  userId: string;
}

type WorkflowStep = 'upload' | 'jobSelection' | 'analysis' | 'download';

interface WorkflowData {
  selectedResume: any;
  selectedJob: Job | null;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  tailoredResumeId: string;
}

export function TailoredCVWorkflow({ userId }: TailoredCVWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    selectedResume: null,
    selectedJob: null,
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    tailoredResumeId: ''
  });

  const steps = [
    { id: 'upload', title: 'Upload Resume', icon: Upload, description: 'Upload your existing resume or CV' },
    { id: 'jobSelection', title: 'Select Job', icon: Building, description: 'Choose the job you\'re applying for' },
    { id: 'analysis', title: 'AI Analysis', icon: Brain, description: 'AI analyzes and tailors your resume' },
    { id: 'download', title: 'Download', icon: Download, description: 'Download your tailored ATS-friendly resume' }
  ];

  const stepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleStepComplete = (step: WorkflowStep, data: Partial<WorkflowData>) => {
    setWorkflowData(prev => ({ ...prev, ...data }));
    
    switch (step) {
      case 'upload':
        setCurrentStep('jobSelection');
        break;
      case 'jobSelection':
        setCurrentStep('analysis');
        break;
      case 'analysis':
        setCurrentStep('download');
        break;
      case 'download':
        // Workflow complete
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'jobSelection':
        setCurrentStep('upload');
        break;
      case 'analysis':
        setCurrentStep('jobSelection');
        break;
      case 'download':
        setCurrentStep('analysis');
        break;
    }
  };

  const handleRestart = () => {
    setCurrentStep('upload');
    setWorkflowData({
      selectedResume: null,
      selectedJob: null,
      jobTitle: '',
      companyName: '',
      jobDescription: '',
      tailoredResumeId: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            CV Tailoring Workflow
          </CardTitle>
          <CardDescription>
            Follow these 4 simple steps to create a perfectly tailored ATS-friendly resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = index < stepIndex;
                const isCurrent = step.id === currentStep;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        isCurrent ? 'bg-blue-500 border-blue-500 text-white' : 
                        'bg-gray-100 border-gray-300 text-gray-400'}
                    `}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 max-w-24 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'upload' && (
          <ResumeUploadStep
            userId={userId}
            onComplete={(data) => handleStepComplete('upload', data)}
          />
        )}
        
        {currentStep === 'jobSelection' && (
          <JobSelectionStep
            onComplete={(data) => handleStepComplete('jobSelection', data)}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'analysis' && (
          <AIAnalysisStep
            workflowData={workflowData}
            onComplete={(data) => handleStepComplete('analysis', data)}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'download' && (
          <DownloadStep
            workflowData={workflowData}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
