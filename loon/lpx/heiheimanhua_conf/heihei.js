if (!$request) {
  $done({});
  return;
}

const url = $request.url;
if (url.includes("/xxxx/")) {  
  let headers = $request.headers;
  headers["Header-Name"] = "Header-Value";
  $done({ headers });
  return;
}

if (url.includes("/yyyy/")) {  
  let headers = $request.headers;
  headers["Header-Name"] = "Header-Value";
  $done({ headers });
  return;
}

/* ========== ② 响应体修改 ========== */
if ($response && $response.body && url.includes("/zzzz/")) {

  let body;
  try {
    body = JSON.parse($response.body);
  } catch (e) {
    $done({});
    return;
  }

  body.code = 9;
  body.msg = "success";

  $done({
    body: JSON.stringify(body)
  });
  return;
}

/* ========== ③ 其他情况放行 ========== */
$done({});
