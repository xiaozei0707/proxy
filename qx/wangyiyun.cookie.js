/******************************************
 * @name Netease Music Headers
 * @description Quantumult X request header capture helper for BoxJS.
 ******************************************/

var $ = Env();
var KEY_COOKIE = "wyy_cookie";
var KEY_MCONFIG = "wyy_mconfig_info";
var KEY_USER_AGENT = "wyy_user_agent";
var KEY_CAPTURE_TIME = "wyy_cookie_capture_time";

!(function () {
  if (typeof $request === "undefined") {
    $.msg("网易云音乐", "仅用于请求捕获", "请在 Quantumult X rewrite 中使用。");
    $.done();
    return;
  }

  capture();
})()
  .catch(function (err) {
    $.msg("网易云音乐", "脚本异常", String(err));
  })
  .finally(function () {
    $.done();
  });

function capture() {
  console.log("网易云音乐命中接口：" + ($request.url || ""));

  var savedCookie = $.getdata(KEY_COOKIE);
  if (savedCookie) {
    console.log("网易云音乐 Cookie 已存在，跳过本次捕获。");
    return;
  }

  var headers = $request.headers || {};
  var cookie = pickHeader(headers, "cookie");
  var mconfig = pickHeader(headers, "mconfig-info");
  var userAgent = pickHeader(headers, "user-agent");

  if (!cookie) {
    $.msg("网易云音乐", "获取失败", "当前请求头中没有 Cookie。");
    return;
  }

  $.setdata(normalizeCookie(cookie), KEY_COOKIE);
  if (mconfig) $.setdata(mconfig, KEY_MCONFIG);
  if (userAgent) $.setdata(userAgent, KEY_USER_AGENT);
  $.setdata(formatDate(new Date()), KEY_CAPTURE_TIME);

  $.msg("网易云音乐", "获取成功", "Cookie 已保存到 BoxJS。");
}

function pickHeader(headers, name) {
  var target = String(name || "").toLowerCase();
  for (var key in headers) {
    if (String(key).toLowerCase() === target) return headers[key];
  }
  return "";
}

function normalizeCookie(cookie) {
  return String(cookie || "")
    .replace(/[\r\n]/g, "")
    .split(";")
    .map(function (item) {
      return item.trim();
    })
    .filter(Boolean)
    .join("; ");
}

function formatDate(date) {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
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
