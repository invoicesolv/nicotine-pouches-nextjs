async function listVendors() {
  try {
    // Fetch UK vendors
    console.log('Fetching UK vendors...\n');
    const ukResponse = await fetch('http://localhost:3000/api/admin/vendors?region=UK&page=1&limit=1000');
    const ukData = await ukResponse.json();
    
    if (ukData.data && ukData.data.length > 0) {
      console.log('=== UK VENDORS ===');
      console.log(`Total: ${ukData.data.length}\n`);
      ukData.data
        .sort((a, b) => a.id - b.id)
        .forEach(vendor => {
          console.log(`${vendor.id.toString().padStart(3, ' ')}. ${vendor.name}`);
        });
    }

    // Fetch US vendors
    console.log('\n\nFetching US vendors...\n');
    const usResponse = await fetch('http://localhost:3000/api/admin/vendors?region=US&page=1&limit=1000');
    const usData = await usResponse.json();
    
    if (usData.data && usData.data.length > 0) {
      console.log('=== US VENDORS ===');
      console.log(`Total: ${usData.data.length}\n`);
      usData.data
        .sort((a, b) => a.id - b.id)
        .forEach(vendor => {
          console.log(`${vendor.id.toString().padStart(3, ' ')}. ${vendor.name}`);
        });
    }

    // Summary
    console.log('\n\n=== SUMMARY ===');
    console.log(`UK Vendors: ${ukData.data?.length || 0}`);
    console.log(`US Vendors: ${usData.data?.length || 0}`);
    console.log(`Total Vendors: ${(ukData.data?.length || 0) + (usData.data?.length || 0)}`);

  } catch (error) {
    console.error('Error fetching vendors:', error);
  }
}

listVendors();

