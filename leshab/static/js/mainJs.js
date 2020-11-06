/* declaring the layers of the map and the view
and also the sources of the layers */


let sourceBingMaps = new ol.source.BingMaps({
    key: 'AnWBpIG0qCjcNvdCH1yznXDbft30_b2o190D5NbANKoJUYZsxjp_ikq4rxlq_zka',
    imagerySet: 'Aerial',
});

let satelliteTile = new ol.layer.Tile({
    source: sourceBingMaps,
    zIndex: -1
})

let OSMTile = new ol.layer.Tile({ 
    source: new ol.source.OSM(),
    zIndex: -1
})

let lampsSource = new ol.source.Vector({ 
    url : 'getGeojson',
    format: new ol.format.GeoJSON(),
})
function flickrStyle(feature) {
    let style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
        stroke: new ol.style.Stroke({
            color: 'white',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'green'
        })
        })
    });
    return style;
}
let lampsVector = new ol.layer.Vector({ 
    source: lampsSource,
    style: flickrStyle
})

let defaultZoom = 13
const map = new ol.Map({
    target: document.getElementById('map'),
    layers: [
        OSMTile,
        lampsVector
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([43.105059, 11.596976]),
        zoom: defaultZoom,
        projection: 'EPSG:3857',
        minZoom: 4,
        maxZoom: 20
    })
});


/* Programming the interaction actions, like changing the basemap 
*/

function byClass(element){ 
    return document.getElementsByClassName(element)
}
function byId(element){ 
    return document.getElementById(element)
}

let baseMaps = byClass('fond')
for (let baseMap of baseMaps){ 
    baseMap.addEventListener('click', function(){  
        if (!baseMap.getAttribute('class').includes('active')){
            RemoveAttributeActive() 
            baseMap.setAttribute('class', 'fond active')
            let mapTileID = baseMap.getAttribute('id')
            switch(mapTileID){
                case 'OSM':
                    map.removeLayer(satelliteTile)
                    map.addLayer(OSMTile)
                    break
                case 'satellite':
                    map.removeLayer(OSMTile)
                    map.addLayer(satelliteTile) 
                    break
                default:
                    console.log('nothing to do')
            }
        }
    })
}

function RemoveAttributeActive(){ 
    for (let base of baseMaps){ 
        if (base.getAttribute('class').includes('active')){
            base.setAttribute('class', 'fond')
        }
    }
}
let dataLamps = []
let selectionedElement =  {}
let highlightStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
    stroke: new ol.style.Stroke({
        color: 'white',
        width: 2
    }),
    fill: new ol.style.Fill({
        color: 'red'
    })
    })
});
map.on('click', function(e) {
    let pixels = e.pixel
    let features = lampsSource.getFeatures()
    for (let feature of features){ 
        feature.setStyle(flickrStyle)
    }
    map.forEachFeatureAtPixel(pixels, function(f,layer){
        if (layer.className_ !== 'geoloc'){ // we dont want to style the geoloc feature
            f.setStyle(highlightStyle)
            console.log(layer, f)
            let id = f.getId() 
            if (!selectionedElement || selectionedElement.id !== id){ // we dont need that a user click the same obj repetly
                selectionedElement.id = id
                selectionedElement.name = f.get('name')
                selectionedElement.station = f.get('station')
                fetchlamps()
            }
        }
    })
})
function fetchlamps(){ 
    fetch(`lamphistorique/${selectionedElement.id}`)
    .then(function(res){ 
        return res.json()
    })
    .then(function(data){  
        dataLamps = data
        CreateLampTable(data[0]) // As our data are ordered by datetime we want the recent to show the recent data
        CreateLampGraphic()
    })
}

