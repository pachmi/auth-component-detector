import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Code, Loader2, Sparkles, Shield, Globe, ExternalLink, Zap, Lock, Mail, User, Eye, Clock } from 'lucide-react';

export default function AuthenticationDetector() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  const testWebsites = [
    { name: 'Stack Overflow', url: 'https://stackoverflow.com/users/login', type: 'Tech', icon: '💻' },
    { name: 'GitHub', url: 'https://github.com/login', type: 'SaaS', icon: '🐙' },
    { name: 'WordPress.org', url: 'https://login.wordpress.org', type: 'Blog', icon: '📝' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/login', type: 'Social', icon: '💼' },
    { name: 'PayPal', url: 'https://www.paypal.com/signin', type: 'E-commerce', icon: '💳' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('recentScans');
    if (saved) {
      setRecentScans(JSON.parse(saved));
    }
  }, []);

  const detectAuthComponents = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const findings = {
      forms: [],
      passwordInputs: [],
      usernameInputs: [],
      emailInputs: [],
      loginButtons: [],
      authContainers: [],
      socialAuth: []
    };

    const htmlLower = html.toLowerCase();
    
    const forms = doc.querySelectorAll('form');
    forms.forEach((form, idx) => {
      const formHtml = form.outerHTML;
      const hasPassword = form.querySelector('input[type="password"]') || 
                         formHtml.toLowerCase().includes('type="password"') ||
                         formHtml.toLowerCase().includes('type=password');
      const hasEmail = form.querySelector('input[type="email"]') ||
                      formHtml.toLowerCase().includes('type="email"');
      const hasUsername = form.querySelector('input[name*="user"], input[name*="login"], input[id*="user"], input[id*="login"]') ||
                         formHtml.toLowerCase().includes('name="user') ||
                         formHtml.toLowerCase().includes('name="login');
      
      if (hasPassword || hasEmail || hasUsername) {
        findings.forms.push({
          html: formHtml.substring(0, 600) + (formHtml.length > 600 ? '...' : ''),
          hasPassword: !!hasPassword,
          hasUsername: !!hasUsername,
          hasEmail: !!hasEmail,
          action: form.getAttribute('action') || 'N/A',
          method: form.getAttribute('method') || 'GET',
          id: form.getAttribute('id') || 'N/A',
          index: idx
        });
      }
    });

    const passwordInputs = doc.querySelectorAll('input[type="password"]');
    if (passwordInputs.length === 0 && htmlLower.includes('type="password"')) {
      findings.passwordInputs.push({
        html: '<input type="password" ... (JavaScript-rendered)',
        id: 'N/A (JS-rendered)',
        name: 'N/A (JS-rendered)',
        placeholder: 'Detected in HTML source',
        autocomplete: 'N/A',
        index: 0
      });
    } else {
      passwordInputs.forEach((input, idx) => {
        findings.passwordInputs.push({
          html: input.outerHTML,
          id: input.id || 'N/A',
          name: input.name || 'N/A',
          placeholder: input.placeholder || 'N/A',
          autocomplete: input.autocomplete || 'N/A',
          index: idx
        });
      });
    }

    const emailInputs = doc.querySelectorAll('input[type="email"]');
    if (emailInputs.length === 0 && htmlLower.includes('type="email"')) {
      findings.emailInputs.push({
        html: '<input type="email" ... (JavaScript-rendered)',
        id: 'N/A (JS-rendered)',
        name: 'N/A (JS-rendered)',
        placeholder: 'Detected in HTML source',
        index: 0
      });
    } else {
      emailInputs.forEach((input, idx) => {
        findings.emailInputs.push({
          html: input.outerHTML,
          id: input.id || 'N/A',
          name: input.name || 'N/A',
          placeholder: input.placeholder || 'N/A',
          index: idx
        });
      });
    }

    const usernameSelectors = [
      'input[name*="user"]',
      'input[name*="login"]',
      'input[id*="user"]',
      'input[id*="login"]',
      'input[placeholder*="user"]',
      'input[placeholder*="email"]',
      'input[name*="username"]',
      'input[id*="username"]'
    ];
    
    const foundUsernames = new Set();
    usernameSelectors.forEach(selector => {
      const inputs = doc.querySelectorAll(selector);
      inputs.forEach((input) => {
        if (input.type !== 'password' && input.type !== 'email' && !foundUsernames.has(input.outerHTML)) {
          foundUsernames.add(input.outerHTML);
          findings.usernameInputs.push({
            html: input.outerHTML,
            id: input.id || 'N/A',
            name: input.name || 'N/A',
            type: input.type || 'text',
            placeholder: input.placeholder || 'N/A',
            index: findings.usernameInputs.length
          });
        }
      });
    });

    if (findings.usernameInputs.length === 0) {
      const usernamePatterns = ['name="username"', 'name="user"', 'name="login"', 'id="username"'];
      if (usernamePatterns.some(pattern => htmlLower.includes(pattern))) {
        findings.usernameInputs.push({
          html: '<input name="username" ... (JavaScript-rendered)',
          id: 'N/A (JS-rendered)',
          name: 'Detected in source',
          type: 'text',
          placeholder: 'Username field detected',
          index: 0
        });
      }
    }

    const buttons = doc.querySelectorAll('button, input[type="submit"]');
    const authKeywords = ['login', 'sign in', 'signin', 'log in', 'submit', 'continue', 'enter'];
    
    buttons.forEach((btn) => {
      const text = (btn.textContent || btn.value || '').toLowerCase();
      
      if (authKeywords.some(keyword => text.includes(keyword))) {
        findings.loginButtons.push({
          html: btn.outerHTML.substring(0, 300),
          text: btn.textContent || btn.value || 'N/A',
          type: btn.type || 'button',
          id: btn.id || 'N/A',
          index: findings.loginButtons.length
        });
      }
    });

    if (findings.loginButtons.length === 0) {
      if (htmlLower.includes('type="submit"') || htmlLower.includes('<button')) {
        findings.loginButtons.push({
          html: '<button type="submit" ... (JavaScript-rendered)',
          text: 'Submit button detected',
          type: 'submit',
          id: 'N/A (JS-rendered)',
          index: 0
        });
      }
    }

    const authSelectors = [
      '[class*="login"]',
      '[class*="auth"]',
      '[id*="login"]',
      '[id*="auth"]',
      '[class*="signin"]',
      '[id*="signin"]'
    ];

    const foundContainers = new Set();
    authSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((el) => {
        const html = el.outerHTML;
        const hasInputs = el.querySelectorAll('input').length > 0;
        if (hasInputs && html.length < 3000 && !foundContainers.has(html) && findings.authContainers.length < 5) {
          foundContainers.add(html);
          findings.authContainers.push({
            html: html.substring(0, 600) + (html.length > 600 ? '...' : ''),
            className: el.className || 'N/A',
            id: el.id || 'N/A',
            tag: el.tagName.toLowerCase(),
            index: findings.authContainers.length
          });
        }
      });
    });

    const socialKeywords = ['google', 'facebook', 'twitter', 'github', 'microsoft', 'apple', 'linkedin'];
    const allElements = doc.querySelectorAll('button, a, div[role="button"]');
    
    allElements.forEach((el) => {
      const text = (el.textContent || '').toLowerCase();
      const className = (el.className || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const combined = `${text} ${className} ${id}`;
      
      socialKeywords.forEach(social => {
        if (combined.includes(social) && (combined.includes('sign') || combined.includes('login'))) {
          findings.socialAuth.push({
            provider: social.charAt(0).toUpperCase() + social.slice(1),
            text: el.textContent?.trim().substring(0, 50) || 'N/A',
            html: el.outerHTML.substring(0, 300)
          });
        }
      });
    });

    const uniqueSocial = [];
    const seenSocial = new Set();
    findings.socialAuth.forEach(item => {
      if (!seenSocial.has(item.html)) {
        seenSocial.add(item.html);
        uniqueSocial.push(item);
      }
    });
    findings.socialAuth = uniqueSocial;

    return findings;
  };

  const corsProxies = [
    { url: 'https://api.allorigins.win/raw?url=', name: 'AllOrigins' },
    { url: 'https://corsproxy.io/?', name: 'CorsProxy' },
    { url: 'https://api.codetabs.com/v1/proxy?quest=', name: 'CodeTabs' }
  ];

  const scanWebsite = async (targetUrl) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let normalizedUrl = targetUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      new URL(normalizedUrl);

      let html = null;
      let successfulProxy = null;

      for (const proxy of corsProxies) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const response = await fetch(proxy.url + encodeURIComponent(normalizedUrl), {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            html = await response.text();
            
            if (html && html.length > 100) {
              successfulProxy = proxy.name;
              break;
            }
          }
        } catch (proxyError) {
          continue;
        }
      }

      if (!html) {
        throw new Error(
          'Unable to fetch website content. This may be due to:\n' +
          '• Website blocking automated requests\n' +
          '• CORS restrictions\n' +
          '• Network issues\n' +
          'Try a different website or check if the URL is correct.'
        );
      }

      const findings = detectAuthComponents(html);
      
      const hasAuth = findings.forms.length > 0 || 
                     findings.passwordInputs.length > 0 || 
                     findings.usernameInputs.length > 0 ||
                     findings.emailInputs.length > 0;

      const scanResult = {
        url: normalizedUrl,
        timestamp: new Date().toISOString(),
        hasAuthentication: hasAuth,
        findings,
        proxy: successfulProxy,
        summary: {
          forms: findings.forms.length,
          passwordFields: findings.passwordInputs.length,
          usernameFields: findings.usernameInputs.length,
          emailFields: findings.emailInputs.length,
          loginButtons: findings.loginButtons.length,
          authContainers: findings.authContainers.length,
          socialAuth: findings.socialAuth.length,
          total: findings.forms.length + findings.passwordInputs.length + 
                 findings.usernameInputs.length + findings.emailInputs.length +
                 findings.loginButtons.length + findings.socialAuth.length
        }
      };

      setResult(scanResult);

      const updated = [
        { url: normalizedUrl, timestamp: new Date().toISOString(), hasAuth, total: scanResult.summary.total },
        ...recentScans.filter(s => s.url !== normalizedUrl)
      ].slice(0, 5);
      setRecentScans(updated);
      localStorage.setItem('recentScans', JSON.stringify(updated));

    } catch (err) {
      setError(err.message || 'Failed to scan website. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    scanWebsite(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse top-0 -left-40"></div>
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse bottom-0 -right-40 delay-700"></div>
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(-10px) translateX(-10px); }
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="relative">
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
            </div>
            <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 font-bold tracking-wider">
              AI-POWERED DETECTION ENGINE
            </span>
            <div className="relative">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 bg-purple-400 blur-xl opacity-50 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 relative">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-2xl opacity-50"></span>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                Auth Detector
              </span>
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
            Advanced web scraping that identifies <span className="text-purple-400 font-semibold">login forms</span> and{' '}
            <span className="text-pink-400 font-semibold">authentication components</span> on any website
          </p>
        </div>

        {/* Enhanced Search Interface */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative group/input">
                <Globe className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-hover/input:text-purple-400 transition-colors" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Enter website URL (e.g., https://example.com/login)"
                  className="w-full pl-14 pr-6 py-5 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-lg font-medium"
                />
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="relative px-10 py-5 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 text-lg overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin relative z-10" />
                    <span className="relative z-10">Scanning...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Analyze</span>
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Quick Test Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300 font-semibold">Quick Test Sites:</span>
                <span className="text-xs text-slate-500">Click to fill URL, then press Analyze</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {testWebsites.map((site) => (
                  <button
                    key={site.url}
                    onClick={() => setUrl(site.url)}
                    disabled={loading}
                    className="group/site relative px-5 py-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-purple-900/30 hover:to-pink-900/30 border border-slate-700/50 hover:border-purple-500/50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover/site:from-purple-500/10 group-hover/site:via-pink-500/10 group-hover/site:to-cyan-500/10 transition-all duration-300"></div>
                    <div className="relative flex items-center gap-2">
                      <span className="text-xl">{site.icon}</span>
                      <div className="text-left">
                        <div className="text-sm text-white font-semibold">{site.name}</div>
                        <div className="text-xs text-purple-400">{site.type}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="relative group/error mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25"></div>
            <div className="relative bg-red-950/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
              <div className="relative">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div className="absolute inset-0 bg-red-400 blur-xl opacity-50"></div>
              </div>
              <div className="text-red-200 whitespace-pre-line flex-1">{error}</div>
            </div>
          </div>
        )}

        {/* Enhanced Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card with cool animations */}
            <div className="relative group/result">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl blur opacity-25 group-hover/result:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {result.hasAuthentication ? (
                      <>
                        <CheckCircle className="w-10 h-10 text-green-400" />
                        <div className="absolute inset-0 bg-green-400 blur-xl opacity-50 animate-pulse"></div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-10 h-10 text-yellow-400" />
                        <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black text-white mb-2">
                      {result.hasAuthentication ? '✓ Authentication Found!' : '⚠ No Authentication'}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        <span className="truncate max-w-md">{result.url}</span>
                      </span>
                      <span>•</span>
                      <span className="text-purple-400 font-semibold">{result.proxy}</span>
                      <span>•</span>
                      <span>{new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-black bg-gradient-to-br from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {result.summary.total}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold tracking-wider">COMPONENTS</div>
                  </div>
                </div>
                
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <CoolStatCard label="Forms" value={result.summary.forms} icon={Shield} color="from-pink-500 to-rose-500" />
                  <CoolStatCard label="Passwords" value={result.summary.passwordFields} icon={Lock} color="from-red-500 to-orange-500" />
                  <CoolStatCard label="Usernames" value={result.summary.usernameFields} icon={User} color="from-blue-500 to-cyan-500" />
                  <CoolStatCard label="Emails" value={result.summary.emailFields} icon={Mail} color="from-purple-500 to-indigo-500" />
                  <CoolStatCard label="Buttons" value={result.summary.loginButtons} icon={Zap} color="from-green-500 to-emerald-500" />
                  <CoolStatCard label="Containers" value={result.summary.authContainers} icon={Code} color="from-yellow-500 to-amber-500" />
                  <CoolStatCard label="Social" value={result.summary.socialAuth} icon={Eye} color="from-indigo-500 to-purple-500" />
                </div>
              </div>
            </div>

            {/* Rest of the results... */}
            {result.hasAuthentication && (
              <div className="space-y-4">
                {result.findings.forms.length > 0 && (
                  <CoolFindingCard 
                    title="Login Forms" 
                    icon={Shield} 
                    items={result.findings.forms} 
                    type="form"
                    gradient="from-pink-500 to-rose-500"
                  />
                )}
                {result.findings.passwordInputs.length > 0 && (
                  <CoolFindingCard 
                    title="Password Inputs" 
                    icon={Lock} 
                    items={result.findings.passwordInputs} 
                    type="input"
                    gradient="from-red-500 to-orange-500"
                  />
                )}
                {result.findings.emailInputs.length > 0 && (
                  <CoolFindingCard 
                    title="Email Inputs" 
                    icon={Mail} 
                    items={result.findings.emailInputs} 
                    type="input"
                    gradient="from-purple-500 to-indigo-500"
                  />
                )}
                {result.findings.usernameInputs.length > 0 && (
                  <CoolFindingCard 
                    title="Username Inputs" 
                    icon={User} 
                    items={result.findings.usernameInputs} 
                    type="input"
                    gradient="from-blue-500 to-cyan-500"
                  />
                )}
                {result.findings.loginButtons.length > 0 && (
                  <CoolFindingCard 
                    title="Login Buttons" 
                    icon={Zap} 
                    items={result.findings.loginButtons} 
                    type="button"
                    gradient="from-green-500 to-emerald-500"
                  />
                )}
                {result.findings.authContainers.length > 0 && (
                  <CoolFindingCard 
                    title="Auth Containers" 
                    icon={Code} 
                    items={result.findings.authContainers} 
                    type="container"
                    gradient="from-yellow-500 to-amber-500"
                  />
                )}
                {result.findings.socialAuth.length > 0 && (
                  <CoolFindingCard 
                    title="Social Auth" 
                    icon={Eye} 
                    items={result.findings.socialAuth} 
                    type="social"
                    gradient="from-indigo-500 to-purple-500"
                  />
                )}
              </div>
            )}

            {!result.hasAuthentication && (
              <div className="relative group/warn">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-yellow-950/30 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    No Authentication Components Found
                  </h3>
                  <p className="text-yellow-200 text-sm mb-3">
                    The page was successfully scraped, but no login forms or authentication components were detected.
                  </p>
                  <ul className="text-sm text-yellow-200 list-disc list-inside space-y-2 ml-2">
                    <li>Page may not have a login form</li>
                    <li>Authentication might be JavaScript-rendered</li>
                    <li>Login form could be on a different URL</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-yellow-500/20">
                    <p className="text-xs text-yellow-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">Tip:</span> Try URLs like /login, /signin, or /auth for better results
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Recent Scans */}
        {recentScans.length > 0 && (
          <div className="mt-8 relative group/recent">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-slate-900/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-400" />
                Recent Scans
              </h3>
              <div className="space-y-2">
                {recentScans.map((scan, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUrl(scan.url);
                      scanWebsite(scan.url);
                    }}
                    className="w-full text-left px-5 py-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-purple-500/30 rounded-xl flex items-center justify-between group/scan transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        {scan.hasAuth ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div className="absolute inset-0 bg-green-400 blur-lg opacity-30 group-hover/scan:opacity-50 transition-opacity"></div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-30 group-hover/scan:opacity-50 transition-opacity"></div>
                          </>
                        )}
                      </div>
                      <span className="text-slate-300 text-sm font-medium truncate flex-1">{scan.url}</span>
                      {scan.total > 0 && (
                        <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-xs font-bold">
                          {scan.total} found
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 ml-3">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-block px-6 py-3 bg-slate-900/30 backdrop-blur-xl rounded-full border border-white/10">
            <p className="text-slate-400 text-sm">
              Built with <span className="text-pink-400">♥</span> using React + Vite
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Created by <span className="text-purple-400 font-semibold">Alyssa Bustos</span> for AI Engineer Assessment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoolStatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="relative group/stat">
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${color} rounded-xl blur opacity-20 group-hover/stat:opacity-40 transition duration-300`}></div>
      <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 bg-gradient-to-br ${color} bg-clip-text text-transparent`} />
          <div className={`text-3xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
            {value}
          </div>
        </div>
        <div className="text-xs text-slate-400 font-semibold tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function CoolFindingCard({ title, icon: Icon, items, type, gradient }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative group/finding">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover/finding:opacity-30 transition duration-300`}></div>
      <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Icon className={`w-6 h-6 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-30`}></div>
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <span className={`bg-gradient-to-br ${gradient} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
              {items.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm font-medium">{expanded ? 'Hide' : 'Show'}</span>
            <span className="text-lg">{expanded ? '▼' : '▶'}</span>
          </div>
        </button>

        {expanded && (
          <div className="mt-6 space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="bg-slate-950/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors">
                {type === 'form' && (
                  <div className="text-xs text-slate-400 mb-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Action:</span>
                      <span className="text-slate-300 font-mono">{item.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Method:</span>
                      <span className="text-slate-300 font-mono">{item.method}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {item.hasPassword && <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-semibold">Password</span>}
                      {item.hasEmail && <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-semibold">Email</span>}
                      {item.hasUsername && <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-semibold">Username</span>}
                    </div>
                  </div>
                )}
                {type === 'input' && (
                  <div className="text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-500">ID:</span>
                      <span className="text-slate-300 font-mono">{item.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500">Name:</span>
                      <span className="text-slate-300 font-mono">{item.name}</span>
                    </div>
                    {item.placeholder && item.placeholder !== 'N/A' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500">Placeholder:</span>
                        <span className="text-slate-300 font-mono">{item.placeholder}</span>
                      </div>
                    )}
                  </div>
                )}
                {type === 'button' && (
                  <div className="text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Text:</span>
                      <span className="text-slate-300 font-semibold">{item.text}</span>
                    </div>
                  </div>
                )}
                {type === 'container' && (
                  <div className="text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Tag:</span>
                      <span className="text-slate-300 font-mono">{item.tag}</span>
                    </div>
                  </div>
                )}
                {type === 'social' && (
                  <div className="text-xs text-slate-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Provider:</span>
                      <span className="text-slate-300 font-semibold">{item.provider}</span>
                    </div>
                  </div>
                )}
                <div className="mt-3 bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-hidden">
                  <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                    {item.html}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}