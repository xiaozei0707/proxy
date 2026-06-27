/******************************************
 * @name Xiaoheihe Sign
 * @description Surge capture and sign script.
 ******************************************/

var $ = Env();
var KEY_COOKIE = "xhh_cookie";
var KEY_TOKEN = "xhh_tokenid";
var KEY_PKEY = "xhh_pkey";
var KEY_USER = "xhh_user";
var KEY_SIGN_URL = "xhh_sign_url";
var KEY_STATE_URL = "xhh_state_url";
var KEY_TASK_URL = "xhh_task_url";
var HKEY_SERVER = "http://47.120.39.109:9900/hkey";
var ANDROID_IMEI = "4187fb55b1be198a";
var ANDROID_NONCE = "tb6e1k7WqQCIHToyzWzI8Ogq9d0EIgpb";

!(async function () {
  if (typeof $request !== "undefined") {
    capture();
  } else {
    await sign();
  }
})()
  .catch(function (err) {
    $.msg("小黑盒", "脚本异常", String(err));
  })
  .finally(function () {
    $.done();
  });

function capture() {
  var url = $request.url || "";
  var headers = $request.headers || {};
  var cookie = headers.Cookie || headers.cookie || "";
  var cookies = parseCookie(cookie);
  var query = parseQuery(url);
  var path = parsePath(url);
  var hasLocalToken = !!$.getdata(KEY_TOKEN);

  if (!cookies.pkey || !cookies.x_xhh_tokenid) {
    $.msg("小黑盒", "获取失败", "未找到 pkey 或登录令牌");
    return;
  }

  var cleanCookie = "pkey=" + cookies.pkey + ";x_xhh_tokenid=" + cookies.x_xhh_tokenid;
  if (cookies.hkey) cleanCookie += ";hkey=" + cookies.hkey;

  var user = {
    heybox_id: query.heybox_id || "",
    device_id: query.device_id || "",
    version: query.version || "1.3.388",
    os_version: query.os_version || "",
    device_info: query.device_info || "",
    user_agent: headers["User-Agent"] || headers["user-agent"] || "xiaoheihe/1.3.388 (com.max.xiaoheihe; iOS) Alamofire/5.9.0",
  };

  $.setdata(cleanCookie, KEY_COOKIE);
  $.setdata(cookies.x_xhh_tokenid, KEY_TOKEN);
  $.setdata(cookies.pkey, KEY_PKEY);
  $.setdata(JSON.stringify(user), KEY_USER);

  if (path === "/task/sign_v3/sign") $.setdata(url, KEY_SIGN_URL);
  if (path === "/task/sign_v3/get_sign_state") $.setdata(url, KEY_STATE_URL);
  if (path === "/task/list_v2/" || path === "/task/list_v2") $.setdata(url, KEY_TASK_URL);

  var text = "pkey 和登录令牌已" + (hasLocalToken ? "更新" : "保存");
  if (user.heybox_id) text += "，小黑盒ID：" + user.heybox_id;
  if (path.indexOf("/task/sign_v3/") === 0) text += "，签到参数已保存";
  $.msg("小黑盒", hasLocalToken ? "更新成功" : "获取成功", text);
}

