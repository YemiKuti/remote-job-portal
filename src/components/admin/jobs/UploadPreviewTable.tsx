import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { ParsedJobData, ValidationResult } from '@/utils/csvJobParser';

interface UploadPreviewTableProps {
  jobs: ParsedJobData[];
  validationResults: ValidationResult[];
  duplicates: Map<string, number[]>;
  maxPreviewRows?: number;
}

export const UploadPreviewTable: React.FC<UploadPreviewTableProps> = ({
  jobs,
  validationResults,
  duplicates,
  maxPreviewRows = 10
}) => {
  const validCount = validationResults.filter(r => r.isValid && !r.isDuplicate).length;
  const invalidCount = validationResults.filter(r => !r.isValid).length;
  const duplicateCount = validationResults.filter(r => r.isDuplicate).length;
  const warningCount = validationResults.filter(r => r.warnings && r.warnings.length > 0).length;

  const getRowStatus = (index: number) => {
    const result = validationResults[index];
    if (!result) return 'unknown';
    
    if (result.isDuplicate) return 'duplicate';
    if (!result.isValid) return 'error';
    if (result.warnings && result.warnings.length > 0) return 'warning';
    return 'valid';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'duplicate':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case 'error':
        return 'bg-red-50 border-l-4 border-l-red-500';
      case 'duplicate':
        return 'bg-yellow-50 border-l-4 border-l-yellow-500';
      case 'warning':
        return 'bg-orange-50 border-l-4 border-l-orange-500';
      case 'valid':
        return 'bg-green-50 border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const previewJobs = jobs.slice(0, maxPreviewRows);
  const hasMoreRows = jobs.length > maxPreviewRows;

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-700">{validCount}</div>
                <div className="text-xs text-muted-foreground">Valid Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-semibold text-red-700">{invalidCount}</div>
                <div className="text-xs text-muted-foreground">Invalid Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-700">{duplicateCount}</div>
                <div className="text-xs text-muted-foreground">Duplicates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-semibold text-orange-700">{warningCount}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Preview ({previewJobs.length} of {jobs.length} rows)</span>
            {hasMoreRows && (
              <Badge variant="secondary">
                +{jobs.length - maxPreviewRows} more rows
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Row</TableHead>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="min-w-[200px]">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewJobs.map((job, index) => {
                  const status = getRowStatus(index);
                  const result = validationResults[index];
                  
                  return (
                    <TableRow key={index} className={getRowClassName(status)}>
                      <TableCell className="font-mono text-xs">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        {getStatusIcon(status)}
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {job.title || <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {job.company || <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        {job.location || <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {job.employment_type || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {status === 'duplicate' && (
                            <div className="text-xs text-yellow-700 font-medium">
                              🔄 Duplicate entry
                            </div>
                          )}
                          {result?.errors && result.errors.length > 0 && (
                            <div className="text-xs text-red-700">
                              <strong>Errors:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {result.errors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result?.warnings && result.warnings.length > 0 && (
                            <div className="text-xs text-orange-700">
                              <strong>Warnings:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {result.warnings.map((warning, i) => (
                                  <li key={i}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {status === 'valid' && (
                            <div className="text-xs text-green-700 font-medium">
                              ✅ Ready to upload
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {hasMoreRows && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing first {maxPreviewRows} rows. All {jobs.length} rows will be processed during upload.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Upload Summary</h4>
              <p className="text-sm text-muted-foreground">
                {validCount} valid jobs will be uploaded. 
                {invalidCount > 0 && ` ${invalidCount} invalid jobs will be skipped.`}
                {duplicateCount > 0 && ` ${duplicateCount} duplicates will be skipped.`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{validCount}</div>
              <div className="text-xs text-muted-foreground">Jobs to Upload</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};