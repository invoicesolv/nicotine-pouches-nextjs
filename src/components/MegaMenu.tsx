'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  brandImage: string;
  subcategories: {
    name: string;
    items: {
      title: string;
      image_url: string;
    }[];
    count: number;
  }[];
}

// Old hardcoded function removed - now using database images

const categories: Category[] = [
  {
    id: 'velo',
    name: 'Velo',
    brandImage: 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675',
    subcategories: [
      {
        name: 'Velo Freeze',
        items: [
          { title: 'Velo Freeze Mint', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675' },
          { title: 'Velo Freeze Black', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675' },
          { title: 'Velo Freeze White', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675' },
          { title: 'Velo Freeze Blue', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675' },
          { title: 'Velo Freeze Green', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Freezing_Peppermint_Slim_SL_4_6_Nicotine_Pouches-NPO-VEL_FRPE_SL_0109.webp?v=1745599918&width=675' }
        ],
        count: 12
      },
      {
        name: 'Velo Ice',
        items: [
          { title: 'Velo Ice Mint', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Icy_Berries_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ICBE_SL_0080.webp?v=1747815552&width=675' },
          { title: 'Velo Ice Black', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Icy_Berries_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ICBE_SL_0080.webp?v=1747815552&width=675' },
          { title: 'Velo Ice White', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Icy_Berries_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ICBE_SL_0080.webp?v=1747815552&width=675' },
          { title: 'Velo Ice Blue', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Icy_Berries_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ICBE_SL_0080.webp?v=1747815552&width=675' }
        ],
        count: 8
      },
      {
        name: 'Velo Urban',
        items: [
          { title: 'Velo Urban Mint', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Arctic_Grapefruit_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ARGR_SL_0100.webp?v=1745599915&width=675' },
          { title: 'Velo Urban Black', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Arctic_Grapefruit_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ARGR_SL_0100.webp?v=1745599915&width=675' },
          { title: 'Velo Urban White', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Arctic_Grapefruit_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ARGR_SL_0100.webp?v=1745599915&width=675' },
          { title: 'Velo Urban Blue', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Arctic_Grapefruit_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_ARGR_SL_0100.webp?v=1745599915&width=675' }
        ],
        count: 6
      },
      {
        name: 'Velo Max',
        items: [
          { title: 'Velo Max Mint', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Cinnamon_Flame_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_CIFL_SL_0100.webp?v=1745599915&width=675' },
          { title: 'Velo Max Black', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Cinnamon_Flame_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_CIFL_SL_0100.webp?v=1745599915&width=675' },
          { title: 'Velo Max White', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Cinnamon_Flame_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_CIFL_SL_0100.webp?v=1745599915&width=675' },
          { title: 'Velo Max Blue', image_url: 'https://twowombats.com/cdn/shop/files/Velo_Cinnamon_Flame_Slim_SL_3_6_Nicotine_Pouches-NPO-VEL_CIFL_SL_0100.webp?v=1745599915&width=675' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'zyn',
    name: 'ZYN',
    brandImage: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Mint_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COMI_SW_0110_0d74fcd4-5eb3-4aff-baec-e80d4096146b.webp?v=1744292353&width=675',
    subcategories: [
      {
        name: 'ZYN Cool Mint',
        items: [
          { title: 'ZYN Cool Mint Slim', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Mint_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COMI_SW_0110_0d74fcd4-5eb3-4aff-baec-e80d4096146b.webp?v=1744292353&width=675' },
          { title: 'ZYN Cool Mint Mini', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Mint_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COMI_SW_0110_0d74fcd4-5eb3-4aff-baec-e80d4096146b.webp?v=1744292353&width=675' },
          { title: 'ZYN Cool Mint White', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Mint_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COMI_SW_0110_0d74fcd4-5eb3-4aff-baec-e80d4096146b.webp?v=1744292353&width=675' },
          { title: 'ZYN Cool Mint Black', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Mint_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COMI_SW_0110_0d74fcd4-5eb3-4aff-baec-e80d4096146b.webp?v=1744292353&width=675' }
        ],
        count: 15
      },
      {
        name: 'ZYN Spearmint',
        items: [
          { title: 'ZYN Spearmint Slim', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Frost_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COFR_SW_0090_867e559d-03dd-430b-b7e8-0c27f13da626.webp?v=1744205156&width=675' },
          { title: 'ZYN Spearmint Mini', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Frost_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COFR_SW_0090_867e559d-03dd-430b-b7e8-0c27f13da626.webp?v=1744205156&width=675' },
          { title: 'ZYN Spearmint White', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Frost_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COFR_SW_0090_867e559d-03dd-430b-b7e8-0c27f13da626.webp?v=1744205156&width=675' },
          { title: 'ZYN Spearmint Black', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Cool_Frost_Slim_SW_3_4_Nicotine_Pouches-NPO-ZYN_COFR_SW_0090_867e559d-03dd-430b-b7e8-0c27f13da626.webp?v=1744205156&width=675' }
        ],
        count: 12
      },
      {
        name: 'ZYN Citrus',
        items: [
          { title: 'ZYN Citrus Slim', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Citrus_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_CITR_MD_0030_986a0ef6-f8d0-4471-9de7-02ef665d4e43.webp?v=1744205158&width=675' },
          { title: 'ZYN Citrus Mini', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Citrus_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_CITR_MD_0030_986a0ef6-f8d0-4471-9de7-02ef665d4e43.webp?v=1744205158&width=675' },
          { title: 'ZYN Citrus White', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Citrus_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_CITR_MD_0030_986a0ef6-f8d0-4471-9de7-02ef665d4e43.webp?v=1744205158&width=675' },
          { title: 'ZYN Citrus Black', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Citrus_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_CITR_MD_0030_986a0ef6-f8d0-4471-9de7-02ef665d4e43.webp?v=1744205158&width=675' }
        ],
        count: 8
      },
      {
        name: 'ZYN Wintergreen',
        items: [
          { title: 'ZYN Wintergreen Slim', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Black_Licorice_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_BLLI_MD_0030.webp?v=1747048135&width=675' },
          { title: 'ZYN Wintergreen Mini', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Black_Licorice_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_BLLI_MD_0030.webp?v=1747048135&width=675' },
          { title: 'ZYN Wintergreen White', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Black_Licorice_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_BLLI_MD_0030.webp?v=1747048135&width=675' },
          { title: 'ZYN Wintergreen Black', image_url: 'https://twowombats.com/cdn/shop/files/ZYN_Black_Licorice_Mini_MD_2_4_Nicotine_Pouches-NPO-ZYN_BLLI_MD_0030.webp?v=1747048135&width=675' }
        ],
        count: 10
      }
    ]
  },
  {
    id: 'helwit',
    name: 'Helwit',
    brandImage: 'https://twowombats.com/cdn/shop/files/Helwit_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-HEL_MINT_SL_0035_e9930e98-4195-4268-b8b9-39f2a17b062b.webp?v=1746537307&width=675',
    subcategories: [
      {
        name: 'Helwit Original',
        items: [
          { title: 'Helwit Original Mint', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-HEL_MINT_SL_0035_e9930e98-4195-4268-b8b9-39f2a17b062b.webp?v=1746537307&width=675' },
          { title: 'Helwit Original Black', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-HEL_MINT_SL_0035_e9930e98-4195-4268-b8b9-39f2a17b062b.webp?v=1746537307&width=675' },
          { title: 'Helwit Original White', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-HEL_MINT_SL_0035_e9930e98-4195-4268-b8b9-39f2a17b062b.webp?v=1746537307&width=675' },
          { title: 'Helwit Original Blue', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-HEL_MINT_SL_0035_e9930e98-4195-4268-b8b9-39f2a17b062b.webp?v=1746537307&width=675' }
        ],
        count: 8
      },
      {
        name: 'Helwit Strong',
        items: [
          { title: 'Helwit Strong Mint', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Menthol_Slim_SL_4_4_Nicotine_Pouches-NPO-HEL_MENT_SL_0060_836824a2-f49d-4805-a875-3ac96dfbfeae.webp?v=1746537307&width=675' },
          { title: 'Helwit Strong Black', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Menthol_Slim_SL_4_4_Nicotine_Pouches-NPO-HEL_MENT_SL_0060_836824a2-f49d-4805-a875-3ac96dfbfeae.webp?v=1746537307&width=675' },
          { title: 'Helwit Strong White', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Menthol_Slim_SL_4_4_Nicotine_Pouches-NPO-HEL_MENT_SL_0060_836824a2-f49d-4805-a875-3ac96dfbfeae.webp?v=1746537307&width=675' },
          { title: 'Helwit Strong Blue', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Menthol_Slim_SL_4_4_Nicotine_Pouches-NPO-HEL_MENT_SL_0060_836824a2-f49d-4805-a875-3ac96dfbfeae.webp?v=1746537307&width=675' }
        ],
        count: 6
      },
      {
        name: 'Helwit Fresh',
        items: [
          { title: 'Helwit Fresh Mint', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Blueberry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_BLUE_SL_0045_051a70d6-8206-4950-adc5-c7e4ce606b58.webp?v=1746537308&width=675' },
          { title: 'Helwit Fresh Black', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Blueberry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_BLUE_SL_0045_051a70d6-8206-4950-adc5-c7e4ce606b58.webp?v=1746537308&width=675' },
          { title: 'Helwit Fresh White', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Blueberry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_BLUE_SL_0045_051a70d6-8206-4950-adc5-c7e4ce606b58.webp?v=1746537308&width=675' },
          { title: 'Helwit Fresh Blue', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Blueberry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_BLUE_SL_0045_051a70d6-8206-4950-adc5-c7e4ce606b58.webp?v=1746537308&width=675' }
        ],
        count: 5
      },
      {
        name: 'Helwit Fruit',
        items: [
          { title: 'Helwit Fruit Cherry', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Cherry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_CHER_SL_0045_0e698704-ffb6-49c2-8aef-359d6ddb2c61.webp?v=1746537307&width=675' },
          { title: 'Helwit Fruit Apple', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Cherry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_CHER_SL_0045_0e698704-ffb6-49c2-8aef-359d6ddb2c61.webp?v=1746537307&width=675' },
          { title: 'Helwit Fruit Grape', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Cherry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_CHER_SL_0045_0e698704-ffb6-49c2-8aef-359d6ddb2c61.webp?v=1746537307&width=675' },
          { title: 'Helwit Fruit Orange', image_url: 'https://twowombats.com/cdn/shop/files/Helwit_Cherry_Slim_SL_3_4_Nicotine_Pouches-NPO-HEL_CHER_SL_0045_0e698704-ffb6-49c2-8aef-359d6ddb2c61.webp?v=1746537307&width=675' }
        ],
        count: 4
      }
    ]
  },
  {
    id: 'apres',
    name: 'Apres',
    brandImage: 'https://twowombats.com/cdn/shop/files/Apres_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_MINT_SL_0044.webp?v=1744301520&width=675',
    subcategories: [
      {
        name: 'Apres Ice',
        items: [
          { title: 'Apres Ice Mint', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_MINT_SL_0044.webp?v=1744301520&width=675' },
          { title: 'Apres Ice Black', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_MINT_SL_0044.webp?v=1744301520&width=675' },
          { title: 'Apres Ice White', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_MINT_SL_0044.webp?v=1744301520&width=675' },
          { title: 'Apres Ice Blue', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Mint_Slim_SL_2_4_Nicotine_Pouches-NPO-APR_MINT_SL_0044.webp?v=1744301520&width=675' }
        ],
        count: 8
      },
      {
        name: 'Apres Fresh',
        items: [
          { title: 'Apres Fresh Mint', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Cactus_Lime_Slim_SL_45749_Nicotine_Pouches-NPO-APR_CALI_SL_0044.webp?v=1744301524&width=675' },
          { title: 'Apres Fresh Black', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Cactus_Lime_Slim_SL_45749_Nicotine_Pouches-NPO-APR_CALI_SL_0044.webp?v=1744301524&width=675' },
          { title: 'Apres Fresh White', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Cactus_Lime_Slim_SL_45749_Nicotine_Pouches-NPO-APR_CALI_SL_0044.webp?v=1744301524&width=675' },
          { title: 'Apres Fresh Blue', image_url: 'https://twowombats.com/cdn/shop/files/Apres_Cactus_Lime_Slim_SL_45749_Nicotine_Pouches-NPO-APR_CALI_SL_0044.webp?v=1744301524&width=675' }
        ],
        count: 6
      }
    ]
  },
  {
    id: 'on',
    name: 'On!',
    brandImage: 'https://twowombats.com/cdn/shop/files/On__Mint_Mini_MI_Nicotine_Pouches-NPO-ONX_MINT_MI_0030_a9fa938c-e983-429a-84c0-58bdbc6cfbf5.webp?v=1750334514&width=675',
    subcategories: [
      {
        name: 'On! Original',
        items: [
          { title: 'On! Original Mint', image_url: 'https://twowombats.com/cdn/shop/files/On__Mint_Mini_MI_Nicotine_Pouches-NPO-ONX_MINT_MI_0030_a9fa938c-e983-429a-84c0-58bdbc6cfbf5.webp?v=1750334514&width=675' },
          { title: 'On! Original Strong', image_url: 'https://twowombats.com/cdn/shop/files/On__Mint_Mini_MI_Nicotine_Pouches-NPO-ONX_MINT_MI_0030_a9fa938c-e983-429a-84c0-58bdbc6cfbf5.webp?v=1750334514&width=675' },
          { title: 'On! Original White', image_url: 'https://twowombats.com/cdn/shop/files/On__Mint_Mini_MI_Nicotine_Pouches-NPO-ONX_MINT_MI_0030_a9fa938c-e983-429a-84c0-58bdbc6cfbf5.webp?v=1750334514&width=675' }
        ],
        count: 4
      },
      {
        name: 'On! Fresh',
        items: [
          { title: 'On! Fresh Berry', image_url: 'https://twowombats.com/cdn/shop/files/On__Berry_Mini_MI_Nicotine_Pouches-NPO-ONX_BERR_MI_0030_0091d699-aece-4f04-8e67-15a0ddc80c28.webp?v=1750334018&width=675' },
          { title: 'On! Fresh Apple', image_url: 'https://twowombats.com/cdn/shop/files/On__Berry_Mini_MI_Nicotine_Pouches-NPO-ONX_BERR_MI_0030_0091d699-aece-4f04-8e67-15a0ddc80c28.webp?v=1750334018&width=675' },
          { title: 'On! Fresh Citrus', image_url: 'https://twowombats.com/cdn/shop/files/On__Berry_Mini_MI_Nicotine_Pouches-NPO-ONX_BERR_MI_0030_0091d699-aece-4f04-8e67-15a0ddc80c28.webp?v=1750334018&width=675' }
        ],
        count: 3
      },
      {
        name: 'On! Cool',
        items: [
          { title: 'On! Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/On__Smooth_Mint_Slim_SL_Nicotine_Pouches-NPO-ONX_SMMI_SL_0060.webp?v=1750334506&width=675' },
          { title: 'On! Cool Menthol', image_url: 'https://twowombats.com/cdn/shop/files/On__Smooth_Mint_Slim_SL_Nicotine_Pouches-NPO-ONX_SMMI_SL_0060.webp?v=1750334506&width=675' },
          { title: 'On! Cool Wintergreen', image_url: 'https://twowombats.com/cdn/shop/files/On__Smooth_Mint_Slim_SL_Nicotine_Pouches-NPO-ONX_SMMI_SL_0060.webp?v=1750334506&width=675' }
        ],
        count: 3
      },
      {
        name: 'On! Fruit',
        items: [
          { title: 'On! Fruit Cherry', image_url: 'https://twowombats.com/cdn/shop/files/On__Citrus_Slim_SL_Nicotine_Pouches-NPO-ONX_CITR_SL_0060_ab5a74bc-3d05-4e55-b3fa-5bcaa18463d8.webp?v=1750334016&width=675' },
          { title: 'On! Fruit Orange', image_url: 'https://twowombats.com/cdn/shop/files/On__Citrus_Slim_SL_Nicotine_Pouches-NPO-ONX_CITR_SL_0060_ab5a74bc-3d05-4e55-b3fa-5bcaa18463d8.webp?v=1750334016&width=675' },
          { title: 'On! Fruit Grape', image_url: 'https://twowombats.com/cdn/shop/files/On__Citrus_Slim_SL_Nicotine_Pouches-NPO-ONX_CITR_SL_0060_ab5a74bc-3d05-4e55-b3fa-5bcaa18463d8.webp?v=1750334016&width=675' }
        ],
        count: 2
      }
    ]
  },
  {
    id: 'lyft',
    name: 'Lyft',
    brandImage: 'https://twowombats.com/cdn/shop/files/Lyft_Pure_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345001050.webp?v=1710483169&width=675',
    subcategories: [
      {
        name: 'Lyft Original',
        items: [
          { title: 'Lyft Original Mint', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Pure_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345001050.webp?v=1710483169&width=675' },
          { title: 'Lyft Original Strong', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Pure_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345001050.webp?v=1710483169&width=675' },
          { title: 'Lyft Original White', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Pure_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345001050.webp?v=1710483169&width=675' }
        ],
        count: 5
      },
      {
        name: 'Lyft Fresh',
        items: [
          { title: 'Lyft Fresh Berry', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Black_Currant_Slim_Strong_3_5_Nicotine_Pouches-5715345001159.webp?v=1710482892&width=675' },
          { title: 'Lyft Fresh Apple', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Black_Currant_Slim_Strong_3_5_Nicotine_Pouches-5715345001159.webp?v=1710482892&width=675' },
          { title: 'Lyft Fresh Citrus', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Black_Currant_Slim_Strong_3_5_Nicotine_Pouches-5715345001159.webp?v=1710482892&width=675' }
        ],
        count: 4
      },
      {
        name: 'Lyft Cool',
        items: [
          { title: 'Lyft Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Cool_Air_Slim_Regular_2_5_Nicotine_Pouches-7350126718246.webp?v=1710482897&width=675' },
          { title: 'Lyft Cool Menthol', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Cool_Air_Slim_Regular_2_5_Nicotine_Pouches-7350126718246.webp?v=1710482897&width=675' },
          { title: 'Lyft Cool Wintergreen', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Cool_Air_Slim_Regular_2_5_Nicotine_Pouches-7350126718246.webp?v=1710482897&width=675' }
        ],
        count: 4
      },
      {
        name: 'Lyft Fruit',
        items: [
          { title: 'Lyft Fruit Cherry', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Citrus_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345000565.webp?v=1710483165&width=675' },
          { title: 'Lyft Fruit Orange', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Citrus_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345000565.webp?v=1710483165&width=675' },
          { title: 'Lyft Fruit Grape', image_url: 'https://twowombats.com/cdn/shop/files/Lyft_Citrus_Mint_Mini_Regular_2_4_Nicotine_Pouches-5715345000565.webp?v=1710483165&width=675' }
        ],
        count: 3
      }
    ]
  },
  {
    id: 'loop',
    name: 'Loop',
    brandImage: 'https://twowombats.com/cdn/shop/files/Loop_Creamy_Cappuccino_Slim_SL_3_5_Nicotine_Pouches-NPO-LOO_CRCA_SL_0094_1a4241fa-e4cc-4947-85d2-cd8e716136be.webp?v=1746202939&width=675',
    subcategories: [
      {
        name: 'Loop Original',
        items: [
          { title: 'Loop Original Mint', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Creamy_Cappuccino_Slim_SL_3_5_Nicotine_Pouches-NPO-LOO_CRCA_SL_0094_1a4241fa-e4cc-4947-85d2-cd8e716136be.webp?v=1746202939&width=675' },
          { title: 'Loop Original Strong', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Creamy_Cappuccino_Slim_SL_3_5_Nicotine_Pouches-NPO-LOO_CRCA_SL_0094_1a4241fa-e4cc-4947-85d2-cd8e716136be.webp?v=1746202939&width=675' },
          { title: 'Loop Original White', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Creamy_Cappuccino_Slim_SL_3_5_Nicotine_Pouches-NPO-LOO_CRCA_SL_0094_1a4241fa-e4cc-4947-85d2-cd8e716136be.webp?v=1746202939&width=675' }
        ],
        count: 4
      },
      {
        name: 'Loop Fresh',
        items: [
          { title: 'Loop Fresh Berry', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Cassis_Bliss_Slim_SL_Nicotine_Pouches-NPO-LOO_CABL_SL_0094.webp?v=1746202939&width=675' },
          { title: 'Loop Fresh Apple', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Cassis_Bliss_Slim_SL_Nicotine_Pouches-NPO-LOO_CABL_SL_0094.webp?v=1746202939&width=675' },
          { title: 'Loop Fresh Citrus', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Cassis_Bliss_Slim_SL_Nicotine_Pouches-NPO-LOO_CABL_SL_0094.webp?v=1746202939&width=675' }
        ],
        count: 3
      },
      {
        name: 'Loop Cool',
        items: [
          { title: 'Loop Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Habanero_Mint_Slim_SL_Nicotine_Pouches-NPO-LOO_HAMI_SL_0125.webp?v=1746202942&width=675' },
          { title: 'Loop Cool Menthol', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Habanero_Mint_Slim_SL_Nicotine_Pouches-NPO-LOO_HAMI_SL_0125.webp?v=1746202942&width=675' },
          { title: 'Loop Cool Wintergreen', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Habanero_Mint_Slim_SL_Nicotine_Pouches-NPO-LOO_HAMI_SL_0125.webp?v=1746202942&width=675' }
        ],
        count: 3
      },
      {
        name: 'Loop Fruit',
        items: [
          { title: 'Loop Fruit Cherry', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Hot_Mango_Slim_SL_Nicotine_Pouches-NPO-LOO_HOMA_SL_0094.webp?v=1746202941&width=675' },
          { title: 'Loop Fruit Orange', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Hot_Mango_Slim_SL_Nicotine_Pouches-NPO-LOO_HOMA_SL_0094.webp?v=1746202941&width=675' },
          { title: 'Loop Fruit Grape', image_url: 'https://twowombats.com/cdn/shop/files/Loop_Hot_Mango_Slim_SL_Nicotine_Pouches-NPO-LOO_HOMA_SL_0094.webp?v=1746202941&width=675' }
        ],
        count: 2
      }
    ]
  },
  {
    id: 'ace',
    name: 'Ace',
    brandImage: 'https://twowombats.com/cdn/shop/files/Ace_Cool_Mint_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_COMI_SL_0036.webp?v=1750329604&width=675',
    subcategories: [
      {
        name: 'Ace Original',
        items: [
          { title: 'Ace Original Mint', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Cool_Mint_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_COMI_SL_0036.webp?v=1750329604&width=675' },
          { title: 'Ace Original Strong', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Cool_Mint_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_COMI_SL_0036.webp?v=1750329604&width=675' },
          { title: 'Ace Original White', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Cool_Mint_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_COMI_SL_0036.webp?v=1750329604&width=675' }
        ],
        count: 3
      },
      {
        name: 'Ace Fresh',
        items: [
          { title: 'Ace Fresh Berry', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Berry_Breeze_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_BEBR_SL_0036.webp?v=1750329147&width=675' },
          { title: 'Ace Fresh Apple', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Berry_Breeze_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_BEBR_SL_0036.webp?v=1750329147&width=675' },
          { title: 'Ace Fresh Citrus', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Berry_Breeze_Slim_SL_2_5_Nicotine_Pouches-NPO-ACE_BEBR_SL_0036.webp?v=1750329147&width=675' }
        ],
        count: 2
      },
      {
        name: 'Ace Cool',
        items: [
          { title: 'Ace Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Extreme_Cool_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_EXCO_SL_0096.webp?v=1750329146&width=675' },
          { title: 'Ace Cool Menthol', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Extreme_Cool_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_EXCO_SL_0096.webp?v=1750329146&width=675' },
          { title: 'Ace Cool Wintergreen', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Extreme_Cool_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_EXCO_SL_0096.webp?v=1750329146&width=675' }
        ],
        count: 2
      },
      {
        name: 'Ace Fruit',
        items: [
          { title: 'Ace Fruit Cherry', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Green_Lemon_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_GRLE_SL_0096.webp?v=1750329146&width=675' },
          { title: 'Ace Fruit Orange', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Green_Lemon_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_GRLE_SL_0096.webp?v=1750329146&width=675' },
          { title: 'Ace Fruit Grape', image_url: 'https://twowombats.com/cdn/shop/files/Ace_Green_Lemon_Slim_SL_4_5_Nicotine_Pouches-NPO-ACE_GRLE_SL_0096.webp?v=1750329146&width=675' }
        ],
        count: 1
      }
    ]
  },
  {
    id: 'elf',
    name: 'ELF',
    brandImage: 'https://twowombats.com/cdn/shop/files/ELF_Blueberry_Raspberry_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_BLRA_SL_0120.webp?v=1752685797&width=675',
    subcategories: [
      {
        name: 'ELF Bar',
        items: [
          { title: 'ELF Bar Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Blueberry_Raspberry_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_BLRA_SL_0120.webp?v=1752685797&width=675' },
          { title: 'ELF Bar Blueberry Raspberry', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Blueberry_Raspberry_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_BLRA_SL_0120.webp?v=1752685797&width=675' },
          { title: 'ELF Bar Cool Storm', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Cool_Storm_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_COST_SL_0120.webp?v=1752685798&width=675' },
          { title: 'ELF Bar Watermelon', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Blueberry_Raspberry_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_BLRA_SL_0120.webp?v=1752685797&width=675' }
        ],
        count: 15
      },
      {
        name: 'ELF Bar TE',
        items: [
          { title: 'ELF Bar TE Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Cool_Storm_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_COST_SL_0120.webp?v=1752685798&width=675' },
          { title: 'ELF Bar TE Blueberry Raspberry', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Cool_Storm_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_COST_SL_0120.webp?v=1752685798&width=675' },
          { title: 'ELF Bar TE Cool Storm', image_url: 'https://twowombats.com/cdn/shop/files/ELF_Cool_Storm_Slim_SL_4_6_Nicotine_Pouches-NPO-ELF_COST_SL_0120.webp?v=1752685798&width=675' }
        ],
        count: 12
      }
    ]
  },
  {
    id: 'clew',
    name: 'Clew',
    brandImage: 'https://twowombats.com/cdn/shop/files/Clew_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_COMI_SL_0050.webp?v=1741879965&width=675',
    subcategories: [
      {
        name: 'Clew Mint',
        items: [
          { title: 'Clew Cool Mint', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_COMI_SL_0050.webp?v=1741879965&width=675' },
          { title: 'Clew Spearmint', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_COMI_SL_0050.webp?v=1741879965&width=675' },
          { title: 'Clew Wintergreen', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_COMI_SL_0050.webp?v=1741879965&width=675' },
          { title: 'Clew Menthol', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_COMI_SL_0050.webp?v=1741879965&width=675' }
        ],
        count: 8
      },
      {
        name: 'Clew Fruit',
        items: [
          { title: 'Clew Blueberry', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Blueberry_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_BLUE_SL_0050.webp?v=1741879965&width=675' },
          { title: 'Clew Watermelon', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Watermelon_Slim_SL_6_6_Nicotine_Pouches-NPO-CLE_WATE_SL_0050.webp?v=1741879965&width=675' },
          { title: 'Clew Apple', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Blueberry_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_BLUE_SL_0050.webp?v=1741879965&width=675' },
          { title: 'Clew Cherry', image_url: 'https://twowombats.com/cdn/shop/files/Clew_Blueberry_Slim_SL_4_4_Nicotine_Pouches-NPO-CLE_BLUE_SL_0050.webp?v=1741879965&width=675' }
        ],
        count: 6
      }
    ]
  },
  {
    id: 'baow',
    name: 'BAOW',
    brandImage: 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675',
    subcategories: [
      {
        name: 'BAOW Original',
        items: [
          { title: 'BAOW Ice Mint', image_url: 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675' },
          { title: 'BAOW Gin & Tonic', image_url: 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675' },
          { title: 'BAOW Black', image_url: 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675' },
          { title: 'BAOW White', image_url: 'https://twowombats.com/cdn/shop/files/BAOW_Ice_Mint_Slim_SL_Nicotine_Pouches-NPO-BAO_ICMI_SL_0120.webp?v=1745944580&width=675' }
        ],
        count: 8
      }
    ]
  },
  {
    id: 'avant',
    name: 'Avant',
    brandImage: 'https://twowombats.com/cdn/shop/files/Avant_Raspberry_Liqorice_Slim_SL_2_4_Nicotine_Pouches-NPO-AVA_RALI_SL_0078.webp?v=1741879962&width=675',
    subcategories: [
      {
        name: 'Avant Original',
        items: [
          { title: 'Avant Raspberry Liqorice', image_url: 'https://twowombats.com/cdn/shop/files/Avant_Raspberry_Liqorice_Slim_SL_2_4_Nicotine_Pouches-NPO-AVA_RALI_SL_0078.webp?v=1741879962&width=675' },
          { title: 'Avant Mint', image_url: 'https://twowombats.com/cdn/shop/files/Avant_Cool_Mint_Slim_SL_4_4_Nicotine_Pouches-NPO-AVA_COMI_SL_0130.webp?v=1741879962&width=675' },
          { title: 'Avant Black', image_url: 'https://twowombats.com/cdn/shop/files/Avant_Raspberry_Liqorice_Slim_SL_2_4_Nicotine_Pouches-NPO-AVA_RALI_SL_0078.webp?v=1741879962&width=675' },
          { title: 'Avant White', image_url: 'https://twowombats.com/cdn/shop/files/Avant_Raspberry_Liqorice_Slim_SL_2_4_Nicotine_Pouches-NPO-AVA_RALI_SL_0078.webp?v=1741879962&width=675' }
        ],
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
          .from('wp_products')
          .select('name, image_url')
          .not('image_url', 'is', null)
          .limit(200);

        if (error) {
          console.error('Error fetching product data:', error);
          return;
        }

        if (products) {
          const imageMap: { [key: string]: string } = {};
          const productMap: { [key: string]: any } = {};
          
          products.forEach((product: any) => {
            // Extract brand from product name (first word)
            const brand = product.name.split(' ')[0].toLowerCase();
            
            // Create a key for each brand and product name
            const key = `${brand}-${product.name}`;
            imageMap[key] = product.image_url;
            productMap[key] = product;
            
            // Also create a mapping for brand only (for fallback)
            if (!imageMap[brand]) {
              imageMap[brand] = product.image_url;
            }
          });
          
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
    console.log('Available brands in productData:', Array.from(new Set(Object.values(productData).map(p => p.name.split(' ')[0].toLowerCase()))));
    
    const products = Object.values(productData).filter(product => {
      // Extract brand from product name (first word)
      const dbBrand = product.name.split(' ')[0].toLowerCase().trim();
      const searchBrand = brandName.toLowerCase().trim();
      
      // Direct match
      return dbBrand === searchBrand;
    }).slice(0, 10); // Limit to 10 products per brand
    
    console.log(`Found ${products.length} products for brand ${brandName}:`, products.map(p => p.name));
    
    return products;
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="relative">
      {/* All Categories Button */}
      <button
        className="mega-menu-button"
        onClick={() => setIsOpen(!isOpen)}
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
          className="mega-menu-dropdown fixed bg-white shadow-lg"
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
                className="mega-menu-close text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mega-menu-container flex gap-8">
              {/* Left Sidebar - Categories */}
              <div className="mega-menu-sidebar w-64 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <nav className="mega-menu-categories space-y-1">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        backgroundColor: activeCategory === category.id ? '#f8fafc' : 'transparent',
                        borderColor: activeCategory === category.id ? '#e2e8f0' : 'transparent',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        transform: activeCategory === category.id ? 'translateX(4px)' : 'translateX(0)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        textAlign: 'left',
                        width: '100%',
                        position: 'relative',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        {category.brandImage && category.brandImage.trim() !== '' ? (
                          <img
                            src={category.brandImage}
                            alt={category.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {category.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Link 
                          href={`/brand/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: activeCategory === category.id ? '#1e40af' : '#374151',
                            marginBottom: '2px',
                            textDecoration: 'none'
                          }}
                        >
                          {category.name}
                        </Link>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          {category.subcategories.reduce((total, sub) => total + sub.count, 0)} products
                        </span>
                      </div>
                      {activeCategory === category.id && (
                        <div style={{
                          position: 'absolute',
                          right: '12px',
                          width: '6px',
                          height: '6px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Right Content - Subcategories */}
              <div className="mega-menu-content flex-1">
                {activeCategoryData ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeCategoryData.name}
                      </h2>
                    </div>
                    
                    <div className="mega-menu-subcategories grid grid-cols-4 gap-6">
                      {activeCategoryData.subcategories.map((subcategory, index) => (
                        <div key={index} className="mega-menu-subcategory space-y-3">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                            {subcategory.items[0]?.image_url && subcategory.items[0].image_url.trim() !== '' ? (
                              <img 
                                src={subcategory.items[0].image_url}
                                alt={subcategory.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-semibold rounded-lg">
                                {subcategory.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          <h3 className="mega-menu-subcategory-title font-semibold text-gray-900 text-sm">
                            {subcategory.name}
                          </h3>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            No products available
                          </div>
                          
                          <Link
                            href={getLocalizedPath(`/brand/${activeCategoryData.name.toLowerCase().replace(/\s+/g, '-')}`)}
                            className="inline-block text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
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
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .mega-menu-button {
              display: none !important;
            }
            .mega-menu-dropdown {
              top: 60px !important;
              height: calc(100vh - 60px) !important;
              padding: 15px !important;
            }
            .mega-menu-close {
              font-size: 18px !important;
              margin-bottom: 15px !important;
            }
            .mega-menu-container {
              flex-direction: column !important;
              gap: 20px !important;
            }
            .mega-menu-sidebar {
              width: 100% !important;
              flex-shrink: 1 !important;
            }
            .mega-menu-content {
              width: 100% !important;
              flex: 1 !important;
            }
            .mega-menu-categories {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 8px !important;
              margin-bottom: 20px !important;
            }
            .mega-menu-category-button {
              padding: 10px 12px !important;
              font-size: 14px !important;
              text-align: center !important;
              flex-direction: column !important;
              gap: 4px !important;
            }
            .mega-menu-category-icon {
              font-size: 20px !important;
            }
            .mega-menu-category-name {
              font-size: 12px !important;
              font-weight: 500 !important;
            }
            .mega-menu-subcategories {
              grid-template-columns: repeat(1, 1fr) !important;
              gap: 20px !important;
            }
            .mega-menu-subcategory {
              margin-bottom: 15px !important;
            }
            .mega-menu-subcategory-title {
              font-size: 16px !important;
              margin-bottom: 8px !important;
            }
            .mega-menu-products {
              display: grid !important;
              grid-template-columns: repeat(1, 1fr) !important;
              gap: 8px !important;
            }
            .mega-menu-product-item {
              font-size: 13px !important;
              padding: 6px 0 !important;
            }
          }
          @media (max-width: 480px) {
            .mega-menu-dropdown {
              padding: 10px !important;
            }
            .mega-menu-categories {
              grid-template-columns: repeat(1, 1fr) !important;
            }
            .mega-menu-category-button {
              padding: 12px !important;
              font-size: 13px !important;
            }
            .mega-menu-subcategory-title {
              font-size: 14px !important;
            }
            .mega-menu-product-item {
              font-size: 12px !important;
            }
          }
        `
      }} />
    </div>
  );
}
