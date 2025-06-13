
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all candidates with preferences
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name')
      .not('id', 'is', null);

    if (profilesError) throw profilesError;

    // Get active jobs posted in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: newJobs, error: jobsError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .gte('created_at', oneDayAgo.toISOString());

    if (jobsError) throw jobsError;

    if (!newJobs || newJobs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No new jobs to recommend' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let notificationsCreated = 0;

    // Create job recommendation notifications for all candidates
    for (const profile of profiles || []) {
      for (const job of newJobs) {
        // Check if user has notification preferences that allow job recommendations
        const { data: prefs } = await supabaseClient
          .from('notification_preferences')
          .select('*')
          .eq('user_id', profile.id)
          .eq('notification_type', 'job_recommendation')
          .single();

        // Skip if user has disabled job recommendations
        if (prefs && (!prefs.in_app_enabled || prefs.frequency === 'disabled')) {
          continue;
        }

        // Check if we already sent a recommendation for this job to this user
        const { data: existingNotification } = await supabaseClient
          .from('candidate_notifications')
          .select('id')
          .eq('user_id', profile.id)
          .eq('type', 'job_recommendation')
          .contains('metadata', { job_id: job.id })
          .single();

        if (existingNotification) {
          continue; // Already notified about this job
        }

        // Create recommendation notification
        const { error: notificationError } = await supabaseClient
          .from('candidate_notifications')
          .insert({
            user_id: profile.id,
            type: 'job_recommendation',
            title: 'New Job Recommendation',
            message: `A new ${job.title} position at ${job.company} might interest you`,
            metadata: {
              job_id: job.id,
              job_title: job.title,
              company: job.company,
              location: job.location
            }
          });

        if (!notificationError) {
          notificationsCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Created ${notificationsCreated} job recommendation notifications`,
        newJobsCount: newJobs.length,
        candidatesCount: profiles?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in job-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
