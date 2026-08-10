const fs = require('fs');
const path = require('path');

const diseasesDbPath = path.join(__dirname, '..', 'diseases.json');
const parsed = JSON.parse(fs.readFileSync(diseasesDbPath, 'utf-8'));
const diseasesDb = parsed.diseases || parsed;

const classesToTest = [
  "Apple___Apple_scab",
  "Apple___healthy",
  "Tomato___Early_blight",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  "Pepper,_bell___Bacterial_spot",
  "Tomato___Spider_mites Two-spotted_spider_mite"
];

for (const c of classesToTest) {
  const found = diseasesDb.find(d => d.className === c);
  console.log(`${c} -> ${found ? 'FOUND' : 'NOT FOUND'}`);
}
