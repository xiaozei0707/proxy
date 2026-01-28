if ($request.url.includes("/v1/guestinfo")) {
  let body = JSON.parse($response.body);
  body.data.isvip = 1;
  body.data.vipdays = 999;
  body.data.coins = 999880;
  body.data.Ulevel = 20;
  $done({ body: JSON.stringify(body) });
}

if ($request.url.includes("/paychapters")) {
  let body = JSON.parse($response.body);
  body.status = 0;
  $done({ body: JSON.stringify(body) });
}