function CreateLampTable(data){ 
    let tableBody = byId('table-information-genrales').getElementsByTagName('tbody')[0]
    let newRow = document.createElement('tr')
    if (!data){ 
        newRow.setAttribute('id', selectionedElement.id)
        newRow.innerHTML += `
        <td>${selectionedElement.name}</td>
        <td>${selectionedElement.station}</td>
        <td>0</td>
        <td>0</td>
        <td>0</td>
        <td></td>`
        if (tableBody.getElementsByTagName('tr').length > 1){ 
            tableBody.deleteRow(1)
        }
        tableBody.appendChild(newRow)
    }else{
        let h5 = byId('generales-information').getElementsByTagName('h5')[0]
        let hours =   AddZero(new Date(data.created_At).getHours())
        let minutes = AddZero(new Date(data.created_At).getMinutes())
        h5.innerHTML = 'Derniere modification:  ' + new Date(data.created_At).toLocaleDateString() + '   à  ' + hours + 'h' + minutes
        let difference = data.number_off_lamp_On - data.number_off_lamp_Off
        let services = getServices(data)
        newRow.setAttribute('id', selectionedElement.id)
        newRow.innerHTML += `
        <td>${selectionedElement.name}</td>
        <td>${selectionedElement.station}</td>
        <td>${data.number_off_lamp_On}</td>
        <td>${data.number_off_lamp_Off}</td>
        <td>${difference}</td>
        <td>${services}</td>`
        if (tableBody.getElementsByTagName('tr').length > 1){ 
            tableBody.deleteRow(1)
        }
        tableBody.appendChild(newRow)
        setStyleTableTD(newRow,difference)
    }
}

function setStyleTableTD(element,value){ 
    let quarthTd = element.querySelectorAll('td')[4]
    if (value < 0){
        quarthTd.style.color = 'red'
    }else if (value === 0){ 
        quarthTd.style.color = 'inherit'
    }else{
        quarthTd.style.color = 'green'
    }
}

function getServices(services){ 
    let outputServices = ''
    if (services.hasWifi && services.hasCamera){ 
        outputServices += '<i class="fas fa-camera"></i> <i class="fas fa-wifi"></i>'
    }else{
        if (services.hasWifi){ 
            outputServices += '<i class="fas fa-wifi"></i>'
        }
        if (services.hasCamera){ 
            outputServices += '<i class="fas fa-camera"></i>'
        }
    }
    return outputServices
}

function AddZero(element){ 
    if (element < 10){ 
        element = '0' + element
    }
    return element
}
let ShowBy = ''
function CreateLampGraphic(){ 
    let elements = dataLamps
    let datesLabel = [], data = []
    elements.forEach(element => {
        datesLabel.push(new Date(element.created_At).toLocaleDateString())
        if (!ShowBy || ShowBy === 'number_off_lamp_On' ){ 
            data.push(element.number_off_lamp_On)
        }else{    
            data.push(element.number_off_lamp_Off)
        }
    });
    let ctx = byId('myChart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'line',
            data: {
            labels: datesLabel,
            datasets: [{
                label: 'Evolution',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: data
            }]
        },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
    });
}

let changeGraphic = byId('selected')
changeGraphic.addEventListener('change',function(){ 
     ShowBy = this.value
     CreateLampGraphic()
})

let showModal = byClass('fa-edit')[0]
let divModal= document.getElementById('information-container')
let closeModal = byId('cancel')
let form = byId('form-data')
showModal.addEventListener('click', function(){ 
    divModal.style.display = 'block'
    byId('name').value = selectionedElement.name
    form.addEventListener('submit', SubmitForm)
})
function SubmitForm(e){ 
    e.preventDefault()
    let number_off = Number(byId('numberOff').value)
    let number_on = Number(byId('numberOn').value)
    let comment = byId('comment').value
    let total = number_off + number_on
    let newLampHistoric = { 
        number_off_lamp_Off: number_off,
        number_off_lamp_On: number_on,
        total: total,
        comment: comment,
        lamp: selectionedElement.id,
        hasWifi: byId('wifi').checked,
        hasCamera: byId('Camera').checked
    }
    let headers = new Headers();
    headers.append('X-CSRFToken', csrftoken)
    headers.append("Content-Type", "application/json")
    fetch(`lamphistorique/${selectionedElement.id}`,{method:'POST',body: JSON.stringify(newLampHistoric), headers:headers})
            .then(res => res.json())
                .then(function(data){ 
                    CreateLampTable(data)
                    fetchlamps()
                    form.reset()
                    divModal.style.display = 'none'
                })
    
}

