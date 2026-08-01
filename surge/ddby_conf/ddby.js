var body = $response.body || "";

try {
  var data = JSON.parse(body);

  var vip = {
    vip_status: true,
    vip_level: 3,
    vip_expire_at: "2099-09-19T22:21:06.147807+00:00",
    username: "sarff",
    avatar_url: "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/sarff.png"
  };

  function patch(obj) {
    if (obj && typeof obj === "object") {
      Object.keys(vip).forEach(function (key) {
        obj[key] = vip[key];
      });
    }
    return obj;
  }

  if (Array.isArray(data)) {
    data = data.map(patch);
  } else {
    data = patch(data);
  }

  $done({ body: JSON.stringify(data) });
} catch (e) {
  $done({ body: body });
}
