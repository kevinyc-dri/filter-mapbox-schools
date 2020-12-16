mapboxgl.accessToken =
  'pk.eyJ1IjoibWlhbWllZHRlY2giLCJhIjoiY2tocXh0NHMwMGViajJ4bWN5NWZxMjFqOCJ9.C44hy16LPWVJlKlX-4Ko5A';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-80.34858076, 25.57276101],
  zoom: 11.15
});

function loadImages(callback) {
  const colors = ['red', 'yellow', 'green', 'blue', 'orange', 'white', 'gray'];
  const images = {}
  let lastError;
  colors.forEach(color => {
    map.loadImage('/images/' + color + '-marker.png', (error, image) => {
      if (error) {
        lastError = error;
      }
      images[color + '-marker'] = error ? null : image;
      if (Object.keys(images).length === colors.length) {
        if (lastError) {
          callback(lastError);
        } else {
          callback(null, images);
        }
      }
    })
  });
}

map.on('load', function () {
  loadImages(
    function (error, images) {
      if (error) throw error;
      Object.keys(images).forEach(name => {
        map.addImage(name, images[name]);
      })

      fetch('/schools.json')
        .then(function (res) {
          return res.json()
        })
        .then(function (schools) {
          map.addSource('schools', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': schools
            }
          })
        })
        .then(function () {
          map.addLayer({
            'id': '2018',
            'type': 'symbol',
            'source': 'schools',
            'layout': {
              'icon-image': [
                "match",
                ["get", "Grade_2018"],
                "A", "green-marker",
                "B", "yellow-marker",
                "C", "red-marker",
                "gray-marker"
              ],
              'icon-allow-overlap': true,
              'visibility': 'visible'
            },
            'paint': {
              'icon-opacity': 1.0
            }
          });
          map.addLayer({
            'id': '2018 70+%',
            'type': 'symbol',
            'source': 'schools',
            'layout': {
              'icon-image': [
                "match",
                ["get", "Grade_2018"],
                "A", "green-marker",
                "B", "yellow-marker",
                "C", "red-marker",
                "gray-marker"
              ],
              'icon-allow-overlap': true,
              'visibility': 'visible'
            },
            'paint': {
              'icon-opacity': [
                'case',
                ['>=', ['get', 'Black (%)'], 0.7], 1.0,
                0.25
              ]
            }
          });
          map.addLayer({
            'id': '2019',
            'type': 'symbol',
            'source': 'schools',
            'layout': {
              'icon-image': [
                "match",
                ["get", "Grade_2018"],
                "A", "green-marker",
                "B", "yellow-marker",
                "C", "red-marker",
                "gray-marker"
              ],
              'icon-allow-overlap': true,
              'visibility': 'visible'
            },
            'paint': {
              'icon-opacity': 1.0
            }
          });
          map.addLayer({
            'id': '2019 70+%',
            'type': 'symbol',
            'source': 'schools',
            'layout': {
              'icon-image': [
                "match",
                ["get", "Grade_2018"],
                "A", "green-marker",
                "B", "yellow-marker",
                "C", "red-marker",
                "gray-marker"
              ],
              'icon-allow-overlap': true,
              'visibility': 'visible'
            },
            'paint': {
              'icon-opacity': [
                'case',
                ['>=', ['get', 'Black (%)'], 0.7], 1.0,
                0.25
              ]
            }
          });
        })
    }
  );

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
  });

  // Process School Feature Properties To Html
  const propertiesToHTMLString = (properties) => {
    const parent = document.createElement('div')
    const ul = document.createElement('ul')

    const createListItem = (title, value) => {
      const li = document.createElement('li')
      li.innerHTML = `<strong>${title}</strong>: ${value}`
      return li
    }

    Object.keys(properties).map((key) => {
      ul.appendChild(createListItem(key, properties[key]))
    })
    parent.appendChild(ul)

    return parent.innerHTML
  }

  function callback(e) {
    map.getCanvas().style.cursor = 'pointer';

    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    const content = propertiesToHTMLString(properties)
    popup.setLngLat(coordinates).setHTML(content).addTo(map);
  }

  map.on('click', '2018', callback);
  map.on('click', '2018 70+%', callback);
  map.on('click', '2019', callback);
  map.on('click', '2019 70+%', callback);


});

// enumerate ids of the layers
let toggleableLayerIds = ['2018', '2018 70+%', '2019', '2019 70+%'];
let selectedLayerId = '2019A';
let toggleableLinks = [];

// set up the corresponding toggle button for each layer
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = '';
  link.textContent = id;
  if (id === selectedLayerId) {
    link.className = 'active';
  }
  toggleableLinks.push(link);

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

    // toggle layer visibility by changing the layout object's visibility property
    const selectedLink = this;
    toggleableLinks.forEach(link => {
      const isSelected = link.textContent === selectedLink.textContent;
      console.log(link.textContent, isSelected);
      link.className = isSelected ? 'active' : '';
      map.setLayoutProperty(link.textContent, 'visibility', isSelected ? 'visible' : 'none');
    });
  };

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}

