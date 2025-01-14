import {check, PERMISSIONS, RESULTS, request, requestMultiple, checkMultiple} from 'react-native-permissions';

export const HasGpsPermissions=async () =>{
    let hasPermission = (await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)) === 'granted';
    if (!hasPermission) {
      const permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, {
        title:'Please Accept Location Permission', 
        message:'The location permisson is needed to check burn ban info in your current location',
        buttonPositive: 'Accept'
      });
      let statuses = await checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ])
      hasPermission = ((await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)) ==='granted' 
      || (await check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION)) === 'granted');
     }
    return hasPermission;
}

export const HasNotificationPermission = async () => {
  let hasPermission = (await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)) === 'granted';
  if (!hasPermission) {
    await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS, {
      title:'Please Accept Notifications Permission', 
      message:'The notifications permisson is needed to send updates when a burn ban status has changed for a watched county',
      buttonPositive: 'Accept'
    })
    .then((permission) => {;
      check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
      .then((stringPermission) => 
        {hasPermission = (stringPermission === 'granted')
          return hasPermission;
        });
    })
  }
}
