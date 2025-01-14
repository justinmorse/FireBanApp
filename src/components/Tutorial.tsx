import { Divider} from "@rneui/base";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { HasGpsPermissions, HasNotificationPermission } from "../services/PermissionsService";
import { Button } from "@rneui/themed";
const { height, width } = Dimensions.get('window');

interface TutorialProps {
    onTutorialFinished: Function
}

const Tutorial = (props: TutorialProps) => {
    useEffect(() => {
        checkPermissions()
    }, [])

    const [tutorialPage, setTutorialPage] = useState(1);
    useEffect(() => {
        if (tutorialPage === 99) {
            props.onTutorialFinished();
        }
    }, [tutorialPage])

    async function checkPermissions() {
        await HasGpsPermissions().then(async () => {
          await HasNotificationPermission();
        });
      }



    return (
        <View>
          <StatusBar animated={true} backgroundColor="#A4161A"/>
            {tutorialPage === 1 &&
                <View style={styles.titleContainer}>
                    <Image source={require("../assets/logo.png")} style={styles.logo} />
                    <Text style={[styles.welcomeHeader, { color: '#161A1D', marginBottom: 15 }]}>Welcome to BurnOut!</Text>
                    <Text style={[styles.tutorialSubHeader, { color: '#161A1D', marginBottom: 15 }]}>Would You Like To View The Tutorial?</Text>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Start" setTutorialPage={setTutorialPage} pageNumber={2}></TutorialNavButton>
                        <TutorialNavButton title="Skip" setTutorialPage={setTutorialPage} pageNumber={99}></TutorialNavButton>
                    </View>

                </View>
            }
            {tutorialPage !== 1 && tutorialPage != 9 &&
                <View>
                    <Text style={styles.header}>Tutorial</Text>
                </View>
            }
            {tutorialPage === 2 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>Easily See If A County Has A Burn Ban</Text>
                    <Divider width={2} style={styles.divider} />
                    <Text style={styles.tutorialSubHeader}>Pro Version Only</Text>
                    <Text style={styles.tutorialSubHeader}>Click Around The Map To Select Other Locations</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/MapBurnBan.png")} style={styles.screenshotFull}></Image>
                    </View>
                    <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={3}></TutorialNavButton>
                </View>
            }

            {tutorialPage === 3 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>A County Shows Green When There Is No Burn Ban</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/MapNoBurnBan.png")} style={styles.screenshotFull}></Image>
                    </View>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Back" setTutorialPage={setTutorialPage} pageNumber={2}></TutorialNavButton>
                        <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={4}></TutorialNavButton>
                    </View>
                </View>
            }

            {tutorialPage === 4 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>Search For Any Location And Instantly See The Burn Ban Status</Text>
                    <Divider style={styles.divider} width={2}></Divider>
                    <Text style={styles.tutorialSubHeader}>Pro Version Only</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/MapSearchDropdown.png")} style={styles.screenshotFull}></Image>
                    </View>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Back" setTutorialPage={setTutorialPage} pageNumber={3}></TutorialNavButton>
                        <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={5}></TutorialNavButton>
                    </View>
                </View>
            }

            {tutorialPage === 5 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>Save A County To The Watch List And Get Notifications On Burn Ban Stautus Changes</Text>
                    <Divider style={styles.divider} width={2}></Divider>
                    <Text style={styles.tutorialSubHeader}>Pro Version Only</Text>
                    <Text style={styles.tutorialSubHeader}>Click The Heart Icon Anywhere To Add Or Remove Counties From The Watch List</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/MapSavedCounty.png")} style={styles.screenshotPartial}></Image>
                    </View>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Back" setTutorialPage={setTutorialPage} pageNumber={4}></TutorialNavButton>
                        <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={6}></TutorialNavButton>
                    </View>
                </View>
            }

            {tutorialPage === 6 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>Quickly Go To Your Saved Counties From The Watch List</Text>
                    <Divider style={styles.divider} width={2}></Divider>
                    <Text style={styles.tutorialSubHeader}>Pro Version Only</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/WatchList.png")} style={styles.screenshotFull}></Image>
                    </View>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Back" setTutorialPage={setTutorialPage} pageNumber={5}></TutorialNavButton>
                        <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={7}></TutorialNavButton>
                    </View>
                </View>
            }

            {tutorialPage === 7 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>Pick A State From The Search Screen To See Burn Ban Statuses Of All Counties</Text>
                    <Divider style={styles.divider} width={2}></Divider>
                    <Text style={styles.tutorialSubHeader}>Pro Version Only</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/SearchScreenPickState.png")} style={styles.screenshotPartial}></Image>
                    </View>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Back" setTutorialPage={setTutorialPage} pageNumber={6}></TutorialNavButton>
                        <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={8}></TutorialNavButton>
                    </View>
                </View>
            }

            {tutorialPage === 8 &&
                <View style={styles.container}>
                    <Text style={styles.tutorialHeader}>Click On A County To Go To The Map View Or Add And Remove Counties From The Watch List</Text>
                    <Divider style={styles.divider} width={2}></Divider>
                    <Text style={styles.tutorialSubHeader}>Pro Version Only</Text>
                    <View style={{ backgroundColor: '#D3D3D3', marginBottom: 10 }}>
                        <Image source={require("../assets/screenshots/SearchScreenResults.png")} style={styles.screenshotFull}></Image>
                    </View>
                    <View style={styles.flexInline}>
                        <TutorialNavButton title="Back" setTutorialPage={setTutorialPage} pageNumber={7}></TutorialNavButton>
                        <TutorialNavButton title="Next" setTutorialPage={setTutorialPage} pageNumber={99}></TutorialNavButton>
                    </View>
                </View>
            }
        </View>
    )

}

