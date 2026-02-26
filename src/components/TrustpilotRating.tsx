import Image from 'next/image';

interface TrustpilotRatingProps {
  score?: number | null;
  size?: number;
  className?: string;
  showScore?: boolean;
}

export default function TrustpilotRating({
  score,
  size = 20,
  className = '',
  showScore = true
}: TrustpilotRatingProps) {
  // If no score provided, don't render anything
  if (score === null || score === undefined || score === 0) {
    return null;
  }

  // Ensure score is between 0 and 5
  const validScore = Math.max(0, Math.min(5, score));
  const displayScore = validScore.toFixed(1);

  return (
    <div className={className} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      width: 'fit-content'
    }}>
      {/* Trustpilot Logo */}
      <Image
        src="/trustpilot-logo.webp"
        alt="Trustpilot"
        width={size * 4}
        height={size}
        style={{
          objectFit: 'contain',
          height: `${size}px`,
          width: 'auto'
        }}
      />

      {/* Score Display */}
      {showScore && (
        <span style={{
          fontSize: `${size * 0.7}px`,
          fontWeight: '600',
          color: '#00B67A',
          fontFamily: 'Arial, sans-serif'
        }}>
          {displayScore}
        </span>
      )}
    </div>
  );
}
