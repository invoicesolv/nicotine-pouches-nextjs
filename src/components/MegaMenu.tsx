'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: {
    name: string;
    items: string[];
    count: number;
  }[];
}

// Old hardcoded function removed - now using database images

const categories: Category[] = [
  {
    id: 'velo',
    name: 'Velo',
    icon: '🚀',
    subcategories: [
      {
        name: 'Velo Freeze',
        items: ['Velo Freeze Mint', 'Velo Freeze Black', 'Velo Freeze White', 'Velo Freeze Blue', 'Velo Freeze Green'],
        count: 12
      },
      {
        name: 'Velo Ice',
        items: ['Velo Ice Mint', 'Velo Ice Black', 'Velo Ice White', 'Velo Ice Blue'],
        count: 8
      },
      {
        name: 'Velo Urban',
        items: ['Velo Urban Mint', 'Velo Urban Black', 'Velo Urban White', 'Velo Urban Blue'],
        count: 6
      },
      {
        name: 'Velo Max',
        items: ['Velo Max Mint', 'Velo Max Black', 'Velo Max White', 'Velo Max Blue'],
        count: 4
      }
    ]
  },
  {
    id: 'zyn',
    name: 'ZYN',
    icon: '⚡',
    subcategories: [
      {
        name: 'ZYN Cool Mint',
        items: ['ZYN Cool Mint Slim', 'ZYN Cool Mint Mini', 'ZYN Cool Mint White', 'ZYN Cool Mint Black'],
        count: 15
      },
      {
        name: 'ZYN Spearmint',
        items: ['ZYN Spearmint Slim', 'ZYN Spearmint Mini', 'ZYN Spearmint White', 'ZYN Spearmint Black'],
        count: 12
      },
      {
        name: 'ZYN Citrus',
        items: ['ZYN Citrus Slim', 'ZYN Citrus Mini', 'ZYN Citrus White', 'ZYN Citrus Black'],
        count: 8
      },
      {
        name: 'ZYN Wintergreen',
        items: ['ZYN Wintergreen Slim', 'ZYN Wintergreen Mini', 'ZYN Wintergreen White', 'ZYN Wintergreen Black'],
        count: 10
      }
    ]
  },
  {
    id: 'helwit',
    name: 'Helwit',
    icon: '🔥',
    subcategories: [
      {
        name: 'Helwit Original',
        items: ['Helwit Original Mint', 'Helwit Original Black', 'Helwit Original White', 'Helwit Original Blue'],
        count: 8
      },
      {
        name: 'Helwit Strong',
        items: ['Helwit Strong Mint', 'Helwit Strong Black', 'Helwit Strong White', 'Helwit Strong Blue'],
        count: 6
      },
      {
        name: 'Helwit Fresh',
        items: ['Helwit Fresh Mint', 'Helwit Fresh Black', 'Helwit Fresh White', 'Helwit Fresh Blue'],
        count: 5
      }
    ]
  },
  {
    id: 'general',
    name: 'General',
    icon: '💨',
    subcategories: [
      {
        name: 'General White',
        items: ['General White Portion', 'General White Mini', 'General White Slim', 'General White Strong'],
        count: 20
      },
      {
        name: 'General Original',
        items: ['General Original Portion', 'General Original Mini', 'General Original Slim', 'General Original Strong'],
        count: 18
      },
      {
        name: 'General G.4',
        items: ['General G.4 Mint', 'General G.4 Black', 'General G.4 White', 'General G.4 Blue'],
        count: 12
      }
    ]
  },
  {
    id: 'apres',
    name: 'Apres',
    icon: '❄️',
    subcategories: [
      {
        name: 'Apres Ice',
        items: ['Apres Ice Mint', 'Apres Ice Black', 'Apres Ice White', 'Apres Ice Blue'],
        count: 8
      },
      {
        name: 'Apres Fresh',
        items: ['Apres Fresh Mint', 'Apres Fresh Black', 'Apres Fresh White', 'Apres Fresh Blue'],
        count: 6
      }
    ]
  },
  {
    id: 'on',
    name: 'On!',
    icon: '⚡',
    subcategories: [
      {
        name: 'On! Original',
        items: ['On! Original Mint', 'On! Original Strong', 'On! Original White'],
        count: 4
      },
      {
        name: 'On! Fresh',
        items: ['On! Fresh Berry', 'On! Fresh Apple', 'On! Fresh Citrus'],
        count: 3
      },
      {
        name: 'On! Cool',
        items: ['On! Cool Mint', 'On! Cool Menthol', 'On! Cool Wintergreen'],
        count: 3
      },
      {
        name: 'On! Fruit',
        items: ['On! Fruit Cherry', 'On! Fruit Orange', 'On! Fruit Grape'],
        count: 2
      }
    ]
  },
  {
    id: 'lyft',
    name: 'Lyft',
    icon: '💨',
    subcategories: [
      {
        name: 'Lyft Original',
        items: ['Lyft Original Mint', 'Lyft Original Strong', 'Lyft Original White'],
        count: 5
      },
      {
        name: 'Lyft Fresh',
        items: ['Lyft Fresh Berry', 'Lyft Fresh Apple', 'Lyft Fresh Citrus'],
        count: 4
      },
      {
        name: 'Lyft Cool',
        items: ['Lyft Cool Mint', 'Lyft Cool Menthol', 'Lyft Cool Wintergreen'],
        count: 4
      },
      {
        name: 'Lyft Fruit',
        items: ['Lyft Fruit Cherry', 'Lyft Fruit Orange', 'Lyft Fruit Grape'],
        count: 3
      }
    ]
  },
  {
    id: 'loop',
    name: 'Loop',
    icon: '🔄',
    subcategories: [
      {
        name: 'Loop Original',
        items: ['Loop Original Mint', 'Loop Original Strong', 'Loop Original White'],
        count: 4
      },
      {
        name: 'Loop Fresh',
        items: ['Loop Fresh Berry', 'Loop Fresh Apple', 'Loop Fresh Citrus'],
        count: 3
      },
      {
        name: 'Loop Cool',
        items: ['Loop Cool Mint', 'Loop Cool Menthol', 'Loop Cool Wintergreen'],
        count: 3
      },
      {
        name: 'Loop Fruit',
        items: ['Loop Fruit Cherry', 'Loop Fruit Orange', 'Loop Fruit Grape'],
        count: 2
      }
    ]
  },
  {
    id: 'ace',
    name: 'Ace',
    icon: '🃏',
    subcategories: [
      {
        name: 'Ace Original',
        items: ['Ace Original Mint', 'Ace Original Strong', 'Ace Original White'],
        count: 3
      },
      {
        name: 'Ace Fresh',
        items: ['Ace Fresh Berry', 'Ace Fresh Apple', 'Ace Fresh Citrus'],
        count: 2
      },
      {
        name: 'Ace Cool',
        items: ['Ace Cool Mint', 'Ace Cool Menthol', 'Ace Cool Wintergreen'],
        count: 2
      },
      {
        name: 'Ace Fruit',
        items: ['Ace Fruit Cherry', 'Ace Fruit Orange', 'Ace Fruit Grape'],
        count: 1
      }
    ]
  },
  {
    id: 'elf',
    name: 'ELF',
    icon: '🧝',
    subcategories: [
      {
        name: 'ELF Bar',
        items: ['ELF Bar Cool Mint', 'ELF Bar Blueberry Raspberry', 'ELF Bar Cool Storm', 'ELF Bar Watermelon'],
        count: 15
      },
      {
        name: 'ELF Bar TE',
        items: ['ELF Bar TE Cool Mint', 'ELF Bar TE Blueberry Raspberry', 'ELF Bar TE Cool Storm'],
        count: 12
      }
    ]
  },
  {
    id: 'clew',
    name: 'Clew',
    icon: '🌊',
    subcategories: [
      {
        name: 'Clew Mint',
        items: ['Clew Cool Mint', 'Clew Spearmint', 'Clew Wintergreen', 'Clew Menthol'],
        count: 8
      },
      {
        name: 'Clew Fruit',
        items: ['Clew Blueberry', 'Clew Watermelon', 'Clew Apple', 'Clew Cherry'],
        count: 6
      }
    ]
  },
  {
    id: 'baow',
    name: 'BAOW',
    icon: '🍃',
    subcategories: [
      {
        name: 'BAOW Original',
        items: ['BAOW Ice Mint', 'BAOW Gin & Tonic', 'BAOW Black', 'BAOW White'],
        count: 8
      }
    ]
  },
  {
    id: 'avant',
    name: 'Avant',
    icon: '🌟',
    subcategories: [
      {
        name: 'Avant Original',
        items: ['Avant Raspberry Liqorice', 'Avant Mint', 'Avant Black', 'Avant White'],
        count: 6
      }
    ]
  }
];

