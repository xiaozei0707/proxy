var response = JSON.parse($response.body);
var innerBody = JSON.parse(response.responses[0].body);

var shopMaxSub = {
  "purchaseId": "123xxx321yyy1234567890",
  "purchaseDate": 1758267353,
  "purchasePrice": 249,
  "id": "gold_subscription",
  "itemName": "gold_subscription",
  "subscriptionInfo": {
    "currency": "USD",
    "expectedExpiration": 2758872153,
    "isFreeTrialPeriod": true,
    "isIntroOfferPeriod": false,
    "isInBillingRetryPeriod": false,
    "periodLength": 12,
    "price": 99999,
    "productId": "com.duolingo.DuolingoMobile.subscription.Gold.TwelveMonth.25Q2WB7D.Trial7.240",
    "renewer": "APPLE",
    "renewing": true,
    "tier": "twelve_month",
    "type": "gold",
    "vendorPurchaseId": "123456789012345",
    "promotionalOfferId": ""
  },
  "familyPlanInfo": {
    "ownerId": 1234567890,
    "secondaryMembers": [],
    "inviteToken": "1-AAAA-1234-MMMM-BBBB",
    "pendingInvites": [],
    "pendingInviteSuggestions": []
  }
};

var configMaxSub = {
  "subscriptionConfigs": [
    {
      "vendorPurchaseId": "123456789012345",
      "isInBillingRetryPeriod": false,
      "isInGracePeriod": false,
      "pauseStart": 2758872153,
      "pauseEnd": null,
      "productId": "com.duolingo.DuolingoMobile.subscription.Gold.TwelveMonth.25Q2WB7D.Trial7.240",
      "receiptSource": 1,
      "expirationTimestamp": 2758872153000,
      "isFreeTrialPeriod": true,
      "itemType": "gold_subscription"
    }
  ]
};

if (!innerBody.shopItems) {
    innerBody.shopItems = [];
}
innerBody.shopItems.push(shopMaxSub);

if (!innerBody.subscriptionConfigs) {
    innerBody.subscriptionConfigs = [];
}
innerBody.subscriptionConfigs.push(configMaxSub);

if (!innerBody.trackingProperties) {
    innerBody.trackingProperties = {};
}
innerBody.trackingProperties.has_item_gold_subscription = true;
innerBody.trackingProperties.monetizable_status = "free_trial_owner_max";

if (!innerBody.timerBoostConfig) {
    innerBody.timerBoostConfig = {};
}
innerBody.timerBoostConfig.timerBoosts = 8;
innerBody.timerBoostConfig.hasPurchasedTimerBoost = true;

innerBody.subscriberLevel = "GOLD";

response.responses[0].body = JSON.stringify(innerBody);
$done({ body: JSON.stringify(response) });
