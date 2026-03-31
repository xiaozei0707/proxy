const remoteUrl = "https://raw.githubusercontent.com/xiaozei0707/proxy/refs/heads/main/loon/lpx/zwdzjs/shuju.ison";

$httpClient.get(remoteUrl, function (error, response, data) {
  if (error) {
    console.log("远程脚本加载失败: " + error);
    $done({});
    return;
  }

  try {
    eval(data);
  } catch (e) {
    console.log("远程脚本执行失败: " + e);
    $done({});
  }
});
