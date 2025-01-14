import React from 'react';
import { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef} from 'react-native-google-places-autocomplete';

// @ts-ignore 
navigator.geolocation = require('@react-native-community/geolocation')

interface AutocompleteProps{
  autocompleteHandler:Function,
  isDisabled: boolean
}

const Autocomplete = (props:AutocompleteProps) => {
    const autoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
    const apiKey = 'AIzaSyDTnaCGKC2CsuUW1pk_4-07h4R7eeabaWw';

    // const [predictionText, setPredictionText] = React.useState({
    //     predictionText: "",
    //   });

    async function predictionSelectionChanged(prediction){
        var place_id = prediction.place_id;
        autoCompleteRef.current?.setAddressText('');
        props.autocompleteHandler(place_id);
      }

    return (
      !props.isDisabled ?
        <GooglePlacesAutocomplete ref={autoCompleteRef}
          placeholder='Search'
          minLength={3}
          listViewDisplayed='auto'    // true/false/undefined
          currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
          currentLocationLabel="Current location"
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            predictionSelectionChanged(data);
          }}
          query={{
            key: apiKey,
            language: 'en',
            components: 'country:us',
          }}
          styles={styles}
          />
      :
      <TouchableOpacity style={styles.textInputContainer} onPress={() => props.autocompleteHandler('disabled')}>
        <TextInput selectTextOnFocus={false} editable={false} placeholder='Search' style={styles.textInput}></TextInput>
      </TouchableOpacity>
    )
}
    const styles = StyleSheet.create({
        textInputContainer:{
            backgroundColor: '#F5F3F4',
            borderTopWidth: 0,
            borderBottomWidth:0,
            zIndex:999,
            width:'100%',
        },
        textInput: {
            margin: 10,
            height: 45,
            color: '#161A1D',
            fontSize: 16,
            borderWidth:1,
            zIndex:999,
            backgroundColor:'white',
          },
          predefinedPlacesDescription: {
            color: '#1161A1D'
          },
          listView:{
              top:45.5,
              zIndex:10,
              position: 'absolute',
              color: '#161A1D',
              backgroundColor:"#161A1D",
              width:'100%',
          },
          separator:{
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: 'blue',
          },
          description:{
            flexDirection:"row",
            flexWrap:"wrap",
            fontSize:14,
            maxWidth:'100%',
          },
          row:{
            color: '#161A1D'
          }
        });


export default Autocomplete