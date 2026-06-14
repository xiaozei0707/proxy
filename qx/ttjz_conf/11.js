function mockCoinInfo(responseText) {
  const obj = JSON.parse(responseText);

  if (obj.info && typeof obj.info.coinNumber === "number") {
    obj.info.coinNumber = 9999;
  }

  return JSON.stringify(obj);
}
