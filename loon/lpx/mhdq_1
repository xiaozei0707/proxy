let body = $response.body;

if (typeof body === "string") {

  // ① 直接正则替换 coinPrice（不管在不在 data 里）
  body = body.replace(/"coinPrice"\s*:\s*\d+/g, '"coinPrice":0');

  try {
    let obj = JSON.parse(body);

    // ② 修改 user 相关字段
    if (obj.user) {
      obj.user.vipExpiredTime = "9999-12-31";
      obj.user.avatarUrl = "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/xiaolian.png";
      obj.user.chatName = "Sarff0707";
      obj.user.message = "永久";
      obj.user.userTypeName = "永久会员";
      obj.user.userType = 1;
    }

    body = JSON.stringify(obj);
  } catch (e) {
    // JSON 解析失败就只保留正则替换结果
  }
}

$done({ body });