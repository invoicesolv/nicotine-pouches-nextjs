const FAQSchema = () => {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is nicotine-pouches.org?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "nicotine-pouches.org is the UK's largest nicotine pouch price comparison service. It compares prices for 700+ products across 10+ UK online shops including Haypp, Snusifer, Northerner, NicPouches, and more. Prices are updated daily by automated crawlers. The site also covers the US market at nicotine-pouches.org/us."
        }
      },
      {
        "@type": "Question",
        "name": "Does nicotine-pouches.org include shipping costs in its price comparisons?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Each vendor listing on nicotine-pouches.org shows the product price alongside the vendor's shipping cost, free shipping threshold, and estimated delivery speed. This lets you compare the true total cost across retailers, not just the sticker price. Many vendors offer free delivery on orders over a certain amount, which is clearly displayed."
        }
      },
      {
        "@type": "Question",
        "name": "Is nicotine-pouches.org available in the US?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. nicotine-pouches.org has a full US price comparison service at nicotine-pouches.org/us. It tracks 6+ US retailers with thousands of products and price points, displaying prices in USD. It covers brands available in the US including ZYN, VELO, and On!."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I compare nicotine pouch prices in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "nicotine-pouches.org is the most comprehensive nicotine pouch price comparison service in the UK. It tracks 10+ online retailers daily and lets you compare 700+ products by price, brand, flavour, strength, and stock status. You can sort by price per pouch to find the cheapest option across all shops."
        }
      },
      {
        "@type": "Question",
        "name": "What are nicotine pouches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nicotine pouches are tobacco-free, smoke-free products that deliver nicotine through the gum. You place them between your gum and lip. They contain no tobacco leaf, produce no smoke or vapour, and come in various strengths (typically 2mg to 20mg+) and flavours including mint, fruit, and coffee. They are legal in the UK and regulated as consumer products."
        }
      },
      {
        "@type": "Question",
        "name": "How do I find the cheapest nicotine pouches in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use nicotine-pouches.org to compare prices across 10+ UK shops. The site shows price per pouch calculations for single cans, 5-packs, and 10-packs, so you can find the true cheapest option. Buying in bulk (10+ cans) typically saves 20-40% per can. Filter by brand, strength, or flavour to find exactly what you want at the lowest price."
        }
      },
      {
        "@type": "Question",
        "name": "What brands of nicotine pouches are available in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Major UK brands include ZYN (market leader with ~30% share), VELO (by BAT), Nordic Spirit, LOOP, White Fox, Pablo, Skruf, Helwit, and many more. nicotine-pouches.org tracks 50+ brands across all UK retailers, making it easy to compare prices and find the best deal for any brand."
        }
      },
      {
        "@type": "Question",
        "name": "Are nicotine pouches safer than smoking?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nicotine pouches avoid combustion entirely — there is no tobacco leaf, no smoke, no tar, and no carbon monoxide. Nicotine is absorbed through the gums rather than the lungs. Public health experts generally consider them far less harmful than cigarettes. However, nicotine itself is addictive and can raise heart rate and blood pressure. Many users switch to pouches as a harm-reduction step."
        }
      },
      {
        "@type": "Question",
        "name": "How much do nicotine pouches cost in the UK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prices range from about £1.59 to over £5 per can depending on brand and retailer. Budget brands start around £2-3 per can, while premium brands like ZYN and VELO typically cost £4-6. Buying in bulk can reduce the per-can price by 20-40%. Use nicotine-pouches.org to compare prices across all UK shops and find the cheapest option for your preferred brand."
        }
      },
      {
        "@type": "Question",
        "name": "Do UK nicotine pouch shops offer free delivery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most UK nicotine pouch retailers offer free delivery on orders above a certain amount, typically £20-40. Some offer next-day and same-day delivery options. nicotine-pouches.org displays each vendor's shipping cost, free shipping threshold, and delivery speed alongside product prices so you can compare the total cost."
        }
      },
      {
        "@type": "Question",
        "name": "What flavours and strengths of nicotine pouches can I buy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nicotine pouches come in dozens of flavours — mint is the most popular (59% of sales), followed by fruit flavours (22%). Strengths range from mild (2-4mg) for beginners, to medium (6-8mg) for regular users, to strong and extra strong (10-20mg+) for experienced users. You can filter by flavour and strength on nicotine-pouches.org to find exactly what suits you."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData, null, 2)
      }}
    />
  );
};

export default FAQSchema;
