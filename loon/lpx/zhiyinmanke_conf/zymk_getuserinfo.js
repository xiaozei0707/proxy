let obj = JSON.parse($response.body);

if (obj && obj.data) {
  obj.data.isvip = 1;
  obj.data.coins = 999880;
  obj.data.Ulevel = 20;
  obj.data.vipdays = 999;
  obj.data.vipdate = 1;
  obj.data.Uviptime = 32493812812000;
  obj.data.Cgold = 999880;
  obj.data.Uname = "Sarff0707";
  obj.data.headpic = "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/xiaolian.png";
}

if (obj) {
  obj.status = 0;
}

$done({ body: JSON.stringify(obj) });
