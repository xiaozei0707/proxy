/******************************************
 * @name Netease Music Cookie (No Validation)
 * @description Capture one full Cookie into BoxJS and inject it. (Removed strict validations)
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_LAST_NOTIFY = "wyy_cookie_last_notify";
var NOTIFY_INTERVAL_MS = 15000;
var CAPTURE_DELAY_MS = 5000;
var READY_URL_PATTERNS = [
  /\/(?:eapi|xeapi)\/vipauth\/app\/auth\/(?:soundquality\/)?query/,
];

// 需要被强行替换为占位符的设备标识字段
var FIXED_COOKIE_VALUES = {
  sDeviceId: "00000000000000000000000000000000",
  idfa: "00000000-0000-0000-0000-000000000000",
  deviceId: "00000000000000000000000000000000",
  idfv: "00000000-0000-0000-0000-000000000000",
};

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

  // 1. 如果本地已经存了 Cookie，尝试处理并注入
  if (boxCookie) {
    var normalizedBoxCookie = buildCookie(boxCookie);
    if (normalizedBoxCookie) {
      WYYHeaders["cookie"] = normalizedBoxCookie;
      $done({ headers: WYYHeaders });
      return;
    }
  }

  // 2. 如果没存或者没处理成功，判断当前 URL 是否是抓取目标
  if (!isReadyCaptureUrl(requestUrl)) {
    $done({});
    return;
  }

  // 3. 延迟抓取
  setTimeout(function () {
    captureCookie(WYYHeaders);
  }, CAPTURE_DELAY_MS);
}

function captureCookie(WYYHeaders) {
  var requestCookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"];
  if (!requestCookie) {
    $done({});
    return;
  }

  // 只要包含最核心的账号身份 MUSIC_U 即可，不再校验其他几十个字段是否齐全
  var musicU = getCookieValue(requestCookie, "MUSIC_U");
  if (!musicU) {
    if (shouldNotify()) {
      $notify("网易云音乐", "等待提取", "未在请求中发现核心登录状态 MUSIC_U");
    }
    $done({});
    return;
  }

  // 处理、替换追踪字段后保存
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

function shouldNotify() {
  var now = Date.now();
  var last = Number($prefs.valueForKey(KEY_LAST_NOTIFY) || 0);
  if (now - last < NOTIFY_INTERVAL_MS) return false;
  $prefs.setValueForKey(String(now), KEY_LAST_NOTIFY);
  return true;
}

function buildCookie(cookie) {
  var fields = parseCookie(cookie);
  var pairs = [];

  // 遍历当前请求自带的所有 Cookie 字段
  for (var key in fields) {
    // 如果是设备 ID，强行替换为 0 的占位符
    if (FIXED_COOKIE_VALUES[key]) {
      pairs.push(key + "=" + FIXED_COOKIE_VALUES[key]);
    } else {
      // 其他字段原样保留
      pairs.push(key + "=" + fields[key]);
    }
  }

  // 兜底机制：即使原始请求里连设备 ID 字段都没有，也强行给它塞进去（防止服务端报错）
  for (var fixedKey in FIXED_COOKIE_VALUES) {
    if (typeof fields[fixedKey] === "undefined") {
      pairs.push(fixedKey + "=" + FIXED_COOKIE_VALUES[fixedKey]);
    }
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

function getCookieValue(cookie, name) {
  return parseCookie(cookie)[name] || "";
}

function maskMusicU(cookie) {
  var match = String(cookie || "").match(/(?:^|;\s*)MUSIC_U=([^;]+)/);
  if (!match) return "未找到 MUSIC_U";
  var value = match[1];
  if (value.length <= 16) return "MUSIC_U=" + value;
  return "MUSIC_U=" + value.slice(0, 8) + "..." + value.slice(-8);
}
