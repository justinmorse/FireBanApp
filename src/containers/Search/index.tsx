import { useIsFocused } from '@react-navigation/native';
import { Card, Divider, Icon, } from '@rneui/base';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'
import {GetStates, GetCountyDataByState } from '../../services/FireBanContextService'
import { GetSavedCountiesLocal, AddSavedCountyLocal, RemoveSavedCountyLocal, SavedCounty} from '../../services/AsyncStorageService'
import { RemoveNotificationSubscription, SaveNotificationSubscription } from '../../services/FirebaseContextService';
import ProVersionSignup from '../../components/ProVersionSignup';
import GooglePlaySubscriptionService from '../../services/GooglePlaySubscriptionService';
import Toast from 'react-native-toast-message';

const Search = ({ navigation }) => {
  const isFocused = useIsFocused();

  const [states, setStates] = useState([] as {label, value}[]);
  const [savedCounties, setSavedCounties] = useState(null as SavedCounty[] | null);
  const [countyList, setCountyList] = useState([] as any[]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [isPageReady, setIsPageReady] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0
  })
  const [hasProVersion, SetHasProVersion] = useState(false);

  useEffect(() =>{
    let window = Dimensions.get('window');
    setDimensions({
      height: window.height,
      width: window.width
    })
      populateStates();
      setIsPageReady(true);
  }, [])

  useEffect(()=>{
    if(isFocused){
      setIsPageReady(false);
      GooglePlaySubscriptionService.userHasSubscription().then((isPro) =>{
        SetHasProVersion(isPro);
        if(isPro){
          populateSavedCounties();
          setIsPageReady(true);
        }
      })
    }
  }, [isFocused])

  async function populateStates() {
    const tempStates = await GetStates();
    var states:{label, value}[] = [];
    tempStates.forEach(s =>{
      states.push({label:s.name, value:s.abbreviation});
    })
    setStates(states);
  }

  async function populateSavedCounties() {
    setIsPageReady(false);
    let tempSaved = (await GetSavedCountiesLocal() ?? []).sort((a, b) => (a.countyName < b.countyName ? -1 : 1));
    setSavedCounties(tempSaved);
    setIsPageReady(true);
  }

  const showOnMap: any = (county) => () =>{
    if(!isScrolling){
      let latLng = JSON.parse(county.defaultCoordinates);
      let tempSavedCounty:SavedCounty = {
        countyName:county.countyShortName, 
        stateName: county.state,
        lat: latLng.lat,
        lng: latLng.lng,
        savedDate: null
      }
      navigation.jumpTo('Map', { navCounty: tempSavedCounty });
    }
  }

  const OnToggleSave = (county) => async () =>{
    let success = false;
    let latLng = JSON.parse(county.defaultCoordinates);
    if(isCountySaved(county)){
      success = await RemoveSavedCountyLocal(county.countyShortName, county.state);
      if(success){
        if(await RemoveNotificationSubscription(county.countyShortName, county.state)){
          Toast.show({ type: 'defaultToast', text1: county.countyShortName + ' Removed From Watch List', autoHide:true });
        };
      }
    }
    else{
      success = await AddSavedCountyLocal(county.countyShortName, county.state, latLng.lat, latLng.lng);
      if(success){
        if(await SaveNotificationSubscription(county.countyShortName, county.state)){
          Toast.show({ type: 'defaultToast', text1: county.countyShortName + ' Added To Watch List', autoHide:true });
        };
      }
    }
    setSavedCounties(await GetSavedCountiesLocal() ?? []);
  }

  async function GetCountiesByState(state){
    if(state){
      setIsPageReady(false);
      setCountyList([]);
      var counties = await GetCountyDataByState(state);
      setCountyList(counties)
      setIsPageReady(true);
    }
  };

  function isCountySaved(county){
    return (savedCounties?.filter(c => c.countyName === county.countyShortName && c.stateName === county.state)?.length ?? 0) > 0
  }

  let isScrolling = false;

  return (
    hasProVersion ? 
    <View style={{marginBottom:120}}>
      <Text style={styles.header}>Search</Text>
      <View style={{marginLeft:10, marginRight:10, marginBottom:5}}>
        <DropDownPicker
          placeholder="Select A State"
          placeholderStyle={{
            color: "grey",
          }}
          open={open}
          value={value}
          items={states}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setStates}
          onChangeValue={GetCountiesByState}
          />
      </View>
      {countyList.length > 0 ? (
        <ScrollView onScrollBeginDrag={() =>{isScrolling=true}} onScrollEndDrag={()=> {isScrolling=false}}>
          {countyList?.map((bbInfo, index) => {
          return (
              <TouchableOpacity key={index} onPress={showOnMap(bbInfo)}>
                <Card containerStyle={styles.infoCard}>
                <View>
                  <View style={styles.flexInline}>
                    <View style={styles.cardNameContainer}>
                      <Text style={styles.infoCardHeader}>{bbInfo.countyLongName}</Text>
                    </View>
                    { bbInfo.id !== -1 ? (
                      <View style={styles.cardButtonContainer}> 
                          <Icon name={isCountySaved(bbInfo) ? 'heart' : 'heart-o'} color='#A4161A' type="font-awesome" onPress={OnToggleSave(bbInfo)}></Icon >
                      </View> )
                    : 
                    <View></View>
                    }
                  </View>
                  <Divider width={2} style={styles.infoCardDivider} />
                  {bbInfo.Id !== -1 ? 
                    bbInfo.isFireBan ? 
                      <View style={styles.flexInline}>
                        <Icon name="fire" color='#A4161A' type="material-community" size={24} style={styles.infoCardBurnBanIcon}></Icon>
                        <Text style={styles.infoCardBurnBan}>Burn Ban In Effect</Text>
                        <Text style={styles.infoCardData}>{new Date(bbInfo.lastUpdated).toLocaleString()}</Text>
                      </View>
                      :
                      <Text style={styles.infoCardBurnNotBan}>No Burn Ban</Text>
                  :
                    <Text style={styles.infoCardHeader}>County Or State Not Supported</Text>
                  }
                  
                </View>
            </Card>
          </TouchableOpacity>
            )
          })}
        </ScrollView>
      ) :
      <Text style={styles.instructions}>Select A State To See All County Statuses</Text>
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
        <Text style={[styles.subscribeText]}>Subscribe To Pro To Search All Counties In A State</Text>
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
    textAlign:'center',
    margin:10,
    marginBottom:5
  },
  infoCard: {
    margin: 10,
    borderWidth: 0
  },
  infoCardHeader: {
    color: '#161A1D',
    fontSize: 18,
    marginBottom: 5
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
  infoCardData: {
    color: '#B1A7A6',
    fontSize: 14,
    margin: 8
  },
  infoCardWebsite: {
    color: 'blue',
    margin: 5
  },
  flexInline: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
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
  instructions: {
    color: '#B1A7A6',
    margin: 20,
    fontSize: 24,
    textAlign: 'center',
  },
  cardButtonContainer:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight:20,
    zIndex:100
  },
  cardNameContainer:{
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

});

export default Search;

