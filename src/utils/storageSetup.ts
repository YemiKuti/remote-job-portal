
import { supabase } from '@/integrations/supabase/client';

export const ensureStorageBucketExists = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const documentsBucket = buckets?.find(bucket => bucket.id === 'documents');
    
    if (!documentsBucket) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating documents bucket:', createError);
        return false;
      }

      console.log('Documents bucket created successfully');
    }

    return true;
  } catch (error) {
    console.error('Error in ensureStorageBucketExists:', error);
    return false;
  }
};
