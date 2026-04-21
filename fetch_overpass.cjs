const fs = require('fs');

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
  console.log(data.elements.length);
}

fetchKuwait();
