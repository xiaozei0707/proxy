let obj = JSON.parse($response.body);

if (obj.info && typeof obj.info.coinNumber !== "undefined") {
  obj.info.coinNumber = 9999;
}

$done({ body: JSON.stringify(obj) });
