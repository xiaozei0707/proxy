/******************************************
 * @name Xiaoheihe Sign
 * @description Quantumult X capture and sign script.
 ******************************************/

var $ = Env();
var KEY_COOKIE = "xhh_cookie";
var KEY_TOKEN = "xhh_tokenid";
var KEY_PKEY = "xhh_pkey";
var KEY_USER = "xhh_user";
var KEY_SIGN_URL = "xhh_sign_url";
var KEY_STATE_URL = "xhh_state_url";
var KEY_TASK_URL = "xhh_task_url";

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
  if (!signUrl && !stateUrl) {
    $.msg("小黑盒签到", "缺少签到参数", "请打开小黑盒任务或签到页刷新一次");
    return;
  }

  var headers = {
    Host: "api.xiaoheihe.cn",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-Hans-CN;q=1.0, en-CN;q=0.9",
    Connection: "keep-alive",
    Referer: "http://api.maxjia.com/",
    "User-Agent": user.user_agent || "xiaoheihe/1.3.388 (com.max.xiaoheihe; iOS) Alamofire/5.9.0",
    Cookie: cookie,
  };

  if (stateUrl) {
    var before = parseBody(await get(stateUrl, headers));
    if (before.status === "ok" && before.result && before.result.state === "ok") {
      var beforeTask = taskUrl ? parseBody(await get(taskUrl, headers)) : {};
      notifySigned(before.result, beforeTask, before.msg);
      return;
    }
  }

  if (taskUrl) {
    var taskBefore = parseBody(await get(taskUrl, headers));
    if (isTaskSigned(taskBefore)) {
      notifySigned({}, taskBefore, "今日已签到");
      return;
    }
  }

  if (!signUrl) {
    $.msg("小黑盒签到", "缺少签到链接", "请打开签到页捕获 /task/sign_v3/sign");
    return;
  }

  var res = parseBody(await get(signUrl, headers));
  var after = stateUrl ? parseBody(await get(stateUrl, headers)) : {};
  var task = taskUrl ? parseBody(await get(taskUrl, headers)) : {};
  var msg = after.msg || res.msg || JSON.stringify(res);
  var result = after.result || res.result || {};

  if (isSignedResult(res) || isSignedResult(after) || isTaskSigned(task)) {
    notifySigned(result, task, msg);
  } else {
    $.msg("小黑盒签到", "签到失败", failMessage(res, after, task));
  }
}

function isSignedResult(data) {
  if (!data || data.status !== "ok") return false;
  if (!data.result) return true;
  return data.result.state === "ok" || data.result.state === "finish" || data.result.state === "";
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

function notifySigned(result, task, fallbackMsg) {
  result = result || {};
  task = task || {};

  var coin = pick(result, ["sign_in_coin", "coin"]);
  var total = pick(task, ["result.level_info.coin", "level_info.coin"]);
  if (total === undefined) total = pick(result, ["level_info.coin"]);

  var detail = [];
  if (coin !== undefined && coin !== 0) detail.push("本次获得 " + coin + " H币");
  if (total !== undefined) detail.push("当前共 " + total + " H币");
  if (!detail.length && fallbackMsg) detail.push(fallbackMsg);

  $.msg("小黑盒签到", "已签到", detail.join("，"));
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

function get(url, headers) {
  return new Promise(function (resolve) {
    $task.fetch({ url: url, method: "GET", headers: headers }).then(resolve, function (err) {
      resolve({ body: JSON.stringify({ status: "failed", msg: String(err) }) });
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
  var obj = {};
  var index = String(url).indexOf("?");
  if (index === -1) return obj;
  String(url).slice(index + 1).split("&").forEach(function (item) {
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
      return $prefs.valueForKey(key);
    },
    setdata: function (val, key) {
      return $prefs.setValueForKey(val, key);
    },
    msg: function (title, sub, body) {
      $notify(title, sub, body);
    },
    done: function (val) {
      $done(val || {});
    },
  };
}
