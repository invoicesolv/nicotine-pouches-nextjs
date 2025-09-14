import Image from 'next/image';

interface ReviewBallsProps {
  rating: number;
  size?: number;
  className?: string;
}

export default function ReviewBalls({ rating, size = 24, className = '' }: ReviewBallsProps) {
  const fullBalls = Math.floor(rating);
  const hasHalfBall = rating % 1 >= 0.5;
  const emptyBalls = 5 - fullBalls - (hasHalfBall ? 1 : 0);

  return (
    <div className={className} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '2px',
      width: 'fit-content'
    }}>
      {/* Full balls */}
      {Array.from({ length: fullBalls }, (_, index) => (
          <Image
            key={`full-${index}`}
            src="/cropped-NP-1-2.svg"
            alt="NP Ball"
            width={size}
            height={size}
            style={{
              opacity: 1,
              filter: 'none',
              objectFit: 'contain',
              objectPosition: 'center',
              width: size,
              height: size,
              borderRadius: '30px'
            }}
          />
      ))}
      
      {/* Half ball */}
      {hasHalfBall && (
        <div style={{ 
          position: 'relative', 
          width: size, 
          height: size,
          backgroundColor: 'lightgrey',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ccc'
        }}>
          {/* Grey background ball */}
          <Image
            src="/cropped-NP-1-2.svg"
            alt="NP Ball Empty"
            width={size - 4}
            height={size - 4}
            style={{
              opacity: 0.3,
              filter: 'grayscale(100%) brightness(0.3)',
              objectFit: 'contain',
              objectPosition: 'center',
              borderRadius: '30px',
              position: 'absolute'
            }}
          />
          {/* Pink half ball on top */}
          <div style={{ 
            position: 'absolute',
            width: size, 
            height: size, 
            overflow: 'hidden',
            clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
          }}>
            <Image
              src="/cropped-NP-1-2.svg"
              alt="NP Ball Half"
              width={size}
              height={size}
              style={{
                opacity: 1,
                filter: 'none',
                objectFit: 'contain',
                objectPosition: 'center',
                width: size,
                height: size,
                borderRadius: '30px'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Empty balls */}
      {Array.from({ length: emptyBalls }, (_, index) => (
        <div key={`empty-${index}`} style={{
          width: size,
          height: size,
          backgroundColor: 'lightgrey',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #ccc'
        }}>
          <Image
            src="/cropped-NP-1-2.svg"
            alt="NP Ball Empty"
            width={size - 4}
            height={size - 4}
            style={{
              opacity: 0.3,
              filter: 'grayscale(100%) brightness(0.3)',
              objectFit: 'contain',
              objectPosition: 'center',
              borderRadius: '30px'
            }}
          />
        </div>
      ))}
    </div>
  );
}
