const https = require('https');
https.get('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const geojson = JSON.parse(data);
    const kuwait = geojson.features.find(f => f.properties.ISO_A3 === 'KWT');
    console.log(JSON.stringify(kuwait.geometry));
  });
});
