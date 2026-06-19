/******************************************
 * @name Netease Music Cookie
 * @description Capture one full Cookie into BoxJS and inject it.
 ******************************************/

var KEY_COOKIE = "wyy_cookie";
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

  if (boxCookie) {
    WYYHeaders["cookie"] = normalizeCookie(boxCookie);
    $done({ headers: WYYHeaders });
    return;
  }

  if (!isReadyCaptureUrl(requestUrl)) {
    $done({});
    return;
  }

  setTimeout(function () {
    captureCookie(WYYHeaders, requestUrl);
  }, CAPTURE_DELAY_MS);
}

function captureCookie(WYYHeaders, requestUrl) {
  var requestCookie = WYYHeaders["cookie"] || WYYHeaders["Cookie"];
  if (!requestCookie) {
    $done({});
    return;
  }

  var cookie = normalizeCookie(requestCookie);
  if (!cookie) {
    $done({});
    return;
  }

  $prefs.setValueForKey(cookie, KEY_COOKIE);
  $notify("网易云音乐", "从这条请求捕获成功", requestUrl);
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