interface TutorialNavProps{
    pageNumber:number,
    title,
    setTutorialPage:Function
}
const TutorialNavButton = (props:TutorialNavProps) => {
    return (
        <Button 
            title={props.title}
            buttonStyle={styles.navButton} 
            titleStyle={{ color: 'white', marginHorizontal: 20 }} 
            containerStyle={{
                width: 150,
                marginHorizontal: 30,
                marginVertical: 10,
            }} 
            onPress={() => { props.setTutorialPage(props.pageNumber) }}>
        </Button>
    )
}

const styles = StyleSheet.create({
    container: {
        //...StyleSheet.absoluteFillObject,
        height: height,
        backgroundColor: '#F5F3F4',
        alignItems: "center",
        justifyContent: "flex-start",
    },
    titleContainer:{
        height: height,
        backgroundColor: '#F5F3F4',
        alignItems: "center",
        justifyContent: "center",
    },
    navButton: {
        //margin: 20,
        backgroundColor: '#A4161A',
        //paddingTop: 5,
        //paddingBottom: 5,
        //paddingLeft: 20,
        //paddingRight: 20
    },
    welcomeHeader: {
        fontSize: 26,
        color: '#161A1D',
        margin: 20,
        textAlign: 'center'
    },
    welcomeSubHeader: {
        fontSize: 16,
        color: '#161A1D',
        marginBottom: 20,
        textAlign: 'center'
    },
    tutorialHeader: {
        fontSize: 20,
        color: '#161A1D',
        margin: 20,
        textAlign: 'center'
    },
    tutorialSubHeader: {
        fontSize: 16,
        color: '#161A1D',
        marginBottom: 20,
        textAlign: 'center'
    },
    logo: {
        width: 150,
        height: 150,
    },
    screenshotFull: {
        width: width * .5,
        height: height * .5,
        margin: 15
    },
    screenshotPartial: {
        width: width * .75,
        height: height * .25,
        margin: 15
    },
    divider: {
        margin: 5,
        width: 200
    },
    flexInline: {
        //flexWrap: 'wrap',
        alignItems: "center",
        flexDirection: 'row',
    },
    header: {
        color: '#F5F3F4',
        fontSize: 24,
        padding: 10,
        backgroundColor: '#A4161A',
        textAlign: 'center'
    },
    googlePlayIcon:{
        width:100,
        height: 100
    }
});
export default Tutorial;