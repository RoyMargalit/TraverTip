'use strict'
import { mapService } from '../service/travel-service.js'
import { storageService } from '../service/storage-service.js'
import { utilsService } from '../service/utils.js'



// window.onGoTOPlace = onGoTOPlace;
// window.onDeletePlace = onDeletePlace;

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
        <td><button class="delete-btn" data-id"${place.id}" >X</button></td>
        </tr>`
    });

    var elTbody = document.querySelector('tbody')
    elTbody.innerHTML = strHtml;
    var elGOBtns = document.querySelectorAll('.go-btn');
    elGOBtns.forEach((btn) => {
        btn.addEventListener('click', () => onGoTOPlace(btn.dataset.id))
    });
    var elDeleteBtn = document.querySelectorAll('.delete-btn')
    elDeleteBtn.forEach((btn) => {
        btn.addEventListener('click', () => onDeletePlace(btn.dataset.id))
    })
}
    



var elMyLocationBtn = document.querySelector('.my-loc-btn');
console.log(elMyLocationBtn);
elMyLocationBtn.addEventListener('click', () => onSearchLoc())




function showLocation(position) {
    console.log(position);
    gMap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
}


function handleLocationError(error) {
    var locationError = document.getElementById("locationError");

    switch (error.code) {
        case 0:
            locationError.innerHTML = "There was an error while retrieving your location: " + error.message;
            break;
        case 1:
            locationError.innerHTML = "The user didn't allow this page to retrieve a location.";
            break;
        case 2:
            locationError.innerHTML = "The browser was unable to determine your location: " + error.message;
            break;
        case 3:
            locationError.innerHTML = "The browser timed out before retrieving the location.";
            break;
    }
}


function onSearchLoc() {
    if (!navigator.geolocation) return ('HTML5 Geolocation is not supported in your browser.');

    navigator.geolocation.getCurrentPosition(showLocation, handleLocationError);
}


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



// document.querySelector('.my-loc-btn').addEventListener('click', (ev) => {
//     console.log('Aha!', ev.target);
//     panTo(35.6895, 139.6917);
// })