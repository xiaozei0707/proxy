let body = JSON.parse($response.body);

body.status = 0;

$done({
  body: JSON.stringify(body)
});
