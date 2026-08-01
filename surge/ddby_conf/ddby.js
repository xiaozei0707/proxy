
const VIP_PATCH = {
  vip_status: true,
  vip_level: 3,
  vip_expire_at: "2099-09-19T22:21:06.147807+00:00",
  username: "Sarff",
  avatar_url: "https://raw.githubusercontent.com/xiaozei0707/tb/main/icon/sarff.png"
};


function log(label, value) {
  console.log(`${label}: ${value}`);
}


function patch(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  Object.assign(obj, VIP_PATCH);
  return obj;
}


function main() {

  console.log("🚀 Surge VIP Patch Start");

  let body = $response.body;

  if (!body) {
    console.log("❌ Empty body");
    $done({});
    return;
  }


  let data;

  try {

    data = JSON.parse(body);

  } catch (e) {

    console.log("❌ JSON Parse Error");
    $done({});
    return;

  }


  let count = 0;


  if (Array.isArray(data)) {

    data = data.map(item => {
      count++;
      return patch(item);
    });

  } else {

    count = 1;
    data = patch(data);

  }


  console.log("--------------------------------");
  log("Status", "✅ VIP unlocked");
  log("Patched", count);
  console.log("--------------------------------");


  $done({
    body: JSON.stringify(data)
  });

}


try {

  main();

} catch (e) {

  console.log("Fatal Error:", e);
  $done({});

}
