import { lightColors, PricingCard } from "@rneui/base"
import React from "react"
import { ScrollView, View } from "react-native"
import GooglePlaySubscriptionService from "../services/GooglePlaySubscriptionService"

const ProVersionSignup = () => {

    const purchaseYearlySubscription = () => {
        GooglePlaySubscriptionService.purchaseYearSubscription();
    } 

    const purchaseMonthlySubscription = () => {
        GooglePlaySubscriptionService.purchaseMonthSubscription();
    }

    return (
        <ScrollView>
            <PricingCard
                color={'#A4161A'}
                title="BurnOut Pro"
                price="99¢/Month"
                info={['**14 Day Free Trial**', 
                'Navigate The Map To Select Locations By Dragging And Clicking', 
                'Autocomplete Search From The Map Screen', 
                'Save Counties To Your Watch List For Easy Burn Ban Status Lookup', 
                'Get Notifications Of Burn Ban Status Changes For Your Watched Counties']}
                button={{ title: 'SUBSCRIBE'}}
                onButtonPress={purchaseMonthlySubscription}
            />
            {/* <PricingCard
                color={'#A4161A'}
                title="Pro Yearly"
                price="$9.99/Year"
                info={['**BEST VALUE**','14 Day Free Trial','Same Features As Montly Subscription', 'Navigate The Map To Select Locations', 'Map Screen Autocomplee Search', 'Save Counties To Your Watch List', 'Get Notifications Of Burn Ban Status Changes For Your Watched Counties']}
                button={{ title: 'SUBSCRIBE'}}
                onButtonPress={purchaseYearlySubscription}
            /> */}
        </ScrollView>
    )
}

export default ProVersionSignup
