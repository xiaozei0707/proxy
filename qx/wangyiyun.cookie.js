/******************************************
 * @name Netease Music Cookie
 * @description Quantumult X BoxJS cookie injector.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_CAPTURE_TIME = "wyy_cookie_capture_time";
var KEY_LAST_URL = "wyy_last_url";
var KEY_LAST_STATUS = "wyy_last_status";
var KEY_LAST_INJECTED_MUSIC_U = "wyy_last_injected_music_u";
var KEY_LAST_INJECTED_HEADERS = "wyy_last_injected_headers";

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
  var WYYHeaders = $request.headers;
  var savedCookie = read(KEY_COOKIE);
  write(KEY_LAST_URL, $request.url || "");

  if (savedCookie) {
    savedCookie = clean(savedCookie);
    var beforeCookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"] || "";
    replaceCookieOnly(WYYHeaders, savedCookie);
    var injectedMusicU = getCookieValue(savedCookie, "MUSIC_U");
    write(KEY_LAST_STATUS, "已按 BoxJS Cookie 替换，长度 " + savedCookie.length);
    write(KEY_LAST_INJECTED_MUSIC_U, injectedMusicU);
    write(
      KEY_LAST_INJECTED_HEADERS,
      JSON.stringify({
        boxjs_music_u: maskMusicU(injectedMusicU),
        before_music_u: maskMusicU(getCookieValue(beforeCookie, "MUSIC_U")),
        missing_required_fields: missingCookieFields(savedCookie),
        final_cookie: WYYHeaders["cookie"] || WYYHeaders["Cookie"],
        final_headers: WYYHeaders,
      })
    );
    $done({headers: WYYHeaders});
    return;
  }

  var cookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"];

  if (!cookie) {
    write(KEY_LAST_STATUS, "命中但未获取 Cookie");
    $done({});
    return;
  }

  cookie = clean(cookie);
  var missing = missingCookieFields(cookie);
  if (missing.length) {
    write(KEY_LAST_STATUS, "命中但 Cookie 不完整，缺少 " + missing.join(","));
    write(
      KEY_LAST_INJECTED_HEADERS,
      JSON.stringify({
        captured_music_u: maskMusicU(getCookieValue(cookie, "MUSIC_U")),
        missing_required_fields: missing,
        captured_cookie: cookie,
      })
    );
    $done({});
    return;
  }

  write(KEY_COOKIE, cookie);
  write(KEY_CAPTURE_TIME, formatDate(new Date()));
  write(KEY_LAST_STATUS, "Cookie 已保存到 BoxJS");

  var musicU = getCookieValue(cookie, "MUSIC_U");
  write(KEY_LAST_INJECTED_MUSIC_U, musicU);
  write(
    KEY_LAST_INJECTED_HEADERS,
    JSON.stringify({
      captured_music_u: maskMusicU(musicU),
      missing_required_fields: [],
      captured_cookie: cookie,
    })
  );
  notify("Cookie 捕获成功", maskMusicU(musicU), "已保存到 BoxJS");
  $done({});
}

function replaceCookieOnly(headers, cookie) {
  var keyName = "cookie";
  if (headers["Cookie"] && !headers["cookie"]) keyName = "Cookie";
  headers[keyName] = cookie;
  if (keyName === "cookie" && headers["Cookie"]) delete headers["Cookie"];
  if (keyName === "Cookie" && headers["cookie"]) delete headers["cookie"];
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

function missingCookieFields(cookie) {
  var fields = parseCookie(cookie);
  var required = [
    "MUSIC_U",
    "caid",
    "buildver",
    "sDeviceId",
    "channel",
    "packageType",
    "appver",
    "deviceId",
    "EVNSM",
    "os",
    "osver",
    "machineid",
    "NMCID",
    "appkey",
    "idfv",
    "URS_APPID",
    "NMDI",
  ];
  var missing = [];
  for (var i = 0; i < required.length; i++) {
    if (!fields[required[i]]) missing.push(required[i]);
  }
  return missing;
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
