
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TailoredResumesList } from "@/components/cv/TailoredResumesList";
import { Sparkles } from "lucide-react";

const TailoredResumes = () => {
  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Tailored Resumes
            </CardTitle>
            <CardDescription>
              View and manage your AI-tailored resumes for specific job applications.
              Each tailored resume is optimized to match the requirements of a particular job.
            </CardDescription>
          </CardHeader>
        </Card>

        <TailoredResumesList />
      </div>
    </DashboardLayout>
  );
};

export default TailoredResumes;
