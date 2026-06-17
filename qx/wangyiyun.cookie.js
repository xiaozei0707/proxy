/******************************************
 * @name Netease Music Cookie11
 * @description Quantumult X BoxJS cookie injector.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_CAPTURE_TIME = "wyy_cookie_capture_time";
var KEY_LAST_URL = "wyy_last_url";
var KEY_LAST_STATUS = "wyy_last_status";
var KEY_LAST_INJECTED_MUSIC_U = "wyy_last_injected_music_u";

// 你要求匹配的捕获 URL 正则表达式
var captureUrlRegex = /^https?:\/\/interface3?\.music\.163\.com\/(?:eapi|xeapi)\/vipauth\/app\/auth\/(soundquality\/)?query/;

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
  var requestUrl = $request.url || "";
  var savedCookie = clean(read(KEY_COOKIE));
  
  write(KEY_LAST_URL, requestUrl);

  // 1. 如果 BoxJS 已经有 Cookie，直接替换当前请求的 Cookie（静默替换，不通知）
  if (savedCookie) {
    replaceCookieHeader(WYYHeaders, savedCookie);
    var injectedMusicU = getCookieValue(savedCookie, "MUSIC_U");
    write(KEY_LAST_STATUS, "BoxJS 已有 Cookie，跳过捕获并静默替换当前请求");
    write(KEY_LAST_INJECTED_MUSIC_U, injectedMusicU);
    $done({ headers: WYYHeaders });
    return;
  }

  // 2. 如果 BoxJS 没有值，则检查当前 URL 是否匹配你指定的接口用于捕获
  if (captureUrlRegex.test(requestUrl)) {
    var cookie = pickHeader(WYYHeaders, "cookie");

    if (!cookie) {
      write(KEY_LAST_STATUS, "命中指定 URL 但未获取到 Cookie");
      $done({});
      return;
    }

    cookie = clean(cookie);
    write(KEY_COOKIE, cookie);
    write(KEY_CAPTURE_TIME, formatDate(new Date()));
    write(KEY_LAST_STATUS, "Cookie 捕获成功，已保存并替换");

    replaceCookieHeader(WYYHeaders, cookie);
    var musicU = getCookieValue(cookie, "MUSIC_U");
    write(KEY_LAST_INJECTED_MUSIC_U, musicU);
    
    // 捕获成功时，弹出通知
    notify("Cookie 捕获成功", maskMusicU(musicU), "已保存到 BoxJS 并可用于后续替换");
    $done({ headers: WYYHeaders });
  } else {
    // 3. 如果 BoxJS 没有值，且当前 URL 也不匹配捕获接口，则直接放行，什么都不做
    $done({});
  }
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
