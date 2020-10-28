'use strict'
import { mapService } from '../service/travel-service.js'
import { storageService } from '../service/storage-service.js'
import { utilsService } from '../service/utils.js'



// window.onGoTOPlace = onGoTOPlace;
window.onDeletePlace = onDeletePlace;

var gMap;
var gPlaces =[];
const STORAGE_KEY = 'dBPlaces'
console.log('Main!');

mapService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {
    initMap()
        .then(() => {
            
            addMarker({ lat: 32.0749831, lng: 34.9120554 });
        })
        .catch(console.log('INIT MAP ERROR'));

    getPosition()
        .then(pos => {

            console.log('User position is:', pos.coords);
        })
        .catch(err => {
            console.log('err!!!', err);
        })
}

document.querySelector('.btn').addEventListener('click', (ev) => {
    console.log('Aha!', ev.target);
    panTo(35.6895, 139.6917);
})


export function initMap(lat = 32.0749831, lng = 34.9120554) {
// function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap');
    return _connectGoogleApi()
        .then(() => {
            console.log('google available');
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            console.log('Map!', gMap);

            gMap.addListener('click', function (mapsMouseEvent) {
                const myLatlng = {
                    lat: mapsMouseEvent.latLng.lat(),
                    lng: mapsMouseEvent.latLng.lng()
                }
                console.log(myLatlng);
                var name = prompt('Enter place name:');
                addPlace(name, myLatlng);
                // gMap.setCenter(myLatlng);
            });

            renderPlace()
           
        })
}

function addPlace(name, latlang) {
 
    var newPlace = createPlace(name, latlang);
    gPlaces.push(newPlace)
    console.log(gPlaces);
    storageService.saveToStorage(STORAGE_KEY, gPlaces);
    renderPlace()
}


function onDeletePlace(placeId) {
    mapService.deletePlace(placeId, gPlaces, STORAGE_KEY)
    renderPlace()
}


function renderPlace() {
    gPlaces = mapService.getPlaces(STORAGE_KEY, gPlaces);
    console.log(gPlaces);
    var strHtml = ''
    gPlaces.forEach( function(place) {
       return strHtml += `<tr>
        <td>${place.id}</td>
        <td>${place.name}</td>
        <td>${place.latlng.lat}</td>
        <td>${place.latlng.lng}</td>
        <td>${place.createdAT}</td>
        <td><button class="go-btn" data-id="${place.id}" >Go</button></td>
        <td><button class="delete-btn" onclick="onDeletePlace('${place.id}')">X</button></td>
        </tr>`
    });
    var elTbody = document.querySelector('tbody')
    elTbody.innerHTML = strHtml;
    var elBtns = document.querySelectorAll('.go-btn');
    console.log(elBtns);
    elBtns.forEach((btn) => {
        btn.addEventListener('click', () => onGoTOPlace(btn.dataset.id))
    })
}
    

{/* <td><button class="go-btn" data-id="${place.id}" onclick="onGoTOPlace('${place.id}')">Go</button></td>
<td><button class="delete-btn" onclick="onDeletePlace('${place.id}')">X</button></td> */}
    // renderPlace()
    //     .then( console.log(document.querySelectorAll('button')))

    // setTimeout(() => {
    //     console.log(document.querySelectorAll('button'));
    // }, 2000);
     
    // document.querySelectorAll('button');
    // console.log(ff);


// var ff = document.querySelector('button');
// console.log(ff);





// document.querySelector('button').addEventListener('click',(ev)=>{
//     console.log(ev);
//     // onGoTOPlace
// })

// ff.addEventListener ('click', () => {
//     console.log('fffffff');
//     // console.log(ev);
// })



// ().forEach 
// addEventListener('click', () => {
    
// })



export function onGoTOPlace(placeId){
    var place = gPlaces.find(function (place) {
        return placeId === place.id
    })
    // console.log(place.latlng);
    gMap.setCenter(new google.maps.LatLng(place.latlng.lat, place.latlng.lng))
}

function createPlace(name, latlang) {
    return {
        id: utilsService.makeId(length = 3),
        latlng: latlang,
        name: name,
        createdAT: Date.now()
    }
}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    });
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    gMap.panTo(laLatLng);
}

function getPosition() {
    console.log('Getting Pos');

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyAnno07meWzY_i9y51CIiSxViNX_PrMqZ4'; //TODO: Enter your API Key
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}



