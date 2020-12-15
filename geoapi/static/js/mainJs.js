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
    format: new ol.format.GeoJSON()
})
function lampStyle(feature,resolution) {
    let diff = feature.get('diff')
    let style = new ol.style.Style()
    if (diff < 0){ 
        style.setImage(
            new ol.style.Circle({
                radius: 5.5,
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
                radius: 5.5,
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
    style: lampStyle
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
    }),
    controls: ol.control.defaults({
        zoom: false,
        attribution: false,
        rotate: false
    })
});


/* Programming the actions, like changing the basemap 
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
            removeAttributeActive() 
            baseMap.classList.add('active')
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

function removeAttributeActive(){ 
    for (let base of baseMaps){ 
        if (base.getAttribute('class').includes('active')){
            base.classList.remove('active')
        }
    }
}
let styleElement = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 5.5,
    stroke: new ol.style.Stroke({
        color: 'white',
        width: 2
    }),
    fill: new ol.style.Fill({
        color: '#0853AA'
    })
    })
});

function resetStyle(){ 
    let features = lampsSource.getFeatures()
    for (let feature of features){ 
        feature.setStyle(lampStyle)
    }
}

let selectionedElement =  {}
let featureClicked = null
map.on('click', function(e) {
    let pixels = e.pixel
    map.forEachFeatureAtPixel(pixels, function(f,layer){
        let idOfLayer = Number(layer.ol_uid)
        if (idOfLayer !== 29){ // we dont want to style the geolocalization feature 
            let id = f.getId()
            let trElements = byClass('data')
            if (trElements.length > 0){ // we will synchronise the map and the table 
                if (featureClicked !== null){ 
                    resetStyle()
                }
                if (!selectionedElement || selectionedElement.id !== id){ // we dont want that a user click the same obj repetly
                    featureClicked = f
                    for (let trElement of trElements){ 
                        trElement.setAttribute('class','data')
                    }
                    for (let trElement of trElements){ 
                        if (Number(trElement.getAttribute('id')) === id){ 
                            trElement.classList.add('clicked')
                        }
                    }
                    featureClicked.setStyle(styleElement)
                    selectionedElement.id = id
                    selectionedElement.name = featureClicked.get('name')
                    selectionedElement.station = featureClicked.get('station')
                    fetchLamps()
                }else{ 
                    featureClicked.setStyle(styleElement)
                }
            }else{ 
                if (featureClicked !== null){ 
                    resetStyle()
                }
                if (!selectionedElement || selectionedElement.id !== id){ 
                    featureClicked = f
                    featureClicked.setStyle(styleElement)
                    selectionedElement.id = id
                    selectionedElement.name = featureClicked.get('name')
                    selectionedElement.station = featureClicked.get('station')
                    fetchLamps()
                }else{ 
                    featureClicked.setStyle(styleElement)
                }
            }
        }
    })
})
let baseModal =  byId('base')
let showBaseModal = document.getElementById('display-base')
showBaseModal.addEventListener('click',function(){ 
    baseModal.style.transition = "all 2s"
    baseModal.style.display = "block"
})


let dataLamps = []
function fetchLamps(){ 
    fetch(`lamphistorique/${selectionedElement.id}`)
    .then(function(res){ 
        return res.json()
    })
    .then(function(data){  
        dataLamps = data
        createInformationTable(data[0]) // As our data are ordered by datetime we want to show up the recent data
        createGraphic()
    })
}

function createInformationTable(data){
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
        let hours =   addZero(new Date(data.created_At).getHours())
        let minutes = addZero(new Date(data.created_At).getMinutes())
        h5.innerHTML = 'Derniere Maintenance: le ' + new Date(data.created_At).toLocaleDateString() + '   à  ' + hours + 'h' + minutes
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

function addZero(element){ 
    if (element < 10){ 
        element = '0' + element
    }
    return element
}
let showBy = byId('selected')

function createGraphic(){ 
    let data = []
    let labels = []
    let elements = dataLamps
    for (let element of elements){ 
        labels.unshift(new Date(element.created_At).toLocaleDateString())
        if (showBy.value === 'number_off_lamp_On'){ 
            data.unshift(element.number_off_lamp_On)
        }else{ 
            data.unshift(element.number_off_lamp_Off)
        }
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
                label: showBy.value === 'number_off_lamp_Off' ? 'Eteint': 'Allumé',
                borderColor: showBy.value === 'number_off_lamp_Off' ? '#D21F0D': 'blue',
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

showBy.addEventListener('change',function(){ 
    createGraphic()
})

let showForm = byClass('fa-edit')[0]
let closeForm = byId('cancel')
let formContainer= document.getElementById('information-container')
let form = byId('form-data')
let msgError = byId('msgError')
let msgSucces = byId('msgConfirmation')
showForm.addEventListener('click', function(){ 
    if (featureClicked !== null){ 
        formContainer.style.display = 'block' // the form is under the formContainer
        byId('name').value = selectionedElement.name
        form.addEventListener('submit', submitForm) 
    }
})
function submitForm(e){ 
    e.preventDefault()
    let numberOfLampsOff = Number(byId('numberOff').value)
    let numberOfLampsOn = Number(byId('numberOn').value)
    let comment = byId('comment').value
    let total = numberOfLampsOff + numberOfLampsOn
    let newLampMaintenance = { 
        number_off_lamp_Off: numberOfLampsOff,
        number_off_lamp_On: numberOfLampsOn,
        total: total,
        comment: comment,
        lamp: selectionedElement.id,
        hasWifi: byId('wifi').checked,
        hasCamera: byId('Camera').checked,
    }
    let headers = new Headers();
    headers.append('X-CSRFToken', csrftoken)
    headers.append("Content-Type", "application/json")
    fetch(`lamphistorique/${selectionedElement.id}`,{method:'POST',body: JSON.stringify(newLampMaintenance),headers:headers})
            .then(res => res.json())
                .then(function(data){ 
                    if (data.non_field_errors){ // case the server sends us a error 
                        msgError.innerHTML = data.non_field_errors
                        msgError.style.display = 'block'
                        setTimeout(function(){ 
                            msgError.style.display = 'none'
                        },2000)
                    }else{
                        fetchLamps()
                        form.reset()
                        featureClicked.set('diff',data.number_off_lamp_On - data.number_off_lamp_Off)
                        formContainer.style.display = 'none'
                        msgSucces.style.display = 'none'
                    }
                })
    }


closeForm.addEventListener('click', function(e){ 
    e.preventDefault()
    form.reset()
    formContainer.style.display = 'none'
    msgError.style.display = 'none'
})
let geolocation = new ol.Geolocation({ 
    projection: map.getView().getProjection()
})
let activateGeolocation = byId('location')
let positions = null
let vectorPosition = new ol.layer.Vector()
let nearestLampsContainer = byId('nearest-lamps')
activateGeolocation.addEventListener('click',function(){ 
    if (!activateGeolocation.getAttribute('class').includes('actual')){
        geolocation.setTracking(true)
        geolocation.on('change:position', function(evt){ 
        geolocation.setTracking(false) // we will diseable the tracking 
       let accuracy = geolocation.getAccuracy()
       if (accuracy < 17000){ 
            positions = geolocation.getPosition()
            createGeolocationGeometry()
            activateGeolocation.classList.add('actual')
            showNearestLamps()  
        }else{  // case where the accuracy is low, we will just center the map, but not show the marker
            positions = geolocation.getPosition()
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
            putOnTableNearestLamps(JSON.parse(data))
         })
  }

function createGeolocationGeometry(){ 
    let positionFeature = new ol.Feature();
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
    vectorPosition.set('className','geolocalization')
    map.addLayer(vectorPosition)
    map.getView().setCenter(positions)
    map.getView().setZoom(17)  
  }
  
  let tableBody = byId('lamps-table').getElementsByTagName('tbody')[0]
  function putOnTableNearestLamps(elements){ 
      let i = 0
      for (i; i < elements.length; i++){ 
        let distance = convertDistance(elements[i].distance)
        tableBody.innerHTML += `<tr class="data" id=${elements[i].id} onclick="showFeature(this)">
                                    <td>${i}</td>
                                    <td>${elements[i].name}</td>
                                    <td>${elements[i].station}</td>
                                    <td>${distance}</td>
                                </tr>`
      }
      /* the first tr element will receive a class attribute data clicked in order to style it differently */
      let firstTr = tableBody.getElementsByTagName('tr')[1]
      firstTr.classList.add('clicked')
      let features = lampsSource.getFeatures()
      resetStyle()
      nearestLampsContainer.style.display = 'block'
      let ids = []
      for (let element of elements){ 
            ids.push(Number(element.id))
      }
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
  

function showFeature(element){ 
    let lampTrs = tableBody.querySelectorAll('tr.data')
    let id = Number(element.getAttribute('id'))
    let idClicked = byClass('data clicked')[0].getAttribute('id')
    if (id !== Number(idClicked)){ 
        for (let lampTr of lampTrs){ 
            lampTr.classList.remove('clicked')
        }
        element.classList.add('clicked') // we will give the tr element that receive the click another class attr
        let features = lampsSource.getFeatures()
        let featureToShow = features.find(feature => feature.id_ === id)
        featureClicked = featureToShow
        selectionedElement.id = featureToShow.getId()
        selectionedElement.name = featureToShow.get('name')
        selectionedElement.station = featureToShow.get('station')
        resetStyle()
        featureToShow.setStyle(styleElement)
        fetchLamps()
    }
}

  function convertDistance(dist){ 
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
 

  function getCookie(name) { // Source of this function : django documentation
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
    let formatCoord = ol.coordinate.createStringXY(3)
    let XYcoords = formatCoord(coords).split(',')
    document.getElementById('position-mouse').textContent = XYcoords
})

let closeDivs = document.getElementsByClassName('close-information')
for (let closeDiv of closeDivs){ 
    closeDiv.addEventListener('click', function(){ 
        let parentDiv = this.parentElement.parentElement
        if (parentDiv.getAttribute('id') === 'form-data'){ 
            parentDiv = parentDiv.parentElement
            form.reset()
            parentDiv.style.display = 'none'
            msgError.style.display = 'none'
        }else if (parentDiv.getAttribute('id') === 'nearest-lamps'){ 
            fetch('getGeojson').then(res => res.json()).then(function(data){ 
                let format =  new ol.format.GeoJSON()
                lampsSource.clear()
                let features = format.readFeatures(data,{dataProjection:'EPSG:4326',featureProjection:'EPSG:3857'})
                lampsSource.addFeatures(features)
                let feature = features.find(feature => feature.id_ === featureClicked.id_)
                feature.setStyle(styleElement)
                featureClicked = feature
                clearTable()
                activateGeolocation.classList.remove('actual')
                parentDiv.style.display = 'none'
                map.removeLayer(vectorPosition)
            })
        }
        parentDiv.style.display = 'none'       
    })
}

function clearTable(){ 
    let datas = document.querySelectorAll('tr.data')
    for (let data of datas){ 
        let parent = data.parentElement
        parent.removeChild(data)
    }
}


