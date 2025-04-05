
interface MemberfulCheckout {
  open: (planId: string) => void;
}

interface Memberful {
  setup: (options: { site: string }) => void;
  checkout: MemberfulCheckout;
  signin: () => void;
  signout: () => void;
}

declare global {
  interface Window {
    memberful?: Memberful;
  }
}

export {};