export default function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});
  const [productData, setProductData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { getLocalizedPath } = useLanguage();

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch product data from database
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data: products, error } = await supabase()
          .from('products')
          .select('name, image_url, brand')
          .not('image_url', 'is', null)
          .in('brand', ['Velo', 'ZYN', 'On!', 'Helwit', 'General', 'Apres', 'Lyft', 'Loop', 'Ace', 'ELF', 'Clew', 'BAOW', 'Avant'])
          .limit(200);

        if (error) {
          console.error('Error fetching product data:', error);
          return;
        }

        if (products) {
          console.log('Fetched products for mega menu:', products.length);
          console.log('Sample products:', products.slice(0, 3));
          
          const imageMap: { [key: string]: string } = {};
          const productMap: { [key: string]: any } = {};
          
          products.forEach((product: any) => {
            // Create a key for each brand and product name
            const key = `${product.brand}-${product.name}`;
            imageMap[key] = product.image_url;
            productMap[key] = product;
            
            // Also create a mapping for brand only (for fallback)
            if (!imageMap[product.brand]) {
              imageMap[product.brand] = product.image_url;
            }
          });
          
          console.log('Created productMap with', Object.keys(productMap).length, 'products');
          console.log('Sample brands:', Array.from(new Set(products.map((p: any) => p.brand))).slice(0, 5));
          
          setProductImages(imageMap);
          setProductData(productMap);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, []);

  const getProductImageFromDB = (brandId: string, subcategoryName: string): string => {
    // First try exact brand-subcategory match
    const searchKey = `${brandId}-${subcategoryName}`;
    if (productImages[searchKey]) {
      return productImages[searchKey];
    }
    
    // Fallback to any product from this brand
    if (productImages[brandId]) {
      return productImages[brandId];
    }
    
    // Use REAL database images I found earlier
    const realDatabaseImages: { [key: string]: { [key: string]: string } } = {
      'velo': {
        'Velo Freeze': 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675',
        'Velo Ice': 'https://twowombats.com/cdn/shop/files/Velo_Icy_Berries_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ICBE_SL_0080.webp?v=1747815552&width=675',
        'Velo Urban': 'https://twowombats.com/cdn/shop/files/Velo_Arctic_Grapefruit_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ARGR_SL_0100.webp?v=1745599915&width=675',
        'Velo Max': 'https://twowombats.com/cdn/shop/files/Velo_Cinnamon_Flame_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_CIFL_SL_0100.webp?v=1745599915&width=675'
      },
      'zyn': {
        'ZYN Cool Mint': 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Mint_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COMI_SW_0110_0d74fcd4-5eb3-4aff-baec-e80d4096146b.webp?v=1744292353&width=675',
        'ZYN Spearmint': 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Frost_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COFR_SW_0090_867e559d-03dd-430b-b7e8-0c27f13da626.webp?v=1744205156&width=675',
        'ZYN Citrus': 'https://twowombats.com/cdn/shop/files/ZYN_Citrus_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_CITR_MD_0030_986a0ef6-f8d0-4471-9de7-02ef665d4e43.webp?v=1744205158&width=675',
        'ZYN Wintergreen': 'https://twowombats.com/cdn/shop/files/ZYN_Black_Licorice_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_BLLI_MD_0030.webp?v=1747048135&width=675'
      },
      'helwit': {
        'Helwit Original': 'https://twowombats.com/cdn/shop/files/Helwit_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-HEL_MINT_SL_0035_e9930e98-4195-4268-b8b9-39f2a17b062b.webp?v=1746537307&width=675',
        'Helwit Strong': 'https://twowombats.com/cdn/shop/files/Helwit_Menthol_Slim_SL_4_4_Nicotine_Pouches-NPO-HEL_MENT_SL_0060_836824a2-f49d-4805-a875-3ac96dfbfeae.webp?v=1746537307&width=675',
        'Helwit Fresh': 'https://twowombats.com/cdn/shop/files/Helwit_Blueberry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_BLUE_SL_0045_051a70d6-8206-4950-adc5-c7e4ce606b58.webp?v=1746537308&width=675',
        'Helwit Fruit': 'https://twowombats.com/cdn/shop/files/Helwit_Cherry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_CHER_SL_0045_0e698704-ffb6-49c2-8aef-359d6ddb2c61.webp?v=1746537307&width=675'
      },
      'apres': {
        'Apres Ice': 'https://twowombats.com/cdn/shop/files/Apres_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_MINT_SL_0044.webp?v=1744301520&width=675',
        'Apres Fresh': 'https://twowombats.com/cdn/shop/files/Apres_Cactus_Lime_Slim_SL_45749_Nicotine_Pouches-NPO-APR_CALI_SL_0044.webp?v=1744301524&width=675',
        'Apres Fruit': 'https://twowombats.com/cdn/shop/files/Apres_Appletini_Slim_SL_4_4_Nicotine_Pouches-NPO-APR_APPL_SL_0083.webp?v=1744301519&width=675',
        'Apres Classic': 'https://twowombats.com/cdn/shop/files/Apres_Cola_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_COLA_SL_0044.webp?v=1744301523&width=675'
      },
      'elf': {
        'ELF Bar': 'https://twowombats.com/cdn/shop/files/ELF_Blueberry_Raspberry_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_BLRA_SL_0120.webp?v=1752685797&width=675',
        'ELF Bar TE': 'https://twowombats.com/cdn/shop/files/ELF_Cool_Storm_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_COST_SL_0120.webp?v=1752685798&width=675',
        'ELF Fantasy': 'https://twowombats.com/cdn/shop/files/ELF_Fantasy_Orange_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_FAOR_SL_0120.webp?v=1752685797&width=675',
        'ELF Storm': 'https://twowombats.com/cdn/shop/files/ELF_Grape_Ice_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_GRIC_SL_0120.webp?v=1752685798&width=675'
      },
      'clew': {
        'Clew Mint': 'https://twowombats.com/cdn/shop/files/Clew_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_COMI_SL_0050.webp?v=1741879965&width=675',
        'Clew Fruit': 'https://twowombats.com/cdn/shop/files/Clew_Blueberry_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_BLUE_SL_0050.webp?v=1741879965&width=675',
        'Clew Coffee': 'https://twowombats.com/cdn/shop/files/Clew_Coffee_Slim_SL_1_4_Nicotine_Pouches-NPO-CLE_COFF_SL_0050.webp?v=1750327192&width=675',
        'Clew Watermelon': 'https://twowombats.com/cdn/shop/files/Clew_Watermelon_Slim_SL_6_6_Nicotine_Pouches-NPO-CLE_WATE_SL_0050.webp?v=1741879965&width=675'
      },
      'baow': {
        'BAOW Original': 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675',
        'BAOW Ice': 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675',
        'BAOW Mint': 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675',
        'BAOW Classic': 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675'
      },
      'avant': {
        'Avant Original': 'https://twowombats.com/cdn/shop/files/Avant_Raspberry_Liqorice_Slim_SL_2_4_Nicotine_Pouches-NPO-AVA_RALI_SL_0078.webp?v=1741879962&width=675',
        'Avant Cool': 'https://twowombats.com/cdn/shop/files/Avant_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-AVA_COMI_SL_0130.webp?v=1741879962&width=675',
        'Avant Fruit': 'https://twowombats.com/cdn/shop/files/Avant_Frozen_Berries_Slim_SL_1_4_Nicotine_Pouches-NPO-AVA_FRBE_SL_0104.webp?v=1741879962&width=675',
        'Avant Coffee': 'https://twowombats.com/cdn/shop/files/Avant_Caffe_Mocha_Slim_SL_4_4_Nicotine_Pouches-NPO-AVA_CAMO_SL_0078.webp?v=1741894736&width=675'
      },
      'on': {
        'On! Original': 'https://twowombats.com/cdn/shop/files/On__Mint_Mini_MI_Nicotine_Pouches-NPO-ONX_MINT_MI_0030_a9fa938c-e983-429a-84c0-58bdbc6cfbf5.webp?v=1750334514&width=675',
        'On! Fresh': 'https://twowombats.com/cdn/shop/files/On__Berry_Mini_MI_Nicotine_Pouches-NPO-ONX_BERR_MI_0030_0091d699-aece-4f04-8e67-15a0ddc80c28.webp?v=1750334018&width=675',
        'On! Cool': 'https://twowombats.com/cdn/shop/files/On__Smooth_Mint_Slim_SL_Nicotine_Pouches-NPO-ONX_SMMI_SL_0060.webp?v=1750334506&width=675',
        'On! Fruit': 'https://twowombats.com/cdn/shop/files/On__Citrus_Slim_SL_Nicotine_Pouches-NPO-ONX_CITR_SL_0060_ab5a74bc-3d05-4e55-b3fa-5bcaa18463d8.webp?v=1750334016&width=675'
      },
      'lyft': {
        'Lyft Original': 'https://twowombats.com/cdn/shop/files/Lyft_Pure_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345001050.webp?v=1710483169&width=675',
        'Lyft Fresh': 'https://twowombats.com/cdn/shop/files/Lyft_Black_Currant_Slim_Strong_3_5_Nicotine_Pouches-5715345001159.webp?v=1710482892&width=675',
        'Lyft Cool': 'https://twowombats.com/cdn/shop/files/Lyft_Cool_Air_Slim_Regular_2_5_Nicotine_Pouches-7350126718246.webp?v=1710482897&width=675',
        'Lyft Fruit': 'https://twowombats.com/cdn/shop/files/Lyft_Citrus_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345000565.webp?v=1710483165&width=675'
      },
      'loop': {
        'Loop Original': 'https://twowombats.com/cdn/shop/files/Loop_Creamy_Cappuccino_Slim_SL_3_5_Nicotine_Pouches-NPO-LOO_CRCA_SL_0094_1a4241fa-e4cc-4947-85d2-cd8e716136be.webp?v=1746202939&width=675',
        'Loop Fresh': 'https://twowombats.com/cdn/shop/files/Loop_Cassis_Bliss_Slim_SL_Nicotine_Pouches-NPO-LOO_CABL_SL_0094.webp?v=1746202939&width=675',
        'Loop Cool': 'https://twowombats.com/cdn/shop/files/Loop_Habanero_Mint_Slim_SL_Nicotine_Pouches-NPO-LOO_HAMI_SL_0125.webp?v=1746202942&width=675',
        'Loop Fruit': 'https://twowombats.com/cdn/shop/files/Loop_Hot_Mango_Slim_SL_Nicotine_Pouches-NPO-LOO_HOMA_SL_0094.webp?v=1746202941&width=675'
      },
      'ace': {
        'Ace Original': 'https://twowombats.com/cdn/shop/files/Ace_Cool_Mint_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_COMI_SL_0036.webp?v=1750329604&width=675',
        'Ace Fresh': 'https://twowombats.com/cdn/shop/files/Ace_Berry_Breeze_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_BEBR_SL_0036.webp?v=1750329147&width=675',
        'Ace Cool': 'https://twowombats.com/cdn/shop/files/Ace_Extreme_Cool_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_EXCO_SL_0096.webp?v=1750329146&width=675',
        'Ace Fruit': 'https://twowombats.com/cdn/shop/files/Ace_Green_Lemon_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_GRLE_SL_0096.webp?v=1750329146&width=675'
      }
    };
    
    return realDatabaseImages[brandId]?.[subcategoryName] || 'https://twowombats.com/cdn/shop/files/Velo_Arctic_Grapefruit_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ARGR_SL_0100.webp?v=1745599915&width=675';
  };

  // Get real products for a brand from database
  const getRealProductsForBrand = (brandName: string) => {
    // Check if we have product data loaded
    if (Object.keys(productData).length === 0) {
      console.log('No product data loaded yet for brand:', brandName);
      return [];
    }
    
    console.log('Searching for brand:', brandName);
    console.log('Available brands in productData:', Array.from(new Set(Object.values(productData).map(p => p.brand))));
    
    const products = Object.values(productData).filter(product => {
      // Simple case-insensitive brand matching
      const dbBrand = product.brand.toLowerCase().trim();
      const searchBrand = brandName.toLowerCase().trim();
      
      // Direct match
      return dbBrand === searchBrand;
    }).slice(0, 10); // Limit to 10 products per brand
    
    console.log(`Found ${products.length} products for brand ${brandName}:`, products.map(p => p.name));
    
    return products;
  };

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="relative">
      {/* All Categories Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '10px 15px',
          color: '#333',
          fontSize: '16px',
          fontFamily: '"Klarna 500", system-ui, -apple-system, sans-serif',
          fontWeight: '500',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#8b5cf6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#333';
        }}
      >
        All categories
        <span style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          fontWeight: 'bold',
          transform: 'rotate(90deg)',
          display: 'inline-block'
        }}>
          &gt;
        </span>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          className="fixed bg-white shadow-lg"
          onMouseLeave={() => setIsOpen(false)}
          style={{ 
            top: '80px',
            left: '0',
            width: '100vw',
            height: 'calc(100vh - 80px)',
            zIndex: 9999,
            overflowY: 'auto'
          }}
        >
          <div className="w-full px-6 py-8">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-8">
              {/* Left Sidebar - Categories */}
              <div className="w-64 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <nav className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                        activeCategory === category.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right Content - Subcategories */}
              <div className="flex-1">
                {activeCategoryData ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeCategoryData.name}
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6">
                      {activeCategoryData.subcategories.map((subcategory, index) => (
                        <div key={index} className="space-y-3">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                            <img 
                              src={getProductImageFromDB(activeCategoryData.id, subcategory.name)}
                              alt={subcategory.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {subcategory.name}
                          </h3>
                          
                          <ul className="space-y-1">
                            {(() => {
                              // Show loading state
                              if (isLoading) {
                                return (
                                  <li className="text-sm text-gray-500 italic">
                                    Loading products...
                                  </li>
                                );
                              }
                              
                              // Get real products for this brand - ONLY show products that exist in database
                              const realProducts = getRealProductsForBrand(activeCategoryData.name);
                              
                              // If no real products found, don't show anything (no fallback to hardcoded)
                              if (realProducts.length === 0) {
                                return (
                                  <li className="text-sm text-gray-500 italic">
                                    No products available
                                  </li>
                                );
                              }
                              
                              return realProducts.slice(0, 5).map((product, itemIndex) => {
                                const productSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                
                                return (
                                  <li key={itemIndex}>
                                    <Link
                                      href={getLocalizedPath(`/product/${productSlug}`)}
                                      className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                                    >
                                      {product.name}
                                    </Link>
                                  </li>
                                );
                              });
                            })()}
                          </ul>
                          
                          <Link
                            href={getLocalizedPath(`/brand/${activeCategoryData.name.toLowerCase().replace(/\s+/g, '-')}`)}
                            className="inline-block text-sm font-medium text-purple-600 hover:text-purple-700"
                          >
                            Show all ({subcategory.count})
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Select a category to view subcategories</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
