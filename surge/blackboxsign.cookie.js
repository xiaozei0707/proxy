/******************************************
 * BlackBoxSign cookie capture for Surge
 *
 * Capture from api.xiaoheihe.cn requests that contain:
 * - query: heybox_id
 * - cookie: pkey and x_xhh_tokenid
 ******************************************/

var STORE_KEY = "BLACKBOX_COOKIE";

(function () {
  if (typeof $request === "undefined") {
    notify("BlackBoxSign", "Capture only", "Run this script from an http-request rule.");
    return done();
  }

  var url = $request.url || "";
  var headers = $request.headers || {};
  var cookie = getHeader(headers, "cookie");
  var cookies = parseCookie(cookie);
  var query = parseQuery(url);
  var heyboxId = query.heybox_id || query.heyboxId || "";
  var pkey = cookies.pkey || getHeader(headers, "pkey");
  var tokenid = cookies.x_xhh_tokenid || getHeader(headers, "x_xhh_tokenid") || getHeader(headers, "x-xhh-tokenid");

  if (!heyboxId || !pkey || !tokenid) {
    notify("BlackBoxSign", "Capture failed", "Open Xiaoheihe task/sign page again. Missing heybox_id, pkey, or x_xhh_tokenid.");
    return done();
  }

  var cleanCookie = "pkey=" + pkey + ";x_xhh_tokenid=" + tokenid;
  var account = heyboxId + "#" + cleanCookie;
  var accounts = readAccounts();
  var replaced = false;

  for (var i = 0; i < accounts.length; i++) {
    if (accounts[i].split("#")[0] === heyboxId) {
      accounts[i] = account;
      replaced = true;
      break;
    }
  }

  if (!replaced) accounts.push(account);

  if (write(STORE_KEY, accounts.join("&"))) {
    notify("BlackBoxSign", replaced ? "Cookie updated" : "Cookie captured", "heybox_id: " + heyboxId + "\naccounts: " + accounts.length);
  } else {
    notify("BlackBoxSign", "Save failed", "Surge persistent storage write failed.");
  }

  done();
})();

function readAccounts() {
  var raw = read(STORE_KEY) || "";
  return raw
    .split(/[\n&]+/)
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item.indexOf("#") > 0;
    });
}

function parseCookie(cookie) {
  var out = {};
  String(cookie || "")
    .split(";")
    .forEach(function (part) {
      var index = part.indexOf("=");
      if (index < 0) return;
      var key = part.slice(0, index).trim();
      var value = part.slice(index + 1).trim();
      if (key) out[key] = value;
    });
  return out;
}

function parseQuery(url) {
  var out = {};
  var query = String(url || "").split("?")[1] || "";
  query.split("&").forEach(function (part) {
    if (!part) return;
    var index = part.indexOf("=");
    var key = index >= 0 ? part.slice(0, index) : part;
    var value = index >= 0 ? part.slice(index + 1) : "";
    try {
      out[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
    } catch (e) {
      out[key] = value;
    }
  });
  return out;
}

function getHeader(headers, name) {
  var lower = String(name).toLowerCase();
  for (var key in headers) {
    if (String(key).toLowerCase() === lower) return headers[key];
  }
  return "";
}

function read(key) {
  return $persistentStore.read(key);
}

function write(key, value) {
  return $persistentStore.write(value, key);
}

function notify(title, subtitle, body) {
  if (typeof $notification !== "undefined") $notification.post(title, subtitle, body || "");
  console.log([title, subtitle, body || ""].join(" | "));
}

function done(value) {
  if (typeof $done !== "undefined") $done(value || {});
}
