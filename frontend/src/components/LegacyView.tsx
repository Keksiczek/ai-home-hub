import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LegacyViewProps {
  tabId: string;
}

export function LegacyView({ tabId }: LegacyViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // When the component mounts or tabId changes, we try to tell the legacy iframe to switch tabs.
    // That requires the legacy app.js to support such a hash or message. 
    // Since we just loaded it, we can pass it via hash if we modify legacy to read it, or send a postMessage.
    // For now, we will just reload the iframe with a URL hash or query param.
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // The legacy code uses data-tab buttons. 
      // We can inject a script to switch the tab, but due to same-origin (both localhost locally), we can do it.
      try {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          const btn = doc.querySelector(`button[data-tab="${tabId}"]`) as HTMLButtonElement;
          if (btn) btn.click();
        }
      } catch (e) {
        // cross-origin or not loaded yet
      }
    }
  }, [tabId]);

  const handleIframeLoad = () => {
    // Hide the legacy sidebar and top bar so only the content area shows!
    if (iframeRef.current && iframeRef.current.contentDocument) {
      try {
        const doc = iframeRef.current.contentDocument;
        const sidebar = doc.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const activityBar = doc.getElementById('activity-bar');
        
        if (sidebar) sidebar.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        if (activityBar) activityBar.style.display = 'none';

        // Adjust main content margin since sidebar is gone
        const mainContent = doc.getElementById('main-content');
        if (mainContent) {
           mainContent.style.marginLeft = '0';
        }

        // Switch to the correct tab right away
        const btn = doc.querySelector(`button[data-tab="${tabId}"]`) as HTMLButtonElement;
        if (btn) btn.click();
      } catch (e) {
        console.error("Could not inject styles into iframe", e);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', height: '100%', overflow: 'hidden', padding: 0 }}
      className="card glass-panel"
    >
      <iframe
        ref={iframeRef}
        src="/legacy/index.html"
        onLoad={handleIframeLoad}
        style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
        title={`Legacy ${tabId}`}
      />
    </motion.div>
  );
}
