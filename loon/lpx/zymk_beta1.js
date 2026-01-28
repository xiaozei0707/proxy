if ($request.url.includes("/gestureinfo")) {

  let body = JSON.parse($response.body);

  if (body && body.data) {
    Object.assign(body.data, {
      Uname: "Sarff0707",
      headpic: "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/xiaolian.png",
      isvip: 1,
      vipdate: 1,
      vipdays: 999,
      Uviptime: 32493812812000,
      Cgold: 999880,
      coins: 999880,
      Ulevel: 20
    });
  }

  $done({ body: JSON.stringify(body) });

} else if ($request.url.includes("/paychapters")) {

  let body = JSON.parse($response.body);
  body.status = 0;
  $done({ body: JSON.stringify(body) });

} else {
  $done({});
}