async function sign() {
  var cookie = $.getdata(KEY_COOKIE);
  var user = safeJson($.getdata(KEY_USER), {});
  var signUrl = $.getdata(KEY_SIGN_URL);
  var stateUrl = $.getdata(KEY_STATE_URL);
  var taskUrl = $.getdata(KEY_TASK_URL);

  if (!cookie) {
    $.msg("小黑盒签到", "缺少登录信息", "请先打开小黑盒获取一次令牌");
    return;
  }

  var capturedHeaders = {
    Host: "api.xiaoheihe.cn",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-Hans-CN;q=1.0, en-CN;q=0.9",
    Connection: "keep-alive",
    Referer: "http://api.maxjia.com/",
    "User-Agent": user.user_agent || "xiaoheihe/1.3.388 (com.max.xiaoheihe; iOS) Alamofire/5.9.0",
    Cookie: cookie,
  };

  var capturedFail = null;
  if (signUrl || stateUrl) {
    capturedFail = await signWithCapturedUrls(signUrl, stateUrl, taskUrl, capturedHeaders);
    if (!capturedFail) return;
  }

  if (!user.heybox_id) {
    $.msg("小黑盒签到", "缺少小黑盒ID", capturedFail || "请打开小黑盒任务或签到页刷新一次");
    return;
  }

  var headers = {
    Host: "api.xiaoheihe.cn",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Connection: "keep-alive",
    Referer: "http://api.maxjia.com/",
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 (KHTML like Gecko) Chrome/41.0.2272.118 Safari/537.36 ApiMaxJia/1.0",
    Cookie: cookie,
  };

  var signKey = await getHkey(user.heybox_id, 1);
  if (!signKey || !signKey.hkey || !signKey.timestamp) {
    $.msg("小黑盒签到", "签到失败", capturedFail ? capturedFail + " | hkey 获取失败" : "hkey 获取失败");
    return;
  }

  var res = parseBody(await get(buildSignUrl(user.heybox_id, signKey), headers));
  var taskKey = await getHkey(user.heybox_id, 2);
  var task = taskKey ? parseBody(await get(buildTaskUrl(user.heybox_id, taskKey), headers)) : {};
  var msg = res.msg || pick(task, ["msg"]) || JSON.stringify(res);
  var result = res.result || {};

  if (isSignedResult(res) || isTaskSigned(task) || isAlreadyDone(res)) {
    notifySigned(result, task, msg, isIgnoreState(res) ? "已经签到了" : "已签到");
  } else {
    var fallbackFail = debugFailMessage(res, {}, task);
    $.msg("小黑盒签到", "签到失败", capturedFail ? capturedFail + " | " + fallbackFail : fallbackFail);
  }
}

async function signWithCapturedUrls(signUrl, stateUrl, taskUrl, headers) {
  var before = {};
  var after = {};
  var res = {};
  var task = {};

  if (stateUrl) {
    before = parseBody(await get(stateUrl, headers));
    if (isSignedResult(before) || isAlreadyDone(before)) {
      task = taskUrl ? parseBody(await get(taskUrl, headers)) : {};
      notifySigned(before.result || {}, task, before.msg, "已签到");
      return null;
    }
  }

  if (!signUrl) return "缺少签到链接，请打开签到页捕获 /task/sign_v3/sign";

  res = parseBody(await get(signUrl, headers));
  after = stateUrl ? parseBody(await get(stateUrl, headers)) : {};
  task = taskUrl ? parseBody(await get(taskUrl, headers)) : {};

  if (isSignedResult(res) || isSignedResult(after) || isTaskSigned(task) || isAlreadyDone(res) || isAlreadyDone(after)) {
    notifySigned(after.result || res.result || {}, task, after.msg || res.msg, isIgnoreState(res) || isIgnoreState(after) ? "已经签到了" : "已签到");
    return null;
  }

  return debugFailMessage(res, after, task);
}

async function getHkey(heyboxId, type, taskName) {
  var body = JSON.stringify({ heyboxId: heyboxId, type: type, taskName: taskName || "null" });
  var resp = await post(HKEY_SERVER, body, {
    "Content-Type": "application/json",
  });
  return parseBody(resp);
}

function buildSignUrl(heyboxId, key) {
  return (
    "https://api.xiaoheihe.cn/task/sign_v3/sign?heybox_id=" +
    encodeURIComponent(heyboxId) +
    "&imei=" +
    ANDROID_IMEI +
    "&device_info=XiaoMi%2013%E7%A7%81%E4%BA%BA%E8%AE%A2%E5%88%B6%E7%89%88" +
    "&nonce=" +
    ANDROID_NONCE +
    "&hkey=" +
    encodeURIComponent(key.hkey) +
    "&os_type=Android&x_os_type=Android&x_client_type=mobile&os_version=9&version=1.3.332&build=871&_time=" +
    encodeURIComponent(key.timestamp) +
    "&dw=428&channel=heybox_xiaomi&x_app=heybox"
  );
}

