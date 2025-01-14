import { endConnection, flushFailedPurchasesCachedAsPendingAndroid, getAvailablePurchases, getSubscriptions, initConnection, requestSubscription, SubscriptionAndroid, SubscriptionPurchase, RequestSubscriptionAndroid, purchaseUpdatedListener, finishTransaction, ProductPurchase, purchaseErrorListener, PurchaseError, promotedProductListener } from "react-native-iap";
import Toast from 'react-native-toast-message';
import RNRestart from 'react-native-restart';

class GooglePlaySubscriptionService {

    static allSubscriptions: SubscriptionAndroid[] = [];
    static userSubscriptions: SubscriptionPurchase[] | null = null
    static isInititalized: boolean = false;
    static purchaseUpdateSubscription = purchaseUpdatedListener(
        async (
            purchase: SubscriptionPurchase | ProductPurchase,
        ) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
                // If not consumable
                await finishTransaction({ purchase: purchase, isConsumable: false });
                RNRestart.Restart(); //Restart the app after all transactions
            }
        });
    static purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
            Toast.show({ type: 'defaultToast', text1:"Purchase Failed", autoHide:true });
        },
      );;

    static initializeGooglePlaySubscription = async () => {
        let success = false;
        if (this.isInititalized)
            return true;
        else {
            success = await initConnection()
            if (success) {
                this.isInititalized = true;
                await flushFailedPurchasesCachedAsPendingAndroid()
            }
            return success;
        }
    }

    static disconnectGooglePlaySubscription = async () => {
        if (!this.isInititalized)
            return true;
        else {
            return await endConnection();
        }
    }

    static getAllSubscriptions = async () => {
        this.allSubscriptions = await getSubscriptions({ skus: ["arrowsoft_burnout_pro"] });
    }

    static getUserSubscriptions = async () => {
        const availablePurchases = await getAvailablePurchases();
        this.userSubscriptions = availablePurchases;
    }

    static userHasSubscription = async () => {
        if (!this.userSubscriptions) {
            await this.getUserSubscriptions();
        }
        return (this.userSubscriptions?.length ?? 0) > 0;
    }

    static async purchaseMonthSubscription() {
        let name = 'arrowsoft-burnout-pro-base-monthly';
        let token = this.getSubscriptionOfferToken(name);
        await this.requestSubscriptionPurchase(token);
       
    }

    static async purchaseYearSubscription() {
        let name = 'arrowsoft-burnout-pro-base-yearly';
        let token = this.getSubscriptionOfferToken(name);
        await this.requestSubscriptionPurchase(token);
    }

    static getSubscriptionOfferToken(productName:string){
        var monthly = productName === 'arrowsoft-burnout-pro-base-monthly'
        let subscription = this.allSubscriptions[0];
        if(subscription){
            let subscriptionOfferDetails = subscription.subscriptionOfferDetails;
            if(subscriptionOfferDetails){
                subscriptionOfferDetails.forEach(s => {
                    let pricing = s.pricingPhases;
                    if(monthly && pricing.pricingPhaseList.filter(p => p.billingPeriod === 'P1M').length > 0){
                         return s.offerToken;
                    }
                    else if(!monthly && pricing.pricingPhaseList.filter(p => p.billingPeriod === 'P1Y').length > 0){
                        return s.offerToken;
                    }
                })
            }
        }
        return '';
    }

    static async requestSubscriptionPurchase(offerToken: string) {
        let sku = 'arrowsoft_burnout_pro'
        try {
            await requestSubscription({ sku:sku, subscriptionOffers: [{sku, offerToken}]});
        } catch (err) {
            Toast.show({ type: 'defaultToast', text1:"Purchase Failed", autoHide:true });
        }
    }
}

export default GooglePlaySubscriptionService;