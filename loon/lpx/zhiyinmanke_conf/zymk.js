var obj = JSON.parse($response.body);
obj.status = 0;
obj.data.isvip = 1;
obj.data.coins = 6666;
obj.data.Cgold = 6666;
$done({body: JSON.stringify(obj)});