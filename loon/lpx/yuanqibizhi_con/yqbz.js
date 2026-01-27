let obj = JSON.parse($response.body);

if (obj && obj.data) {
  obj.data.vipType = 256;
  obj.data.vipLabel = "永久会员";
}

$done({ body: JSON.stringify(obj) });
