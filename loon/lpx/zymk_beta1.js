// ====== 安全兜底 ======
if (!$response || !$response.body) {
  $done({});
  return;
}

let url = $request.url;
let body;

// ====== 用户信息接口 ======
if (url.includes("gestureinfo")) {

  try {
    body = JSON.parse($response.body);
  } catch (e) {
    $done({});
    return;
  }

  if (body && body.data && typeof body.data === "object") {

    body.data.Uname = "Sarff0707";
    body.data.headpic = "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/xiaolian.png";

    body.data.isvip = 1;
    body.data.vipdate = 1;
    body.data.vipdays = 999;
    body.data.Uviptime = 32493812812000;

    body.data.Cgold = 999880;
    body.data.coins = 999880;
    body.data.Ulevel = 20;
  }

  $done({ body: JSON.stringify(body) });
  return;
}

// ====== 支付接口 ======
if (url.includes("paychapters")) {

  try {
    body = JSON.parse($response.body);
  } catch (e) {
    $done({});
    return;
  }

  body.status = 0;

  $done({ body: JSON.stringify(body) });
  return;
}

// ====== 其他接口放行 ======
$done({});
