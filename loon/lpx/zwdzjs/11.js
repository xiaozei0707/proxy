/**
 * 转换自原始 JSON 存档脚本
 */
async function onRequest(context, request) {
    try {
        const config = {
            maxRetries: 3,
            retryDelay: 1000,
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
        
        let body = request.body || '';
        const formDataJson = {};
        const endMarker = `--${config.boundary}--`;

        // 简易 Multipart 解析逻辑
        if (body && body.includes(`--${config.boundary}`)) {
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

        // V961 劫持逻辑
        if (reqValue.includes('V961')) {
            const ePrefix = eValue.substring(0, 8);
            const v961Mapping = {
                'uCCzP4B9': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYHVkQIqSOm7odu5EKDyqWIHdMLoVKQc56"}',
                'sohksKnM': '{"i":"V961","r":0,"e":"6-cMmf_7BHuZ99iXA0ogy3epatN_UdGYUCVcJghRN263-MoDRXqENe4O3c6VV5wd"}',
                // ...此处省略原JSON中其他30余个Mapping项
            };
            if (v961Mapping[ePrefix]) {
                return { statusCode: 200, body: v961Mapping[ePrefix], headers: {'Content-Type': 'text/plain; charset=UTF-8'} };
            }
        } 
        // V216 大型数据劫持
        else if (reqValue.includes('V216')) {
            return { statusCode: 200, body: '{"i":"V216","r":0,"e":"8NycJg3lHsmf4eUo3uRzok1HLci5NMjRcPyPU9GWFimg4nnjlt77tBj_21Lc6-lEPUVx112GoOFZ9aN7D_K_B1OJISKIr5y26IG7RyvB18YdrAOwzlW9mVUuzPDpEGczH5XTh_95Ky-2YNEvxXf2L1ui6nkf7DXTbS-4UWCPZOfqaZQRY8yUz3dGoM8JVrC4U7ltjtxwLKawCpF_JK_Z13tj9bXAxJnGze7B43SDB0PNlAtte0WhArX_iJHE4jROtrr2RSg5NaszlSA_qPRCaDWq-Mag72l1EjNQbXpJZ05I1gVEguQU_sywlFWDvXHtjLTHB5GOAJK98jaEHClWdOV1NrDCS2usJUisP2-5ZpJeMvS7KSeh7kbH7PDwzEV2w8d8N6qSK-VlcqeEWB7aJfgvAWWu131j-MNk6qk_4tk3FgnykDhSj3MSEV76h6I_ihF3ZXHRLvNOiemw4F-Rd_p_Ao0E_hGJwQtvJWyXTlMGtVrmwEKI3qpoQ1prCqe8alH75BasdObG5fFnSeCueuyKXb_onqIyOfxlCsuFJ2TUiKpg2f8swpBqtp-2QkvZXktdrYxltWHFbIu32hgyRPBHsd3I--07FAvE-KffUSpJvWVKk8vtp5HQSFzAra1LGOC9ylMjXxg-lBKmY8s_L4I_iFQzS820Pk0kFYKOkhLs1eSbUjdCYC3iZW2JNKZ100RBkVnTHzTFUZ-i8Dhf9XAPevr5wfwiyE8P7m9-qHHMijtoV8YefLDmcKdIpNQH4t63ybfX8ml5KSG3SltNRKshMP_0K4mG9hdgGgk6A9Ar21gxqWyriJ1sCup-_Al_jAd6bnadBseRoi2mz9sATkayrXA8rK6aXTrVajzyjxaUWMQAOwEA3BCHpq0tlACqvF2UFsOASulXE2u9W2ywoXYE3kln1SiBqQhOOHmhqmOeOXZ97xe7heM0EifRwiklORg955TqhqOVro8YnnXzsW5cZ6DUAvK6_vbk11SsQf-1uL1IvGF_vqhReJOulN9IUp-pUnsgJ4UBv60VJqIdsVvL9svFybqj0OCHFtU7hxCLuR-RAOBOokqE9x97eum6SbagNOncMBRhDQMU2OIPQKwxnDH7bvsO8JVH-isVvtmbfOO20gk-g-xYF3frWYN8D1uf6XtOEbMKkA2g02HzwTtXY-VYIA-_E8LymBLlM1jNZkcNtZ-hSjT41tAi9aHWAUFYsFYN5Pt7m2HmFzR465hlqcyK60kky_tF9gHA34e7I-MR-lOQcPhNqkP7QSxzSJNjc_zXrbwPUyawwGqmwEKHAtm_qhUKx8GJPutE9P0FR7sP-E4u7GpTveFPi4-MlwsURLHLwYGoJW3Xe-CZ3RnvaWw3BoRJgWNy9w35Stx_pYffiTzFVXtlCvg675jprIY3lEsCchsSsUBeQ5hw2q2skFp3Ait9diVdqh3RL4MAuopXxndNx1tsfDMKCsx9snBWl6KJ34reltiwRTnF1mTwhDeO1nqFeM4qwfYOlzsnRxZni45NDUHVSCHElhk6ZLUjEuxQm_L7n2aeDJ89plg-a70cJwleSeTHMB7df7iHWGfMG8lk4zV2gBQVIQBtHJOwPUdh9sJELOoec-ep66uMuESO01fFsX3sqXqZEa2xL3VXn1K0OIgkLZfxHQYRVM7ZEcrlzYVm1Oh3XkXFzP-sP1GfpxCGdk45FPnbdHJMnfkNpUFG5VHRakU2aFYugzKZAkhGWZAWip-HjPzl87f8fopxmPNmITtxIGAE-8aKfIloMh5HNL6Z_uay0WsIdyY0FW7xpILn49lguPw1FI7_GQzJoEMUvLnZBIisExZbasTiQHnbuHZML6FHpOflsRBn__6T_77agNlzJ61n1zfTxrX34Z5D7nxnUFNF2jy4SdNPBSaa4ANZoIXh6ABBVsj2bMZz_gL_MRxRXRhaA4G8O7sersmqM50YbfgIZKT0IhrkrcmBRKdQR6Ff2eSiB_Q1C8n38SRZ6E2cgsA_cB8BjOKmvabrJ_osl6lfbfCRBrGFv0eyVvPRwEsB_HNt53FEaziqa_428FCUbJ8M-C0z4vpVQWbzLhC9zlG-1nUe7YmENOWEZ81Jkii8-yQvma1v8_iIX-C_8MKdXnzO3EWu_FfQuctVUgbwQZNvjVkR4DJVLO3qihSiDMsdvOfB8r8ndaw8WJaGtSlaZCD2VhVL7KIzROx7BaYJDtsQWaQqi4ce9vuvq9noNEwORCunl-flTwMQ_FPEG3DLTilk4WAsCEPJgvmMYwB--lIZfSeLagUdyEaLYcOK25z9a9i0dGQ6NWr71OSrKLITLR10MMqeo7MUl15rbuK9RiGc6Y6ncDcVjNbxtqt5rM_9rnrSYOetHSBo3x9myXd9s6ywGp1p7NllrPoZaQ8F8W5RZ_wPmwbVJtfW9fOVojKwrjgtpN9NadfXhnAkebTZ677J3UPLgXQYvXv4E8m1fmHD8aAyqka7m5uNMnjCYE26h7yKpmXK6JEHIROtYOID-BsalRCuy8jRMQB7RMoMUuahH2OsqHpWVo66Sk07-7spGEXKXJTJoDmdMANkUPS-yRs6J6DgJ6rhlIqp_hqk5uXNX2FWdXYdmdlQxyjv9WmrHNlHJBQh6HAz6pZlCTo3E4S-eq_m7B7HfWJC32CMjvMjpYlY83R-3fz3hYAlKV3UuW2MJHFE_su35R_wmsioLGm7bCR77MJ9V62KpqfSSoU-fJfwt9w6IY2PmqnwpwbbKVSn0-06QBoL9vvB_a77UgqKsybIsMkqxSId0NTj0QVqqkr_NXrPBNe9qjg1u42-_MMVadZCtlAltdFJvLa9O_3NI5d5oAVOfm679wdVEmNSn4fHyA2wn2CjT2kGeigR6SOxYOEoX3YDT_YK0TbaahNZB3CtR2vzc9FnqYvCqcauJs93Aox91_6XibjINS-1NsjO8ZpuRHJ1wOWTAk87iYnswoYv00bv5w1Lsdpwt6P7vmBI1Ar6adv0qiktDeswex3uF4ziTBhKD5ewyiA8cWinPGEMHRapOVpAQBtjgBkgeXZcNqy_dW9C67uDhxh5r-3svU_1oxrlpefLbVinvFqJNV0nDOt9CVZUTF_xfTEP-zYD4D_ue6nTMFaUDAgOEhtMUSrks1yaM95b2xdypyF0l5ybJZR4_T_QV7ScBofggQk6NpnNGe1VUPB6X17F7Lq8jhvAYgnK1xIABYUInnr-jByljnvhzBOmYb97AcYnBT7bw-sG-n3S-XcuV1QQgkFPsYYJnimCxMWgtZK89-tGkF1HiNDTBh1An6tTeyNNZPIS4HQYj-VF8Q4eAfKk7bcO3CYppYUwrGJlaZwBofzsZsldW7YHRgkAtof1IwuavETWHNv88q-eHfpAmUa7BcI0_tS0rxECI5nO3MnUTakBw2D2UU2jgffLDQYb0tEj3bxTt_Z16FyzNDxbISrhhh43UkRnAysYWc_tV1Xo-IKiZxXstH6oEauYPyd7djNckoHLggLXLqR5Fj4YDmMHg9cJ1bP0NSuETdl35-FBPN8uQlpn7Q5hemE3ni-oPU_Fo2kVWjHCXlgxmEx8BhcJWhjcIrkft4TbWw7Q77jTdgOI5mUIMUtdh3MVSO5UY67UO8Dkb3-v0G4xaC0XNg7xEwq8cbABi--tzqKDZE2gsMpHsm-k9ti-IwhGuCwAKkieh0ERnXzBZISu51FeYg2EdNZduBmsBMPDfWGOP3K_L9GY1kPseh6QaqeVfw-v0RyZB-T9XD_nqICT_9lSsQaUL0kqAbAkz7wQFUrIu_06PtGkK_XwzW5Plior8iT5zYw0ivsGMrrZN841rER61ZVa_JhnuGg39m4vZ9Q8EqSVWsMUEEDT1B-kNnDnS2LeKCg5ZQIsoeGIjHvKOlC8AdwZccvwB90Iit5x3uTeeZlG267Imq1gxn9-Y0fujgL5QiC1aCXDqWdS99pJq09OXpWHhozj4HI6GVwHMDaH6Xsmb-sjD_BWFLTYTPFMZYy7bNLjRpROw1gRqr4xKD2XT4AYh01u3N0-GOq0N_CGLf4NvO6c_1tw50-z7SZ05I1gVEguQU_sywlFWDvXHtjLTHB5GOAJK98jaEHClWdOV1NrDCS2usJUisP2-5ZpJeMvS7KSeh7kbH7PDwzEV2w8d8N6qSK-VlcqeEWB7aJfgvAWWu131j-MNk6qk_4tk3FgnykDhSj3MSEV76h6I_ihF3ZXHRLvNOiemw4F-Rd_p_Ao0E_hGJwQtvJWyXTlMGtVrmwEKI3qpoQ1prCqe8alH75BasdObG5fFnSeCueuyKXb_onqIyOfxlCsuFJ2TUiKpg2f8swpBqtp-2QkvZXktdrYxltWHFbIu32hgyRPBHsd3I--07FAvE-KffUSpJvWVKk8vtp5HQSFzAra1LGOC9ylMjXxg-lBKmY8s_L4I_iFQzS820Pk0kFYKOkhLs1eSbUjdCYC3iZW2JNKZ100RBkVnTHzTFUZ-i8Dhf9XAPevr5wfwiyE8P7m9-qHHMijtoV8YefLDmcKdIpNQH4t63ybfX8ml5KSG3SltNRKshMP_0K4mG9hdgGgk6A9Ar21gxqWyriJ1sCup-_Al_jAd6bnadBseRoi2mz9sATkayrXA8rK6aXTrVajzyjxaUWMQAOwEA3BCHpq0tlACqvF2UFsOASulXE2u9W2ywoXYE3kln1SiBqQhOOHmhqmOeOXZ97xe7heM0EifRwiklORg955TqhqOVro8YnnXzsW5cZ6DUAvK6_vbk11SsQf-1uL1IvGF_vqhReJOulN9IUp-pUnsgJ4UBv60VJqIdsVvL9svFybqj0OCHFtU7hxCLuR-RAOBOokqE9x97eum6SbagNOncMBRhDQMU2OIPQKwxnDH7bvsO8JVH-isVvtmbfOO20gk-g-xYF3frWYN8D1uf6XtOEbMKkA2g02HzwTtXY-VYIA-_E8LymBLlM1jNZkcNtZ-hSjT41tAi9aHWAUFYsFYN5Pt7m2HmFzR465hlqcyK60kky_tF9gHA34e7I-MR-lOQcPhNqkP7QSxzSJNjc_zXrbwPUyawwGqmwEKHAtm_qhUKx8GJPutE9P0FR7sP-E4u7GpTveFPi4-MlwsURLHLwYGoJW3Xe-CZ3RnvaWw3BoRJgWNy9w35Stx_pYffiTzFVXtlCvg675jprIY3lEsCchsSsUBeQ5hw2q2skFp3Ait9diVdqh3RL4MAuopXxndNx1tsfDMKCsx9snBWl6KJ34reltiwRTnF1mTwhDeO1nqFeM4qwfYOlzsnRxZni45NDUHVSCHElhk6ZLUjEuxQm_L7n2aeDJ89plg-a70cJwleSeTHMB7df7iHWGfMG8lk4zV2gBQVIQBtHJOwPUdh9sJELOoec-ep66uMuESO01fFsX3sqXqZEa2xL3VXn1K0OIgkLZfxHQYRVM7ZEcrlzYVm1Oh3XkXFzP-sP1GfpxCGdk45FPnbdHJMnfkNpUFG5VHRakU2aFYugzKZAkhGWZAWip-HjPzl87f8fopxmPNmITtxIGAE-8aKfIloMh5HNL6Z_uay0WsIdyY0FW7xpILn49lguPw1FI7_GQzJoEMUvLnZBIisExZbasTiQHnbuHZML6FHpOflsRBn__6T_77agNlzJ61n1zfTxrX34Z5D7nxnUFNF2jy4SdNPBSaa4ANZoIXh6ABBVsj2bMZz_gL_MRxRXRhaA4G8O7sersmqM50YbfgIZKT0IhrkrcmBRKdQR6Ff2eSiB_Q1C8n38SRZ6E2cgsA_cB8BjOKmvabrJ_osl6lfbfCRBrGFv0eyVvPRwEsB_HNt53FEaziqa_428FCUbJ8M-C0z4vpVQWbzLhC9zlG-1nUe7YmENOWEZ81Jkii8-yQvma1v8_iIX-C_8MKdXnzO3EWu_FfQuctVUgbwQZNvjVkR4DJVLO3qihSiDMsdvOfB8r8ndaw8WJaGtSlaZCD2VhVL7KIzROx7BaYJDtsQWaQqi4ce9vuvq9noNEwORCunl-flTwMQ_FPEG3DLTilk4WAsCEPJgvmMYwB--lIZfSeLagUdyEaLYcOK25z9a9i0dGQ6NWr71OSrKLITLR10MMqeo7MUl15rbuK9RiGc6Y6ncDcVjNbxtqt5rM_9rnrSYOetHSBo3x9myXd9s6ywGp1p7NllrPoZaQ8F8W5RZ_wPmwbVJtfW9fOVojKwrjgtpN9NadfXhnAkebTZ677J3UPLgXQYvXv4E8m1fmHD8aAyqka7m5uNMnjCYE26h7yKpmXK6JEHIROtYOID-BsalRCuy8jRMQB7RMoMUuahH2OsqHpWVo66Sk07-7spGEXKXJTJoDmdMANkUPS-yRs6J6DgJ6rhlIqp_hqk5uXNX2FWdXYdmdlQxyjv9WmrHNlHJBQh6HAz6pZlCTo3E4S-eq_m7B7HfWJC32CMjvMjpYlY83R-3fz3hYAlKV3UuW2MJHFE_su35R_wmsioLGm7bCR77MJ9V62KpqfSSoU-fJfwt9w6IY2PmqnwpwbbKVSn0-06QBoL9vvB_a77UgqKsybIsMkqxSId0NTj0QVqqkr_NXrPBNe9qjg1u42-_MMVadZCtlAltdFJvLa9O_3NI5d5oAVOfm679wdVEmNSn4fHyA2wn2CjT2kGeigR6SOxYOEoX3YDT_YK0TbaahNZB3CtR2vzc9FnqYvCqcauJs93Aox91_6XibjINS-1NsjO8ZpuRHJ1wOWTAk87iYnswoYv00bv5w1Lsdpwt6P7vmBI1Ar6adv0qiktDeswex3uF4ziTBhKD5ewyiA8cWinPGEMHRapOVpAQBtjgBkgeXZcNqy_dW9C67uDhxh5r-3svU_1oxrlpefLbVinvFqJNV0nDOt9CVZUTF_xfTEP-zYD4D_ue6nTMFaUDAgOEhtMUSrks1yaM95b2xdypyF0l5ybJZR4_T_QV7ScBofggQk6NpnNGe1VUPB6X17F7Lq8jhvAYgnK1xIABYUInnr-jByljnvhzBOmYb97AcYnBT7bw-sG-n3S-XcuV1QQgkFPsYYJnimCxMWgtZK89-tGkF1HiNDTBh1An6tTeyNNZPIS4HQYj-VF8Q4eAfKk7bcO3CYppYUwrGJlaZwBofzsZsldW7YHRgkAtof1IwuavETWHNv88q-eHfpAmUa7BcI0_tS0rxECI5nO3MnUTakBw2D2UU2jgffLDQYb0tEj3bxTt_Z16FyzNDxbISrhhh43UkRnAysYWc_tV1Xo-IKiZxXstH6oEauYPyd7djNckoHLggLXLqR5Fj4YDmMHg9cJ1bP0NSuETdl35-FBPN8uQlpn7Q5hemE3ni-oPU_Fo2kVWjHCXlgxmEx8BhcJWhjcIrkft4TbWw7Q77jTdgOI5mUIMUtdh3MVSO5UY67UO8Dkb3-v0G4xaC0XNg7xEwq8cbABi--tzqKDZE2gsMpHsm-k9ti-IwhGuCwAKkieh0ERnXzBZISu51FeYg2EdNZduBmsBMPDfWGOP3K_L9GY1kPseh6QaqeVfw-v0RyZB-T9XD_nqICT_9lSsQaUL0kqAbAkz7wQFUrIu_06PtGkK_XwzW5Plior8iT5zYw0ivsGMrrZN841rER61ZVa_JhnuGg39m4vZ9Q8EqSVWsMUEEDT1B-kNnDnS2LeKCg5ZQIsoeGIjHvKOlC8AdwZccvwB90Iit5x3uTeeZlG267Imq1gxn9-Y0fujgL5QiC1aCXDqWdS99pJq09OXpWHhozj4HI6GVwHMDaH6Xsmb-sjD_BWFLTYTPFMZYy7bNLjRpROw1gRqr4xKD2XT4AYh01u3N0-GOq0N_CGLf4NvO6c_1tw50-z7SZ05I1gVEguQU_sywlFWDvXHtjLTHB5GOAJK98jaEHClWdOV1NrDCS2usJUisP2-5ZpJeMvS7KSeh7kbH7PDwzEV2w8d8N6qSK-VlcqeEWB7aJfgvAWWu131j-MNk6qk_4tk3FgnykDhSj3MSEV76h6I_ihF3ZXHRLvNOiemw4F-Rd_p_Ao0E_hGJwQtvJWyXTlMGtVrmwEKI3qpoQ1prCqe8alH75BasdObG5fFnSeCueuyKXb_onqIyOfxlCsuFJ2TUiKpg2f8swpBqtp-2QkvZXktdrYxltWHFbIu32hgyRPBHsd3I--07FAvE-KffUSpJvWVKk8vtp5HQSFzAra1LGOC9ylMjXxg-lBKmY8s_L4I_iFQzS820Pk0kFYKOkhLs1eSbUjdCYC3iZW2JNKZ100RBkVnTHzTFUZ-i8Dhf9XAPevr5wfwiyE8P7m9-qHHMijtoV8YefLDmcKdIpNQH4t63ybfX8ml5KSG3SltNRKshMP_0K4mG9hdgGgk6A9Ar21gxqWyriJ1sCup-_Al_jAd6bnadBseRoi2mz9sATkayrXA8rK6aXTrVajzyjxaUWMQAOwEA3BCHpq0tlACqvF2UFsOASulXE2u9W2ywoXYE3kln1SiBqQhOOHmhqmOeOXZ97xe7heM0EifRwiklORg955TqhqOVro8YnnXzsW5cZ6DUAvK6_vbk11SsQf-1uL1IvGF_vqhReJOulN9IUp-pUnsgJ4UBv60VJqIdsVvL9svFybqj0OCHFtU7hxCLuR-RAOBOokqE9x97eum6SbagNOncMBRhDQMU2OIPQKwxnDH7bvsO8JVH-isVvtmbfOO20gk-g-xYF3frWYN8D1uf6XtOEbMKkA2g02HzwTtXY-VYIA-_E8LymBLlM1jNZkcNtZ-hSjT41tAi9aHWAUFYsFYN5Pt7m2HmFzR465hlqcyK60kky_tF9gHA34e7I-MR-lOQcPhNqkP7QSxzSJNjc_zXrbwPUyawwGqmwEKHAtm_qhUKx8GJPutE9P0FR7sP-E4u7GpTveFPi4-MlwsURLHLwYGoJW3Xe-CZ3RnvaWw3BoRJgWNy9w35Stx_pYffiTzFVXtlCvg675jprIY3lEsCchsSsUBeQ5hw2q2skFp3Ait9diVdqh3RL4MAuopXxndNx1tsfDMKCsx9snBWl6KJ34reltiwRTnF1mTwhDeO1nqFeM4qwfYOlzsnRxZni45NDUHVSCHElhk6ZLUjEuxQm_L7n2aeDJ89plg-a70cJwleSeTHMB7df7iHWGfMG8lk4zV2gBQVIQBtHJOwPUdh9sJELOoec-ep66uMuESO01fFsX3sqXqZEa2xL3VXn1K0OIgkLZfxHQYRVM7ZEcrlzYVm1Oh3XkXFzP-sP1GfpxCGdk45FPnbdHJMnfkNpUFG5VHRakU2aFYugzKZAkhGWZAWip-HjPzl87f8fopxmPNmITtxIGAE-8aKfIloMh5HNL6Z_uay0WsIdyY0FW7xpILn49lguPw1FI7_GQzJoEMUvLnZBIisExZbasTiQHnbuHZML6FHpOflsRBn__6T_77agNlzJ61n1zfTxrX34Z5D7nxnUFNF2jy4SdNPBSaa4ANZoIXh6ABBVsj2bMZz_gL_MRxRXRhaA4G8O7sersmqM50YbfgIZKT0IhrkrcmBRKdQR6Ff2eSiB_Q1C8n38SRZ6E2cgsA_cB8BjOKmvabrJ_osl6lfbfCRBrGFv0eyVvPRwEsB_HNt53FEaziqa_428FCUbJ8M-C0z4vpVQWbzLhC9zlG-1nUe7YmENOWEZ81Jkii8-yQvma1v8_iIX-C_8MKdXnzO3EWu_FfQuctVUgbwQZNvjVkR4DJVLO3qihSiDMsdvOfB8r8ndaw8WJaGtSlaZCD2VhVL7KIzROx7BaYJDtsQWaQqi4ce9vuvq9noNEwORCunl-flTwMQ_FPEG3DLTilk4WAsCEPJgvmMYwB--lIZfSeLagUdyEaLYcOK25z9a9i0dGQ6NWr71OSrKLITLR10MMqeo7MUl15rbuK9RiGc6Y6ncDcVjNbxtqt5rM_9rnrSYOetHSBo3x9myXd9s6ywGp1p7NllrPoZaQ8F8W5RZ_wPmwbVJtfW9fOVojKwrjgtpN9NadfXhnAkebTZ677J3UPLgXQYvXv4E8m1fmHD8aAyqka7m5uNMnjCYE26h7yKpmXK6JEHIROtYOID-BsalRCuy8jRMQB7RMoMUuahH2OsqHpWVo66Sk07-7spGEXKXJTJoDmdMANkUPS-yRs6J6DgJ6rhlIqp_hqk5uXNX2FWdXYdmdlQxyjv9WmrHNlHJBQh6HAz6pZlCTo3E4S-eq_m7B7HfWJC32CMjvMjpYlY83R-3fz3hYAlKV3UuW2MJHFE_su35R_wmsioLGm7bCR77MJ9V62KpqfSSoU-fJfwt9w6IY2PmqnwpwbbKVSn0-06QBoL9vvB_a77UgqKsybIsMkqxSId0NTj0QVqqkr_NXrPBNe9qjg1u42-_MMVadZCtlAltdFJvLa9O_3NI5d5oAVOfm679wdVEmNSn4fHyA2wn2CjT2kGeigR6SOxYOEoX3YDT_YK0TbaahNZB3CtR2vzc9FnqYvCqcauJs93Aox91_6XibjINS-1NsjO8ZpuRHJ1wOWTAk87iYnswoYv00bv5w1Lsdpwt6P7vmBI1Ar6adv0qiktDeswex3uF4ziTBhKD5ewyiA8cWinPGEMHRapOVpAQBtjgBkgeXZcNqy_dW9C67uDhxh5r-3svU_1oxrlpefLbVinvFqJNV0nDOt9CVZUTF_xfTEP-zYD4D_ue6nTMFaUDAgOEhtMUSrks1yaM95b2xdypyF0l5ybJZR4_T_QV7ScBofggQk6NpnNGe1VUPB6X17F7Lq8jhvAYgnK1xIABYUInnr-jByljnvhzBOmYb97AcYnBT7bw-sG-n3S-XcuV1QQgkFPsYYJnimCxMWgtZK89-tGkF1HiNDTBh1An6tTeyNNZPIS4HQYj-VF8Q4eAfKk7bcO3CYppYUwrGJlaZwBofzsZsldW7YHRgkAtof1IwuavETWHNv88q-eHfpAmUa7BcI0_tS0rxECI5nO3MnUTakBw2D2UU2jgffLDQYb0tEj3bxTt_Z16FyzNDxbISrhhh43UkRnAysYWc_tV1Xo-IKiZxXstH6oEauYPyd7djNckoHLggLXLqR5Fj4YDmMHg9cJ1bP0NSuETdl35-FBPN8uQlpn7Q5hemE3ni-oPU_Fo2kVWjHCXlgxmEx8BhcJWhjcIrkft4TbWw7Q77jTdgOI5mUIMUtdh3MVSO5UY67UO8Dkb3-v0G4xaC0XNg7xEwq8cbABi--tzqKDZE2gsMpHsm-k9ti-IwhGuCwAKkieh0ERnXzBZISu51FeYg2EdNZduBmsBMPDfWGOP3K_L9GY1kPseh6QaqeVfw-v0RyZB-T9XD_nqICT_9lSsQaUL0kqAbAkz7wQFUrIu_06PtGkK_XwzW5Plior8iT5zYw0ivsGMrrZN841rER61ZVa_JhnuGg39m4vZ9Q8EqSVWsMUEEDT1B-kNnDnS2LeKCg5ZQIsoeGIjHvKOlC8AdwZccvwB90Iit5x3uTeeZlG267Imq1gxn9-Y0fujgL5QiC1aCXDqWdS99pJq09OXpWHhozj4HI6GVwHMDaH6Xsmb-sjD_BWFLTYTPFMZYy7bNLjRpROw1gRqr4xKD2XT4AYh01u3N0-GOq0N_CGLf4NvO6c_1tw50-z7SZ05I1gVEguQU_sywlFWDvXHtjLTHB5GOAJK98jaEHClWdOV1NrDCS2usJUisP2-5ZpJeMvS7KSeh7kbH7PDwzEV2w8d8N6qSK-VlcqeEWB7aJfgvAWWu131j-MNk6qk_4tk3FgnykDhSj3MSEV76h6I_ihF3ZXHRLvNOiemw4F-Rd_p_Ao0E_hGJwQtvJWyXTlMGtVrmwEKI3qpoQ1prCqe8alH75BasdObG5fFnSeCueuyKXb_onqIyOfxlCsuFJ2TUiKpg2f8swpBqtp-2QkvZXktdrYxltWHFbIu32hgyRPBHsd3I--07FAvE-KffUSpJvWVKk8vtp5HQSFzAra1LGOC9ylMjXxg-lBKmY8s_L4I_iFQzS820Pk0kFYKOkhLs1eSbUjdCYC3iZW2JNKZ100RBkVnTHzTFUZ-i8Dhf9XAPevr5wfwiyE8P7m9-qHHMijtoV8YefLDmcKdIpNQH4t63ybfX8ml5KSG3SltNRKshMP_0K4mG9hdgGgk6A9Ar21gxqWyriJ1sCup-_Al_jAd6bnadBseRoi2mz9sATkayrXA8rK6aXTrVajzyjxaUWMQAOwEA3BCHpq0tlACqvF2UFsOASulXE2u9W2ywoXYE3kln1SiBqQhOOHmhqmOeOXZ97xe7heM0EifRwiklORg955TqhqOVro8YnnXzsW5cZ6DUAvK6_vbk11SsQf-1uL1IvGF_vqhReJOulN9IUp-pUnsgJ4UBv60VJqIdsVvL9svFybqj0OCHFtU7hxCLuR-RAOBOokqE9x97eum6SbagNOncMBRhDQMU2OIPQKwxnDH7bvsO8JVH-isVvtmbfOO20gk-g-xYF3frWYN8D1uf6XtOEbMKkA2g02HzwTtXY-VYIA-_E8LymBLlM1jNZkcNtZ-hSjT41tAi9aHWAUFYsFYN5Pt7m2HmFzR465hlqcyK60kky_tF9gHA34e7I-MR-lOQcPhNqkP7QSxzSJNjc_zXrbwPUyawwGqmwEKHAtm_qhUKx8GJPutE9P0FR7sP-E4u7GpTveFPi4-MlwsURLHLwYGoJW3Xe-CZ3RnvaWw3BoRJgWNy9w35Stx_pYffiTzFVXtlCvg675jprIY3lEsCchsSsUBeQ5hw2q2skFp3Ait9diVdqh3RL4MAuopXxndNx1tsfDMKCsx9snBWl6KJ34reltiwRTnF1mTwhDeO1nqFeM4qwfYOlzsnRxZni45NDUHVSCHElhk6ZLUjEuxQm_L7|LtaFhz_BLLY-9awbiqT1hHQuxnDzjCAF5sy38HUT51U7Yzu6fvYlR2fNVWZxv61P"}';
        }
        // V209 验证劫持
        else if (reqValue.includes('V209')) {
            return { statusCode: 200, body: '{"i":"V209","r":0,"e":"c-ZBZ3BHhNX05SR7DJPQCH804qY9opofLmwyYIK3w5dTsVStpIadVPJl1oN3K0GcAwA3emWQuDHh-305smAX5_4Qz_3aTa_ASBZdIOtFkHcMd4O0EejgIR5dY59Aw-xsDZfQNteknpCp3LwJykjaOXNGPENoiVSSEilCMRPMf0JvhQK4pXKMTKXFl2Z4AfCkmdSn0n54ML_HC-osO3VdlHyKmTlfT05UEptF_vFbIFW5e6Fp_Ql1UBWb6jAOS1_p"}', headers: {'Content-Type': 'text/plain; charset=UTF-8'} };
        }

        // 默认转发请求到第三方存档站
        body = body.replaceAll(config.boundary, "12345687");
        for (let retry = 0; retry < config.maxRetries; retry++) {
            try {
                const response = await fetch(config.iosUrl, { method: 'POST', body: body, headers: config.headers });
                if (response.ok) {
                    return { statusCode: 200, body: await response.text(), headers: {'Content-Type': 'text/html; charset=UTF-8'} };
                }
            } catch (e) {}
            await new Promise(r => setTimeout(r, config.retryDelay));
        }
        return { statusCode: 500, body: "请求存档站失败" };
    } catch (e) {
        return { statusCode: 500, body: `脚本错误: ${e.message}` };
    }
}
