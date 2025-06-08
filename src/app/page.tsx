
"use client"; // Required for useEffect and useRouter

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/SplashScreen'; // Import splash screen for fallback

// This component now immediately attempts to redirect to the login page.
// The actual content display (including loading state) is handled by the layout and provider.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately on client-side mount
    router.replace('/login'); // Use replace to avoid adding splash screen to history
  }, [router]); // Dependency array includes router

  // Render a minimal loading state or splash screen as a fallback
  // This will be briefly visible if the redirect takes time or during SSR/initial load.
  // The AppProvider also shows a splash screen until initialized, providing a more consistent loading experience.
  return <SplashScreen />;
}
