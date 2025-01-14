import { AddressType, Client} from '@googlemaps/google-maps-services-js';

export const reverseGeocode = (latitude:number, longitude:number, useLocale:boolean, defaultLocale:string, maxResults: number, apiKey:string) =>{
    const client = new Client();
    var prom = client.reverseGeocode({
        params:{
            latlng: [latitude, longitude],
            key: apiKey
        },
        timeout: 1000
    })
    return prom;
   
}

export const Geocode = (placeid: string,apiKey:string) =>{
    const client = new Client();
    var prom = client.geocode({
        params:{
            place_id: placeid,
            key: apiKey
        },
        timeout: 1000
    })
    return prom;
   
}

export const  ParseGeocodeInfo = (geocodeResponse) =>{
    if(geocodeResponse){
        try{
            let firstAddress = geocodeResponse.data.results[0];
            let countyObj = firstAddress.address_components.filter(a => a.types.filter(t => t == AddressType.administrative_area_level_2).length > 0);
            let county = "";
            let state = "";
            if(countyObj && countyObj.length > 0){
                county = countyObj[0].short_name;
                county = county.replace(" County", "");
                state = firstAddress.address_components.filter(a => a.types.filter(t => t == AddressType.administrative_area_level_1).length > 0)[0].short_name;
            }
            return {county: county, state: state}

        }
        catch(err){
            let i = err;
        }
    }
}