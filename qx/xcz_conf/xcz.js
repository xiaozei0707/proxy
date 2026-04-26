
// 获取原始响应体
let body = $response.body;

// 确保响应体存在后再进行修改
if (body) {
    // 核心逻辑：将 Membership":false 替换为 Membership":true
    body = body.replace(/Membership":false/g, 'Membership":true');
}

// 将修改后的响应体返回给 QX
$done({ body });
