import {useIsFocused } from '@react-navigation/native';
import { Card, Divider, Icon } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { GetSavedCountiesLocal, RemoveSavedCountyLocal, SavedCounty } from '../../services/AsyncStorageService'
import { RemoveNotificationSubscription } from '../../services/FirebaseContextService';
import ProVersionSignup from '../../components/ProVersionSignup';
import GooglePlaySubscriptionService from '../../services/GooglePlaySubscriptionService';
import { GetCountyData } from '../../services/FireBanContextService';
import Toast from 'react-native-toast-message';

const Favorites = ({ navigation }) => {
  const isFocused = useIsFocused();

  const [savedCounties, setSavedCounties] = useState(null as SavedCounty[] | null);
  const [hasProVersion, SetHasProVersion] = useState(false);
  const [countyData, SetCountyData] = useState([] as any);
  const [isPageReady, setIsPageReady] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0
  })

  useEffect(() => {
    if (isFocused) {
      let window = Dimensions.get('window');
      setDimensions({
        height: window.height,
        width: window.width
      })
      CheckHasProVersion().then(() => {
        GooglePlaySubscriptionService.userHasSubscription().then((hasPro) =>{
          SetHasProVersion(hasPro);
          if(hasPro){
            populateSavedCounties();
          }
        })
      })
    }
  }, [isFocused])

  async function CheckHasProVersion() {
    let hasPro = await GooglePlaySubscriptionService.userHasSubscription();
    SetHasProVersion(hasPro);
  }

  async function populateSavedCounties() {
    let tempSaved = (await GetSavedCountiesLocal() ?? []).sort((a, b) => (a.countyName < b.countyName ? -1 : 1));
    let tempArr: { county, state }[] = [];
    tempSaved?.forEach(element => {
      tempArr.push({ county: element.countyName, state: element.stateName })
    });
    GetCountyData(tempArr).then((countyData) => {
      SetCountyData(countyData);
      setSavedCounties(tempSaved);
      setIsPageReady(true);
    })
  }

  function GetIsBurnBan(county: string, state: string) {
    let foundCounty = countyData.filter(c => c.countyShortName === county && c.state === state)[0];
    return foundCounty?.isFireBan ?? false;
  }

  const showOnMap: any = (county: SavedCounty) => () => {
    if (!isScrolling) {
      navigation.jumpTo('Map', { navCounty: county });
    }
  }

  const OnToggleSave = (county: SavedCounty) => async () => {
    let success = false;
    success = await RemoveSavedCountyLocal(county.countyName, county.stateName);
    if (success) {
      success = await RemoveNotificationSubscription(county.countyName, county.stateName);
    }
    if (success) {
      Toast.show({ type: 'defaultToast', text1: county.countyName + ' removed from watch list', autoHide:true });
      setSavedCounties(await GetSavedCountiesLocal() ?? []);
    }
  }

  let isScrolling = false;

  return (
    hasProVersion ?
      <View style={{ marginBottom: 70 }}>
        <Text style={styles.header}>Watch List</Text>
        {(savedCounties?.length ?? 0) > 0 &&
          <ScrollView onScrollBeginDrag={() => { isScrolling = true }} onScrollEndDrag={() => { isScrolling = false }}>
            {savedCounties?.map((value, index) => {
              return (
                <TouchableOpacity key={index} onPress={showOnMap(value)}>
                  <Card containerStyle={styles.infoCard}>
                    <View>
                      <View style={styles.flexInline}>
                        <View style={styles.cardNameContainer}>
                          <Text style={styles.infoCardHeader}>{value.countyName} County, {value.stateName}</Text>
                        </View>
                        <View style={styles.favoriteButtonContainer}>
                          <Icon name='close' color='#A4161A' type="simple-line-icon" onPress={OnToggleSave(value)}></Icon >
                        </View>
                      </View>
                      <Divider width={2} style={styles.infoCardDivider} />
                      {GetIsBurnBan(value.countyName, value.stateName) ?
                        <View style={styles.flexInline}>
                          <Icon name="fire" color='#A4161A' type="material-community" size={24} style={styles.infoCardBurnBanIcon}></Icon>
                          <Text style={styles.infoCardBurnBan}>Burn Ban In Effect</Text>
                        </View>
                        :
                        <Text style={styles.infoCardBurnNotBan}>No Burn Ban</Text>
                      }
                    </View>
                  </Card>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        }
        {(savedCounties?.length ?? 0) === 0 &&
          <View>
            <Text style={styles.instructions}>No Counties In Watch List</Text>
            <Text style={styles.instructionsSub}>To add counties to your watch list, press the heart icon anywhere in the app</Text>
          </View>
        }
        {!isPageReady ?
        (<View style={{height:dimensions.height * 0.60, zIndex:1000}}>
          <ActivityIndicator
            size="large"
            color="#A4161A"
            style={styles.spinner} />
        </View>) : <View/>
        }
      </View>

      :
      <ScrollView>
        <Card>
          <Card.Title style={styles.subscribeHeader}>Pro Subscription Required</Card.Title>
          <Card.Divider />
          <Text style={[styles.subscribeText]}>Subscribe To Pro To Create A Watch List And Get Notified Of Burn Ban Status Changes</Text>
        </Card>
        <ProVersionSignup />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F3F4',
  },
  subscribeText:{
    color: '#161A1D',
    fontSize: 18,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  subscribeHeader:{
    color: '#A4161A',
    fontSize: 26,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  header: {
    color: '#161A1D',
    fontSize: 24,
    padding: 10,
    backgroundColor: '#F5F3F4',
    textAlign: 'center',
    margin:10,
    marginBottom:5
  },
  infoCard: {
    margin: 10,
    borderWidth: 0
  },
  flexInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 20,
    zIndex: 100
  },
  favoriteNameContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  infoCardHeader: {
    color: '#161A1D',
    fontSize: 24,
    marginBottom: 5
  },
  instructions: {
    color: '#B1A7A6',
    margin: 20,
    fontSize: 24,
    textAlign: 'center',
  },
  instructionsSub: {
    color: '#B1A7A6',
    margin: 20,
    fontSize: 20,
    textAlign: 'center',
  },
  infoCardDivider: {
    margin: 5
  },
  infoCardBurnBan: {
    color: '#A4161A',
    padding: 5,
    fontSize: 18
  },
  infoCardBurnBanIcon: {
    paddingLeft: 5,
    paddingTop: 5,
    paddingBottom: 5
  },
  infoCardBurnNotBan: {
    color: 'green',
    padding: 5,
    fontSize: 18
  },
  cardNameContainer:{
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  spinner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex:1000
  },
});

export default Favorites;

