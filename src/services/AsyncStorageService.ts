import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const savedCountiesKey = 'SavedCounties';
const deviceTokenKey = 'DeviceToken';
const googlePlayUserKey = "GooglePlayUser";
const isFirstLaunchKey = "IsFirstLaunch";
const isWarningAcceptedKey = "IsWarningAccepted"

export async function SaveGoogleUserInfoLocal(user:any): Promise<boolean> {
    let success = true;
    try {
        StoreJsonData(googlePlayUserKey, {user});
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
        success = false;
    }
    return success
}

export async function GoogleUserInfoLocal() {
    let retValue;
    try {
        const jsonValue = await AsyncStorage.getItem(googlePlayUserKey);
        jsonValue != null ? retValue = JSON.parse(jsonValue) : retValue = null;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return retValue;
}

export async function SetDeviceTokenLocal(token: string): Promise<boolean> {
    let success = true;
    try {
        StoreJsonData(deviceTokenKey, { token });
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
        success = false;
    }
    return success
}

export async function GetDeviceTokenLocal(): Promise<string | null> {
    let retValue: string | null = "";
    try {
        const jsonValue = await AsyncStorage.getItem(deviceTokenKey)
        jsonValue != null ? retValue = JSON.parse(jsonValue) : retValue = null;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return retValue;
}

export async function GetSavedCountiesLocal(): Promise<SavedCounty[] | null> {
    let retValue: SavedCounty[] | null = [];
    try {
        const jsonValue = await AsyncStorage.getItem(savedCountiesKey)
        jsonValue != null ? retValue = JSON.parse(jsonValue) : retValue = null;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return retValue;
}

export async function AddSavedCountyLocal(county, state, lat, lng): Promise<boolean> {
    let success = false;
    try {
        let savedCounties = await GetSavedCountiesLocal();
        if (!savedCounties) {
            savedCounties = [];
        }
        if (savedCounties.findIndex(x => x.countyName === county && x.stateName === state) === -1) {
            success = savedCounties.push({ countyName: county, stateName: state, lat: lat, lng: lng, savedDate: new Date().toUTCString() }) > 0;
            if (success) {
                StoreJsonData(savedCountiesKey, savedCounties);
            }
        }
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return success
}

export async function UpdateSavedCountyLocal(savedCounties:SavedCounty[] | null): Promise<boolean> {
    let success = false;
    try {
       StoreJsonData(savedCountiesKey, savedCounties);
       success = true;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return success
}


export async function RemoveSavedCountyLocal(county, state) {
    let success = false;
    try {
        let savedCounties = await GetSavedCountiesLocal();
        if (savedCounties) {
            let index = savedCounties.findIndex(x => x.countyName === county && x.stateName === state);
            if (index !== -1) {
                const deleted = savedCounties.splice(index, 1);
                if (deleted) {
                    StoreJsonData(savedCountiesKey, savedCounties);
                    success = true;
                }
            }
        }
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return success;

}

export async function ClearSavedCountiesLocal() {
    StoreJsonData(savedCountiesKey, []);
}

export async function GetIsFirstLaunch(): Promise<boolean | null> {
    let retValue: boolean = true;
    try {
        const jsonValue = await AsyncStorage.getItem(isFirstLaunchKey)
        jsonValue != null ? retValue = JSON.parse(jsonValue)[isFirstLaunchKey] : retValue = true;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return retValue;
}

export async function SetIsFirstLaunch(isFirstLaunch:boolean): Promise<boolean> {
    let success = true;
    try {
        StoreJsonData(isFirstLaunchKey, {isFirstLaunch});
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
        success = false;
    }
    return success
}

export async function GetIsWarningAccepted(): Promise<boolean | null> {
    let retValue: boolean = true;
    try {
        const jsonValue = await AsyncStorage.getItem(isWarningAcceptedKey)
        jsonValue != null ? retValue = JSON.parse(jsonValue)[isWarningAcceptedKey] : retValue = false;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    return retValue;
}

export async function SetIsWarningAccepted(IsWarningAccepted:boolean): Promise<boolean> {
    let success = true;
    try {
        StoreJsonData(isWarningAcceptedKey, {IsWarningAccepted});
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
        success = false;
    }
    return success
}

export const StoreJsonData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
}

export const StoreStringData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
}

export const getStringData = async (key) => {
    try {
        return await AsyncStorage.getItem(key)
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
}

export const getJsonData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (err) {
        Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
}

export interface SavedCounty {
    countyName,
    stateName,
    lat,
    lng,
    savedDate
}