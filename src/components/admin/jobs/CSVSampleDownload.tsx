import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateSampleCSV } from '@/utils/csvJobParser';

export const CSVSampleDownload: React.FC = () => {
  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'job-upload-sample.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownloadSample}
      className="flex items-center gap-2 text-xs"
    >
      <Download className="h-3 w-3" />
      Download Sample CSV
    </Button>
  );
};