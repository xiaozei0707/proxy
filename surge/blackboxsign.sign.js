/******************************************
 * BlackBoxSign daily sign for Surge
 *
 * Persistent key:
 * BLACKBOX_COOKIE=heybox_id#pkey=xxx;x_xhh_tokenid=xxx
 * Multiple accounts can be separated by & or a newline.
 ******************************************/

var STORE_KEY = "BLACKBOX_COOKIE";
var HKEY_SERVER = "http://47.120.39.109:9900/hkey";
var ANDROID_IMEI = "4187fb55b1be198a";
var ANDROID_NONCE = "tb6e1k7WqQCIHToyzWzI8Ogq9d0EIgpb";
var DEVICE_INFO = "XiaoMi%2013%E7%A7%81%E4%BA%BA%E8%AE%A2%E5%88%B6%E7%89%88";
var ANDROID_PREFIX =
  "&imei=" +
  ANDROID_IMEI +
  "&device_info=" +
  DEVICE_INFO +
  "&nonce=" +
  ANDROID_NONCE;
var ANDROID_SUFFIX = "&os_type=Android&x_os_type=Android&x_client_type=mobile&os_version=9&version=1.3.332&build=871";
var CHANNEL_SUFFIX = "&dw=428&channel=heybox_xiaomi&x_app=heybox";

(async function () {
  var accounts = readAccounts();
  if (!accounts.length) {
    notify("BlackBoxSign", "No cookie", "Enable capture rule, then open Xiaoheihe task/sign page once.");
    return;
  }

  var messages = [];
  for (var i = 0; i < accounts.length; i++) {
    messages.push(await signOne(accounts[i], i + 1));
  }

  notify("BlackBoxSign", "Done", messages.join("\n"));
})()
  .catch(function (err) {
    notify("BlackBoxSign", "Script error", String(err && err.stack ? err.stack : err));
  })
  .finally(function () {
    done();
  });

async function signOne(account, index) {
  var parts = account.split("#");
  var heyboxId = parts[0];
  var cookie = parts.slice(1).join("#");
  if (!heyboxId || !cookie) return "Account " + index + ": invalid cookie format";

  var key = await getHkey(heyboxId, 1, "null");
  if (!key || !key.hkey || !key.timestamp) return "Account " + index + ": hkey failed";

  var signUrl = buildSignUrl(heyboxId, key);
  var signData = parseBody(await get(signUrl, apiHeaders(cookie)));
  var taskData = {};

  var taskKey = await getHkey(heyboxId, 2, "null");
  if (taskKey && taskKey.hkey && taskKey.timestamp) {
    taskData = parseBody(await get(buildTaskUrl(heyboxId, taskKey), apiHeaders(cookie)));
  }

  var status = describeSign(signData);
  var extra = describeTask(taskData);
  return "Account " + index + ": " + status + (extra ? " | " + extra : "");
}

async function getHkey(heyboxId, type, taskName) {
  var body = JSON.stringify({ heyboxId: heyboxId, type: type, taskName: taskName || "null" });
  return parseBody(
    await post(HKEY_SERVER, body, {
      "Content-Type": "application/json",
    })
  );
}

function buildSignUrl(heyboxId, key) {
  return (
    "https://api.xiaoheihe.cn/task/sign_v3/sign?heybox_id=" +
    encodeURIComponent(heyboxId) +
    ANDROID_PREFIX +
    "&hkey=" +
    encodeURIComponent(key.hkey) +
    ANDROID_SUFFIX +
    "&_time=" +
    encodeURIComponent(key.timestamp) +
    CHANNEL_SUFFIX
  );
}

function buildTaskUrl(heyboxId, key) {
  return (
    "https://api.xiaoheihe.cn/task/list_v2/?heybox_id=" +
    encodeURIComponent(heyboxId) +
    ANDROID_PREFIX +
    "&hkey=" +
    encodeURIComponent(key.hkey) +
    ANDROID_SUFFIX +
    "&_time=" +
    encodeURIComponent(key.timestamp) +
    CHANNEL_SUFFIX
  );
}

function apiHeaders(cookie) {
  return {
    Host: "api.xiaoheihe.cn",
    Referer: "http://api.maxjia.com/",
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML like Gecko) Chrome/41.0.2272.118 Safari/537.36 ApiMaxJia/1.0",
    Connection: "Keep-Alive",
    Accept: "*/*",
    Cookie: cookie,
  };
}

function describeSign(data) {
  if (!data || typeof data !== "object") return "empty response";
  var state = data.result && data.result.state;
  if (state === "finish") return "already signed";
  if (data.msg === "ignore") return "signed";
  if (data.status === "ok" && !data.msg) return "signed";
  if (data.status === "ok") return data.msg || "ok";
  return data.msg || data.message || JSON.stringify(data).slice(0, 120);
}

function describeTask(data) {
  var result = data && data.result;
  if (!result) return "";
  var user = result.user || {};
  var info = user.info || user;
  var coin = info.coin;
  var level = info.level_info && info.level_info.level;
  var name = info.nickname || info.username || info.name || "";
  var parts = [];
  if (name) parts.push(name);
  if (coin !== undefined) parts.push("coin: " + coin);
  if (level !== undefined) parts.push("level: " + level);
  return parts.join(", ");
}

function readAccounts() {
  var raw = read(STORE_KEY) || "";
  return raw
    .split(/[\n&]+/)
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item.indexOf("#") > 0;
    });
}

function get(url, headers) {
  return request("GET", { url: url, headers: headers });
}

function post(url, body, headers) {
  return request("POST", { url: url, body: body, headers: headers });
}

function request(method, options) {
  return new Promise(function (resolve, reject) {
    options.method = method;
    options.timeout = 8000;
    $httpClient[method.toLowerCase()](options, function (err, resp, body) {
      if (err) return reject(err);
      resolve(body || "");
    });
  });
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch (e) {
    return { raw: String(body) };
  }
}

function read(key) {
  return $persistentStore.read(key);
}

function notify(title, subtitle, body) {
  if (typeof $notification !== "undefined") $notification.post(title, subtitle, body || "");
  console.log([title, subtitle, body || ""].join(" | "));
}

function done(value) {
  if (typeof $done !== "undefined") $done(value || {});
}
