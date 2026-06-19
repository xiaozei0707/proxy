/******************************************
 * @name Netease Music Cookie & X-Music-U
 * @description Capture full Cookie and x-music-u into BoxJS and inject it.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
var KEY_XMUSICU = "wyy_x_music_u"; // 新增保存 x-music-u 的键名
var CAPTURE_DELAY_MS = 5000;
var READY_URL_PATTERNS = [
  /\/(?:eapi|xeapi)\/vipauth\/app\/auth\/(?:soundquality\/)?query/,
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
  var boxXMusicU = $prefs.valueForKey(KEY_XMUSICU);

  // 如果 Cookie 和 x-music-u 都已存在，直接替换并完成请求[span_1](start_span)[span_1](end_span)
  if (boxCookie && boxXMusicU) {
    WYYHeaders["cookie"] = normalizeCookie(boxCookie);
    WYYHeaders["x-music-u"] = boxXMusicU;
    $done({ headers: WYYHeaders });
    return;
  }

  // 如果数据未收集全，且是目标 URL，则进入捕获逻辑[span_2](start_span)[span_2](end_span)
  if (isReadyCaptureUrl(requestUrl)) {
    setTimeout(function () {
      captureHeaders(WYYHeaders, requestUrl);
    }, CAPTURE_DELAY_MS);
    return;
  }

  // 如果不是目标 URL 但有部分缓存数据，尽量注入已有数据[span_3](start_span)[span_3](end_span)
  var modified = false;
  if (boxCookie) {
    WYYHeaders["cookie"] = normalizeCookie(boxCookie);
    modified = true;
  }
  if (boxXMusicU) {
    WYYHeaders["x-music-u"] = boxXMusicU;
    modified = true;
  }

  if (modified) {
    $done({ headers: WYYHeaders });
  } else {
    $done({});
  }
}

// 提取原捕获逻辑，改为同时捕获 Cookie 和 x-music-u[span_4](start_span)[span_4](end_span)
function captureHeaders(WYYHeaders, requestUrl) {
  var requestCookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"];
  var requestXMusicU = WYYHeaders["x-music-u"] || WYYHeaders["X-Music-U"]; // 兼容大小写

  var captured = false;
  var msg = [];

  if (requestCookie) {
    var cookie = normalizeCookie(requestCookie);
    if (cookie) {
      $prefs.setValueForKey(cookie, KEY_COOKIE);
      msg.push("Cookie");
      captured = true;
    }
  }

  if (requestXMusicU) {
    $prefs.setValueForKey(requestXMusicU, KEY_XMUSICU);
    msg.push("x-music-u");
    captured = true;
  }

  if (captured) {
    $notify("网易云音乐", "捕获成功", "已保存: " + msg.join(" 和 ") + "\n" + requestUrl);
  }

  $done({});
}

function isReadyCaptureUrl(url) {
  for (var i = 0; i < READY_URL_PATTERNS.length; i++) {
    if (READY_URL_PATTERNS[i].test(url)) return true;
  }
  return false;
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
