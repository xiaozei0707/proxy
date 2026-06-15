/******************************************
 * @name Xiaoheihe Daily Sign
 * @description Quantumult X capture and task script.
 *
 * Quantumult X:
 *
 * [mitm]
 * hostname = api.xiaoheihe.cn
 *
 * [rewrite_local]
 * ^https:\/\/api\.xiaoheihe\.cn\/(?:account\/info|task\/sign_v3\/get_sign_state|task\/sign_v3\/sign|task\/sign_list|task\/list_v2) url script-request-header xhh.js
 *
 * [task_local]
 * 15 8 * * * xhh.js, tag=Xiaoheihe Sign, enabled=true
 ******************************************/

var $ = new Env("Xiaoheihe");

var KEY_COOKIE = "xhh_cookie";
var KEY_TOKEN = "xhh_tokenid";
var KEY_PKEY = "xhh_pkey";
var KEY_USER = "xhh_user";
var KEY_SIGN_URL = "xhh_sign_url";
var KEY_STATE_URL = "xhh_state_url";

!(async function () {
  if (typeof $request !== "undefined") {
    GetToken();
  } else {
    await Sign();
  }
})()
  .catch(function (err) {
    $.notify("Script error", "", String(err));
  })
  .finally(function () {
    $.done();
  });

function GetToken() {
  var url = $request.url || "";
  var headers = $request.headers || {};
  var cookie = headers.Cookie || headers.cookie || "";
  var cookies = parseCookie(cookie);
  var query = parseQuery(url);
  var path = parsePath(url);

  if (!cookies.pkey || !cookies.x_xhh_tokenid) {
    $.notify("Xiaoheihe", "Token capture failed", "pkey or x_xhh_tokenid not found");
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
    user_agent:
      headers["User-Agent"] ||
      headers["user-agent"] ||
      "xiaoheihe/1.3.388 (com.max.xiaoheihe; iOS) Alamofire/5.9.0",
  };

  $.setdata(cleanCookie, KEY_COOKIE);
  $.setdata(cookies.x_xhh_tokenid, KEY_TOKEN);
  $.setdata(cookies.pkey, KEY_PKEY);
  $.setdata(JSON.stringify(user), KEY_USER);

  if (path === "/task/sign_v3/sign") {
    $.setdata(url, KEY_SIGN_URL);
  }
  if (path === "/task/sign_v3/get_sign_state") {
    $.setdata(url, KEY_STATE_URL);
  }

  var msg = "pkey/token saved";
  if (user.heybox_id) msg += ", heybox_id: " + user.heybox_id;
  if (path.indexOf("/task/sign_v3/") === 0) msg += ", sign params saved";
  $.notify("Xiaoheihe", "Token captured", msg);
}

async function Sign() {
  var cookie = $.getdata(KEY_COOKIE);
  var user = safeJson($.getdata(KEY_USER), {});
  var signUrl = $.getdata(KEY_SIGN_URL);
  var stateUrl = $.getdata(KEY_STATE_URL);

  if (!cookie) {
    $.notify("Xiaoheihe Sign", "Cookie missing", "Open Xiaoheihe once to capture token");
    return;
  }

  if (!signUrl && !stateUrl) {
    $.notify("Xiaoheihe Sign", "Sign params missing", "Open the Xiaoheihe task/sign page once");
    return;
  }

  var headers = {
    Host: "api.xiaoheihe.cn",
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-Hans-CN;q=1.0, en-CN;q=0.9",
    Connection: "keep-alive",
    Referer: "http://api.maxjia.com/",
    "User-Agent":
      user.user_agent ||
      "xiaoheihe/1.3.388 (com.max.xiaoheihe; iOS) Alamofire/5.9.0",
    Cookie: cookie,
  };

  if (stateUrl) {
    var before = parseBody(await httpGet(stateUrl, headers));
    if (before.status === "ok" && before.result && before.result.state === "ok") {
      $.notify("Xiaoheihe Sign", "Already signed", before.msg || "");
      return;
    }
  }

  if (!signUrl) {
    $.notify("Xiaoheihe Sign", "Sign url missing", "Open the sign page and capture /task/sign_v3/sign");
    return;
  }

  var sign = parseBody(await httpGet(signUrl, headers));
  var after = stateUrl ? parseBody(await httpGet(stateUrl, headers)) : {};
  var body = after.msg || sign.msg || JSON.stringify(sign);
  var result = after.result || sign.result || {};
  var detail = [];

  if (result.sign_in_coin !== undefined) detail.push(result.sign_in_coin + " HCoin");
  if (result.sign_in_exp !== undefined) detail.push(result.sign_in_exp + " Exp");

  if (sign.status === "ok" || after.status === "ok") {
    $.notify("Xiaoheihe Sign", body || "Done", detail.join(", "));
  } else {
    $.notify("Xiaoheihe Sign", "Failed", body || "Captured sign params may be expired");
  }
}

function httpGet(url, headers) {
  return new Promise(function (resolve) {
    $task
      .fetch({
        url: url,
        method: "GET",
        headers: headers,
      })
      .then(
        function (resp) {
          resolve(resp);
        },
        function (err) {
          resolve({ body: JSON.stringify({ status: "failed", msg: String(err) }) });
        }
      );
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
  String(cookie || "")
    .split(";")
    .forEach(function (item) {
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
  String(url)
    .slice(index + 1)
    .split("&")
    .forEach(function (item) {
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

function Env(name) {
  return {
    name: name,
    getdata: function (key) {
      return $prefs.valueForKey(key);
    },
    setdata: function (val, key) {
      return $prefs.setValueForKey(val, key);
    },
    notify: function (title, sub, body) {
      $notify(title, sub, body);
    },
    done: function (value) {
      $done(value || {});
    },
  };
}
