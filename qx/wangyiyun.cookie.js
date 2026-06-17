/******************************************
 * @name Netease Music Cookie
 * @description Quantumult X BoxJS cookie injector.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_CAPTURE_TIME = "wyy_cookie_capture_time";
var KEY_LAST_URL = "wyy_last_url";
var KEY_LAST_STATUS = "wyy_last_status";
var KEY_LAST_INJECTED_MUSIC_U = "wyy_last_injected_music_u";

try {
  if (typeof $request === "undefined") {
    $done({});
  } else {
    main();
  }
} catch (err) {
  $notify("网易云音乐", "脚本异常", String(err));
  $done({});
}

function main() {
  var WYYHeaders = $request.headers || {};
  var savedCookie = clean(read(KEY_COOKIE));
  write(KEY_LAST_URL, $request.url || "");

  if (savedCookie) {
    replaceCookieHeader(WYYHeaders, savedCookie);
    var injectedMusicU = getCookieValue(savedCookie, "MUSIC_U");
    write(KEY_LAST_STATUS, "BoxJS 已有 Cookie，跳过捕获并替换当前请求");
    write(KEY_LAST_INJECTED_MUSIC_U, injectedMusicU);
    $done({ headers: WYYHeaders });
    return;
  }

  var cookie = pickHeader(WYYHeaders, "cookie");

  if (!cookie) {
    write(KEY_LAST_STATUS, "命中但未获取 Cookie");
    $done({});
    return;
  }

  cookie = clean(cookie);
  write(KEY_COOKIE, cookie);
  write(KEY_CAPTURE_TIME, formatDate(new Date()));
  write(KEY_LAST_STATUS, "Cookie 已保存到 BoxJS 并替换当前请求");

  replaceCookieHeader(WYYHeaders, cookie);
  var musicU = getCookieValue(cookie, "MUSIC_U");
  write(KEY_LAST_INJECTED_MUSIC_U, musicU);
  notify("Cookie 捕获成功", maskMusicU(musicU), "已保存到 BoxJS 并替换当前请求");
  $done({ headers: WYYHeaders });
}

function replaceCookieHeader(headers, cookie) {
  var cookieKey = "cookie";
  for (var key in headers) {
    if (String(key).toLowerCase() === "cookie") {
      cookieKey = key;
      break;
    }
  }
  headers[cookieKey] = cookie;
  for (var dupKey in headers) {
    if (dupKey !== cookieKey && String(dupKey).toLowerCase() === "cookie") {
      delete headers[dupKey];
    }
  }
}

function pickHeader(headers, name) {
  var target = String(name || "").toLowerCase();
  for (var key in headers) {
    if (String(key).toLowerCase() === target) return headers[key];
  }
  return "";
}

function clean(value) {
  return String(value || "").replace(/[\r\n]/g, "").trim();
}

function parseCookie(cookie) {
  var fields = {};
  String(cookie || "")
    .split(";")
    .forEach(function (item) {
      var index = item.indexOf("=");
      if (index <= 0) return;
      var key = item.slice(0, index).trim();
      var value = item.slice(index + 1).trim();
      if (key) fields[key] = value;
    });
  return fields;
}

function getCookieValue(cookie, name) {
  var fields = parseCookie(cookie);
  return fields[name] || "";
}

function maskMusicU(value) {
  value = String(value || "");
  if (!value) return "未找到 MUSIC_U";
  if (value.length <= 16) return "MUSIC_U=" + value;
  return "MUSIC_U=" + value.slice(0, 8) + "..." + value.slice(-8);
}

function notify(subtitle, message, detail) {
  if (typeof $notify === "function") {
    $notify("网易云音乐", subtitle, [message, detail].filter(Boolean).join("\n"));
  }
}

function read(key) {
  return $prefs.valueForKey(key);
}

function write(key, value) {
  return $prefs.setValueForKey(value, key);
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
