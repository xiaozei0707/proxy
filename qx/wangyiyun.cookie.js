/******************************************
 * @name Netease Music Headers
 * @description Quantumult X request header injector and capture helper for BoxJS.
 ******************************************/

var $ = Env();
var KEY_COOKIE = "wyy_cookie";
var KEY_MCONFIG = "wyy_mconfig_info";
var KEY_USER_AGENT = "wyy_user_agent";
var KEY_HEADERS = "wyy_headers";
var KEY_FIELDS = "wyy_cookie_fields";
var KEY_CAPTURE_TIME = "wyy_cookie_capture_time";
var KEY_LAST_URL = "wyy_last_url";
var KEY_LAST_STATUS = "wyy_last_status";
var KEY_LAST_INJECTED_MUSIC_U = "wyy_last_injected_music_u";
var HEADER_KEYS = [
  "x-trc-trsmt",
  "x-machineid",
  "x-os",
  "x-mam-custommark",
  "x-osver",
  "x-idfv",
  "x-deviceid",
  "x-appkey",
  "x-urs-appid",
  "accept-language",
  "content-type",
  "x-appver",
  "x-sdeviceid",
  "mconfig-info",
  "x-music-u",
  "accept",
  "x-netlib",
  "user-agent",
  "x-caid",
  "x-buildver",
  "x-idfa",
  "x-channel",
  "x-packagetype",
  "x-nmdi",
  "x-nmcid",
  "x-nmtid",
  "x-csrf",
];
var COOKIE_ORDER = [
  "MUSIC_U",
  "__csrf",
  "ntes_kaola_ad",
  "EVNSM",
  "NMCID",
  "NMDI",
  "URS_APPID",
  "appkey",
  "appver",
  "buildver",
  "caid",
  "channel",
  "deviceId",
  "idfa",
  "idfv",
  "machineid",
  "os",
  "osver",
  "packageType",
  "sDeviceId",
  "JSESSIONID-WYYY",
  "_iuqxldmzr_",
  "WEVNSM",
  "WNMCID",
  "_ntes_nnid",
  "_ntes_nuid",
  "NMTID",
];

try {
  if (typeof $request === "undefined") {
    $.msg("网易云音乐", "仅用于请求捕获", "请在 Quantumult X rewrite 中使用。");
    $.done();
  } else {
    handleRequest();
  }
} catch (err) {
  $.msg("网易云音乐", "脚本异常", String(err));
  $.done();
}

function handleRequest() {
  console.log("网易云音乐命中接口：" + ($request.url || ""));
  $.setdata($request.url || "", KEY_LAST_URL);

  var WYYHeaders = $request.headers || {};
  var savedCookie = $.getdata(KEY_COOKIE);
  if (savedCookie) {
    injectHeaders(WYYHeaders, savedCookie);
    console.log("网易云音乐 Cookie 已存在，已写入请求头。");
    $.setdata("已注入保存的 Cookie", KEY_LAST_STATUS);
    $.done({ headers: WYYHeaders });
    return;
  }

  var cookie = buildTemplateCookie(WYYHeaders);
  var mconfig = pickHeader(WYYHeaders, "mconfig-info");
  var userAgent = pickHeader(WYYHeaders, "user-agent");

  if (!cookie) {
    console.log("网易云音乐当前请求头没有 Cookie 或 x-music-u，继续等待。");
    $.setdata("命中但无 Cookie/x-music-u", KEY_LAST_STATUS);
    $.msg("网易云音乐", "命中但未获取", "当前接口没有 Cookie 或 x-music-u，请播放歌曲或进入歌曲详情。");
    $.done();
    return;
  }

  $.setdata(cookie, KEY_COOKIE);
  $.setdata(JSON.stringify(parseCookie(cookie)), KEY_FIELDS);
  $.setdata(JSON.stringify(collectHeaders(WYYHeaders)), KEY_HEADERS);
  if (mconfig) $.setdata(mconfig, KEY_MCONFIG);
  if (userAgent) $.setdata(userAgent, KEY_USER_AGENT);
  $.setdata(formatDate(new Date()), KEY_CAPTURE_TIME);
  $.setdata("获取成功", KEY_LAST_STATUS);

  injectHeaders(WYYHeaders, cookie);
  $.msg("网易云音乐", "获取成功", "Cookie 已保存并写入当前请求头。");
  $.done({ headers: WYYHeaders });
}

