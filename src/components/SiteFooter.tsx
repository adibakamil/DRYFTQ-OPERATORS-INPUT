export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__group">
          <span>CLEARANCE: LEVEL-4 RESTRICTED</span>
          <span className="site-footer__sep">•</span>
          <span>NODE: PACIFIC-NORTHWEST-RELAY-09</span>
        </div>
        <div className="site-footer__group">
          <span className="site-footer__hash">HASH: SHA-256::e9b2…84ac</span>
          <span className="site-footer__sep">•</span>
          <span>SYS-VER: v2.4.1-COLLECT</span>
          <span className="site-footer__sep">•</span>
          <span className="site-footer__encrypted">
            <span className="live-dot" /> ENCRYPTED
          </span>
        </div>
      </div>
    </footer>
  );
}
