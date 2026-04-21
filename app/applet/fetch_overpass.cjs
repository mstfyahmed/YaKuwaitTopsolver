const fs = require('fs');
const d3 = require('d3-geo');

async function fetchKuwait() {
  const query = `
    [out:json];
    relation["name:en"="Kuwait"]["admin_level"="2"];
    out geom;
  `;
  
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });
  
  const data = await response.json();
  
  // Convert Overpass geometry to GeoJSON
  const relation = data.elements[0];
  const coordinates = [];
  
  // A relation contains members (ways). We need to stitch them together.
  // For simplicity, let's just create a MultiPolygon or Polygon from the ways.
  // Actually, osmtogeojson is better for this. Let's install it.
  console.log(data.elements.length);
}

fetchKuwait();
