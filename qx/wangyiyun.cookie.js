/******************************************
 * @name Netease Music Cookie
 * @description Quantumult X BoxJS cookie injector.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_MCONFIG = "wyy_mconfig_info";
var KEY_USER_AGENT = "wyy_user_agent";
var KEY_HEADERS = "wyy_headers";
var KEY_COOKIE_FIELDS = "wyy_cookie_fields";
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
  var WYYHeaders = $request.headers || {};
  var savedCookie = read(KEY_COOKIE);
  write(KEY_LAST_URL, $request.url || "");

  if (savedCookie) {
    var injectedCookie = clean(savedCookie);
    WYYHeaders["cookie"] = injectedCookie;

    var savedMconfig = read(KEY_MCONFIG);
    var savedUserAgent = read(KEY_USER_AGENT);
    if (savedMconfig) WYYHeaders["mconfig-info"] = savedMconfig;
    if (savedUserAgent) WYYHeaders["user-agent"] = savedUserAgent;

    var injectedMusicU = getCookieValue(injectedCookie, "MUSIC_U");
    write(KEY_LAST_STATUS, "已使用保存的 Cookie 替换当前请求");
    write(KEY_LAST_INJECTED_MUSIC_U, injectedMusicU);
    write(KEY_LAST_INJECTED_HEADERS, JSON.stringify(WYYHeaders));
    notify("Cookie 替换成功", maskMusicU(injectedMusicU), $request.url || "");
    $done({ headers: WYYHeaders });
    return;
  }

  var cookie = pickHeader(WYYHeaders, "cookie");
  if (!cookie && pickHeader(WYYHeaders, "x-music-u")) {
    cookie = buildCookieFromHeaders(WYYHeaders);
  }

  if (!cookie) {
    write(KEY_LAST_STATUS, "命中但未获取 Cookie");
    $done({});
    return;
  }

  cookie = clean(cookie);
  write(KEY_COOKIE, cookie);
  write(KEY_HEADERS, JSON.stringify(WYYHeaders));
  write(KEY_COOKIE_FIELDS, JSON.stringify(parseCookie(cookie)));

  var mconfig = pickHeader(WYYHeaders, "mconfig-info");
  var userAgent = pickHeader(WYYHeaders, "user-agent");
  if (mconfig) write(KEY_MCONFIG, mconfig);
  if (userAgent) write(KEY_USER_AGENT, userAgent);
  write(KEY_CAPTURE_TIME, formatDate(new Date()));
  write(KEY_LAST_STATUS, "Cookie 捕获成功并替换当前请求");

  WYYHeaders["cookie"] = cookie;
  if (mconfig) WYYHeaders["mconfig-info"] = mconfig;
  if (userAgent) WYYHeaders["user-agent"] = userAgent;
  var musicU = getCookieValue(cookie, "MUSIC_U");
  write(KEY_LAST_INJECTED_MUSIC_U, musicU);
  write(KEY_LAST_INJECTED_HEADERS, JSON.stringify(WYYHeaders));
  notify("Cookie 捕获成功", maskMusicU(musicU), "已保存并替换当前请求");
  $done({ headers: WYYHeaders });
}

function buildCookieFromHeaders(headers) {
  var pairs = [];
  add(pairs, "MUSIC_U", pickHeader(headers, "x-music-u"));
  add(pairs, "caid", pickHeader(headers, "x-caid"));
  add(pairs, "buildver", pickHeader(headers, "x-buildver") || parseUserAgent(pickHeader(headers, "user-agent")).buildver);
  add(pairs, "sDeviceId", pickHeader(headers, "x-sdeviceid"));
  add(pairs, "channel", pickHeader(headers, "x-channel"));
  add(pairs, "idfa", pickHeader(headers, "x-idfa"));
  add(pairs, "packageType", pickHeader(headers, "x-packagetype"));
  add(pairs, "appver", pickHeader(headers, "x-appver") || parseUserAgent(pickHeader(headers, "user-agent")).appver);
  add(pairs, "deviceId", pickHeader(headers, "x-deviceid"));
  add(pairs, "os", pickHeader(headers, "x-os"));
  add(pairs, "osver", pickHeader(headers, "x-osver"));
  add(pairs, "machineid", pickHeader(headers, "x-machineid"));
  add(pairs, "appkey", pickHeader(headers, "x-appkey"));
  add(pairs, "idfv", pickHeader(headers, "x-idfv"));
  add(pairs, "URS_APPID", pickHeader(headers, "x-urs-appid"));
  add(pairs, "NMDI", pickHeader(headers, "x-nmdi"));
  return pairs.join("; ");
}

function add(pairs, key, value) {
  if (value) pairs.push(key + "=" + String(value).trim());
}

function pickHeader(headers, name) {
  var target = String(name || "").toLowerCase();
  for (var key in headers) {
    if (String(key).toLowerCase() === target) return headers[key];
  }
  return "";
}

function parseUserAgent(userAgent) {
  var match = String(userAgent || "").match(/NeteaseMusic\s+([\d.]+)\/(\d+)/i);
  return {
    appver: match ? match[1] : "",
    buildver: match ? match[2] : "",
  };
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
