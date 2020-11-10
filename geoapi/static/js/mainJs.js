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
function LampStyle(feature,resolution) {
    let diff = feature.get('diff')
    let style = new ol.style.Style()
    if (diff < 0){ 
        style.setImage(
            new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'red'
                })
            })
        )
    }else{ 
        style.setImage(
            new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'green'
                })
            })
        )
    }
    return style;
}
let lampsVector = new ol.layer.Vector({ 
    source: lampsSource,
    style: LampStyle
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
            let mapTile = baseMap.getAttribute('id')
            switch(mapTile){
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
let StyleElement = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5,
    stroke: new ol.style.Stroke({
        color: 'white',
        width: 2
    }),
    fill: new ol.style.Fill({
        color: '#8B2318'
    })
    })
});
let selectionedElement =  {}
let ft = null
map.on('click', function(e) {
    let pixels = e.pixel
    map.forEachFeatureAtPixel(pixels, function(f,layer){
        if (layer.className_ !== 'geoloc'){ // we dont want to style the geoloc feature
            byId('base').style.display = 'block'
            let id = f.getId()
            if (ft !== null){ 
                ft.setStyle(LampStyle)
            }
            if (!selectionedElement || selectionedElement.id !== id){ // we dont want that a user click the same obj repetly
                ft = f
                ft.setStyle(StyleElement)
                selectionedElement.id = id
                selectionedElement.name = ft.get('name')
                selectionedElement.station = ft.get('station')
                fetchlamps()
            }else{ 
                ft.setStyle(StyleElement)
            }
        }
    })
})
let dataLamps = []
function fetchlamps(){ 
    fetch(`lamphistorique/${selectionedElement.id}`)
    .then(function(res){ 
        return res.json()
    })
    .then(function(data){  
        dataLamps = data
        CreateLampTable(data[0]) // As our data are ordered by datetime we want to show up the recent data
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
let ShowBy = byId('selected')

function CreateLampGraphic(){ 
    let data = []
    let labels = []
    let elements = dataLamps
    for (let element of elements){ 
        labels.push(new Date(element.created_At).toLocaleDateString())
        if (ShowBy === 'number_off_lamp_On'){ 
            data.push(element.number_off_lamp_Off)
        }
        data.push(element.number_off_lamp_On)
    }
    byId('myChart').remove() // will remove the others chart instances
    let chartCanvas = document.createElement('canvas')
    chartCanvas.setAttribute('id','myChart')
    byId('chart').append(chartCanvas)
    let chart = new Chart(chartCanvas,{
        type: 'line',
            data: {
            labels: labels,
            datasets: [{
                label: ShowBy.value === 'number_off_lamp_Off' ? 'Eteint': 'Allumé',
                borderColor: ShowBy.value === 'number_off_lamp_Off' ? '#D21F0D': 'blue',
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
                },
            }
    });
}

ShowBy.addEventListener('change',function(){ 
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
let vectorPosition = new ol.layer.Vector()
let tableNearest = byId('nearest-lamps')
activeGeolocation.addEventListener('click',function(){ 
    if (!activeGeolocation.getAttribute('class').includes('actual')){
        geolocation.setTracking(true)
        geolocation.on('change:position', function(evt){ 
        geolocation.setTracking(false) // we will diseable the tracking 
        activeGeolocation.setAttribute('class', 'control location actual')
       let accuracy = geolocation.getAccuracy()
       if (accuracy < 3000){ 
            positions = geolocation.getPosition()
            createPositionFeature()
            showNearestLamps()  
        }else{  // case where the accuracy is low, we will just center the map, but not show the marker
            positions = geolocation.getPosition()
            showNearestLamps()
            map.getView().setCenter(positions)
            map.getView().setZoom(15)
        }  
    })
  }else{ 
      map.getView().setCenter(positions)
  }
})
function showNearestLamps() {
   let [long, lat]= ol.proj.transform(positions,'EPSG:3857','EPSG:4326')
    fetch(`getNearestLamp/?lat=${lat}&long=${long}`)
        .then(function(res){ 
            return res.json()
        }).then(function(data){ 
            console.log(data)
            nearestLampTable(JSON.parse(data))
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
    let sourceFeaturePosition = new ol.source.Vector({ 
        format: new ol.format.GeoJSON(),
        features: [positionFeature]
    })
    vectorPosition.setSource(sourceFeaturePosition)
    vectorPosition.set('className','geoloc')
    map.addLayer(vectorPosition)
    map.getView().setCenter(positions)
    map.getView().setZoom(16)  
  }
  let tableBody = byId('lamps-table').getElementsByTagName('tbody')[0]
  function nearestLampTable(elements){ 
      /*if (tableBody.getElementsByClassName('data').length > 2){ // we will remove previous data 
        let tableElements = tableBody.getElementsByClassName('data')
        console.log(tableElements)
        for (let tableElement of tableElements){ 
            tableBody.remove(tableElement)
        }
      }*/
      let i = 0
      for (i; i < elements.length; i++){ 
        let distance = ConvertDistance(elements[i].distance)
        tableBody.innerHTML += `<tr class="data" id=${elements[i].id} onclick="ShowFeature(this)">
                                    <td>${i}</td>
                                    <td>${elements[i].name}</td>
                                    <td>${elements[i].station}</td>
                                    <td>${distance}</td>
                                </td>`
      }
      /* the first tr element will receive a class attribute data clicked in order to style it differently */
      tableBody.getElementsByTagName('tr')[1].setAttribute('class', 'data clicked')
      tableNearest.style.display = 'block'
      let ids = []
      for (let element of elements){ 
            ids.push(Number(element.id))
      }
      let features = lampsSource.getFeatures()
      let filteredFeatures = filterFeatures(features,ids)
      lampsSource.clear()
      lampsSource.addFeatures(filteredFeatures)
  }
  function filterFeatures(elements,objs){ 
    let output = []
    for (let feature of elements){ 
        if (objs.find(obj => obj === feature.id_)){ 
            output.push(feature)
        }
    }
    return output
  }
  

function ShowFeature(element){ 
    byId('base').style.display = 'block'
    let lampTrs = tableBody.querySelectorAll('tr.data')
    let id = Number(element.getAttribute('id'))
    let idClicked = byClass('data clicked')[0].getAttribute('id')
    if (id !== Number(idClicked)){ 
        for (let lampTr of lampTrs){ 
            lampTr.setAttribute('class', 'data')
        }
        element.setAttribute('class', 'data clicked') // we will give the tr element that receive the click another class attri
        let features = lampsSource.getFeatures()
        let featureToShow = features.find(feature => feature.id_ === id)
        selectionedElement.id = featureToShow.getId()
        selectionedElement.name = featureToShow.get('name')
        selectionedElement.station = featureToShow.get('station')
        for (let feature of features){ 
            feature.setStyle(LampStyle)
        }
        featureToShow.setStyle(StyleElement)
        fetchlamps()
    }
}

  function ConvertDistance(dist){ 
    let output = 0
    if (!dist || typeof(dist) !== 'number'){ 
            throw new Error('Need a valid distance')
    }
    if (dist > 1000){ 
        output = (dist / 1000).toFixed(2) + ' ' + 'km'
    }else{
        output = (dist).toFixed(2) +  ' ' + 'm'
    }
    return output 
  }
 
  function getCookie(name) { // Source of this function : the django documentation
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
let zooms = byClass('zoom')
let spanZoomOut = byId('zoomoutspan')
let spanZoomIn = byId('zoominspan')
for (let zoom of zooms){ 
    zoom.addEventListener('click',function(){ 
        let id = zoom.getAttribute('id')
        let zoomValue = map.getView().getZoom()
        if (id === "zoomin"){ 
            spanZoomIn.style.display = 'none'
            map.getView().setZoom(zoomValue + 1)
        }else if (id === "zoomout"){
            spanZoomOut.style.display = 'none'
            map.getView().setZoom(zoomValue - 1)
        }else{ 
            map.getView().animate({center: coordsCenter},{zoom: defaultZoom},{duration: 2000})
        }
            
    })
}

let zoomin = byId('zoomin')
let zoomOut = byId('zoomout')
zoomin.addEventListener('mouseenter', function(){ 
    spanZoomIn.style.display = 'block'
})
zoomin.addEventListener('mouseleave', function(){ 
    spanZoomIn.style.display = 'none'        
})
zoomOut.addEventListener('mouseenter', function(){ 
    spanZoomOut.style.display = 'block'
})
zoomOut.addEventListener('mouseleave', function(){ 
    spanZoomOut.style.display = 'none'        
})

map.on('pointermove', function(e){ 
    let coords = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326')
    let formatCoord = ol.coordinate.createStringXY(4)
    let XYcoords = formatCoord(coords).split(',')
    document.getElementById('position-mouse').textContent = XYcoords
})
let baseContainer = document.getElementById('base')
let closeDivs = document.getElementsByClassName('close-information')
for (let closeDiv of closeDivs){ 
    closeDiv.addEventListener('click', function(){ 
        let parentDiv = this.parentElement.parentElement
        if (parentDiv.getAttribute('id') === 'form-data'){ 
            parentDiv = parentDiv.parentElement
            parentDiv.style.display = 'none'
        }else if (parentDiv.getAttribute('id') === 'nearest-lamps'){ 
            //activeGeolocation.setAttribute('class', 'control location')
            //ClearTable()
            parentDiv.style.display = 'none'
            map.removeLayer(vectorPosition)
            lampsSource.refresh()
        }
        parentDiv.style.display = 'none'       
    })
}

function ClearTable(){ 
    let datas = document.querySelectorAll('tr.data')
    for (let data of datas){ 
        let parent = data.parentElement
        parent.removeChild(data)
    }
}


