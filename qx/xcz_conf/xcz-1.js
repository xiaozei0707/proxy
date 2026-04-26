// 获取原始响应体
let body = $response.body;

try {
    // 解析 JSON
    let obj = JSON.parse(body);

    // 确保数据结构存在，将各项资产修改为 999
    if (obj && obj.result) {
        obj.result.tippedCoins = 999;
        obj.result.androidCoins = 999;
        obj.result.money = 999;
        obj.result.iosCoins = 999;
    }

    // 转回字符串并返回修改后的数据
    $done({ body: JSON.stringify(obj) });

} catch (e) {
    // 出现异常（如解析失败）时，原样返回防止 App 崩溃
    $done({ body });
}
