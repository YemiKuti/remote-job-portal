
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Clock, ExternalLink, Star } from "lucide-react";
import { useCVAnalysis } from "@/hooks/useCVAnalysis";
import { useNavigate } from "react-router-dom";

export const JobRecommendationsList = () => {
  const { recommendations, loading } = useCVAnalysis();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Recommendations</CardTitle>
          <CardDescription>Loading your personalized job matches...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Recommendations</CardTitle>
          <CardDescription>
            No job recommendations yet. Analyze your CV to get personalized job matches.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getMatchScoreText = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Potential Match";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Job Recommendations</h3>
          <p className="text-sm text-gray-600">
            {recommendations.length} personalized job matches based on your CV
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {recommendations.map((recommendation) => {
          const job = recommendation.job;
          if (!job) return null;

          return (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      {job.remote && (
                        <Badge variant="secondary">Remote</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs ${getMatchScoreColor(recommendation.match_score)}`}>
                      <Star className="h-3 w-3" />
                      {recommendation.match_score}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getMatchScoreText(recommendation.match_score)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Why you're a match:</h4>
                  <p className="text-sm text-gray-600 mb-2">{recommendation.recommendation_reason}</p>
                  
                  {recommendation.matching_keywords.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Matching skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.matching_keywords.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {recommendation.matching_keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{recommendation.matching_keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.employment_type}
                    </span>
                    <span>{job.experience_level}</span>
                    {job.salary_min && job.salary_max && (
                      <span>
                        {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="flex items-center gap-1"
                  >
                    View Job
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
