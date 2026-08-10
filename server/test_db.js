const fs = require('fs');
const path = require('path');

const diseasesDbPath = path.join(__dirname, '..', 'diseases.json');
try {
  const parsed = JSON.parse(fs.readFileSync(diseasesDbPath, 'utf-8'));
  const diseasesDb = parsed.diseases || parsed;
  console.log("Is array?", Array.isArray(diseasesDb));
  console.log("Length:", diseasesDb.length);
  const found = diseasesDb.find(d => d.className === 'Apple___Cedar_apple_rust');
  console.log("Found:", found ? found.className : "No");
} catch (e) {
  console.error("Error:", e);
}
