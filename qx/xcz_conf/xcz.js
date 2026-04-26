// 获取原始响应体
let body = $response.body;

// 将所有 "Membership":false 替换为 "Membership":true
body = body.replace(/Membership":false/g, '"Membership":true');

// 返回修改后的结果
$done({ body });
