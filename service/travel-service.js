
import { storageService } from '../service/storage-service.js'

export const mapService = {
    getLocs: getLocs,
    getPlaces,
    deletePlace,
}
var locs = [{ lat: 11.22, lng: 22.11 }]

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs);
        }, 2000)
    });
}



function deletePlace(placeId , places, KEY){
    var placeIdx = places.findIndex(function (place) {
        return placeId === place.id
    })
    places.splice(placeIdx, 1)
    storageService.saveToStorage(KEY, places)
}


function getPlaces(KEY ,places) {
    places = storageService.loadFromStorage(KEY);
    if(!places || !places.length){
        places = [];
    }
    return places;
}