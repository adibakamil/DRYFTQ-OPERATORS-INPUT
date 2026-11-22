interface BrandLogoProps {
  size?: 'default' | 'large';
}

export function BrandLogo({ size = 'default' }: BrandLogoProps) {
  return (
    <div className={`brand ${size === 'large' ? 'brand--large' : ''}`}>
      <svg className="brand__mark" viewBox="0 0 48 48" role="img" aria-label="DRYFTQ logo">
        <rect x="1" y="1" width="46" height="46" rx="5" fill="#0b1018" stroke="#6b3518" />
        <g fill="#f15a19">
          <rect x="9" y="8" width="6" height="32" rx="1" />
          <rect x="15" y="8" width="14" height="5" rx="1" />
          <rect x="29" y="13" width="5" height="6" rx="1" />
          <rect x="34" y="19" width="5" height="10" rx="1" />
          <rect x="29" y="29" width="5" height="6" rx="1" />
          <rect x="15" y="35" width="14" height="5" rx="1" />
        </g>
      </svg>
      <div>
        <div className="brand__name">DRYFTQ</div>
        <div className="brand__sub">Collect</div>
      </div>
    </div>
  );
}
