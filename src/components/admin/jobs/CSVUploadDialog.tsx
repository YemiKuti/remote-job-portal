import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateJobData, detectDuplicates, createJobsBatch, type ParsedJobData, type ValidationResult } from '@/utils/csvJobParser';
import { parseFile, generateHeaderMapping, convertToJobData, type ParsedFileData, type HeaderMapping } from '@/utils/enhancedFileParser';
import { CSVSampleDownload } from './CSVSampleDownload';
import { HeaderMappingStep } from './HeaderMappingStep';
import { UploadPreviewTable } from './UploadPreviewTable';

interface CSVUploadDialogProps {
  onJobsUploaded: () => void;
}

export const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ onJobsUploaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ParsedFileData | null>(null);
  const [headerMapping, setHeaderMapping] = useState<HeaderMapping>({});
  const [parsedJobs, setParsedJobs] = useState<ParsedJobData[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [duplicates, setDuplicates] = useState<Map<string, number[]>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'uploading' | 'complete'>('upload');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.toLowerCase().split('.').pop();
      if (!['csv', 'xlsx'].includes(extension || '')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a CSV or XLSX file.',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFileProcessing = async () => {
    if (!file) return;

    setIsProcessing(true);
    console.log(`🔄 Processing file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    try {
      const result = await parseFile(file);
      
      if (!result.success || !result.data) {
        const errorMsg = result.error || 'Failed to parse file. Please check the file format and try again.';
        console.error('❌ File parsing failed:', errorMsg);
        
        toast({
          title: 'File Parse Error',
          description: errorMsg,
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      const data = result.data;
      console.log(`✅ File parsed successfully:`, {
        fileType: data.fileType,
        totalRows: data.totalRows,
        headers: data.headers.length,
        fileName: data.fileName
      });
      
      setFileData(data);
      
      // Generate intelligent header mapping
      const mapping = generateHeaderMapping(data.headers);
      setHeaderMapping(mapping);
      
      console.log('🎯 Generated header mapping:', mapping);
      
      toast({
        title: 'File Parsed Successfully',
        description: `Found ${data.totalRows} rows with ${data.headers.length} columns in ${data.fileType.toUpperCase()} file.`
      });
      
      setStep('mapping');
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to parse file. Please check the file format.';
      console.error('❌ File processing error:', error);
      
      toast({
        title: 'File Processing Error',
        description: errorMsg,
        variant: 'destructive'
      });
    }
    setIsProcessing(false);
  };

  const handleMappingComplete = () => {
    if (!fileData) return;

    console.log('🎯 Processing header mapping:', headerMapping);
    
    // Check if essential fields are mapped (be more flexible)
    const essentialFields = ['title', 'company'];
    const mappedFields = new Set(Object.values(headerMapping));
    const missingEssential = essentialFields.filter(field => !mappedFields.has(field));
    
    if (missingEssential.length > 0) {
      toast({
        title: 'Missing Essential Fields',
        description: `Please map these essential fields: ${missingEssential.join(', ')}. Location and description can use defaults if not provided.`,
        variant: 'destructive'
      });
      return;
    }

    console.log('🔄 Converting data using header mapping...');
    
    try {
      // Convert data using header mapping
      const jobs = convertToJobData(fileData.rows, headerMapping);
      console.log(`📊 Converted ${jobs.length} jobs from ${fileData.rows.length} rows`);
      
      setParsedJobs(jobs);
      
      // Detect duplicates
      const duplicateMap = detectDuplicates(jobs);
      setDuplicates(duplicateMap);
      console.log(`🔍 Found ${duplicateMap.size} duplicate groups`);
      
      // Validate each job
      const results = jobs.map((job, index) => {
        const duplicateKey = Array.from(duplicateMap.keys()).find(key => 
          duplicateMap.get(key)?.includes(index)
        );
        return validateJobData(job, duplicateKey);
      });
      
      setValidationResults(results);
      setStep('preview');
      
      const validCount = results.filter(r => r.isValid && !r.isDuplicate).length;
      const invalidCount = results.filter(r => !r.isValid).length;
      const duplicateCount = results.filter(r => r.isDuplicate).length;
      const warningCount = results.filter(r => r.warnings && r.warnings.length > 0).length;
      
      console.log('📋 Validation summary:', {
        valid: validCount,
        invalid: invalidCount,
        duplicates: duplicateCount,
        warnings: warningCount
      });
      
      toast({
        title: 'Data Processed Successfully',
        description: `${validCount} valid jobs ready for upload${invalidCount > 0 ? `, ${invalidCount} need fixes` : ''}${duplicateCount > 0 ? `, ${duplicateCount} duplicates found` : ''}.`
      });
    } catch (error: any) {
      console.error('❌ Error processing data:', error);
      toast({
        title: 'Data Processing Error',
        description: error.message || 'Failed to process job data. Please check your file format.',
        variant: 'destructive'
      });
    }
  };

  const handleBulkUpload = async () => {
    const validJobs = parsedJobs.filter((_, index) => {
      const result = validationResults[index];
      return result.isValid && !result.isDuplicate;
    });
    
    console.log(`🚀 Starting bulk upload of ${validJobs.length} valid jobs out of ${parsedJobs.length} total`);
    
    if (validJobs.length === 0) {
      toast({
        title: 'No Valid Jobs to Upload',
        description: 'Please fix validation errors before uploading, or check if all jobs are duplicates.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: validJobs.length });
    setStep('uploading');

    try {
      console.log('📦 Calling createJobsBatch...');
      const result = await createJobsBatch(validJobs, (completed, total) => {
        console.log(`📈 Upload progress: ${completed}/${total}`);
        setUploadProgress({ current: completed, total });
      });

      console.log('🎯 Upload completed:', result);

      if (result.successful > 0) {
        toast({
          title: 'Upload Successful!',
          description: `Successfully created ${result.successful} jobs${result.failed > 0 ? `. ${result.failed} jobs failed - check console for details` : ''}.`
        });

        if (result.errors.length > 0) {
          console.error('❌ Upload errors:', result.errors);
          // Show first few errors to user
          const errorSample = result.errors.slice(0, 3).join('\n');
          toast({
            title: 'Some Jobs Failed',
            description: `${result.failed} jobs failed to upload. First few errors:\n${errorSample}`,
            variant: 'destructive'
          });
        }

        onJobsUploaded();
        setStep('complete');
      } else {
        console.error('❌ All jobs failed to upload:', result.errors);
        toast({
          title: 'Upload Failed',
          description: `All ${result.failed} jobs failed to upload. Check console for details.`,
          variant: 'destructive'
        });
        setStep('preview'); // Go back to preview to let user try again
      }
    } catch (error: any) {
      console.error('❌ Bulk upload error:', error);
      toast({
        title: 'Upload Error',
        description: error.message || 'Unexpected error during job upload. Please try again.',
        variant: 'destructive'
      });
      setStep('preview'); // Go back to preview to let user try again
    }
    setIsUploading(false);
  };

  const resetDialog = () => {
    setFile(null);
    setFileData(null);
    setHeaderMapping({});
    setParsedJobs([]);
    setValidationResults([]);
    setDuplicates(new Map());
    setUploadProgress({ current: 0, total: 0 });
    setStep('upload');
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(resetDialog, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span>Bulk Upload CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Job Upload</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Upload multiple jobs via CSV or XLSX file. We'll help you map the columns and validate the data.</span>
            <CSVSampleDownload />
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Supported File Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">📁 CSV Files (.csv)</h4>
                    <ul className="space-y-1">
                      <li>• UTF-8 encoding recommended</li>
                      <li>• Comma or semicolon delimited</li>
                      <li>• Header row required</li>
                      <li>• Up to 1000 rows</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📊 Excel Files (.xlsx)</h4>
                    <ul className="space-y-1">
                      <li>• Modern Excel format only</li>
                      <li>• First sheet will be used</li>
                      <li>• Header row required</li>
                      <li>• Up to 1000 rows</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">💡 Smart Column Detection</h4>
                  <p className="text-sm text-blue-600">
                    We'll automatically detect and map your columns to job fields. 
                    Common variations like "Job Title", "Position", "Role" are all recognized.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              
              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    <Badge variant="secondary" className="ml-2">
                      {file.name.toLowerCase().endsWith('.xlsx') ? 'XLSX' : 'CSV'}
                    </Badge>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleFileProcessing}
                  disabled={!file || isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Parse File
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'mapping' && fileData && (
          <div className="space-y-6">
            <HeaderMappingStep 
              headers={fileData.headers}
              headerMapping={headerMapping}
              onMappingChange={setHeaderMapping}
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleMappingComplete}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Continue to Preview
              </Button>
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <UploadPreviewTable 
              jobs={parsedJobs}
              validationResults={validationResults}
              duplicates={duplicates}
              maxPreviewRows={10}
            />

            <div className="flex gap-2">
              <Button 
                onClick={handleBulkUpload}
                disabled={isUploading || validationResults.filter(r => r.isValid && !r.isDuplicate).length === 0}
                className="flex items-center gap-2"
              >
                {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Upload {validationResults.filter(r => r.isValid && !r.isDuplicate).length} Jobs
              </Button>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mapping
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'uploading' && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
            <div>
              <h3 className="text-lg font-semibold">Uploading Jobs...</h3>
              <p className="text-muted-foreground">
                Processing {uploadProgress.current} of {uploadProgress.total} jobs
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Upload Complete!</h3>
              <p className="text-muted-foreground">
                Jobs have been successfully uploaded to the system.
              </p>
            </div>
            <Button onClick={closeDialog}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};