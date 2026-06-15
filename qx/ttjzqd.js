/******************************************
 * @name Tuantuan Bookkeeping Sign
 * @description Quantumult X capture and daily sign script.
 ******************************************/

var $ = Env();
var KEY_AUTH = "ttjz_auth";
var HOST = "gs.gateway.gameley.cn";
var BASE = "https://" + HOST;

!(async function () {
  if (typeof $request !== "undefined") {
    capture();
  } else {
    await sign();
  }
})()
  .catch(function (err) {
    $.msg("团团记账", "脚本异常", String(err));
  })
  .finally(function () {
    $.done();
  });

function capture() {
  var headers = lowerHeaders($request.headers || {});
  var oldAuth = safeJson($.getdata(KEY_AUTH), {});
  var auth = {};
  var keys = [
    "accesstoken",
    "refreshtoken",
    "userid",
    "devicecode",
    "np-book-token",
    "apptype",
    "version",
    "versioncode",
    "sys",
    "channel",
    "user-agent",
    "sign",
    "time",
  ];

  for (var i = 0; i < keys.length; i++) {
    auth[keys[i]] = headers[keys[i]] || oldAuth[keys[i]] || "";
  }

  if (!auth.accesstoken || !auth.refreshtoken || !auth.userid || !auth["np-book-token"]) {
    $.msg("团团记账", "获取失败", "没有在请求头里找到完整 token，请重新打开团团记账后再试");
    return;
  }

  auth.savedAt = new Date().toISOString();
  $.setdata(JSON.stringify(auth), KEY_AUTH);

  $.msg(
    "团团记账",
    oldAuth.accesstoken ? "Token 更新成功" : "Token 保存成功",
    "用户ID：" + auth.userid
  );
}

async function sign() {
  var auth = safeJson($.getdata(KEY_AUTH), {});
  if (!auth.accesstoken || !auth.refreshtoken || !auth.userid || !auth["np-book-token"]) {
    $.msg("团团记账签到", "缺少 Token", "请先打开团团记账，让重写规则获取一次登录信息");
    return;
  }

  auth = await refreshToken(auth);
  var headers = buildHeaders(auth);
  var beforeCoin = await getCoin(headers);
  var listRes = parseBody(await get(dailyListUrl(), headers));

  if (!isSuccess(listRes)) {
    $.msg("团团记账签到", "签到失败", failText(listRes));
    return;
  }

  var currentTask = currentDailyTask(listRes);
  var alreadySigned = currentTask && currentTask.awardStatus === 2;
  var signCoin = 0;
  var signText = "";

  if (alreadySigned) {
    signText = "今日已签到";
    signCoin = sumGoods(currentTask, "金币");
  } else {
    var signRes = parseBody(await get(BASE + "/np-book-user/task/daily/cogain/v2?timestamp=" + Date.now(), headers));
    if (!isSuccess(signRes)) {
      $.msg("团团记账签到", "签到失败", failText(signRes));
      return;
    }
    signCoin = sumGoods(signRes.info, "金币");
    signText = "签到成功";
  }

  var doubleCoin = 0;
  var doubleText = "";
  if (currentTask && currentTask.id !== undefined) {
    var doubleRes = parseBody(
      await post(BASE + "/np-book-user/task/complete", JSON.stringify({ achieveType: 2011, taskId: currentTask.id }), headers)
    );
    if (isSuccess(doubleRes)) {
      doubleCoin = sumReceive(doubleRes.info, "金币");
      doubleText = doubleCoin ? "双倍奖励成功" : "双倍奖励已处理";
    } else if (isAlreadyDone(doubleRes)) {
      doubleText = "双倍奖励已领取";
    } else {
      doubleText = "双倍奖励失败：" + failText(doubleRes);
    }
  } else {
    doubleText = "未找到今日签到任务，双倍奖励跳过";
  }

  var afterCoin = await getCoin(headers);
  var totalCoin = afterCoin !== undefined ? afterCoin : beforeCoin;
  if (!signCoin && beforeCoin !== undefined && afterCoin !== undefined && afterCoin > beforeCoin) {
    signCoin = afterCoin - beforeCoin - doubleCoin;
    if (signCoin < 0) signCoin = 0;
  }

  $.msg("团团记账签到", signText, buildNotify(signCoin, doubleCoin, totalCoin, doubleText));
}