closeModal.addEventListener('click', function(e){ 
    e.preventDefault()
    divModal.style.display = 'none'
})
let geolocation = new ol.Geolocation({ 
    projection: map.getView().getProjection()
})
let activeGeolocation = byId('location')
let positions = null
let positionFeature = new ol.Feature();
activeGeolocation.addEventListener('click',function(){ 
    geolocation.setTracking(true)
    geolocation.on('change:position',function(){ 
        if (!positions){ 
                positions = geolocation.getPosition()
                createPositionFeature()
                showNearestLamps()  
        }else{ 
            let distance = ol.sphere.getDistance(positions,geolocation.getPosition())
            if (distance > 2){ 
                    positions = geolocation.getPosition()
                    createPositionFeature()             
            }
        }
    })
})
function showNearestLamps() {
   let [long, lat]= ol.proj.transform(positions,'EPSG:3857','EPSG:4326')
    fetch(`getNearestLamp/?lat=${lat}&long=${long}`)
        .then(function(res){ 
            return res.json()
        }).then(function(data){ 
            console.log(JSON.parse(data))
        })
  }

  function createPositionFeature(){ 
    positionFeature.setStyle(
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#3399CC',
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    );
    positionFeature.setGeometry(new ol.geom.Point(positions))
    let vectorPosition = new ol.layer.Vector({
        source: new ol.source.Vector({ 
            format: new ol.format.GeoJSON(),
            features: [positionFeature]
        }),
        className: 'geoloc'
    })
    map.addLayer(vectorPosition)
    map.getView().setCenter(positions)
    map.getView().setZoom(16)  
  }

  function nearestLampTable(elements){ 
      if (!elements){ 
          throw Error('The elements must not be empy')
      }
      for (let element of elements){ 

      }

  }
// Creating a default chart when the page load

    /*
        fetch(`lamphistorique/${id}`)
            .then(res => res.json())
                .then(data => console.log(data))
    })
  });
/*document.getElementById("activeGe").addEventListener('click', function(){ 
        navigator.geolocation.getCurrentPosition(showPosition)
})


 /* let check = document.getElementById("visibleObj")
  check.addEventListener('change', function(){ 
      let isVisble = this.checked
      lamps.setVisible(isVisble)
  })*/

 
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');


let controls = map.getControls().array_
for (let control of controls){ 
    map.removeControl(control)
}

let coordsCenter = ol.proj.transform([43.105059, 11.596976], 'EPSG:4326', 'EPSG:3857')
let zooms = document.getElementsByClassName('zoom')
for (let zoom of zooms){ 
    zoom.addEventListener('click',function(){ 
        let id = zoom.getAttribute('id')
        let zoomValue = map.getView().getZoom()
        if (id === "zoomin"){ 
            let span = document.getElementById('zoominspan')
            span.style.display = 'none'
            map.getView().setZoom(zoomValue + 1)
        }else if (id === "zoomout"){
            map.getView().setZoom(zoomValue - 1)
        }else{ 
            // we will re-centre the map by using 12 as zdefautl zoom level
            map.getView().setZoom(defaultZoom)
            map.getView().setCenter(coordsCenter)
        }
            
    })
}

let span = document.getElementById('zoominspan')
let zoomin = document.getElementById('zoomin')
zoomin.addEventListener('mouseenter', function(){ 
    setTimeout(function(){  
    span.style.position = 'absolute'
    span.style.top = '110px'
    span.style.left = '50px'
    span.style.display = 'block'
    }, 500);
})
document.getElementById('zoomin').addEventListener('mouseleave', function(){ 
    setTimeout(function(){  
        span.style.display = 'none'
        }, 700);
})
map.on('pointermove', function(e){ 
    let coords = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
    let formatCoord = ol.coordinate.createStringXY(3)
    let XYcoords = formatCoord(coords).split(',')
    document.getElementById('position-mouse').textContent = XYcoords
})
let baseContainer = document.getElementById('base')
let closeDivs = document.getElementsByClassName('close-information')
for (let closeDiv of closeDivs){ 
    closeDiv.addEventListener('click', function(){ 
        let parentDiv = this.parentElement.parentElement
        if (parentDiv.getAttribute('id') === "form-data"){ 
            parentDiv = parentDiv.parentElement
            parentDiv.style.display = 'none'
        }
            parentDiv.style.display = 'none'
    })
}



