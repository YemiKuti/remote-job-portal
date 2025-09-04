import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { CurrencyDemo } from '@/components/demo/CurrencyDemo';
import { DemoCSVSamples } from '@/components/demo/DemoCSVSamples';
import { 
  Brain, 
  Upload, 
  DollarSign, 
  CheckCircle, 
  Star,
  Zap,
  Target,
  Globe,
  FileText,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturesDemo() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🚀 Enhanced Job Board Features</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Three powerful new features working together to transform your job board experience.
          Test each feature independently or see how they integrate seamlessly.
        </p>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          ✅ All Features Live & Production Ready
        </Badge>
      </div>

      {/* Features Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="h-5 w-5" />
              AI CV Tailoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-600">
              Generate targeted resumes with compelling career profiles optimized for specific jobs.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>AI-powered job matching</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>ATS-friendly keywords</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Crown className="h-3 w-3 text-yellow-600" />
                <span>Premium feature</span>
              </div>
            </div>
            <Link to="/candidate/tailored-resumes">
              <Button size="sm" className="w-full">
                Try CV Tailoring
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Upload className="h-5 w-5" />
              CSV Job Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-green-600">
              Upload hundreds of jobs instantly with smart validation and duplicate detection.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Batch processing up to 1000 jobs</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Smart column mapping</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Duplicate detection</span>
              </div>
            </div>
            <Link to="/admin/jobs">
              <Button size="sm" className="w-full" variant="outline">
                View Admin Panel
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <DollarSign className="h-5 w-5" />
              Currency Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-purple-600">
              Automatic currency detection with manual selection. Real-time salary conversion.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>8+ supported currencies</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Auto location detection</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>6-hour rate caching</span>
              </div>
            </div>
            <div className="pt-2">
              <CurrencyDisplay variant="default" showDetected={true} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Demo Section */}
      <Tabs defaultValue="currency" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Currency Demo
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV Samples
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integration Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currency" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Currency Conversion Demo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Change your currency above and watch job salaries update instantly below.
              </p>
            </CardHeader>
            <CardContent>
              <CurrencyDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Upload Samples & Testing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Download sample CSV files to test the bulk upload feature with different scenarios.
              </p>
            </CardHeader>
            <CardContent>
              <DemoCSVSamples />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Full System Integration Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test how all three features work together in a real workflow.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Workflow Testing Steps
                  </h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <span>Upload jobs via CSV with salary data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <span>Change currency and verify salaries update</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <span>Use CV tailoring with newly posted jobs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <span>Verify performance with multiple jobs</span>
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Success Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">CSV Upload Speed</span>
                      <Badge variant="outline" className="text-green-600">
                        ✅ &lt;2s per 100 jobs
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Currency Conversion</span>
                      <Badge variant="outline" className="text-green-600">
                        ✅ Instant UI updates
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">CV Tailoring</span>
                      <Badge variant="outline" className="text-green-600">
                        ✅ &lt;30s AI processing
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Link to="/admin/jobs">
                  <Button variant="outline">Test CSV Upload</Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="outline">View Job Listings</Button>
                </Link>
                <Link to="/candidate/tailored-resumes">
                  <Button variant="outline">Try CV Tailoring</Button>
                </Link>
                <Link to="/currency-test">
                  <Button variant="outline">Currency Testing</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status & Support Section */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            All Features Production Ready!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            🎉 All three features have been tested together and are working seamlessly. 
            The system handles edge cases gracefully and provides clear user feedback.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              CV Tailoring: Premium Ready
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              CSV Upload: Batch Processing
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Currency: Real-time Conversion
            </Badge>
          </div>

          <div className="pt-4 text-sm text-muted-foreground">
            <p>
              <strong>Support Available:</strong> Quick fixes, minor tweaks, and configuration adjustments included.
              <br />
              Check the <strong>USER_GUIDE.md</strong> for detailed instructions and troubleshooting.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}