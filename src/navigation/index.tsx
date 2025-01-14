
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Icon, Text } from "@rneui/themed";
import Map from '../containers/Map';
import Settings from "../containers/Settings";
import Favorites from '../containers/Favorites';
import Search from '../containers/Search'
import { TouchableOpacity } from 'react-native';
import ProVersionSignup from '../components/ProVersionSignup';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tutorial from '../components/Tutorial';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const focusedColor = '#A4161A';
const unfocusedColor = '#D3D3D3';

let nav;

function NavigatorStack(){
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false}} screenListeners={({ navigation }) => (nav = navigation)}>
        <Stack.Screen name="Tabs" component={BottomTabs} />
        <Stack.Screen name="Subscribe" component={ProVersionSignup} />
        <Stack.Screen name='Tutorial' options={{ title: 'Tutorial' }}>
          {(props) => <Tutorial {...props} onTutorialFinished={() => nav.navigate("Map")} />}
</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );

}

function BottomTabs() {
  return (
      <Tab.Navigator 
        screenOptions={{ headerShown: false, tabBarShowLabel:true}} 
        screenListeners={({ navigation }) => ({
          tabLongPress: (e) => {
            navigation.jumpTo(e?.target?.split('-')[0]); //This is needed for a bug in the component when connected to the debugger
          },
        })}>
        <Tab.Screen 
          name="Map"
          component={Map}
          options={{
            tabBarIcon: ({ size, focused }) => (
              <Icon name="compass" type='simple-line-icon' color={focused ? focusedColor: unfocusedColor} size={size} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{color: focused ? focusedColor: unfocusedColor}}>Map</Text>
            ),
            tabBarButton: props => <TouchableOpacity {...props} />
          }}/>
        <Tab.Screen 
          name="Watch List" 
          component={Favorites} 
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon name="heart" type="simple-line-icon" color={focused ? focusedColor: unfocusedColor} size={size} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{color: focused ? focusedColor: unfocusedColor}}>Watch List</Text>
            ),
            tabBarButton: props => <TouchableOpacity {...props} />
        }}/>
        <Tab.Screen 
          name="Search" 
          component={Search} 
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon name="magnifier" type="simple-line-icon" color={focused ? focusedColor: unfocusedColor} size={size} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{color: focused ? focusedColor: unfocusedColor}}>Search</Text>
            ),
            tabBarButton: props => <TouchableOpacity {...props} />
        }}/>
        <Tab.Screen 
          name="Settings" 
          component={Settings}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon name="settings" type="simple-line-icon" color={focused ? focusedColor: unfocusedColor} size={size} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text style={{color: focused ? focusedColor: unfocusedColor}}>Settings</Text>
            ),
            tabBarButton: props => <TouchableOpacity {...props} />
        }}/>
      </Tab.Navigator>
  );
}
  
export default NavigatorStack;