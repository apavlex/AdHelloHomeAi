import React from 'react';
import SEO from './components/SEO';
import MockupCanvas from './components/MockupCanvas';
import { SITE_ORIGIN } from './lib/site';

export default function VibeBuilderPage() {
  return (
    <>
      <SEO
        title="Vibe Design Builder — AdHello.ai"
        description="Generate live website mockups with AI and Tailwind."
        canonical={`${SITE_ORIGIN}/vibe-builder`}
      />
      <MockupCanvas />
    </>
  );
}
