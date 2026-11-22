import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type RevealKind = 'up' | 'left' | 'right' | 'fade';

const REVEAL_GROUPS: { selector: string; kind: RevealKind }[] = [
  {
    selector: '.page-heading, .section-heading, .role-header, .role-footer, .wizard-header__inner, .context-strip, .wizard-card__head, .wizard-card__foot, .success-card__header, .success-card__actions, .success-meta, .site-footer',
    kind: 'up',
  },
  {
    selector: '.kpi-card, .action-tile, .role-card, .quick-action, .wizard-card, .card, .evidence-card, .review-item, .summary-list__row, .storage-note, .filter-row, .empty-state, .step',
    kind: 'up',
  },
  {
    selector: '.panel-section, .table-wrap, .profile-rows, .review-list, .review-status, .success-card__note',
    kind: 'fade',
  },
  { selector: '.data-table tbody tr, .profile-row, .demo-account-row', kind: 'left' },
];

const ALL_REVEALS = '.reveal-up, .reveal-left, .reveal-right, .reveal-fade';

/** Tags existing elements for scroll reveal and tracks navbar scroll state. */
export function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tagged = new WeakSet<Element>();
    const revealed = new WeakSet<Element>();
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let mutationTimer = 0;
    let frame = 0;

    const tag = (element: Element, kind: RevealKind) => {
      if (tagged.has(element)) return;
      tagged.add(element);
      element.classList.add(`reveal-${kind}`);
      const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
      const index = Math.max(0, Math.min(siblings.indexOf(element), 6));
      (element as HTMLElement).style.setProperty('--reveal-delay', `${index * 55}ms`);
    };

    const prepare = () => {
      REVEAL_GROUPS.forEach(({ selector, kind }) => {
        document.querySelectorAll(selector).forEach((element) => tag(element, kind));
      });
    };

    const attach = () => {
      prepare();
      if (!observer) return;
      document.querySelectorAll(ALL_REVEALS).forEach((element) => {
        if (!revealed.has(element) && !element.classList.contains('is-revealed')) {
          observer!.observe(element);
        }
      });
    };

    const onScroll = () => {
      document.body.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reduceMotion) {
      prepare();
      document.querySelectorAll(ALL_REVEALS).forEach((element) => {
        element.classList.add('is-revealed');
        revealed.add(element);
      });
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            revealed.add(entry.target);
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
      );

      frame = window.requestAnimationFrame(attach);

      mutationObserver = new MutationObserver(() => {
        window.clearTimeout(mutationTimer);
        mutationTimer = window.setTimeout(attach, 80);
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(mutationTimer);
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('is-scrolled');
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [pathname]);

  return null;
}
