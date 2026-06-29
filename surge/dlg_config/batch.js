var body = $response.body || "";

try {
  var response = JSON.parse(body);
  var responses = Array.isArray(response.responses) ? response.responses : [];
  var changed = false;

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

  var subscriptionConfig = {
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
  };

  for (var i = 0; i < responses.length; i++) {
    var item = responses[i];
    if (!item || typeof item.body !== "string" || item.body.length === 0) {
      continue;
    }

    var innerBody;
    try {
      innerBody = JSON.parse(item.body);
    } catch (_) {
      continue;
    }

    if (!innerBody || typeof innerBody !== "object") {
      continue;
    }

    if (!Array.isArray(innerBody.shopItems)) {
      innerBody.shopItems = [];
    }

    if (!Array.isArray(innerBody.subscriptionConfigs)) {
      innerBody.subscriptionConfigs = [];
    }

    if (!innerBody.trackingProperties || typeof innerBody.trackingProperties !== "object") {
      innerBody.trackingProperties = {};
    }

    if (!innerBody.timerBoostConfig || typeof innerBody.timerBoostConfig !== "object") {
      innerBody.timerBoostConfig = {};
    }

    var hasGoldSubscription = false;
    for (var j = 0; j < innerBody.shopItems.length; j++) {
      if (innerBody.shopItems[j] && innerBody.shopItems[j].id === "gold_subscription") {
        hasGoldSubscription = true;
        break;
      }
    }

    if (!hasGoldSubscription) {
      innerBody.shopItems.push(shopMaxSub);
    }

    var hasSubscriptionConfig = false;
    for (var k = 0; k < innerBody.subscriptionConfigs.length; k++) {
      if (innerBody.subscriptionConfigs[k] && innerBody.subscriptionConfigs[k].itemType === "gold_subscription") {
        hasSubscriptionConfig = true;
        break;
      }
    }

    if (!hasSubscriptionConfig) {
      innerBody.subscriptionConfigs.push(subscriptionConfig);
    }

    innerBody.trackingProperties.has_item_gold_subscription = true;
    innerBody.subscriberLevel = "GOLD";
    innerBody.trackingProperties.monetizable_status = "free_trial_owner_max";
    innerBody.timerBoostConfig.timerBoosts = 8;
    innerBody.timerBoostConfig.hasPurchasedTimerBoost = true;

    item.body = JSON.stringify(innerBody);
    changed = true;
  }

  if (changed) {
    $done({ body: JSON.stringify(response) });
  } else {
    $done({ body: body });
  }
} catch (_) {
  $done({ body: body });
}
