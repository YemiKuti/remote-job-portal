
import { supabase } from '@/integrations/supabase/client';

export const ensureStorageBucketExists = async () => {
  try {
    // Check if bucket exists (don't try to create it, as it should exist via migration)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const documentsBucket = buckets?.find(bucket => bucket.id === 'documents');
    
    if (!documentsBucket) {
      console.error('Documents bucket not found. It should be created via SQL migration.');
      return false;
    }

    console.log('Documents bucket exists and is ready for use');
    return true;
  } catch (error) {
    console.error('Error in ensureStorageBucketExists:', error);
    return false;
  }
};
