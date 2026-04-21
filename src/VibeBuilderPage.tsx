import React from 'react';
import SEO from './components/SEO';
import MockupImageCanvas from './components/MockupImageCanvas';
import { SITE_ORIGIN } from './lib/site';

export default function VibeBuilderPage() {
  return (
    <>
      <SEO
        title="Vibe Design Builder — AdHello.ai"
        description="Generate visual website mockup images with AI."
        canonical={`${SITE_ORIGIN}/vibe-builder`}
      />
      <MockupImageCanvas />
    </>
  );
}
