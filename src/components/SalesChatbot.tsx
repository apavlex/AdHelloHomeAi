import { useEffect } from 'react';

export function SalesChatbot() {
  useEffect(() => {
    // Load GHL chat widget script
    const script = document.createElement('script');
    script.src = 'https://beta.leadconnectorhq.com/loader.js';
    script.setAttribute('data-resources-url', 'https://beta.leadconnectorhq.com/chat-widget/loader.js');
    script.setAttribute('data-widget-id', '6a210b859f5b0cd19a698e2a');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script and any GHL widget elements
      document.body.removeChild(script);
      const widget = document.querySelector('[data-chat-widget]');
      if (widget) widget.remove();
    };
  }, []);

  // GHL widget injects its own floating button and chat window
  // We just need the container div for the widget
  return (
    <div
      data-chat-widget
      data-widget-id="6a210b859f5b0cd19a698e2a"
      data-location-id="VUxgZqbJwIhEiUvG8ZbQ"
    />
  );
}
