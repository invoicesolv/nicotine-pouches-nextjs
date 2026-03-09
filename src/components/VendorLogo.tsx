'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VendorLogoProps {
  logo: string;
  name: string;
  size?: number;
}

export default function VendorLogo({ logo, name, size = 50 }: VendorLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Map vendor names to local logo files
  const getLocalLogoPath = (vendorName: string) => {
    const logoMap: { [key: string]: string } = {
      'HAYYP': '/vendor-logos/HAYPP.jpg',
      'GOALLWHITE': '/vendor-logos/NICPOUCHUK.jpg', // Using NICPOUCHUK as placeholder
      'Two Wombats': '/vendor-logos/two-wombats.jpg',
      'Whitepouches': '/vendor-logos/NICPOUCHUK.jpg', // Using NICPOUCHUK as placeholder
      'Nicpouch': '/vendor-logos/NICPOUCHUK.jpg',
      'Buy Nicotine Pouches': '/vendor-logos/NICPOUCHUK.jpg', // Using NICPOUCHUK as placeholder
      'First Line Pods': '/vendor-logos/NICPOUCHUK.jpg', // Using NICPOUCHUK as placeholder
      'Northerner UK': '/vendor-logos/northerner_black_mobile.webp',
      'Northerner US': '/vendor-logos/northerner_black_mobile.webp',
      'Prilla': '/vendor-logos/Prilla.svg',
      'Nicokick': '/vendor-logos/Nicokick.png',
      'Nicokick (55788)': '/vendor-logos/Nicokick.png',
      'Snus Vikings': '/vendor-logos/Snus-viking.png',
      'Snusifer': '/vendor-logos/Snusifer.png',
      'Pouches EU': '/vendor-logos/NICPOUCHUK.jpg', // Using NICPOUCHUK as placeholder
      'GotPouches': '/vendor-logos/gotpouches.png',
      'SnusDirect': '/vendor-logos/snusdirekt.avif',
      'SnusDaddy': '/vendor-logos/pouchdaddy.png',
      'Prime Nic Pouches': '/vendor-logos/PrimeNicPouches.png',
      'NicoUK': '/vendor-logos/NicoUK.png',
      'NicPouches': '/vendor-logos/NicPouches.svg',
      'SnusBoys': '/vendor-logos/SnusBoys.png',
      'NicPouchesDirect': '/vendor-logos/NicPouchesDirect.png',
      'PrimeVapes': '/vendor-logos/PrimeVapes.png',
      'Emeraldpods': '/vendor-logos/Emeraldpods.webp',
      'Emerald': '/vendor-logos/Emeraldpods.webp',
      'Prime': '/vendor-logos/PrimeNicPouches.png',
      'PrimeNicPouches': '/vendor-logos/PrimeNicPouches.png',
    };
    
    return logoMap[vendorName] || null;
  };

  // Fallback color scheme for vendors without logos
  const getVendorColor = (vendorName: string) => {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green  
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
    ];
    const index = vendorName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const localLogoPath = getLocalLogoPath(name);
  const isSnusifer = name.toLowerCase().includes('snusifer');

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: localLogoPath ? (isSnusifer ? '8px' : '50%') : '50%',
      backgroundColor: localLogoPath ? '#f8f9fa' : getVendorColor(name),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: localLogoPath ? '0px' : '14px',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      overflow: isSnusifer ? 'visible' : 'hidden',
      border: localLogoPath && !isSnusifer ? '1px solid #e5e7eb' : 'none'
    }}>
      {localLogoPath && !imageError ? (
        <Image
          src={localLogoPath}
          alt={name}
          width={size}
          height={size}
          style={{
            width: '100%',
            height: '100%',
            objectFit: isSnusifer ? 'contain' : 'cover',
            borderRadius: isSnusifer ? '0' : '50%'
          }}
          onError={() => {
            console.log('Local logo failed to load:', localLogoPath, 'for vendor:', name);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Local logo loaded successfully:', localLogoPath, 'for vendor:', name);
          }}
        />
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          {name.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
