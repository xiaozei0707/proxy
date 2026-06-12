let obj = JSON.parse($response.body);

if (obj.user) {

    // 普通会员
    obj.user.normalVipBoolean = true;
    obj.user.normalVipDt = 4117449600000;

    // 广告会员
    obj.user.adVipBoolean = true;
    obj.user.adVipForever = "永久会员";

    // 访问会员
    obj.user.visitVipBoolean = true;
    obj.user.visitVipDt = 4117449600000;

    // 图片数量
    obj.user.countImg = 9999;
    obj.user.countImgTotal = 9999;

    // 自动抠图次数
    obj.user.countImgAuto = 9999;
    obj.user.countImgAutoTotal = 9999;

    // 报告次数
    obj.user.countReportTotal = 9999;

    // 如果字段存在
    if (obj.user.adVipForever !== undefined) {
        obj.user.adVipBoolean = true;
        obj.user.adVipDt = 4117449600000;
        obj.user.adVipForever = true;
    }

    if (obj.user.visitVipForever !== undefined) {
        obj.user.visitVipBoolean = true;
        obj.user.visitVipDt = 4117449600000;
        obj.user.visitVipForever = true;
    }
}

$done({
    body: JSON.stringify(obj)
});
