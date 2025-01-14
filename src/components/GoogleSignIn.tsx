import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GoogleUserInfoLocal, SaveGoogleUserInfoLocal } from '../services/AsyncStorageService';
import GoogleUser, { SaveGoogleUser } from '../services/FireBanContextService';
import messaging from '@react-native-firebase/messaging';
import { MergeLocalSavedCounties, SaveDeviceToken } from '../services/FirebaseContextService';
import { SetDeviceTokenLocal } from '../services/AsyncStorageService';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { HasGpsPermissions, HasNotificationPermission } from '../services/PermissionsService';
import Toast from 'react-native-toast-message';

interface GoogleSignInProps{
  onGoogleSignIn:Function
}

const GoogleSignIn = (props: GoogleSignInProps) => {

  const [userInfo, _setUserInfo] = useState(null as any | null);
  const setUserInfo = (info) => {
    try{
      let googleUser: GoogleUser = { id: -1, googleId: info.user.id, name: info.user.name, email: info.user.email, photo: info.user.photo, lastSignIn: new Date().toISOString() }
      SaveGoogleUserInfoLocal(info).then((success) => {
        if(success){
          SaveGoogleUser(googleUser).then((success) => {
            if(success){
              _setUserInfo(info);
              RegisterWithFMC().then(() => {
                MergeLocalSavedCounties();
              });
            }
            else{
              Toast.show({ type: 'defaultToast', text1:'Failed To Save Google Signin Info', autoHide:true });
            }
          });
        }
        else{
          Toast.show({ type: 'defaultToast', text1:'Failed To Save Google Signin Info', autoHide:true });
        }
      });    
    }catch (err){
      Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
    finally{
      props.onGoogleSignIn();
    }
  }

  useEffect(() => {
    CheckPermissions().then(() =>{
      GoogleSignin.configure({
        //scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
        webClientId: '248850928641-8d8hn6qtlt2elf95483mua0m7ttfql9m.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
        offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
        hostedDomain: '', // specifies a hosted domain restriction
        forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
        accountName: '', // [Android] specifies an account name on the device that should be used
        //iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
        //googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
        //openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
        profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
      });
      signIn();
    });
  }, [])

  async function CheckPermissions() {
    await HasGpsPermissions().then(async () => {
      await HasNotificationPermission().then(() => {
        return true;
      });
    });
  }

  async function RegisterWithFMC() {
    try{
      await messaging().registerDeviceForRemoteMessages().then(() =>{
        messaging().getToken().then((token) => {
          SaveDeviceToken(token).then((success) => {
            SetDeviceTokenLocal(token).then((success) => {
              notifee.getNotificationSettings().then((settings) => {
                if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
                  Toast.show({ type: 'defaultToast', text1:'Notifications Not Enabled!', autoHide:true });
                }
              });
            });
          });
        });
      });
    }
    catch(err){
      Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
    }
  }

  messaging().onMessage(onMessageReceived);
  messaging().setBackgroundMessageHandler(onMessageReceived);
  messaging().onNotificationOpenedApp(() => { });
  
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
  
    // // Check if the user pressed the "Mark as read" action
    // if (type === EventType.ACTION_PRESS && pressAction?.id === 'mark-as-read') {
    //   // Update external API
    //   await fetch(`https://my-api.com/chat/${notification?.data.chatId}/read`, {
    //     method: 'POST',
    //   });
  
    //   // Remove the notification
    //   await notifee.cancelNotification(notification.id);
    // }
  });
  

  async function onMessageReceived(message) {
    var parsedMessage = JSON.parse(message.data.notifee);
    await displayNotification(parsedMessage.title, parsedMessage.body);
  }

  const displayNotification = async (title: string, body: string) => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId,
        //smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    }).catch((err) =>  Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true }));
  }

  const signIn = async () => {
    try {
      GoogleSignin.hasPlayServices().then((hasPlayServices) => {
        if (hasPlayServices) {
          GoogleSignin.isSignedIn().then((isSignedIn) => {
            if (!isSignedIn) {
              GoogleSignin.signIn().then((user) => setUserInfo(user)).catch((err) => {
                Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
              });
            }
            else {
              GoogleSignin.getCurrentUser().then((user) => setUserInfo(user)).catch((err) => {
                Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
              });
            }
          }).catch((err) => {
            Toast.show({ type: 'defaultToast', text1:String(err), autoHide:true });
          });
        }
      });

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Toast.show({ type: 'defaultToast', text1:'User Cancelled Sign In Process', autoHide:true });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({ type: 'defaultToast', text1:'Play Services is not install on this device', autoHide:true });
      } else {
         Toast.show({ type: 'defaultToast', text1:String(error), autoHide:true });
      }
    }
  }

  return (<View></View>)
}

export default GoogleSignIn;