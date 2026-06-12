// 解析原始响应数据
let obj = JSON.parse($response.body);

// 核心篡改逻辑（判断 user 对象是否存在）
if (obj && obj.user) {
    
    // 1. 解锁去广告 VIP (Ad VIP)
    obj.user.adVipBoolean = true;
    obj.user.adVipDt = 4102444800000; // 过期时间戳：2100年1月1日
    obj.user.adVipForever = true;

    // 2. 修改用户昵称/标识
    obj.user.nickName = "https://t.me/GieGie777";

    // 3. 破解使用次数限制 (改为 9999 次)
    obj.user.countImg = 9999;
    obj.user.countImgAuto = 9999;
    obj.user.countImgAutoTotal = 9999;
    obj.user.countImgTotal = 9999;
    obj.user.countReportTotal = 9999;

    // 4. 解锁普通 VIP (Normal VIP)
    if (obj.user.normalVipBoolean !== undefined) {
        obj.user.normalVipBoolean = true;
        obj.user.normalVipDt = 4102444800000; 
        obj.user.normalVipForever = true;
    }

    // 5. 解锁访问 VIP (Visit VIP)
    if (obj.user.visitVipBoolean !== undefined) {
        obj.user.visitVipBoolean = true;
        obj.user.visitVipDt = 4102444800000;
        obj.user.visitVipForever = true;
    }
}

// 将修改后的数据重新打包返回
$done({'body': JSON.stringify(obj)});
