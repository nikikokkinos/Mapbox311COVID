mapboxgl.accessToken = 'pk.eyJ1IjoibmlraTEyc3RlcCIsImEiOiJjanZlNGFneWswMm0zNDRxcGYwZXYwcjl2In0.fWV3JfWN5hg9UFqDimwIZw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/niki12step/ck5ztjcqg0wb61iqteqyfu5cw', // my style url
  zoom: 9.5,
  center: [-73.915383,40.726238],
})

var markerHeight = 20, markerRadius = 10, linearOffset = 25

var popupOffsets = {
  'top': [0, 0],
  'top-left': [0,0],
  'top-right': [0,0],
  'bottom': [0, -markerHeight],
  'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
  'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
  'left': [markerRadius, (markerHeight - markerRadius) * -1],
  'right': [-markerRadius, (markerHeight - markerRadius) * -1]
}

var complaintPopup = new mapboxgl.Popup({
  offset: popupOffsets,
  closeButton: false,
  closeOnClick: false
})

hoveredId = null

map.on('load', function() {

  // var filterBorough = ['!=', ['get', 'borough'], 'placeholder']
  // var filterYr = ['!=', ['get', 'crash_date'], 'placeholder']

  var complaintData = 'https://data.cityofnewyork.us/resource/erm2-nwe9.geojson'

  map.addSource('complaints', {
    'type': 'geojson',
    'data': complaintData,
    'generateId': true
  })

  map.addLayer({
    'id': 'complaintLayer',
    'source': 'complaints',
    'type': 'circle',
    'filter':
      ['any',
        ['==', ['get', 'descriptor'], 'Social Distancing'],
        ['>=', ['get', '"created_date"'], '2020-03-01T00:00:00.000'],
      ],
    'paint': {
      'circle-radius': 5,
      'circle-opacity':
        [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          .5,
          1
        ],
      'circle-color': 'white',
        // [
        //   'match',
        //   ['get', 'agency'],
        //   'NYPD', '#ffffff', //WHITE
        //   'FDNY', '#fc0303', //RED
        //   'DOHMH','#b503fc', //PURPLE
        //   'DCA',  '#f4fc03', // YELLOW
        //   /* other */ '#fc0303'
        // ],
    }
  })

  // document.getElementById('filters').addEventListener('change', function(e) {
  //   var borough = e.target.value;
  //   // update the map filter
  //   if (borough === 'all') {
  //     filterBorough = ['!=', ['get', 'borough'], 'placeholder'];
  //   } else if (borough === 'bx') {
  //     filterBorough = ['match', ['get', 'borough'], ['BRONX'], true, false];
  //   } else if (borough === 'bk') {
  //     filterBorough = ['match', ['get', 'borough'], ['BROOKLYN'], true, false];
  //   } else if (borough === 'qns') {
  //     filterBorough = ['match', ['get', 'borough'], ['QUEENS'], true, false];
  //   } else if (borough === 'mn') {
  //     filterBorough = ['match', ['get', 'borough'], ['MANHATTAN'], true, false];
  //   } else if (borough === 'si') {
  //     filterBorough = ['match', ['get', 'borough'], ['STATEN ISLAND'], true, false];
  //   } else {
  //     console.log('error');
  //   }
  //   map.setFilter('complaintLayer', ['all', filterBorough])
  // })

  // document.getElementById('filters2').addEventListener('change', function(e) {
  //
  //   // var complaintDateObj = e.features[0].properties.crash_date
  //   // var complaintDateObjSliced = complaintDateObj.slice(0,4)
  //
  //   var year = e.target.value;
  //   // update the map filter
  //   if (year === 'all_years') {
  //     filterYr = ['!=', ['get', 'crash_date'], 'placeholder'];
  //   } else if (year === 'preVision0') {
  //     filterYr = ['<=', ['get', 'crash_date'], ['2013-12-31T00:00:00.000'], true, false];
  //   } else if (year === 'postVision0') {
  //     filterYr = ['>=', ['get', 'crash_date'], ['2014-01-01T00:00:00.000'], true, false];
  //   } else {
  //     console.log('error');
  //   }
  //   map.setFilter('complaintLayer', ['all', filterYr])
  // })

  map.on('click', 'complaintLayer', function (e) {

    var complaintDate = e.features[0].properties.created_date
    var complaintDateSliced = complaintDate.slice(0, 10)
    var complaintTimeSliced = complaintDate.slice(11, 16)

    var closedDate = e.features[0].properties.closed_date
    var closedDateSliced = closedDate.slice(0, 10)
    var closedTimeSliced = closedDate.slice(11, 16)

    var popupHTML = 'Complaint Date:' + ' ' + complaintDateSliced.bold() + '<br >' +
    'Complaint Time:' + ' ' + complaintTimeSliced.bold() + '<br >' +
    'Responding Agency:' + ' ' + e.features[0].properties.agency.bold() + '<br >' +
    'Complaint Description:' + ' ' + e.features[0].properties.descriptor.bold() + '<br >' +
    'Closed Date:' + ' ' + closedDateSliced.bold() + '<br >' +
    'Closed Time:' + ' ' + closedTimeSliced.bold() + '<br >' +
    'Incident Address:' + ' ' + e.features[0].properties.incident_address.bold() + '<br >' +
    'Location Type:' + ' ' + e.features[0].properties.location_type.bold()

    complaintPopup
    .setLngLat(e.lngLat)
    .setHTML( popupHTML )
    .addTo(map)
  })

  map.on('mouseenter', 'complaintLayer', function (e) {
    map.getCanvas().style.cursor = 'pointer'

    if (e.features.length > 0) {
      if (hoveredId) {
        map.setFeatureState({ source: 'complaints', id: hoveredId }, { hover: false })
      }
      hoveredId = e.features[0].id
        map.setFeatureState({ source: 'complaints', id: hoveredId }, { hover: true })
      }
    })

  map.on('mouseleave', 'complaintLayer', function (e) {
    map.getCanvas().style.cursor = ''
    complaintPopup.remove()

    if (hoveredId) {
        map.setFeatureState({ source: 'complaints', id: hoveredId }, { hover: false })
      }
      hoveredId = null
    })

})