async function refreshToken(auth) {
  if (!auth.refreshtoken) return auth;

  var headers = buildHeaders(auth);
  if (auth.sign) headers.sign = auth.sign;
  if (auth.time) headers.time = auth.time;

  var res = parseBody(await post(BASE + "/np-book-user/user/refresh/token", "{}", headers));
  if (!isSuccess(res) || !res.info) return auth;

  if (res.info.accessToken) auth.accesstoken = res.info.accessToken;
  if (res.info.refreshToken) auth.refreshtoken = res.info.refreshToken;
  if (res.info.token) auth["np-book-token"] = res.info.token;
  if (res.info.userId) auth.userid = String(res.info.userId);
  auth.savedAt = new Date().toISOString();
  $.setdata(JSON.stringify(auth), KEY_AUTH);
  return auth;
}

function buildHeaders(auth) {
  return {
    Host: HOST,
    "User-Agent": auth["user-agent"] || "Dart/3.7 (dart:io)",
    accesstoken: auth.accesstoken,
    refreshtoken: auth.refreshtoken,
    userid: String(auth.userid),
    devicecode: auth.devicecode || "",
    "np-book-token": auth["np-book-token"],
    apptype: auth.apptype || "38",
    version: auth.version || "2.8.6",
    versioncode: auth.versioncode || "156",
    sys: auth.sys || "1",
    channel: auth.channel || "apple",
    "content-type": "application/json",
    "accept-encoding": "gzip",
  };
}

function dailyListUrl() {
  return BASE + "/np-book-user/task/daily/list?timestamp=" + Date.now();
}

async function getCoin(headers) {
  var res = parseBody(await get(BASE + "/np-book-user/coin/info", headers));
  if (isSuccess(res) && res.info && res.info.coinNumber !== undefined) return Number(res.info.coinNumber);
  return undefined;
}

function currentDailyTask(data) {
  var info = data.info || {};
  var tasks = info.tasks || [];
  if (!tasks.length) return null;
  if (info.taskIndex !== undefined && tasks[info.taskIndex]) return tasks[info.taskIndex];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].awardStatus === 1 || tasks[i].awardStatus === 2) return tasks[i];
  }
  return tasks[0];
}

function sumReceive(info, name) {
  info = info || {};
  return sumGoods({ goodsList: info.receive || [] }, name);
}

function sumGoods(info, name) {
  var list = (info && info.goodsList) || [];
  var total = 0;
  for (var i = 0; i < list.length; i++) {
    if (!name || list[i].name === name) total += Number(list[i].number || 0);
  }
  return total;
}

function buildNotify(signCoin, doubleCoin, totalCoin, doubleText) {
  var list = [];
  list.push("签到获得：" + Number(signCoin || 0) + " 金币");
  list.push("双倍获得：" + Number(doubleCoin || 0) + " 金币");
  if (totalCoin !== undefined && !isNaN(totalCoin)) list.push("当前总金币：" + totalCoin);
  if (doubleText) list.push(doubleText);
  return list.join("，");
}

function isSuccess(data) {
  return data && (data.status === 0 || data.status === "0");
}

function isAlreadyDone(data) {
  var msg = String((data && data.msg) || "");
  return /已|重复|完成|领取|签/.test(msg);
}

function failText(data) {
  if (!data) return "无返回";
  var msg = data.msg || data.message || "";
  var status = data.status !== undefined ? "状态：" + data.status : "";
  var text = [status, msg].filter(Boolean).join("，");
  if (text) return text;
  return JSON.stringify(data).slice(0, 160);
}

function get(url, headers) {
  return new Promise(function (resolve) {
    $task.fetch({ url: url, method: "GET", headers: headers }).then(resolve, function (err) {
      resolve({ body: JSON.stringify({ status: "failed", msg: String(err) }) });
    });
  });
}

function post(url, body, headers) {
  return new Promise(function (resolve) {
    $task.fetch({ url: url, method: "POST", headers: headers, body: body }).then(resolve, function (err) {
      resolve({ body: JSON.stringify({ status: "failed", msg: String(err) }) });
    });
  });
}

function parseBody(resp) {
  var body = String((resp && resp.body) || "{}").trim();
  try {
    return JSON.parse(body);
  } catch (e) {
    var start = body.indexOf("{");
    var end = body.lastIndexOf("}");
    if (start > -1 && end > start) {
      try {
        return JSON.parse(body.slice(start, end + 1));
      } catch (e2) {}
    }
    return { status: "failed", msg: String(e), raw: body.slice(0, 200) };
  }
}

function lowerHeaders(headers) {
  var out = {};
  for (var key in headers) out[String(key).toLowerCase()] = headers[key];
  return out;
}

function safeJson(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
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