function injectHeaders(headers, cookie) {
  var mconfig = $.getdata(KEY_MCONFIG);
  var userAgent = $.getdata(KEY_USER_AGENT);
  var savedHeaders = safeJson($.getdata(KEY_HEADERS), {});
  var savedFields = safeJson($.getdata(KEY_FIELDS), {});
  var cookies = mergeCookieFields(parseCookie(cookie), savedFields);
  cookies = mergeCookieFields(cookies, cookieFieldsFromHeaders(savedHeaders));
  var finalCookie = stringifyCookie(cookies);

  removeHeader(headers, "cookie");
  headers["cookie"] = finalCookie;
  injectSavedHeaders(headers, savedHeaders, cookies);
  if (mconfig) setHeaderValue(headers, "mconfig-info", mconfig);
  if (userAgent) setHeaderValue(headers, "user-agent", userAgent);
  if (cookies.MUSIC_U) $.setdata(maskValue(cookies.MUSIC_U), KEY_LAST_INJECTED_MUSIC_U);
}

function pickHeader(headers, name) {
  var target = String(name || "").toLowerCase();
  for (var key in headers) {
    if (String(key).toLowerCase() === target) return headers[key];
  }
  return "";
}

function removeHeader(headers, name) {
  var target = String(name || "").toLowerCase();
  Object.keys(headers).forEach(function (key) {
    if (String(key).toLowerCase() === target) delete headers[key];
  });
}

function setHeaderValue(headers, name, value) {
  if (!value) return;
  removeHeader(headers, name);
  headers[name] = value;
}

function injectSavedHeaders(headers, savedHeaders, cookies) {
  HEADER_KEYS.forEach(function (name) {
    var value = pickHeader(savedHeaders, name);
    if (!value) value = headerFallback(name, cookies);
    if (value) setHeaderValue(headers, name, value);
  });
}

function headerFallback(name, cookies) {
  switch (String(name || "").toLowerCase()) {
    case "x-music-u": return cookies.MUSIC_U;
    case "x-machineid": return cookies.machineid;
    case "x-os": return cookies.os;
    case "x-osver": return cookies.osver;
    case "x-idfv": return cookies.idfv;
    case "x-deviceid": return cookies.deviceId;
    case "x-appkey": return cookies.appkey;
    case "x-urs-appid": return cookies.URS_APPID;
    case "x-appver": return cookies.appver;
    case "x-sdeviceid": return cookies.sDeviceId;
    case "x-caid": return cookies.caid;
    case "x-buildver": return cookies.buildver;
    case "x-idfa": return cookies.idfa;
    case "x-channel": return cookies.channel;
    case "x-packagetype": return cookies.packageType;
    case "x-nmdi": return cookies.NMDI;
    case "x-nmcid": return cookies.NMCID;
    case "x-nmtid": return cookies.NMTID;
    case "x-csrf": return cookies.__csrf;
    default: return "";
  }
}

function buildTemplateCookie(headers) {
  var rawCookie = pickHeader(headers, "cookie");
  var cookies = parseCookie(rawCookie);
  var userAgent = pickHeader(headers, "user-agent");

  setIfMissing(cookies, "MUSIC_U", pickHeader(headers, "x-music-u"));
  setIfMissing(cookies, "__csrf", pickHeader(headers, "x-csrf"));
  setIfMissing(cookies, "NMCID", pickHeader(headers, "x-nmcid"));
  setIfMissing(cookies, "NMTID", pickHeader(headers, "x-nmtid"));
  setIfMissing(cookies, "appkey", pickHeader(headers, "x-appkey"));
  setIfMissing(cookies, "appver", pickHeader(headers, "x-appver") || parseUserAgent(userAgent).appver);
  setIfMissing(cookies, "buildver", pickHeader(headers, "x-buildver") || parseUserAgent(userAgent).buildver);
  setIfMissing(cookies, "deviceId", pickHeader(headers, "x-deviceid"));
  setIfMissing(cookies, "sDeviceId", pickHeader(headers, "x-sdeviceid"));
  setIfMissing(cookies, "idfa", pickHeader(headers, "x-idfa"));
  setIfMissing(cookies, "idfv", pickHeader(headers, "x-idfv"));
  setIfMissing(cookies, "machineid", pickHeader(headers, "x-machineid"));
  setIfMissing(cookies, "os", pickHeader(headers, "x-os"));
  setIfMissing(cookies, "osver", pickHeader(headers, "x-osver"));
  setIfMissing(cookies, "URS_APPID", pickHeader(headers, "x-urs-appid"));
  setIfMissing(cookies, "NMDI", pickHeader(headers, "x-nmdi"));
  setIfMissing(cookies, "caid", pickHeader(headers, "x-caid"));
  setIfMissing(cookies, "channel", pickHeader(headers, "x-channel"));
  setIfMissing(cookies, "packageType", pickHeader(headers, "x-packagetype") || pickHeader(headers, "x-packageType"));

  if (!cookies.MUSIC_U) return "";
  return stringifyCookie(cookies);
}

