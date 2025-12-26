const { SquareClient, SquareEnvironment } = require("square");
const fs = require('fs');
const path = require('path');

// Helper to read .env.local manually
function getEnvValue(key) {
  try {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const token = getEnvValue('SQUARE_ACCESS_TOKEN');

  if (!token) {
    console.error("❌ Error: SQUARE_ACCESS_TOKEN not found in .env.local");
    process.exit(1);
  }

  // Helper to init client. 
  // Attempting to support basic 'token' or 'accessToken' based on SDK version.
  // The 'SquareClient' usually takes a config object.
  const client = new SquareClient({
    token: token,
    environment: SquareEnvironment.Sandbox,
  });
  console.log("Client keys:", Object.keys(client));
  console.log("Client prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));

  try {
    console.log("Fetching locations from Square...");
    console.log("Locations API keys:", Object.keys(client.locations));
    console.log("Locations API prototype:", Object.getOwnPropertyNames(Object.getPrototypeOf(client.locations)));

    // const { result } = await client.locations.listLocations();

    if (result.locations && result.locations.length > 0) {
      console.log("\n✅ Found Locations:");
      result.locations.forEach(loc => {
        console.log(`\nName: ${loc.name}`);
        console.log(`ID:   ${loc.id}`);
        console.log(`Type: ${loc.status}`);
      });
      console.log("\n--> Copy the 'ID' above and set it as NEXT_PUBLIC_SQUARE_LOCATION_ID in .env.local");
    } else {
      console.log("⚠️ No locations found.");
    }
  } catch (error) {
    console.error("❌ Error fetching locations:", error.message);
    // If 'token' param was wrong, it might fail here.
    if (error.result && error.result.errors) {
      console.log("Details:", error.result.errors);
    }
  }
}

main();
