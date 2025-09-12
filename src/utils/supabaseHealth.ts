import { supabase } from '@/integrations/supabase/client';

export type ConnectivityStep = {
  name: string;
  success: boolean;
  message: string;
  details?: any;
};

export type ConnectivityResult = {
  success: boolean;
  steps: ConnectivityStep[];
  insertedJobId?: string;
};

function classifyError(e: any): string {
  const msg = e?.message || String(e);
  // Basic heuristics for clearer guidance
  if (/Failed to fetch|NetworkError|TypeError/i.test(msg)) return 'Network error: Unable to reach Supabase (check internet/CORS).';
  if (/401|invalid token|JWT/i.test(msg)) return 'Auth error: Invalid anon key or expired session token.';
  if (/404|Not Found/i.test(msg)) return 'Endpoint error: Supabase URL incorrect or resource missing.';
  if (/permission|rls|policy/i.test(msg)) return 'RLS/permission error: Current user not allowed to perform this action.';
  return msg;
}

export async function testSupabaseConnectivity(): Promise<ConnectivityResult> {
  const steps: ConnectivityStep[] = [];
  let insertedJobId: string | undefined;

  // 1) Simple SELECT on jobs
  try {
    console.info('🔎 Supabase health: Running SELECT on jobs...');
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (error) throw error;
    steps.push({ name: 'Read jobs', success: true, message: `SELECT ok (${data?.length ?? 0} rows)` });
    console.info('✅ Supabase read success:', data);
  } catch (e: any) {
    const reason = classifyError(e);
    console.error('❌ Supabase read failed:', e);
    steps.push({ name: 'Read jobs', success: false, message: reason, details: e });
    return { success: false, steps };
  }

  // 2) Write via admin RPC (creates a draft test job) and then delete
  try {
    console.info('🛠️ Supabase health: Creating test job via admin_create_job RPC...');
    const title = `Connectivity Test Job ${new Date().toISOString()}`;
    const { data: newId, error: createErr } = await supabase.rpc('admin_create_job', {
      job_title: title,
      job_company: 'HealthCheck Co',
      job_location: 'Internet',
      job_description: 'Temporary connectivity check record. Safe to delete.',
      job_requirements: [],
      job_employment_type: 'full-time',
      job_experience_level: 'mid',
      job_status: 'draft',
      job_application_type: 'internal',
      job_application_value: null,
      job_sponsored: false,
    });

    if (createErr) throw createErr;
    insertedJobId = newId as string | undefined;
    steps.push({ name: 'Create test job', success: true, message: `Insert ok (id=${insertedJobId})` });
    console.info('✅ Supabase write success: created job id', insertedJobId);
  } catch (e: any) {
    const reason = classifyError(e);
    console.error('❌ Supabase write failed:', e);
    steps.push({ name: 'Create test job', success: false, message: reason, details: e });
    return { success: false, steps };
  }

  // 3) Cleanup: delete the test job
  if (insertedJobId) {
    try {
      console.info('🧹 Supabase health: Deleting test job...', insertedJobId);
      const { error: delErr } = await supabase.from('jobs').delete().eq('id', insertedJobId);
      if (delErr) throw delErr;
      steps.push({ name: 'Cleanup test job', success: true, message: 'Delete ok' });
      console.info('✅ Supabase cleanup success');
    } catch (e: any) {
      const reason = classifyError(e);
      console.warn('⚠️ Supabase cleanup failed (manual delete may be required):', e);
      steps.push({ name: 'Cleanup test job', success: false, message: reason, details: e });
    }
  }

  return { success: steps.every(s => s.success), steps, insertedJobId };
}