function parseCookie(cookie) {
  var obj = {};
  String(cookie || "")
    .replace(/[\r\n]/g, "")
    .split(";")
    .forEach(function (item) {
      var pair = item.trim();
      var index = pair.indexOf("=");
      if (index > -1) obj[pair.slice(0, index)] = pair.slice(index + 1);
    })
  return obj;
}

function stringifyCookie(cookies) {
  var used = {};
  var pairs = [];
  COOKIE_ORDER.forEach(function (key) {
    if (cookies[key]) {
      pairs.push(key + "=" + cookies[key]);
      used[key] = true;
    }
  });
  Object.keys(cookies).forEach(function (key) {
    if (!used[key] && cookies[key]) pairs.push(key + "=" + cookies[key]);
  });
  return pairs.join("; ");
}

function mergeCookieFields(primary, fallback) {
  var out = {};
  var key;
  for (key in fallback) {
    if (fallback[key]) out[key] = fallback[key];
  }
  for (key in primary) {
    if (primary[key]) out[key] = primary[key];
  }
  return out;
}

function setIfMissing(obj, key, value) {
  if (!obj[key] && value) obj[key] = String(value).trim();
}

function parseUserAgent(userAgent) {
  var match = String(userAgent || "").match(/NeteaseMusic\s+([\d.]+)\/(\d+)/i);
  return {
    appver: match ? match[1] : "",
    buildver: match ? match[2] : "",
  };
}

function collectHeaders(headers) {
  var out = {};
  ["cookie"].concat(HEADER_KEYS).forEach(function (key) {
    var value = pickHeader(headers, key);
    if (value) out[key] = value;
  });
  return out;
}

function cookieFieldsFromHeaders(headers) {
  var fields = {};
  setIfMissing(fields, "MUSIC_U", pickHeader(headers, "x-music-u"));
  setIfMissing(fields, "machineid", pickHeader(headers, "x-machineid"));
  setIfMissing(fields, "os", pickHeader(headers, "x-os"));
  setIfMissing(fields, "osver", pickHeader(headers, "x-osver"));
  setIfMissing(fields, "idfv", pickHeader(headers, "x-idfv"));
  setIfMissing(fields, "deviceId", pickHeader(headers, "x-deviceid"));
  setIfMissing(fields, "appkey", pickHeader(headers, "x-appkey"));
  setIfMissing(fields, "URS_APPID", pickHeader(headers, "x-urs-appid"));
  setIfMissing(fields, "appver", pickHeader(headers, "x-appver"));
  setIfMissing(fields, "sDeviceId", pickHeader(headers, "x-sdeviceid"));
  setIfMissing(fields, "caid", pickHeader(headers, "x-caid"));
  setIfMissing(fields, "buildver", pickHeader(headers, "x-buildver"));
  setIfMissing(fields, "idfa", pickHeader(headers, "x-idfa"));
  setIfMissing(fields, "channel", pickHeader(headers, "x-channel"));
  setIfMissing(fields, "packageType", pickHeader(headers, "x-packagetype"));
  setIfMissing(fields, "NMDI", pickHeader(headers, "x-nmdi"));
  setIfMissing(fields, "NMCID", pickHeader(headers, "x-nmcid"));
  setIfMissing(fields, "NMTID", pickHeader(headers, "x-nmtid"));
  setIfMissing(fields, "__csrf", pickHeader(headers, "x-csrf"));
  return fields;
}

function safeJson(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

function maskValue(value) {
  value = String(value || "");
  if (value.length <= 16) return value;
  return value.slice(0, 8) + "..." + value.slice(-8);
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
