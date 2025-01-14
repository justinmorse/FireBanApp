import Toast from 'react-native-toast-message';
import config from '../../config.json'

export const Timeout = (time) => {
	let controller = new AbortController();
	setTimeout(() => controller.abort(), time * 1000);
	return controller;
};

export const GetCountyData = async (counties:{county, state}[]) =>{
    let map = new Map<string,string>(counties.map(county => {return [county.county, county.state]}));
    let json = JSON.stringify(Object.fromEntries(map));

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
        body: json,
        signal: Timeout(7).signal
    }; 
    let r: any = null;
    try{
        r = await (await fetch(config.ApiUrl + '/fireban/getcountydata', requestOptions)).json();
    }
    catch(err){
        console.log(err)
    }
   
    return r;
}

export const GetCountyDataByState = async (state: string) =>{
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
        signal: Timeout(7).signal
    }; 
    let r: any = null;
    try{
        r = await fetch(config.ApiUrl + '/fireban/getcountydatabystate/' + state, requestOptions);
    }
    catch(err){
        console.log(err)
    }
   
    return r.json();
}

export const GetStates = async () =>{
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
        signal: Timeout(7).signal
    }; 
    let r: any = null;
    try{
        r = await fetch(config.ApiUrl + '/fireban/getstates', requestOptions);
    }
    catch(err){
        console.log(err)
    }
   
    return r.json();
}

export const GetGoogleUserByEmail = async (email:string) => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
        signal: Timeout(7).signal
    }; 
    let r: any = null;
    try{
        r = await fetch(config.ApiUrl + '/googleuser/getgoogleuserbyemail/' + email, requestOptions);
    }
    catch(err){
        console.log(err)
    }
   
    return r.json();
}

export const SaveGoogleUser = async (googleUser:GoogleUser) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "ApiKey": "692633c0-e4e9-496c-9501-1cdb7eefcbed" },
        body: JSON.stringify(googleUser)
    }; 
    let r: any = null;
    try{
        let url = config.ApiUrl + '/googleuser/savegoogleuser';
        r = await fetch(url, requestOptions);
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    let json = await r.json();
    return json;
}

export default interface GoogleUser{
    id: number;
    googleId:string;
    name:string;
    email:string;
    photo:string;
    lastSignIn:string
}



