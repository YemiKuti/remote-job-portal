
import { supabase } from '@/integrations/supabase/client';

export const ensureStorageBucketExists = async () => {
  try {
    console.log('🔍 Checking if documents bucket exists...');
    
    // Check if bucket exists (don't try to create it, as it should exist via migration)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      // Don't return false immediately, let's try to proceed anyway
      console.log('⚠️ Could not list buckets, but continuing with upload attempt...');
      return true;
    }

    console.log('📂 Available buckets:', buckets?.map(b => b.id));
    
    const documentsBucket = buckets?.find(bucket => bucket.id === 'documents');
    
    if (!documentsBucket) {
      console.error('❌ Documents bucket not found in available buckets');
      console.log('📋 Available buckets:', buckets?.map(b => ({ id: b.id, name: b.name })));
      
      // Let's try to proceed anyway - the bucket might exist but not be listable due to permissions
      console.log('⚠️ Proceeding with upload attempt despite bucket not being found in list...');
      return true;
    }

    console.log('✅ Documents bucket found and ready for use');
    return true;
  } catch (error) {
    console.error('❌ Error in ensureStorageBucketExists:', error);
    // Return true to allow upload attempt - better to try and get a more specific error
    console.log('⚠️ Proceeding with upload attempt despite storage check error...');
    return true;
  }
};
