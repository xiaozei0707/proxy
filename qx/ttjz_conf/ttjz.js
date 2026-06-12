let obj = JSON.parse($response.body);

// 核心篡改逻辑：正确的层级是 obj.info.user
if (obj.info && obj.info.user) {
    
    // 1. 无条件解锁普通 VIP (Normal VIP)
    obj.info.user.normalVipBoolean = true;
    obj.info.user.normalVipDt = 4102444800000; // 过期时间：2100年1月1日
    obj.info.user.normalVipForever = true;

    // 2. 修改用户昵称 (引流水印)
    obj.info.user.nickName = "https://t.me/GieGie777";

    // 3. 破解所有使用次数限制 (全部改为 0x270f，即 9999 次)
    obj.info.user.countImgTotal = 9999;
    obj.info.user.countImg = 9999;
    obj.info.user.countImgAutoTotal = 9999;
    obj.info.user.countImgAuto = 9999;
    obj.info.user.countReportTotal = 9999;

    // 4. 条件解锁去广告 VIP (Ad VIP)
    if (obj.info.user.adVipBoolean !== undefined) {
        obj.info.user.adVipBoolean = true;
        obj.info.user.adVipDt = 4102444800000;
        obj.info.user.adVipForever = true;
    }

    // 5. 条件解锁访问 VIP (Visit VIP)
    if (obj.info.user.visitVipBoolean !== undefined) {
        obj.info.user.visitVipBoolean = true;
        obj.info.user.visitVipDt = 4102444800000;
        obj.info.user.visitVipForever = true;
    }
}

// 重新打包并返回数据
$done({'body': JSON.stringify(obj)});
