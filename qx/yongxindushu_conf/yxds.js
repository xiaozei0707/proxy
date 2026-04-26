/*
 * 用心读书 (com.app.parsingbook) — QX 远程脚本
 *
[rewrite_local]
^https://api\.07book\.com/v2/(member/info|authority/(list|devices|verify|checking)) url script-analyze-echo-response https://raw.githubusercontent.com/xiaozei0707/proxy/refs/heads/main/qx/yongxindushu_conf/yxds.js

[mitm]
hostname = api.07book.com
 */

const StatusTexts = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable"
};

const requestUrl = $request.url;
const match = requestUrl.match(/\/v2\/(member\/info|authority\/(?:list|devices|verify))/);

if (!match) {
  $done({});
} else {
  const tag = match[1];
  const options = {
    url: `https://mock.parsingbook.workers.dev/parsingbook/v2/${tag}`,
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: "",
    timeout: 10000
  };

  $task.fetch(options).then(
    response => {
      $done({
        status: `HTTP/1.1 ${response.statusCode || 200} ${StatusTexts[response.statusCode || 200]}`,
        headers: response.headers || {
          server: "openresty",
          date: new Date().toUTCString(),
          "content-type": "application/json; charset=utf-8",
        },
        body: response.body
      });
    },
    reason => {
      console.log("Request failed:", reason);
      $done({
        status: "HTTP/1.1 500 Internal Server Error",
        headers: {
          server: "openresty",
          date: new Date().toUTCString(),
          "content-type": "application/json; charset=utf-8",
        },
        body: '{"error":"Request failed"}'
      });
    }
  );
}
