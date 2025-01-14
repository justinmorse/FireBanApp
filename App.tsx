import React, {useEffect, useState } from 'react';
import { StyleSheet, View,  StatusBar, Text, } from 'react-native';
import { SplashScreen } from './src/containers/SplashScreen';
import Map from './src/navigation/index';
import { GetIsFirstLaunch, SetIsFirstLaunch } from './src/services/AsyncStorageService';
import Tutorial from './src/components/Tutorial';
import GooglePlaySubscriptionService from './src/services/GooglePlaySubscriptionService';
import GoogleSignIn from './src/components/GoogleSignIn';
import Toast from 'react-native-toast-message';
import { GetNotificationSubscriptions, MergeLocalSavedCounties } from './src/services/FirebaseContextService';

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [hasProVersion, SetHasProVersion] = useState(false);

  const toastConfig:any = {
    defaultToast: ({ text1, props }) => (
      <View style={{ height: 60, width: '90%', backgroundColor:"#A4161A",alignItems:'center', borderColor:"#A4161A", borderWidth:2, borderRadius:10, flex: 1, justifyContent: 'center' }}>
        <Text style={{color:"#F5F3F4", fontSize:20, fontWeight:'bold', justifyContent:'center', textAlignVertical: "center"}}>{text1}</Text>
      </View>
    )
  };

  useEffect(() => {
    GooglePlaySubscriptionService.initializeGooglePlaySubscription().then((success) => {
      if(success){
        GooglePlaySubscriptionService.getAllSubscriptions();
        GooglePlaySubscriptionService.getUserSubscriptions();
      }
    });
    CheckFirstLaunch();
    CheckHasProVersion();
    setIsAppReady(true);
  },[])

  async function CheckHasProVersion(){
    let hasPro = await GooglePlaySubscriptionService.userHasSubscription();
    SetHasProVersion(hasPro);
  }

  function CheckFirstLaunch(){
    GetIsFirstLaunch().then((f) => setShowTutorial(f ?? false));
  }

  const setTutorialDone = () =>{
    SetIsFirstLaunch(false); 
    setShowTutorial(false);
  }

  return (
    !showTutorial ? 
    <SplashScreen isAppReady={isAppReady}>
        <StatusBar
          animated={true}
          backgroundColor="#A4161A"/>
        <View style={styles.container}>
          {<Map />}
        </View>
        {hasProVersion && 
          <GoogleSignIn onGoogleSignIn={()=>{}} />
        }
        <Toast config={toastConfig}/>
    </SplashScreen>
    :
    <SplashScreen isAppReady={isAppReady}>
      <Tutorial onTutorialFinished={setTutorialDone}/>
    </SplashScreen> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default App;

