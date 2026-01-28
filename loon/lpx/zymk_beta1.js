if ($request.url.includes("/v1/gestureinfo/")) {
  let body = JSON.parse($response.body);

  Object.assign(body.data, {
    isvip: 1,
    vipdays: 999,
    vipdate: 1,
    Uviptime: 32493812812000,
    Cgold: 999880,
    coins: 999880,
    Ulevel: 20
  });

  $done({ body: JSON.stringify(body) });

} else if ($request.url.includes("/paychapters/")) {
  let body = JSON.parse($response.body);
  body.status = 0;
  $done({ body: JSON.stringify(body) });
}
