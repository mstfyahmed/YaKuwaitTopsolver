const fs = require('fs');
const topojson = require('topojson-client');
const d3 = require('d3-geo');

const world = JSON.parse(fs.readFileSync('./node_modules/world-atlas/countries-10m.json', 'utf8'));
const kuwait = topojson.feature(world, world.objects.countries).features.find(d => d.id === '414');

if (!kuwait) {
  console.error("Kuwait not found!");
  process.exit(1);
}

// Create a projection for Kuwait
const projection = d3.geoMercator()
  .fitSize([800, 800], kuwait);

const pathGenerator = d3.geoPath().projection(projection);
const svgPath = pathGenerator(kuwait);

console.log(svgPath);
