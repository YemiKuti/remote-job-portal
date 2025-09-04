import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseCSVFile, validateJobData, detectDuplicates, createJobsBatch, type ParsedJobData, type ValidationResult } from '@/utils/csvJobParser';
import { CSVSampleDownload } from './CSVSampleDownload';

interface CSVUploadDialogProps {
  onJobsUploaded: () => void;
}

export const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({ onJobsUploaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedJobData[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [duplicates, setDuplicates] = useState<Map<string, number[]>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [step, setStep] = useState<'upload' | 'preview' | 'uploading' | 'complete'>('upload');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a CSV file.',
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
    try {
      const parsed = await parseCSVFile(file);
      
      if (parsed.length === 0) {
        toast({
          title: 'No Data Found',
          description: 'The CSV file contains no valid job data.',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      if (parsed.length > 1000) {
        toast({
          title: 'File Too Large',
          description: 'Maximum 1000 jobs per upload. Please split your file.',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }
      
      // Detect duplicates within the file
      const duplicateMap = detectDuplicates(parsed);
      setDuplicates(duplicateMap);
      
      // Validate each job
      const results = parsed.map((job, index) => {
        const duplicateKey = Array.from(duplicateMap.keys()).find(key => 
          duplicateMap.get(key)?.includes(index)
        );
        return validateJobData(job, duplicateKey);
      });

      setParsedData(parsed);
      setValidationResults(results);
      setStep('preview');
      
      const validCount = results.filter(r => r.isValid && !r.isDuplicate).length;
      const invalidCount = results.filter(r => !r.isValid).length;
      const duplicateCount = results.filter(r => r.isDuplicate).length;
      
      toast({
        title: 'CSV Processed',
        description: `Found ${validCount} valid jobs, ${invalidCount} invalid, ${duplicateCount} duplicates.`
      });
    } catch (error: any) {
      toast({
        title: 'Parse Error',
        description: error.message || 'Failed to parse CSV file.',
        variant: 'destructive'
      });
    }
    setIsProcessing(false);
  };

  const handleBulkUpload = async () => {
    const validJobs = parsedData.filter((_, index) => {
      const result = validationResults[index];
      return result.isValid && !result.isDuplicate;
    });
    
    if (validJobs.length === 0) {
      toast({
        title: 'No Valid Jobs',
        description: 'No valid jobs found to upload.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: validJobs.length });
    setStep('uploading');

    try {
      const result = await createJobsBatch(validJobs, (completed, total) => {
        setUploadProgress({ current: completed, total });
      });

      toast({
        title: 'Upload Complete',
        description: `Successfully created ${result.successful} jobs${result.failed > 0 ? `, ${result.failed} failed` : ''}.`
      });

      if (result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
      }

      onJobsUploaded();
      setStep('complete');
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload jobs.',
        variant: 'destructive'
      });
    }
    setIsUploading(false);
  };

  const resetDialog = () => {
    setFile(null);
    setParsedData([]);
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
            <span>Upload multiple jobs via CSV file. Ensure your CSV includes: Job Title, Company, Location, Description, Employment Type, Experience Level.</span>
            <CSVSampleDownload />
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CSV Format Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Required Columns:</h4>
                    <ul className="space-y-1">
                      <li>• Job Title / Title / Position</li>
                      <li>• Company / Company Name</li>
                      <li>• Location</li>
                      <li>• Description / Job Description</li>
                      <li>• Employment Type / Type</li>
                      <li>• Experience Level / Level</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Optional Columns:</h4>
                    <ul className="space-y-1">
                      <li>• Salary Min / Min Salary</li>
                      <li>• Salary Max / Max Salary</li>
                      <li>• Requirements</li>
                      <li>• Tech Stack</li>
                      <li>• Remote (true/false)</li>
                      <li>• Application Email / Contact</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              
              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
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
                  Process CSV
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {validationResults.filter(r => r.isValid && !r.isDuplicate).length} Valid
                </Badge>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {validationResults.filter(r => !r.isValid).length} Invalid
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationResults.filter(r => r.isDuplicate).length} Duplicates
                </Badge>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((result, index) => (
                    <TableRow key={index} className={result.isDuplicate ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        {result.isDuplicate ? (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        ) : result.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {parsedData[index]?.title || 'Missing'}
                      </TableCell>
                      <TableCell>{parsedData[index]?.company || 'Missing'}</TableCell>
                      <TableCell>{parsedData[index]?.location || 'Missing'}</TableCell>
                      <TableCell>{parsedData[index]?.employment_type || 'Missing'}</TableCell>
                      <TableCell>
                        {result.isDuplicate && (
                          <div className="text-xs text-yellow-600">
                            Duplicate entry
                          </div>
                        )}
                        {!result.isValid && (
                          <div className="text-xs text-red-600">
                            {result.errors?.join(', ')}
                          </div>
                        )}
                        {result.warnings && result.warnings.length > 0 && (
                          <div className="text-xs text-orange-600">
                            {result.warnings.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only valid, non-duplicate jobs will be uploaded. Invalid jobs and duplicates will be skipped.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                onClick={handleBulkUpload}
                disabled={isUploading || validationResults.filter(r => r.isValid && !r.isDuplicate).length === 0}
                className="flex items-center gap-2"
              >
                {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Upload {validationResults.filter(r => r.isValid && !r.isDuplicate).length} Jobs
              </Button>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
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