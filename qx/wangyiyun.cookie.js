/******************************************
 * @name Netease Music Cookie
 * @description Capture one full Cookie into BoxJS and inject it.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
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
  var boxCookie = $prefs.valueForKey(KEY_COOKIE);

  if (boxCookie) {
    WYYHeaders["cookie"] = normalizeCookie(boxCookie);
    $done({ headers: WYYHeaders });
    return;
  }

  var requestCookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"];
  if (!requestCookie) {
    $done({});
    return;
  }

  var cookie = buildCookie(requestCookie);
  if (!cookie) {
    $done({});
    return;
  }

  $prefs.setValueForKey(cookie, KEY_COOKIE);
  $notify("网易云音乐", "Cookie 捕获成功", maskMusicU(cookie));
  $done({});
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
    if (!value) return "";
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

function maskMusicU(cookie) {
  var match = String(cookie || "").match(/(?:^|;\s*)MUSIC_U=([^;]+)/);
  if (!match) return "未找到 MUSIC_U";
  var value = match[1];
  if (value.length <= 16) return "MUSIC_U=" + value;
  return "MUSIC_U=" + value.slice(0, 8) + "..." + value.slice(-8);
}
