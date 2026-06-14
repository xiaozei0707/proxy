let obj = JSON.parse($response.body);

if (obj.info && Array.isArray(obj.info.openVos)) {
  obj.info.openVos = obj.info.openVos.filter(item =>
    item.id !== 27 && item.openId !== 3
  );
}

$done({ body: JSON.stringify(obj) });
