import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Code, Loader2, Sparkles, Shield, Globe } from 'lucide-react';

export default function AuthenticationDetector() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  // Pre-configured test websites
  const testWebsites = [
  { name: 'NY Times (News)', url: 'https://myaccount.nytimes.com/auth/login' },
  { name: 'Etsy (E-commerce)', url: 'https://www.etsy.com/signin' },
  { name: 'Trello (SaaS)', url: 'https://trello.com/login' },
  { name: 'Medium (Blog)', url: 'https://medium.com/m/signin' },
  { name: 'GitHub (Dev)', url: 'https://github.com/login' },
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
      loginButtons: [],
      authContainers: []
    };

    // Find forms with authentication indicators
    const forms = doc.querySelectorAll('form');
    forms.forEach((form, idx) => {
      const formHtml = form.outerHTML;
      const hasPassword = formHtml.toLowerCase().includes('password') || 
                         form.querySelector('input[type="password"]');
      const hasUsername = formHtml.toLowerCase().includes('username') || 
                         formHtml.toLowerCase().includes('email') ||
                         form.querySelector('input[type="email"]') ||
                         form.querySelector('input[name*="user"]') ||
                         form.querySelector('input[name*="email"]');
      
      if (hasPassword || hasUsername) {
        findings.forms.push({
          html: formHtml.substring(0, 500) + (formHtml.length > 500 ? '...' : ''),
          hasPassword,
          hasUsername,
          index: idx
        });
      }
    });

    // Find password inputs
    const passwordInputs = doc.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input, idx) => {
      findings.passwordInputs.push({
        html: input.outerHTML,
        id: input.id || 'N/A',
        name: input.name || 'N/A',
        index: idx
      });
    });

    // Find username/email inputs
    const usernameSelectors = [
      'input[type="email"]',
      'input[name*="user"]',
      'input[name*="email"]',
      'input[id*="user"]',
      'input[id*="email"]',
      'input[placeholder*="user"]',
      'input[placeholder*="email"]'
    ];
    
    usernameSelectors.forEach(selector => {
      const inputs = doc.querySelectorAll(selector);
      inputs.forEach((input, idx) => {
        if (!findings.usernameInputs.some(u => u.html === input.outerHTML)) {
          findings.usernameInputs.push({
            html: input.outerHTML,
            id: input.id || 'N/A',
            name: input.name || 'N/A',
            type: input.type,
            index: idx
          });
        }
      });
    });

    // Find login buttons
    const buttons = doc.querySelectorAll('button, input[type="submit"]');
    buttons.forEach((btn, idx) => {
      const text = btn.textContent.toLowerCase() || btn.value?.toLowerCase() || '';
      if (text.includes('login') || text.includes('sign in') || text.includes('log in')) {
        findings.loginButtons.push({
          html: btn.outerHTML,
          text: btn.textContent || btn.value || 'N/A',
          index: idx
        });
      }
    });

    // Find divs/sections with login/auth classes or IDs
    const authSelectors = [
      '[class*="login"]',
      '[class*="auth"]',
      '[id*="login"]',
      '[id*="auth"]',
      '[class*="signin"]',
      '[id*="signin"]'
    ];

    authSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((el, idx) => {
        const html = el.outerHTML;
        if (html.length < 2000 && !findings.authContainers.some(a => a.html === html)) {
          findings.authContainers.push({
            html: html.substring(0, 500) + (html.length > 500 ? '...' : ''),
            className: el.className || 'N/A',
            id: el.id || 'N/A',
            index: idx
          });
        }
      });
    });

    return findings;
  };

  const scanWebsite = async (targetUrl) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Validate URL
      const urlObj = new URL(targetUrl);
      
      // Use your backend API
      const backendUrl = 'https://auth-detector-backend.onrender.com/api/scrape';
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!response.ok) throw new Error('Failed to fetch website');
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      const html = data.html;
      const findings = detectAuthComponents(html);
      
      const hasAuth = findings.forms.length > 0 || 
                     findings.passwordInputs.length > 0 || 
                     findings.usernameInputs.length > 0;

      const scanResult = {
        url: targetUrl,
        timestamp: new Date().toISOString(),
        hasAuthentication: hasAuth,
        findings,
        summary: {
          forms: findings.forms.length,
          passwordFields: findings.passwordInputs.length,
          usernameFields: findings.usernameInputs.length,
          loginButtons: findings.loginButtons.length,
          authContainers: findings.authContainers.length
        }
      };

      setResult(scanResult);

      // Save to recent scans
      const updated = [
        { url: targetUrl, timestamp: new Date().toISOString(), hasAuth },
        ...recentScans.filter(s => s.url !== targetUrl)
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
    if (url) scanWebsite(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-rose-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-pink-300 font-medium">AI-Powered Detection</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-600">
            Authentication Component Detector
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Advanced web scraping tool that identifies login forms and authentication components on any website
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-pink-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-300 mr-2">Quick tests:</span>
            {testWebsites.map((site) => (
              <button
                key={site.url}
                onClick={() => setUrl(site.url)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm rounded-lg border border-white/10 transition-all"
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-300">{error}</div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                {result.hasAuthentication ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                )}
                <h2 className="text-2xl font-bold text-white">
                  {result.hasAuthentication ? 'Authentication Found!' : 'No Authentication Detected'}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-pink-400">{result.summary.forms}</div>
                  <div className="text-sm text-slate-300">Forms</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-pink-400">{result.summary.passwordFields}</div>
                  <div className="text-sm text-slate-300">Password Fields</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400">{result.summary.usernameFields}</div>
                  <div className="text-sm text-slate-300">Username Fields</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">{result.summary.loginButtons}</div>
                  <div className="text-sm text-slate-300">Login Buttons</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">{result.summary.authContainers}</div>
                  <div className="text-sm text-slate-300">Auth Containers</div>
                </div>
              </div>
            </div>

            {/* Detailed Findings */}
            {result.hasAuthentication && (
              <div className="space-y-4">
                {result.findings.forms.length > 0 && (
                  <FindingCard title="Login Forms" icon={Shield} items={result.findings.forms} type="form" />
                )}
                {result.findings.passwordInputs.length > 0 && (
                  <FindingCard title="Password Inputs" icon={Code} items={result.findings.passwordInputs} type="input" />
                )}
                {result.findings.usernameInputs.length > 0 && (
                  <FindingCard title="Username/Email Inputs" icon={Code} items={result.findings.usernameInputs} type="input" />
                )}
                {result.findings.loginButtons.length > 0 && (
                  <FindingCard title="Login Buttons" icon={Code} items={result.findings.loginButtons} type="button" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Recent Scans</h3>
            <div className="space-y-2">
              {recentScans.map((scan, idx) => (
                <button
                  key={idx}
                  onClick={() => setUrl(scan.url)}
                  className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    {scan.hasAuth ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-slate-300 text-sm truncate">{scan.url}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(scan.timestamp).toLocaleTimeString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FindingCard({ title, icon: Icon, items, type }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full text-sm">
            {items.length}
          </span>
        </div>
        <span className="text-slate-400 text-sm">{expanded ? 'Hide' : 'Show'}</span>
      </button>

      {expanded && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              {type === 'input' && (
                <div className="text-xs text-slate-400 mb-2">
                  ID: {item.id} | Name: {item.name}
                </div>
              )}
              {type === 'button' && (
                <div className="text-xs text-slate-400 mb-2">
                  Text: {item.text}
                </div>
              )}
              <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
                {item.html}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}