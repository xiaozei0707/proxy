// 快看漫画 VIP + 提前看 + 去广告
// 精简解密版

if ($request.url.includes("/v2/comic/detail/get")) {
  // 提前看：伪造请求头
  let headers = $request.headers;
  headers["X-Access-Token"] = "1";
  $done({ headers });
}

else if ($request.url.includes("/v1/vip/me")) {
  let obj = JSON.parse($response.body);

  obj.data = obj.data || {};
  obj.data.is_vip = true;
  obj.data.vip_type = 12;
  obj.data.vip_status = 1;
  obj.data.vip_expire_time = 4102415999000; // 2099-12-31
  obj.data.vip_label = "永久VIP";

  $done({ body: JSON.stringify(obj) });
}

else {
  $done({});
}