/******************************************
 * @name Netease Music Cookie
 * @description Capture one full Cookie into BoxJS and inject it.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_LAST_NOTIFY = "wyy_cookie_last_notify";
var NOTIFY_INTERVAL_MS = 15000;
var READY_URL_PATTERNS = [
  /\/(?:eapi|xeapi)\/ad\/(?:loading\/current|prefetch\/select)/,
  /\/eapi\/lbs\/gpsStatus\/upload/,
  /\/api\/page\/fast\/play\/get/,
  /\/(?:eapi|xeapi)\/song\/enhance\/(?:privilege|player\/url\/v1)/,
  /\/(?:eapi|xeapi)\/vipauth\/app\/auth\/(?:soundquality\/)?query/,
];
var COOKIE_FIELDS = [
  "MUSIC_U",
  "caid",
  "buildver",
  "sDeviceId",
  "channel",
  "idfa",
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
  var requestUrl = $request.url || "";
  var boxCookie = $prefs.valueForKey(KEY_COOKIE);

  if (boxCookie) {
    var normalizedBoxCookie = buildCookie(boxCookie);
    if (normalizedBoxCookie) {
      WYYHeaders["cookie"] = normalizedBoxCookie;
      $done({ headers: WYYHeaders });
      return;
    }

    $prefs.setValueForKey("", KEY_COOKIE);
    notifyMissing("BoxJS Cookie 不完整", missingCookieFields(boxCookie), true);
  }

  if (!isReadyCaptureUrl(requestUrl)) {
    $done({});
    return;
  }

  var requestCookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"];
  if (!requestCookie) {
    notifyMissing("等待完整 Cookie", COOKIE_FIELDS, false);
    $done({});
    return;
  }

  var validation = validateRequest(WYYHeaders, requestCookie);
  if (!validation.ok) {
    notifyMissing(validation.title, validation.missing, false);
    $done({});
    return;
  }

  var cookie = buildCookie(requestCookie);
  $prefs.setValueForKey(cookie, KEY_COOKIE);
  $notify("网易云音乐", "Cookie 捕获成功", maskMusicU(cookie));
  $done({});
}

function isReadyCaptureUrl(url) {
  for (var i = 0; i < READY_URL_PATTERNS.length; i++) {
    if (READY_URL_PATTERNS[i].test(url)) return true;
  }
  return false;
}

function validateRequest(headers, cookie) {
  var missing = missingCookieFields(cookie);
  if (missing.length) {
    return { ok: false, title: "等待完整 Cookie", missing: missing };
  }

  var musicU = getCookieValue(cookie, "MUSIC_U");
  var headerMusicU = pickHeader(headers, "x-music-u");
  if (headerMusicU && headerMusicU !== musicU) {
    return { ok: false, title: "等待账号字段一致", missing: ["x-music-u 与 MUSIC_U 不一致"] };
  }

  return { ok: true, title: "", missing: [] };
}

function notifyMissing(title, missing, force) {
  if (missing.length) {
    if (!force && !shouldNotify()) return;
    $notify("网易云音乐", title, "缺少字段: " + missing.join(", "));
  }
}

function shouldNotify() {
  var now = Date.now();
  var last = Number($prefs.valueForKey(KEY_LAST_NOTIFY) || 0);
  if (now - last < NOTIFY_INTERVAL_MS) return false;
  $prefs.setValueForKey(String(now), KEY_LAST_NOTIFY);
  return true;
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

function buildCookie(cookie) {
  var fields = parseCookie(cookie);
  var pairs = [];
  for (var i = 0; i < COOKIE_FIELDS.length; i++) {
    var key = COOKIE_FIELDS[i];
    var value = fields[key];
    if (typeof value === "undefined" || value === "") return "";
    pairs.push(key + "=" + value);
  }
  return pairs.join("; ");
}

function parseCookie(cookie) {
  var fields = {};
  String(cookie || "")
    .replace(/[\r\n]/g, "")
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

function pickHeader(headers, name) {
  var target = String(name || "").toLowerCase();
  for (var key in headers) {
    if (String(key).toLowerCase() === target) return headers[key];
  }
  return "";
}

function getCookieValue(cookie, name) {
  return parseCookie(cookie)[name] || "";
}

function missingCookieFields(cookie) {
  var fields = parseCookie(cookie);
  var missing = [];
  for (var i = 0; i < COOKIE_FIELDS.length; i++) {
    var key = COOKIE_FIELDS[i];
    var value = fields[key];
    if (typeof value === "undefined" || value === "") missing.push(key);
  }
  return missing;
}

function maskMusicU(cookie) {
  var match = String(cookie || "").match(/(?:^|;\s*)MUSIC_U=([^;]+)/);
  if (!match) return "未找到 MUSIC_U";
  var value = match[1];
  if (value.length <= 16) return "MUSIC_U=" + value;
  return "MUSIC_U=" + value.slice(0, 8) + "..." + value.slice(-8);
}
