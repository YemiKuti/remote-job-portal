
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production';

  track(event: string, properties?: Record<string, any>, userId?: string) {
    if (!this.isProduction) {
      console.log('Analytics Event:', { event, properties, userId });
      return;
    }

    // In production, you would send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    try {
      // Analytics implementation would go here
      console.log('Analytics tracked:', { event, properties, userId });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  // Common events for employer portal
  trackJobPosted(jobId: string, jobTitle: string) {
    this.track('job_posted', { jobId, jobTitle });
  }

  trackJobViewed(jobId: string, jobTitle: string) {
    this.track('job_viewed', { jobId, jobTitle });
  }

  trackApplicationReceived(jobId: string, applicationId: string) {
    this.track('application_received', { jobId, applicationId });
  }

  trackApplicationStatusChanged(applicationId: string, status: string) {
    this.track('application_status_changed', { applicationId, status });
  }

  trackUserSignup(userRole: string) {
    this.track('user_signup', { userRole });
  }

  trackUserLogin(userRole: string) {
    this.track('user_login', { userRole });
  }

  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  trackError(error: string, context?: Record<string, any>) {
    this.track('error_occurred', { error, context });
  }
}

export const analytics = new Analytics();
