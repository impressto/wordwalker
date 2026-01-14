<?php
// Read version from package.json for cache busting
$packageJson = json_decode(file_get_contents(__DIR__ . '/package.json'), true);
$version = $packageJson['version'] ?? '1.0.0';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#4CAF50">
    <meta name="description" content="About WordWalker - A free, open-source, ad-free Spanish learning platform for everyone. Learn Spanish without subscriptions or barriers.">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="https://impressto.ca/wordwalker/dist/favicon.ico">
    <link rel="icon" type="image/svg+xml" href="https://impressto.ca/wordwalker/dist/favicon.svg">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    
    <title>About Us - WordWalker</title>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Quicksand', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }
        
        /* Animated background elements */
        .bg-decoration {
            position: fixed;
            opacity: 0.1;
            pointer-events: none;
            z-index: 0;
        }
        
        .bg-decoration.star {
            font-size: 3rem;
            animation: twinkle 3s infinite;
        }
        
        .bg-decoration.walker {
            font-size: 4rem;
            animation: walk 15s linear infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
        }
        
        @keyframes walk {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(calc(100vw + 100px)); }
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            animation: slideDown 0.6s ease-out;
        }
        
        @keyframes slideDown {
            from { 
                opacity: 0; 
                transform: translateY(-30px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }
        
        .logo {
            font-size: 4rem;
            margin-bottom: 10px;
        }
        
        h1 {
            color: white;
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 1.1rem;
            margin-bottom: 5px;
        }
        
        .spanish-greeting {
            color: #ffd700;
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: fadeInUp 0.6s ease-out 0.2s backwards;
            margin-bottom: 20px;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        h2 {
            color: #667eea;
            font-size: 1.8rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        h3 {
            color: #764ba2;
            font-size: 1.4rem;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        p {
            color: #555;
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 15px;
        }
        
        .mission-points {
            list-style: none;
            margin: 20px 0;
        }
        
        .mission-points li {
            color: #555;
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 15px;
            padding-left: 35px;
            position: relative;
        }
        
        .mission-points li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #4CAF50;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .resources-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .resource-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 20px;
            text-decoration: none;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .resource-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            border-color: #667eea;
        }
        
        .resource-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
            display: block;
        }
        
        .resource-name {
            color: #667eea;
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 8px;
            display: block;
        }
        
        .resource-description {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.5;
            display: block;
        }
        
        .cta-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 1.1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-secondary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .github-link {
            background: linear-gradient(135deg, #24292e 0%, #1a1e22 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        
        .github-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(36, 41, 46, 0.4);
        }
        
        .open-source-badge {
            background: #4CAF50;
            color: white;
            padding: 8px 16px;
            border-radius: 15px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
            .container {
                max-width: 100%;
            }
            
            .card {
                padding: 25px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            .resources-grid {
                grid-template-columns: 1fr;
            }
            
            .cta-buttons {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <!-- Background decorations -->
    <div class="bg-decoration star" style="top: 10%; left: 10%;">⭐</div>
    <div class="bg-decoration star" style="top: 20%; right: 15%;">✨</div>
    <div class="bg-decoration star" style="bottom: 15%; left: 20%;">🌟</div>
    <div class="bg-decoration walker" style="top: 50%;">🚶</div>
    
    <div class="container">
        <div class="header">
            <div class="logo">🚶📚</div>
            <h1>About WordWalker</h1>
            <p class="subtitle">Free Spanish Learning for Everyone</p>
            <p class="spanish-greeting">¡Bienvenidos!</p>
        </div>
        
        <div class="card">
            <div class="open-source-badge">🌍 100% Free & Open Source</div>
            
            <h2>🎯 Our Mission</h2>
            <p>
                WordWalker is dedicated to providing a completely <strong>free, open-source, ad-free, and subscription-free</strong> 
                platform for people to get an introduction to Spanish learning. We believe that language education should be 
                freely accessible to everyone.
            </p>
            
            <ul class="mission-points">
                <li><strong>No Ads:</strong> Learn without distractions or interruptions from advertisements</li>
                <li><strong>No Subscriptions:</strong> All features are completely free forever - no paywalls, no premium tiers</li>
                <li><strong>No Data Collection:</strong> We don't track or sell your personal information</li>
                <li><strong>Open Source:</strong> Our code is freely available for anyone to use, modify, and contribute to</li>
                <li><strong>Community-Driven:</strong> Built by learners, for learners</li>
            </ul>
            
            <h3>🎮 What We Offer</h3>
            <p>
                WordWalker combines gamification with effective language learning techniques. Our interactive game helps 
                you build vocabulary across 15+ categories including food, transportation, business, grammar, and more. 
                With audio pronunciations, example sentences, and progressive difficulty levels, you'll gain confidence 
                in Spanish step by step.
            </p>
            
            <p>
                Our flash cards feature allows you to study at your own pace with over 1,000+ Spanish phrases and words, 
                complete with translations, examples, and native audio pronunciations.
            </p>
            
            <h3>💻 Open Source Contribution</h3>
            <p>
                WordWalker is an open-source project. We welcome contributions from developers, translators, educators, 
                and language enthusiasts. Whether you want to add new features, improve translations, or expand our 
                vocabulary database, we'd love your help!
            </p>
            
            <a href="https://github.com/impressto/wordwalker" class="github-link" target="_blank" rel="noopener">
                <span>⚡</span> View on GitHub
            </a>
        </div>
        
        <div class="card">
            <h2>🌐 Other Spanish Learning Resources</h2>
            <p>
                While we hope WordWalker is helpful for your Spanish learning journey, we also want to point you to 
                other excellent (and mostly free) resources that can complement your studies:
            </p>
            
            <div class="resources-grid">
                <a href="https://www.duolingo.com/" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">🦉</span>
                    <span class="resource-name">Duolingo</span>
                    <span class="resource-description">Popular gamified language learning app with structured lessons</span>
                </a>
                
                <a href="https://www.spanishdict.com/" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">📖</span>
                    <span class="resource-name">SpanishDict</span>
                    <span class="resource-description">Comprehensive Spanish-English dictionary with conjugations and examples</span>
                </a>
                
                <a href="https://studyspanish.com/" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">📚</span>
                    <span class="resource-name">StudySpanish.com</span>
                    <span class="resource-description">Free grammar lessons and verb conjugation practice</span>
                </a>
                
                <a href="https://www.conjuguemos.com/" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">🔤</span>
                    <span class="resource-name">Conjuguemos</span>
                    <span class="resource-description">Verb conjugation practice with games and activities</span>
                </a>
                
                <a href="https://www.youtube.com/c/ButterflySpanish" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">🎥</span>
                    <span class="resource-name">Butterfly Spanish</span>
                    <span class="resource-description">YouTube channel with engaging Spanish lessons for beginners</span>
                </a>
                
                <a href="https://www.youtube.com/c/SpanishPod101" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">🎧</span>
                    <span class="resource-name">SpanishPod101</span>
                    <span class="resource-description">Audio and video lessons for all levels with cultural insights</span>
                </a>
                
                <a href="https://www.reddit.com/r/Spanish/" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">💬</span>
                    <span class="resource-name">r/Spanish</span>
                    <span class="resource-description">Active Reddit community for Spanish learners to ask questions</span>
                </a>
                
                <a href="https://www.languagetransfer.org/" class="resource-card" target="_blank" rel="noopener">
                    <span class="resource-icon">🎓</span>
                    <span class="resource-name">Language Transfer</span>
                    <span class="resource-description">Free audio course focusing on thinking in Spanish naturally</span>
                </a>
            </div>
        </div>
        
        <div class="card">
            <h2>📞 Get in Touch</h2>
            <p>
                Have feedback, found a translation error, or want to suggest new features? We'd love to hear from you! 
                Your input helps us improve WordWalker for everyone.
            </p>
            
            <div class="cta-buttons">
                <a href="/" class="btn btn-primary">🎮 Start Learning</a>
                <a href="/flashcards/" class="btn btn-secondary">📚 Browse Flash Cards</a>
                <a href="/contact.php" class="btn btn-secondary">💬 Contact Us</a>
            </div>
        </div>
    </div>
</body>
</html>
