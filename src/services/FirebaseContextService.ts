import config from '../../config.json'
import { GetSavedCountiesLocal, GoogleUserInfoLocal, SavedCounty, UpdateSavedCountyLocal } from './AsyncStorageService';
import { GetCountyData } from './FireBanContextService';

export const Timeout = (time) => {
	let controller = new AbortController();
	setTimeout(() => controller.abort(), time * 1000);
	return controller;
};

export const SaveDeviceToken = async (token: string) =>{
    const googleUser = await GoogleUserInfoLocal();
    let success: boolean = false;
    if(googleUser.user.user.email){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
            signal: Timeout(7).signal,
            body: JSON.stringify({"value":token, "googleUserEmail":googleUser.user.user.email})
        }; 
       
        try{
            let response = await fetch(config.ApiUrl + '/firebase/savedevicetoken', requestOptions);
            success = response.status === 200;
        }
        catch(err){
            console.log(err)
        }
    }
    return success;
}

export const SaveNotificationSubscription = async (countyName:string, state:string ) =>{
    const googleUser = await GoogleUserInfoLocal();
    let success: boolean = false;
    if(googleUser.user.user.email){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
            signal: Timeout(7).signal,
            body: JSON.stringify({"googleUserEmail":googleUser.user.user.email, "countyShortName":countyName, "state":state, "subscriptionDate":new Date().toISOString()})
        }; 
       
        try{
            let response = await fetch(config.ApiUrl + '/firebase/savenotificationsubscription', requestOptions);
            success = response.status === 200;
        }
        catch(err){
            console.log(err)
        }
    }
    return success;
}

export const RemoveNotificationSubscription = async (countyName:string, state:string ) =>{
    const googleUser = await GoogleUserInfoLocal();
    let success: boolean = false;
    if(googleUser.user.user.email){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
            signal: Timeout(7).signal,
            body: JSON.stringify({"googleUserEmail":googleUser.user.user.email, "countyShortName":countyName, "state":state, "subscriptionDate":new Date().toISOString()})
        }; 
       
        try{
            let response = await fetch(config.ApiUrl + '/firebase/removenotificationsubscription', requestOptions);
            success = response.status === 200;
        }
        catch(err){
            console.log(err)
        }
    }
    return success;
}

export const GetNotificationSubscriptions = async () =>{
    let retValue:any = null;
    const googleUser = await GoogleUserInfoLocal();
    if(googleUser.user.user.email){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
            signal: Timeout(7).signal,
            body: JSON.stringify(googleUser.user.user.email)
        }; 
       
        try{
            let response = await fetch(config.ApiUrl + '/firebase/getnotificationsubscriptions/', requestOptions);
            retValue = await response.json();
        }
        catch(err){
            console.log(err)
        }
    }
    return retValue;
}

export const MergeLocalSavedCounties = async () => {
    var notificationSubs = await GetNotificationSubscriptions();
    var local = await GetSavedCountiesLocal() ?? [];
    local = await PopulateSavedCountyListFromNotificationSubscriptions(notificationSubs, local);
    await UpdateSavedCountyLocal(local);
}

export const PopulateSavedCountyListFromNotificationSubscriptions = async (notificationSubs:any, local:SavedCounty[]) => {
    for(const n of notificationSubs){
        if(local.filter(l => l.countyName === n.countyShortName && l.stateName === n.state).length === 0){
            const c = await CreateSavedCountyLocal(n);
            local.push(c);
        }
    };
    return local
}

export const CreateSavedCountyLocal = async (county:any) =>{
    let retCounty:SavedCounty | null = null;
    let countyData = await GetCountyData([{county:county.countyShortName ?? "", state:county.state ?? ""}])
    let coords = JSON.parse(countyData[0].defaultCoordinates);
    retCounty = {countyName:county.countyShortName,
        stateName: county.state,
        lat: coords.lat, 
        lng: coords.lng,
        savedDate: county.subscriptionDate
    }
    return retCounty;
}

