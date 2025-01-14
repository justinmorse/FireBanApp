import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Dimensions, ScaledSize, Linking, TouchableOpacity } from 'react-native';
import MapView, { LatLng, Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { reverseGeocode, Geocode, ParseGeocodeInfo } from '../../services/GeocoderService';
import { GetCountyData } from '../../services/FireBanContextService';
import { Divider, Card, Icon, Dialog } from "@rneui/themed";
import Autocomplete from '../../components/Autocomplete';
import { GetSavedCountiesLocal, AddSavedCountyLocal, RemoveSavedCountyLocal, SavedCounty, GetIsWarningAccepted, SetIsWarningAccepted} from '../../services/AsyncStorageService'
import { RemoveNotificationSubscription, SaveNotificationSubscription } from '../../services/FirebaseContextService';
import { useIsFocused } from '@react-navigation/native';
import GooglePlaySubscriptionService from '../../services/GooglePlaySubscriptionService';
import Toast from 'react-native-toast-message';

const Map = ({ route, navigation }) => {
  const apiKey = 'AIzaSyDTnaCGKC2CsuUW1pk_4-07h4R7eeabaWw';
  let window: ScaledSize = Dimensions.get('window');
  const params = route.params;
  const isFocused = useIsFocused();
  const [hasProVersion, SetHasProVersion] = useState(false);
  const [isProSubscriptionDialogVisible, setIsProSubscriptionDialogVisible] = useState(false);
  const [isAcceptanceDialogVisible, _setIsAcceptanceDialogVisible] = useState(true);
  function setIsAcceptanceDialogVisible(isVisible: boolean) {
    if(!isVisible && isPageReady){
      SetIsWarningAccepted(true);
    }
    _setIsAcceptanceDialogVisible(isVisible);
  }

  useEffect(() => {
    if (!isPageReady) {
      window = Dimensions.get('window');
      setDimensions({
        height: window.height - 50,
        width: window.width
      })
      postGPSPermission(true);
    }
    CheckHasProVersion().then(() => {
      if (hasProVersion)
        populateSavedCounties();
    })
  }, [])

  useEffect(() => {
    if (params) {
      setIsPageReady(false);
      populateSavedCounties();
      setLatLng(params.navCounty.lat, params.navCounty.lng);
    }
  }, [params])

  useEffect(() => {
    if (isFocused) {
      CheckHasProVersion();
      CheckHasAcceptedWarning();
      populateSavedCounties();
    }
  }, [isFocused])

  var a: SavedCounty[] = []
  const [savedCounties, setSavedCounties] = useState(a)

  useEffect(() => {
    let index = savedCounties.findIndex(x => x.countyName === bbInfo.CountyShortName && x.stateName === bbInfo.State);
    setIsCurrentCountySaved(index !== -1);
  }, [savedCounties])

  const [mapRegion, setMapRegion] = useState({
    latitude: 39.7392,
    longitude: -104.9903,
    latitudeDelta: 2,
    longitudeDelta: 2,
  })

  const [dimensions, setDimensions] = useState({
    height: window.height,
    width: window.width
  })

  const [bbInfo, setBurnBanInfo] = useState({
    CountyShortName: 'Loading',
    CountyLongName: 'Loading',
    State: '',
    IsFireBan: false,
    CountyUrl: '',
    Coordinates: '',
    Metadata: '',
    LastUpdated: '',
    supported: true
  })

  const [isPageReady, setIsPageReady] = useState(false);

  const [isCurrentCountySaved, setIsCurrentCountySaved] = useState(false);

  const [markers, setMarkers] = useState(
    [
      { latitude: 0, longitude: 0 }
    ]
  )

  var d: LatLng[] = [{ latitude: 0, longitude: 0 }]
  const [polygon, setPolygon] = useState(d);

  const setPlaceId = useCallback((newPlaceId) => {
    if(newPlaceId === 'disabled'){
      setIsProSubscriptionDialogVisible(true);
    }
    else{
      GooglePlaySubscriptionService.userHasSubscription().then((hasSubscrition) => {
        if (hasSubscrition) {
          Geocode(newPlaceId, apiKey).then(g => {
            setIsPageReady(false);
            parseGeocodeInfo(g.data.results[0].geometry.location.lat, g.data.results[0].geometry.location.lng, g);
          }
          )
        }
        else {
          setIsProSubscriptionDialogVisible(true);
        }
    })
  }
  }, []);

  async function CheckHasAcceptedWarning(){
    var isAccepted = await GetIsWarningAccepted();
    setIsAcceptanceDialogVisible(!isAccepted);
  }

  async function CheckHasProVersion() {
    SetHasProVersion(await GooglePlaySubscriptionService.userHasSubscription());
  }

  async function populateSavedCounties() {
    setSavedCounties(await GetSavedCountiesLocal() ?? []);
  }

  async function postGPSPermission(canUseGPS) {
    if (canUseGPS) {
      getCurrentPosition();
    }
    else {
      Toast.show({ type: 'defaultToast', text1:'Please turn on GPS to get location', autoHide:true });
    }
  }

  async function getCurrentPosition() {
    Geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude
        setLatLng(lat, lng)
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  function setLatLng(lat, lng) {
    reverseGeocode(lat, lng, true, 'en_US', 5, apiKey)
      .then(resp => {
        parseGeocodeInfo(lat, lng, resp);
      }
      );
  }

  async function parseGeocodeInfo(lat, lng, geocodeResponse) {
    if (geocodeResponse) {
      try {
        const countyState = ParseGeocodeInfo(geocodeResponse);
        await GetCountyData([{county:countyState?.county ?? "", state:countyState?.state ?? ""}]).then(cd => {
          var burnBanInfo = cd[0];
          let countyName = ""
          if (!burnBanInfo.countyShortName)
            countyName = "No County Found";
          else
            countyName = burnBanInfo.id !== -1 ? burnBanInfo.countyLongName : burnBanInfo.countyShortName + ' County, ' + burnBanInfo.state;
          const info = {
            CountyShortName: burnBanInfo.countyShortName,
            CountyLongName: countyName,
            State: burnBanInfo.state ?? '',
            IsFireBan: burnBanInfo.isFireBan ?? false,
            CountyUrl: burnBanInfo.countyURL ?? '',
            Coordinates: burnBanInfo.coordinates ?? '',
            Metadata: burnBanInfo.metadata ?? '',
            LastUpdated: burnBanInfo.lastUpdated ? new Date(burnBanInfo.lastUpdated + 'Z')?.toLocaleString() : '',
            supported: (burnBanInfo.id !== -1)
          }
          setBurnBanInfo(info);
          let index = savedCounties.findIndex(x => x.countyName === info.CountyShortName && x.stateName === info.State);
          setIsCurrentCountySaved(index !== -1);
          setMapRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 1,
              longitudeDelta: 1,
            })
          setMarkers([{ latitude: lat, longitude: lng }]);
          if (info.Coordinates !== '') {
            var polygonArr = JSON.parse(info.Coordinates)[0];
            var polygonObjs: { latitude, longitude }[] = [];
            polygonArr.forEach(element => {
              var latLng: LatLng = {
                latitude: element[1],
                longitude: element[0],
              }
              polygonObjs.push(latLng);
            });
            setPolygon(polygonObjs);
          }
        })
      }
      catch (err) {
        Toast.show({ type: 'defaultToast', text1:'Error connecting to burn ban data', autoHide:true });
      }
      finally {
        setIsPageReady(true);
      }
    }
  }

  async function OnToggleSave() {
    if (hasProVersion) {
      let success = false;
      if (isCurrentCountySaved) {
        success = await RemoveSavedCountyLocal(bbInfo.CountyShortName, bbInfo.State);
        if (success) {
          if (await RemoveNotificationSubscription(bbInfo.CountyShortName, bbInfo.State)) {
            Toast.show({ type: 'defaultToast', text1:bbInfo.CountyShortName + ' removed from watch list', autoHide:true });
          };
        }
      }
      else {
        success = await AddSavedCountyLocal(bbInfo.CountyShortName, bbInfo.State, mapRegion.latitude, mapRegion.longitude);
        if (success) {
          if (await SaveNotificationSubscription(bbInfo.CountyShortName, bbInfo.State)) {
            Toast.show({ type: 'defaultToast', text1:bbInfo.CountyShortName + ' added to watch list', autoHide:true });
          };
        }
      }

      if (success) {
        setIsCurrentCountySaved(!isCurrentCountySaved);
      }
      setSavedCounties(await GetSavedCountiesLocal() ?? []);
    }
    else {
      setIsProSubscriptionDialogVisible(true);
    }
  }

  const onMapPress = (event) => {
    if (isPageReady) {
      if (hasProVersion) {
        var coordinates = event.nativeEvent.coordinate;
        setIsPageReady(false);
        setLatLng(coordinates.latitude, coordinates.longitude)
      }
      else {
        setIsProSubscriptionDialogVisible(true);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Autocomplete autocompleteHandler={setPlaceId} isDisabled={!hasProVersion} />
      <MapView
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        style={{
          width: dimensions.width - 20,
          height: Math.ceil(dimensions.height * .6),
          marginLeft:10
        }}
        onPress={(e) => onMapPress(e)}>
        {markers.map((val, index) => {
          return (<Marker
            coordinate={{
              latitude: val.latitude,
              longitude: val.longitude
            }}
            key={index}
          />);
        })}
        <Polygon coordinates={polygon} fillColor={bbInfo.IsFireBan ? '#A4161A' : 'green'} />
      </MapView>

      <View style={{
        width: dimensions.width,
        height: Math.ceil(dimensions.height * .3),
      }}>
        <Card containerStyle={styles.infoCard}>
          <View>
            <View style={styles.flexInline}>
              <Text style={styles.infoCardHeader}>{bbInfo.CountyLongName}</Text>
              {bbInfo.supported ? (
                <View style={{ margin: 5 }}>
                  <Icon name={isCurrentCountySaved ? 'heart' : 'heart-o'} color='#A4161A' type="font-awesome" onPress={OnToggleSave}></Icon >
                </View>)
                :
                <View></View>
              }
            </View>
            <Divider width={2} style={styles.infoCardDivider} />
            {bbInfo.supported ?
              bbInfo.IsFireBan ?
                <View style={styles.flexInline}>
                  <Icon name="fire" color='#A4161A' type="material-community" size={35}></Icon>
                  <Text style={styles.infoCardBurnBan}>Burn Ban In Effect</Text>
                  <Text style={styles.infoCardData}>{new Date(bbInfo.LastUpdated).toLocaleString()}</Text>
                </View>
                :
                <Text style={styles.infoCardBurnNotBan}>No Burn Ban</Text>
              :
              <Text style={styles.infoCardHeader}>County Or State Not Supported</Text>
            }
            {bbInfo.supported ?? <Text style={styles.infoCardData}>{bbInfo.LastUpdated}</Text>}

          </View>

          <Divider width={2} style={styles.infoCardDivider} />
          <Text style={styles.infoCardData}>For more info, please visit the county website.</Text>
          {bbInfo.CountyUrl != '' &&
            <Text style={styles.infoCardWebsite}
              onPress={() => Linking.openURL(bbInfo.CountyUrl)}>
              County Website
            </Text>
          }
        </Card>
      </View>
      {!isPageReady ?
        <ActivityIndicator
          size="large"
          color="#A4161A"
          style={styles.spinner} />
        : <View />
      }

      <Dialog isVisible={isProSubscriptionDialogVisible} onBackdropPress={()=> setIsProSubscriptionDialogVisible(false)}>
        <Dialog.Title title="Pro Subscription Needed" />
        <Text>The Feature Requires A Pro Subscription. Purchase Pro?</Text>
        <Dialog.Actions>
          <Dialog.Button title="SUBSCRIBE" onPress={() => navigation.navigate('Subscribe')} />
          <Dialog.Button title="CANCEL" onPress={() => setIsProSubscriptionDialogVisible(false)} />
        </Dialog.Actions>
      </Dialog>

      <Dialog isVisible={isAcceptanceDialogVisible}>
        <Dialog.Title title="Please Read" />
        <Text>BurnOut uses data from multiple sources to determine the burn ban status of counties in the United States. 
          This data is not maintained by the developers of BurnOut, only aggregated, and is not guaranteed to be accurate. 
          Please contact your county or state officials to verify burn ban statuses.
          By clicking "ACCEPT", you understand that this data is for informational use only.
        </Text>
        <Dialog.Actions>
          <Dialog.Button title="ACCEPT" onPress={() => setIsAcceptanceDialogVisible(false)} />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F3F4',
    alignContent:"center",
  },
  infoCard: {
    margin: 10,
    borderWidth: 0
  },
  infoCardHeader: {
    color: '#161A1D',
    fontSize: 24,
    marginBottom: 5
  },
  infoCardDivider: {
    margin: 5
  },
  infoCardBurnBan: {
    color: '#A4161A',
    padding: 5,
    fontSize: 24
  },
  infoCardBurnNotBan: {
    color: 'green',
    padding: 5,
    fontSize: 24
  },
  infoCardData: {
    color: '#B1A7A6',
    fontSize: 14,
    margin: 5
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
  }

});

export default Map;
