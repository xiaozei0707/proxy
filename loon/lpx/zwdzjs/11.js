/**
 * PVZ2 iOS 存档修改 Surge 版 (完整数据成品)
 */

const config = {
    iosUrl: 'http://cloudpvz2ios.ditwan.cn/index.php',
    boundary: '_{{}}_',
    headers: {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 14; V2238A Build/UP1A.231005.007)',
        'Content-Type': 'multipart/form-data;boundary=12345687',
        'Content-Type2': 'text/plain; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
    }
};

let body = $request.body || '';
const formDataJson = {};

// 简易 Multipart 解析逻辑
if (body && body.includes(`--${config.boundary}`)) {
    const endMarker = `--${config.boundary}--`;
    const bodyWithoutEndMarker = body.includes(endMarker) 
        ? body.substring(0, body.indexOf(endMarker)) 
        : body;
    
    const normalizedBody = bodyWithoutEndMarker.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalizedBody.split(`--${config.boundary}\n`);

    for (const block of blocks) {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) continue;

        const firstEmptyLineIndex = trimmedBlock.indexOf('\n\n');
        if (firstEmptyLineIndex === -1) continue;

        const headerPart = trimmedBlock.substring(0, firstEmptyLineIndex).trim();
        const valuePart = trimmedBlock.substring(firstEmptyLineIndex + 2).trim();

        const nameMatch = headerPart.match(/name\s*=\s*\"([^\"]+)\"/i);
        if (nameMatch && nameMatch[1]) {
            formDataJson[nameMatch[1]] = valuePart;
        }
    }
}

const reqValue = formDataJson.req || '';
const eValue = formDataJson.e || '';

// ================= 核心劫持逻辑 =================

if (reqValue.includes('V961')) {
    const ePrefix = eValue.substring(0, 8);
    const v961Mapping = {
        'uCCzP4B9': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYHVkQIqSOm7odu5EKDyqWIHdMLoVKQc56"}',
        'sohksKnM': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYUCVcJghRN263-MoDRXqENe4O3c6VV5wd"}',
        'jrzbumkT': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYXupFH4Y3kqRvLEzvHFbEpEBufRdL0rGO"}',
        '7BpVxUrB': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYybAeqpYUfTiWbe_ZKNhPf5lbgSWGYPAe"}',
        'lfag6oeY': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYG47qOHCsmVrVpNMKbDmVR859oQz7Lu8e"}',
        'uHSalfxz': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYL5Il8BenBILA98O2w4lm82W51X_vEDAg"}',
        'k1aUH878': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYoEcG3mw9iKqsOLswxSYapwUxRmujLcke"}',
        'vkH2ERxt': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYmwwmc1RIdH0f3PhBWh2XWaqDJ0reai4G"}',
        '6KCshubB': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYj6H14Inxl87xfK-OJyE_XqiCH3whn_G4"}',
        '6vZZDONG': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYxFMVPPkuXPlpScjlI2qXkff19LkhfKPq"}',
        'cvxlarFd': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYoN0M9cjU_rz5eF9e3k3oGjNdt-7ZQUT_"}',
        'EUdtGjjO': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYlbO_53RkYLIBoZwdvPxCPx9FaRMS_z-9"}',
        'iOK2Zm7W': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYKnoxAEgYHmfsk79CASDuthwrbWA8qTIA"}',
        '7W79qbPt': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGY5Aa29C_2uYe4_W-JaJM6_HHDAODIXD_i"}',
        'gljrgTSN': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGY41IT0eKefQEdAeLmupxQgJcvGM2_5PXd"}',
        '6dkxhbYQ': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYKLFqqnKnlmRwWlnv7xQKZ8L_z70r8eW-"}',
        'BmEdEhMz': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYfRlo4JGc8UXmG3QtL0shicptqqaqTo5C"}',
        'FbCmQ4jL': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYPzlGse2_vOyczQz092zD3VkQ3LShXJZb"}',
        't9hfkDcw': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYkMBmx3MmS_7X1TiHnlUWq4gaTsBnoJtM"}',
        'RgKery0x': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYlHONXhUOWXRtjPaPfpv0UJ_T8s1aVxmp"}',
        'GZEn_01P': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYsgmeFcTFM2ouwgTV8LdodnnQsVpkO9tt"}',
        '1AqwnlDv': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYi2LKmmUPgCrpjeF_NDj6m47M6-crKgvF"}',
        'LVn2wKXj': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGY62f1a9L4rOXT63Y56y3SaX9zRZL8K1Uy"}',
        'j-FT1sbP': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYcPZK3MT0mhRzkpkfRtjlacmAvUoBUbE3"}',
        'd_YjUQs2': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGY01kfRmm5tnxFW1cDo4-MxWAXMi_fJPgy"}',
        '-i6Raiy8': '{"i":"V9
