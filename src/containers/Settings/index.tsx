import React, { Component, useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from '@rneui/base';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info'
import GooglePlaySubscriptionService from '../../services/GooglePlaySubscriptionService';
import { useIsFocused } from '@react-navigation/native';
import { GetSavedCountiesLocal, RemoveSavedCountyLocal, SavedCounty } from '../../services/AsyncStorageService';
import { RemoveNotificationSubscription } from '../../services/FirebaseContextService';
import Toast from 'react-native-toast-message';

const Settings = ({navigation }) => {

  let version = DeviceInfo.getVersion();

  const [hasProVersion, SetHasProVersion] = useState(false);
  const isFocused = useIsFocused();
  
  useEffect(()=>{
    if(isFocused){
      CheckHasProVersion();
    }
  }, [isFocused])
  
  async function CheckHasProVersion(){
    let hasPro = await GooglePlaySubscriptionService.userHasSubscription();
    SetHasProVersion(hasPro);
  }
  

  const list = [
    {
      title: 'Subscribe to Pro',
      icon: 'account-circle',
      subtitle: 'Enable Pro Subscription',
      handler: handleSubscribeSubscription,
      visible: !hasProVersion
    },
    {
      title: 'Manage Pro Subscription',
      icon: 'account-circle',
      subtitle: 'Cancel Your Pro Subscription',
      handler: handleCancelSubscription,
      visible: hasProVersion
    },
    {
      title: 'Clear All Watch List Items',
      icon: 'delete',
      subtitle: 'Clear All Watch List Items To Stop Notifications',
      handler: handleClearWatchListItems,
      visible: true
    },
    {
      title: 'Review Tutorial',
      icon: 'preview',
      subtitle: 'Explorer The Tutorial Again',
      handler: handleReviewTutorial,
      visible: true
    }
  ]

  function handleCancelSubscription(){
    Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.firebanappreactnative&sku=arrowsoft_burnout_pro');
  }

  function handleSubscribeSubscription(){
    navigation.navigate('Subscribe');
  }

  async function handleClearWatchListItems(){
    var counties = (await GetSavedCountiesLocal()) ?? [];
    counties.forEach(async county => {
      let success = false;
      success = await RemoveSavedCountyLocal(county.countyName, county.stateName);
      if(success)
      {
        success = await RemoveNotificationSubscription(county.countyName, county.stateName);
      }
    });
    Toast.show({ type: 'defaultToast', text1:'Watch List Cleared', autoHide:true });
  }

  function handleReviewTutorial(){
    navigation.navigate('Tutorial')
  }


  return (
    <View style={styles.contentContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Settings</Text>
        {
          list.map((item, i) => {
            if (item.visible) 
              return (
                <ListItem key={i} bottomDivider onPress={item.handler}>
                  <Icon name={item.icon} />
                  <ListItem.Content>
                    <ListItem.Title>{item.title}</ListItem.Title>
                    <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
            )})
        }
      </View>
      <View style={styles.footer}>
        <Text style={{textAlign:"center"}}>Version: {version}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    color: '#161A1D',
    fontSize: 24,
    padding: 10,
    backgroundColor: '#F5F3F4',
    textAlign: 'center',
    marginBottom:5
  },
  contentContainer: {
    flex: 1, // pushes the footer to the end of the screen
    margin:5
  },
  footer: {
    height: 30,
  }
});

export default Settings;