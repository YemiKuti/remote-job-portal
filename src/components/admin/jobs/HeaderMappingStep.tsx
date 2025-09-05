import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { HeaderMapping } from '@/utils/enhancedFileParser';

interface HeaderMappingStepProps {
  headers: string[];
  headerMapping: HeaderMapping;
  onMappingChange: (mapping: HeaderMapping) => void;
}

const REQUIRED_FIELDS = ['title', 'company', 'location', 'description'];
const RECOMMENDED_FIELDS = ['employment_type', 'experience_level'];
const OPTIONAL_FIELDS = [
  'requirements', 'salary_min', 'salary_max', 'salary_currency', 
  'tech_stack', 'remote', 'visa_sponsorship', 'application_value'
];

const FIELD_DESCRIPTIONS: Record<string, string> = {
  title: 'Job Title / Position',
  company: 'Company Name',
  location: 'Job Location / City',
  description: 'Job Description',
  employment_type: 'Employment Type (Full-time, Part-time, etc.)',
  experience_level: 'Experience Level (Entry, Mid, Senior, etc.)',
  requirements: 'Job Requirements / Qualifications',
  salary_min: 'Minimum Salary',
  salary_max: 'Maximum Salary', 
  salary_currency: 'Salary Currency (USD, EUR, etc.)',
  tech_stack: 'Technical Skills / Technologies',
  remote: 'Remote Work (true/false)',
  visa_sponsorship: 'Visa Sponsorship Available (true/false)',
  application_value: 'Application Email or URL'
};

export const HeaderMappingStep: React.FC<HeaderMappingStepProps> = ({
  headers,
  headerMapping,
  onMappingChange
}) => {
  const handleMappingChange = (originalHeader: string, targetField: string) => {
    const newMapping = { ...headerMapping };
    newMapping[originalHeader] = targetField;
    onMappingChange(newMapping);
  };

  const getMappedFields = () => {
    const mapped = new Set(Object.values(headerMapping));
    return {
      required: REQUIRED_FIELDS.filter(field => mapped.has(field)),
      recommended: RECOMMENDED_FIELDS.filter(field => mapped.has(field)),
      optional: OPTIONAL_FIELDS.filter(field => mapped.has(field))
    };
  };

  const mappedFields = getMappedFields();
  const allAvailableFields = [...REQUIRED_FIELDS, ...RECOMMENDED_FIELDS, ...OPTIONAL_FIELDS];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Header Mapping
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Map your file headers to the expected job fields. Required fields must be mapped to proceed.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Headers Column */}
            <div>
              <h4 className="font-medium mb-3">Your File Headers ({headers.length})</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {headers.map((header, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-2">{header}</div>
                    <Select
                      value={headerMapping[header] || 'unmapped'}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unmapped">Don't Map</SelectItem>
                        {allAvailableFields.map(field => (
                          <SelectItem key={field} value={field}>
                            {FIELD_DESCRIPTIONS[field] || field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Mapping Summary Column */}
            <div>
              <h4 className="font-medium mb-3">Mapping Summary</h4>
              
              {/* Required Fields */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="text-sm font-medium">Required Fields</h5>
                  <Badge variant={mappedFields.required.length === REQUIRED_FIELDS.length ? 'default' : 'destructive'}>
                    {mappedFields.required.length} / {REQUIRED_FIELDS.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {REQUIRED_FIELDS.map(field => (
                    <div key={field} className="flex items-center gap-2 text-sm">
                      {mappedFields.required.includes(field) ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span className={mappedFields.required.includes(field) ? 'text-green-700' : 'text-red-700'}>
                        {FIELD_DESCRIPTIONS[field]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Fields */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="text-sm font-medium">Recommended Fields</h5>
                  <Badge variant="secondary">
                    {mappedFields.recommended.length} / {RECOMMENDED_FIELDS.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {RECOMMENDED_FIELDS.map(field => (
                    <div key={field} className="flex items-center gap-2 text-sm">
                      {mappedFields.recommended.includes(field) ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
                      )}
                      <span className={mappedFields.recommended.includes(field) ? 'text-green-700' : 'text-muted-foreground'}>
                        {FIELD_DESCRIPTIONS[field]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="text-sm font-medium">Optional Fields</h5>
                  <Badge variant="outline">
                    {mappedFields.optional.length} mapped
                  </Badge>
                </div>
                <div className="space-y-1">
                  {OPTIONAL_FIELDS.map(field => (
                    <div key={field} className="flex items-center gap-2 text-sm">
                      {mappedFields.optional.includes(field) ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <div className="h-3 w-3" />
                      )}
                      <span className={mappedFields.optional.includes(field) ? 'text-green-700' : 'text-muted-foreground'}>
                        {FIELD_DESCRIPTIONS[field]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {mappedFields.required.length < REQUIRED_FIELDS.length && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Missing Required Fields</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Please map all required fields to continue with the upload.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};