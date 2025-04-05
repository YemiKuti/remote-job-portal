
/**
 * Memberful integration service
 * This file handles integration with Memberful for subscription management
 */

interface MemberfulConfig {
  siteId: string;
}

class MemberfulService {
  private config: MemberfulConfig;
  
  constructor(config: MemberfulConfig) {
    this.config = config;
  }

  /**
   * Initialize Memberful JavaScript integration
   */
  initialize(): void {
    // Skip if already initialized or in server environment
    if (typeof window === 'undefined' || window.memberful) return;
    
    const script = document.createElement('script');
    script.src = `https://d35xxde4fgg0cx.cloudfront.net/assets/embedded.js`;
    script.async = true;
    script.onload = () => {
      if (window.memberful) {
        window.memberful.setup({ site: this.config.siteId });
      }
    };
    
    document.head.appendChild(script);
  }

  /**
   * Open Memberful checkout for a specific plan
   * @param planId - The Memberful plan ID to checkout
   */
  checkout(planId: string): void {
    if (typeof window !== 'undefined' && window.memberful) {
      window.memberful.checkout.open(planId);
    } else {
      console.error('Memberful is not initialized');
    }
  }

  /**
   * Sign in to Memberful account
   */
  signIn(): void {
    if (typeof window !== 'undefined' && window.memberful) {
      window.memberful.signin();
    } else {
      console.error('Memberful is not initialized');
    }
  }
}

// Export singleton instance with placeholder config
// Replace 'your-memberful-site-id' with your actual Memberful site ID
export const memberfulService = new MemberfulService({ 
  siteId: 'your-memberful-site-id' 
});

export default memberfulService;
