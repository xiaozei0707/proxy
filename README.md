𓀐𓂸
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我们跑路啦！</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            position: relative;
            animation: bounceIn 1s ease-out;
        }

        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }

        .runaway-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            background: #ff6b6b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            animation: run 2s infinite;
        }

        @keyframes run {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px) rotate(-5deg); }
            75% { transform: translateX(10px) rotate(5deg); }
        }

        h1 {
            color: #ff6b6b;
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .subtitle {
            color: #666;
            font-size: 1.2rem;
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .emoji-container {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        }

        .emoji {
            font-size: 2rem;
            animation: float 3s ease-in-out infinite;
        }

        .emoji:nth-child(2) { animation-delay: 0.5s; }
        .emoji:nth-child(3) { animation-delay: 1s; }
        .emoji:nth-child(4) { animation-delay: 1.5s; }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }

        .message {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 15px;
            margin: 2rem 0;
            border-left: 5px solid #ff6b6b;
        }

        .message p {
            color: #555;
            font-size: 1.1rem;
            line-height: 1.8;
        }

        .funny-quotes {
            margin: 2rem 0;
        }

        .quote {
            background: linear-gradient(45deg, #ff9a9e, #fecfef);
            color: white;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 10px;
            font-style: italic;
            transform: rotate(-1deg);
            animation: wiggle 4s ease-in-out infinite;
        }

        @keyframes wiggle {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(1deg); }
        }

        .floating-objects {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }

        .floating-object {
            position: absolute;
            font-size: 2rem;
            animation: float-around 10s linear infinite;
            opacity: 0.6;
        }

        .floating-object:nth-child(1) { left: 10%; animation-delay: 0s; }
        .floating-object:nth-child(2) { left: 20%; animation-delay: 2s; }
        .floating-object:nth-child(3) { left: 30%; animation-delay: 4s; }
        .floating-object:nth-child(4) { left: 40%; animation-delay: 6s; }
        .floating-object:nth-child(5) { left: 50%; animation-delay: 8s; }

        @keyframes float-around {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.6; }
            90% { opacity: 0.6; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        .footer {
            margin-top: 2rem;
            color: #999;
            font-size: 0.9rem;
        }

        .highlight {
            background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
            padding: 0.2rem 0.5rem;
            border-radius: 5px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="floating-objects">
        <div class="floating-object">🏃‍♂️</div>
        <div class="floating-object">💨</div>
        <div class="floating-object">🚀</div>
        <div class="floating-object">⭐</div>
        <div class="floating-object">🎯</div>
    </div>

    <div class="container">
        <div class="runaway-icon">🏃‍♂️</div>
        
        <h1>我们跑路啦！</h1>
        
        <div class="subtitle">
            是的，你没看错！我们真的跑路了！<br>
            <span class="highlight">随便骂我们都可以！</span>
        </div>

        <div class="emoji-container">
            <div class="emoji">😅</div>
            <div class="emoji">🤷‍♂️</div>
            <div class="emoji">💸</div>
            <div class="emoji">🏃‍♀️</div>
        </div>

        <div class="message">
            <p>
                <strong>亲爱的用户们：</strong><br>
                经过深思熟虑，我们决定...<br>
                <span style="color: #ff6b6b; font-size: 1.3rem;">跑路啦！</span><br><br>
                不要问为什么，问就是任性！<br>
                不要问去哪里，问就是天涯海角！<br>
                不要问什么时候回来，问就是...<br>
                <span style="color: #ff6b6b;">永远不回来！</span>
            </p>
        </div>

        <div class="funny-quotes">
            <div class="quote">
                "跑路是一门艺术，我们只是艺术家而已！" 🎨
            </div>
            <div class="quote">
                "人生苦短，及时跑路！" ⚡
            </div>
            <div class="quote">
                "不是我们抛弃了你们，是你们跟不上我们的脚步！" 🚀
            </div>
        </div>

        <div class="emoji-container">
            <div class="emoji">🎭</div>
            <div class="emoji">🎪</div>
            <div class="emoji">🎨</div>
            <div class="emoji">🎯</div>
        </div>

        <div class="footer">
            <p>最后，感谢大家的支持与理解！</p>
            <p>（虽然我们并不需要理解）</p>
            <p style="margin-top: 1rem; font-size: 0.8rem;">
                PS: 如果你们想骂我们，请对着天空大喊三声！<br>
                我们会在云端听到的！☁️
            </p>
        </div>
    </div>

    <script>
        // 添加一些交互效果
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.querySelector('.container');
            
            // 鼠标移动时的视差效果
            document.addEventListener('mousemove', function(e) {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                container.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
            });

            // 点击时的特效
            container.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });

            // 随机改变emoji颜色
            setInterval(() => {
                const emojis = document.querySelectorAll('.emoji');
                emojis.forEach(emoji => {
                    emoji.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
                });
            }, 3000);
        });
    </script>
</body>
</html>
