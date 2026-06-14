let obj = JSON.parse($response.body);

if (obj.info && Array.isArray(obj.info.openVos)) {
  obj.info.openVos = obj.info.openVos.filter(item =>
    item.id !== 27 &&
    item.openId !== 3 &&
    item.id !== 31 &&
    item.openId !== 6
  );
}

$done({ body: JSON.stringify(obj) });
