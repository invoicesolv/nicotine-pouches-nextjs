// Run this once to set up the QStash schedule
// node scripts/setup-qstash-schedule.js

const { Client } = require('@upstash/qstash');

const client = new Client({
  token: process.env.QSTASH_TOKEN || 'eyJVc2VySUQiOiIwNjhlODg0Zi00ZTEyLTQ2MTMtYWM2Ni04YzFmYWRlYTgyODMiLCJQYXNzd29yZCI6ImQ2YTUwMmQ2MWY2NTQ0OWI5NWQ1MTI1YmZmMWVhY2NlIn0=',
});

async function setupSchedules() {
  console.log('Setting up QStash schedules...\n');

  try {
    // Check price alerts every hour
    const priceAlertSchedule = await client.schedules.create({
      destination: 'https://nicotine-pouches.org/api/cron/check-price-alerts',
      cron: '0 * * * *', // Every hour at minute 0
      scheduleId: 'price-alerts-hourly',
    });
    console.log('✅ Price alerts schedule created:', priceAlertSchedule.scheduleId);

  } catch (error) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Schedule already exists');
    } else {
      console.error('❌ Error creating schedule:', error.message);
    }
  }

  // List all schedules
  console.log('\n--- Current Schedules ---');
  const schedules = await client.schedules.list();
  for (const schedule of schedules) {
    console.log(`- ${schedule.scheduleId}: ${schedule.cron} -> ${schedule.destination}`);
  }
}

setupSchedules().catch(console.error);
