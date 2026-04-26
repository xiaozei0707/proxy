let obj = JSON.parse($response.body);

obj.Membership = true;

$done({
  body: JSON.stringify(obj)
});
