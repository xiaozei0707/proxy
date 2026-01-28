// ===== 用户信息接口 =====
if ($request.url.includes("/v1/gestureinfo/")) {

  let body = JSON.parse($response.body);

  // 伪造用户数据（VIP / 金币 / 等级）
  Object.assign(body.data, {
    Uname: "Sarff0707",
    headpic: "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/xiaolian.png",

    isvip: 1,           // 是否 VIP
    vipdate: 1,         // VIP 状态
    vipdays: 999,       // VIP 天数
    Uviptime: 32493812812000, // VIP 到期时间（极大值）

    Cgold: 999880,      // 金币
    coins: 999880,      // 余额
    Ulevel: 20          // 用户等级
  });

  $done({
    body: JSON.stringify(body)
  });

// ===== 支付章节接口 =====
} else if ($request.url.includes("/paychapters/")) {

  let body = JSON.parse($response.body);

  // 强制支付成功
  body.status = 0;

  $done({
    body: JSON.stringify(body)
  });
}
