/******************************************
 * MagicalBox VIP response mock for Surge
 *
 * Use only against your own test service/account.
 * It rewrites /api3/tool/api/getUserMessage
 * so the client can test VIP UI/state handling.
 ******************************************/

(function () {
  if (typeof $response === "undefined") return done();

  var body = parseJson($response.body || "");
  if (!body || !body.data) {
    notify("MagicalBox VIP Mock", "Skipped", "Unexpected response body.");
    return done();
  }

  var options = parseArgs(typeof $argument === "string" ? $argument : "");
  var vipTime = Number(has(options, "vipTime") ? options.vipTime : 4102444800000); // 2100-01-01T00:00:00.000Z
  var stars = Number(has(options, "stars") ? options.stars : 999);
  var admin = Number(has(options, "admin") ? options.admin : 1);
  var websiteNumber = Number(has(options, "websiteNumber") ? options.websiteNumber : 999);

  body.code = Number(body.code || 200);
  body.msg = options.msg || body.msg || "OK";
  applyDataOverrides(body.data, options);
  body.data.vipTime = vipTime;
  body.data.stars = stars;
  body.data.admin = admin;
  body.data.websiteNumber = websiteNumber;

  notify(
    "MagicalBox VIP Mock",
    admin ? "Admin VIP enabled" : "VIP enabled",
    "userId: " + value(body.data.userId) +
      "\nadmin: " + admin +
      "\nvipTime: " + vipTime +
      "\nstars: " + stars +
      "\nwebsiteNumber: " + websiteNumber
  );

  console.log("MagicalBox VIP Mock data fields\n" + JSON.stringify(body.data, null, 2));
  done({ body: JSON.stringify(body) });
})();

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function parseArgs(text) {
  var out = {};
  String(text || "")
    .split("&")
    .forEach(function (part) {
      if (!part) return;
      var index = part.indexOf("=");
      var key = index >= 0 ? part.slice(0, index) : part;
      var val = index >= 0 ? part.slice(index + 1) : "";
      try {
        out[decodeURIComponent(key)] = decodeURIComponent(val.replace(/\+/g, " "));
      } catch (e) {
        out[key] = val;
      }
    });
  return out;
}

function applyDataOverrides(data, options) {
  Object.keys(options).forEach(function (key) {
    if (key.indexOf("data.") !== 0) return;
    var field = key.slice(5);
    if (!field) return;
    data[field] = parseScalar(options[key]);
  });
}

function parseScalar(input) {
  if (input === "true") return true;
  if (input === "false") return false;
  if (input === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(input)) return Number(input);
  return input;
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function value(input) {
  if (input === null || typeof input === "undefined" || input === "") return "-";
  return String(input);
}

function notify(title, subtitle, body) {
  if (typeof $notification !== "undefined") $notification.post(title, subtitle, body || "");
  console.log([title, subtitle, body || ""].join(" | "));
}

function done(value) {
  if (typeof $done !== "undefined") $done(value || {});
}
