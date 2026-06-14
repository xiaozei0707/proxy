let obj = JSON.parse($response.body);

if (obj.info && Array.isArray(obj.info.openVos)) {
  obj.info.openVos = [];
}

$done({ body: JSON.stringify(obj) });
