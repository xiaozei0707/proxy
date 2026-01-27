#傲软抠图

let obj = JSON.parse($response.body);

if (obj && obj.data) {
  obj.data.expired_at = 1893455999;
  obj.data.remained_seconds = 315360000;
  obj.data.limit_expired_at = 1893455999;
  obj.data.license_type = "vip";
  obj.data.status = 1;
  obj.data.limit = 100;
  obj.data.storage = 1000;
  obj.data.ai_quota = 10000;
  obj.data.candy_expired_at = 1893455999;
  obj.data.group_expired_at = 1893455999;
  obj.data.owner = 72351912;
  obj.data.license_type_id = 2;
  obj.data.storage_expired_at = 1893455999;
  obj.data.quota = 99999;
  obj.data.coin = 999;
  obj.data.max_devices = 5;
  obj.data.period_type = "vip";
  obj.data.candy = 100;
}

$done({ body: JSON.stringify(obj) });