function buildTaskUrl(heyboxId, key) {
  return (
    "https://api.xiaoheihe.cn/task/list_v2/?heybox_id=" +
    encodeURIComponent(heyboxId) +
    "&imei=" +
    ANDROID_IMEI +
    "&device_info=XiaoMi%2013%E7%A7%81%E4%BA%BA%E8%AE%A2%E5%88%B6%E7%89%88" +
    "&nonce=" +
    ANDROID_NONCE +
    "&hkey=" +
    encodeURIComponent(key.hkey) +
    "&os_type=Android&x_os_type=Android&x_client_type=mobile&os_version=9&version=1.3.332&build=871&_time=" +
    encodeURIComponent(key.timestamp) +
    "&dw=428&channel=heybox_xiaomi&x_app=heybox"
  );
}

function isSignedResult(data) {
  if (!data || data.status !== "ok") return false;
  if (!data.result) return true;
  return data.result.state === "ok" || data.result.state === "finish" || data.result.state === "ignore" || data.result.state === "";
}

function isTaskSigned(data) {
  var list = pick(data, ["result.task_list"]);
  if (!list || !list.length) return false;
  for (var i = 0; i < list.length; i++) {
    var tasks = list[i].tasks || [];
    for (var j = 0; j < tasks.length; j++) {
      if (tasks[j].type === "sign" && tasks[j].state === "finish") return true;
    }
  }
  return false;
}

function failMessage(res, after, task) {
  var msg = pick(after, ["msg"]) || pick(res, ["msg"]) || pick(task, ["msg"]);
  if (msg) return msg;
  return "请打开小黑盒任务或签到页刷新参数后再试";
}

function debugFailMessage(res, after, task) {
  var list = [];
  list.push("sign:" + brief(res));
  if (after && after.status) list.push("state:" + brief(after));
  if (task && task.status) list.push("task:" + brief(task));
  var text = list.join(" | ");
  return text || failMessage(res, after, task);
}

function brief(data) {
  if (!data) return "无返回";
  var msg = data.msg || "";
  var state = pick(data, ["result.state"]) || "";
  var status = data.status || "";
  var text = [status, state, msg].filter(Boolean).join("/");
  if (!text) text = JSON.stringify(data);
  return text.length > 120 ? text.slice(0, 120) : text;
}

function isAlreadyDone(data) {
  var msg = pick(data, ["msg"]) || "";
  return /已签到|签到成功|已经|重复|完成/.test(msg);
}

function isIgnoreState(data) {
  return pick(data, ["result.state"]) === "ignore";
}

function notifySigned(result, task, fallbackMsg, subtitle) {
  result = result || {};
  task = task || {};

  var coin = pick(result, ["sign_in_coin", "coin"]);
  if (coin === undefined) coin = parseCoin(fallbackMsg);
  if (coin === undefined) coin = pickSignCoinFromTask(task);
  var total = pick(task, ["result.user.level_info.coin", "result.level_info.coin", "level_info.coin"]);
  if (total === undefined) total = pick(result, ["level_info.coin"]);

  var detail = [];
  if (coin !== undefined && coin !== 0) detail.push("本次获得 " + coin + " H币");
  if (total !== undefined) detail.push("当前共 " + total + " H币");
  if (!detail.length && fallbackMsg) detail.push(fallbackMsg);

  $.msg("小黑盒签到", subtitle || "已签到", detail.join("，"));
}

function parseCoin(text) {
  var match = String(text || "").match(/获得\s*(\d+)\s*H?币/);
  return match ? match[1] : undefined;
}

