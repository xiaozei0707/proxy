var body = $response.body;

if (body) {
    // 逻辑：将 Membership 状态从 false 改为 true
    body = body.replace(/Membership":false/g, '"Membership":true');
    $done({ body });
} else {
    $done({});
}