function pickSignCoinFromTask(task) {
  var list = pick(task, ["result.task_list"]);
  if (!list || !list.length) return undefined;
  for (var i = 0; i < list.length; i++) {
    var tasks = list[i].tasks || [];
    for (var j = 0; j < tasks.length; j++) {
      if (tasks[j].type !== "sign") continue;
      var awards = tasks[j].award_desc_v2 || [];
      for (var k = 0; k < awards.length; k++) {
        if (String(awards[k].icon || "").indexOf("c10d89ae4e547bee22c53412eb7b9946") > -1) {
          return String(awards[k].desc || "").replace("+", "");
        }
      }
      if (tasks[j].sign_in_coin !== undefined) return tasks[j].sign_in_coin;
    }
  }
  return undefined;
}

function pick(obj, paths) {
  for (var i = 0; i < paths.length; i++) {
    var cur = obj;
    var parts = paths[i].split(".");
    for (var j = 0; j < parts.length; j++) {
      if (cur === undefined || cur === null) break;
      cur = cur[parts[j]];
    }
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
}

function clone(obj) {
  var out = {};
  obj = obj || {};
  for (var key in obj) out[key] = obj[key];
  return out;
}

function replaceQuery(url, patch) {
  var hash = "";
  var hashIndex = url.indexOf("#");
  if (hashIndex > -1) {
    hash = url.slice(hashIndex);
    url = url.slice(0, hashIndex);
  }

  var parts = url.split("?");
  var base = parts.shift();
  var query = parseQueryString(parts.join("?"));
  for (var key in patch) {
    if (patch[key] !== undefined && patch[key] !== null && patch[key] !== "") query[key] = patch[key];
  }
  return base + "?" + buildQuery(query) + hash;
}

function buildQuery(query) {
  var list = [];
  for (var key in query) {
    if (query[key] !== undefined && query[key] !== null) list.push(encodeURIComponent(key) + "=" + encodeURIComponent(query[key]));
  }
  return list.join("&");
}

function randomString(len) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var out = "";
  for (var i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function get(url, headers) {
  return new Promise(function (resolve) {
    $httpClient.get({ url: url, headers: headers }, function (err, resp, body) {
      if (err) {
        resolve({ body: JSON.stringify({ status: "failed", msg: String(err) }) });
      } else {
        resolve({ statusCode: resp && resp.status, headers: (resp && resp.headers) || {}, body: body || "" });
      }
    });
  });
}

function post(url, body, headers) {
  return new Promise(function (resolve) {
    $httpClient.post({ url: url, headers: headers, body: body }, function (err, resp, data) {
      if (err) {
        resolve({ body: JSON.stringify({ status: "failed", msg: String(err) }) });
      } else {
        resolve({ statusCode: resp && resp.status, headers: (resp && resp.headers) || {}, body: data || "" });
      }
    });
  });
}

function parseBody(resp) {
  try {
    return JSON.parse((resp && resp.body) || "{}");
  } catch (e) {
    return { status: "failed", msg: String(e), raw: resp && resp.body };
  }
}

function parseCookie(cookie) {
  var obj = {};
  String(cookie || "").split(";").forEach(function (item) {
    var pair = item.trim();
    var index = pair.indexOf("=");
    if (index > -1) obj[pair.slice(0, index)] = pair.slice(index + 1);
  });
  return obj;
}

function parseQuery(url) {
  var index = String(url).indexOf("?");
  return parseQueryString(index === -1 ? "" : String(url).slice(index + 1));
}

function parseQueryString(queryText) {
  var obj = {};
  String(queryText || "").split("&").forEach(function (item) {
    if (!item) return;
    var parts = item.split("=");
    var key = decodeURIComponent(parts.shift() || "");
    var val = decodeURIComponent(parts.join("=") || "");
    if (key) obj[key] = val;
  });
  return obj;
}

function parsePath(url) {
  var match = String(url).match(/^https?:\/\/[^/]+([^?]*)/);
  return match ? match[1] : "";
}

function safeJson(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

function Env() {
  return {
    getdata: function (key) {
      return $persistentStore.read(key);
    },
    setdata: function (val, key) {
      return $persistentStore.write(val, key);
    },
    msg: function (title, sub, body) {
      $notification.post(title, sub, body);
    },
    done: function (val) {
      $done(val || {});
    },
  };
}
