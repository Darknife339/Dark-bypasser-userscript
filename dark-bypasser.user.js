// ==UserScript==
// @name         Dark Bypasser
// @namespace    http://tampermonkey.net/
// @version      3.2
// @author       Darknifus
// @match        *://https://linkvertise.com/*
// @match        *://scriptpastebin.com/*
// @match        *://scriptpastebins.com/*
// @match        *://boost.ink/*
// @match        *://bst.gg/*
// @match        *://booo.st/*
// @match        *://bst.wtf/*
// @match        *://urbanstorm.uk/*
// @match        *://razelol.vercel.app/*
// @match        *://orca-key-system.vercel.app/*
// @match        *://key-system-hub.vercel.app/*
// @match        *://link2unlock.com/*
// @match        *://sub2get.com/*
// @match        *://sub4unlock.com/*
// @match        *://sub2unlock.net/*
// @match        *://sub2unlock.com/*
// @match        *://mboost.me/*
// @match        *://pastebin.com/*
// @match        *://lockr.so/*
// @match        *://lockr.net/*
// @match        *://linkunlocker.com/*
// @match        *://link-unlock.com/*
// @match        *://auth.platorelay.com/*
// @match        *://ads.pandadevelopment.net/*
// @match        *://ads.pandauth.com/*
// @match        *://pastelua.com/*
// @match        *://boblox-script.com/*
// @match        *://neoxsoftworks.eu/*
// @match        *://violated.lol/*
// @match        *://tpi.li/*
// @match        *://airflowkey.space/*
// @match        *://bstshrt.com/*
// @match        *://linkzy.space/*
// @match        *://luarmor.org/*
// @match        *://lnbz.la/*
// @match        *://encurtai.online/*
// @match        *://direct-link.net/*
// @match        *://link-target.net/*
// @match        *://link-to.net/*
// @match        *://link-center.net/*
// @match        *://link-hub.net/*
// @match        *://up-to-down.net/*
// @match        *://linkvertise.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      darkk-bypass.vercel.app
// @connect      fi10.bot-hosting.net
// @connect      unknown-api-one.vercel.app
// ==/UserScript==

(function() {
    'use strict';

    const state = {
        autoBypass: GM_getValue('autoBypass', true),
        autoRedirect: GM_getValue('autoRedirect', true),
        delay: GM_getValue('delay', 30),
        startDelay: GM_getValue('startDelay', 2),
        bypassedUrls: GM_getValue('bypassedUrls', [])
    };

    function getBasePath(url) {
        const urlObj = new URL(url);
        return urlObj.origin + urlObj.pathname;
    }

    function isUrlAlreadyBypassed(url) {
        const basePath = getBasePath(url);
        return state.bypassedUrls.some(savedUrl => getBasePath(savedUrl) === basePath);
    }

    function markUrlAsBypassed(url) {
        const basePath = getBasePath(url);
        if (!state.bypassedUrls.some(savedUrl => getBasePath(savedUrl) === basePath)) {
            state.bypassedUrls.push(basePath);
            GM_setValue('bypassedUrls', state.bypassedUrls);
        }
    }

    const styles = `
        #dark-bypasser-root {
            position: fixed; top: 25px; right: 25px; width: 250px;
            background: #1e1e22; border: 1px solid #333; border-radius: 10px;
            padding: 18px; color: #d1d1d1; font-family: 'Segoe UI', sans-serif;
            z-index: 100000; box-shadow: 0 12px 40px rgba(0,0,0,0.6); user-select: none;
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            min-height: 200px;
        }
        #dark-bypasser-root.result-mode {
            width: 320px;
            top: 50% !important;
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, -50%);
            box-shadow: 0 20px 60px rgba(165, 94, 234, 0.5);
            min-height: 280px;
        }
        #dark-bypasser-root.result-mode .bypass-content {
            opacity: 0;
            pointer-events: none;
            position: absolute;
        }
        #dark-bypasser-root.result-mode .result-content {
            opacity: 1;
            pointer-events: all;
        }
        #dark-bypasser-notifications {
            position: fixed; top: 25px; right: 285px; width: 220px;
            display: flex; flex-direction: column; gap: 8px; z-index: 100000;
            font-family: 'Segoe UI', sans-serif; pointer-events: none;
        }
        .bypass-note {
            background: #1e1e22; border-left: 4px solid #a55eea; border: 1px solid #333; 
            border-left-width: 4px; padding: 10px; border-radius: 4px; color: #d1d1d1; 
            font-size: 11px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            transform: translateY(-100%) scale(0.9);
            opacity: 0;
            animation: noteSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes noteSlideIn {
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .bypass-note.success { border-left-color: #2ed573; }
        .bypass-note.error { border-left-color: #ff4757; }
        #dark-bypasser-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.75);
            z-index: 99999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
        }
        #dark-bypasser-overlay.visible {
            opacity: 1;
            pointer-events: all;
        }
        .bypass-content {
            transition: opacity 0.3s ease;
        }
        .result-content {
            position: absolute;
            top: 18px;
            left: 18px;
            right: 18px;
            bottom: 18px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease 0.15s;
            display: flex;
            flex-direction: column;
        }
        .result-title {
            font-weight: 800;
            margin-bottom: 15px;
            text-align: center;
            color: #a55eea;
            letter-spacing: 1.5px;
            font-size: 14px;
            text-transform: uppercase;
        }
        .result-text {
            background: #121214;
            border: 1px solid #333;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            word-break: break-all;
            flex: 1;
            min-height: 80px;
            max-height: 200px;
            overflow-y: auto;
            text-align: left;
            color: #a55eea;
            margin-bottom: 15px;
        }
        .result-btns {
            display: flex;
            gap: 10px;
        }
        .title { font-weight: 800; margin-bottom: 15px; text-align: center; color: #a55eea; letter-spacing: 1.5px; font-size: 14px; text-transform: uppercase; }
        .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .settings-btn {
            background: #2a2a30;
            border: 1px solid #3a3a42;
            color: #a55eea;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }
        .settings-btn:hover {
            background: #35353d;
            border-color: #a55eea;
            color: #fff;
        }
        .control-group { margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
        .switch-3d { position: relative; width: 46px; height: 22px; background: #121214; border-radius: 4px; cursor: pointer; perspective: 150px; }
        .cube { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; transform-style: preserve-3d; transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1); transform: translateZ(10px) rotateY(0deg); }
        .cube-face { position: absolute; width: 18px; height: 18px; background: #3d3d45; border: 1px solid #4a4a52; }
        .front { transform: rotateY(0deg) translateZ(9px); }
        .back { transform: rotateY(180deg) translateZ(9px); }
        .right { transform: rotateY(90deg) translateZ(9px); }
        .left { transform: rotateY(-90deg) translateZ(9px); }
        .top { transform: rotateX(90deg) translateZ(9px); }
        .bottom { transform: rotateX(-90deg) translateZ(9px); }
        .active .cube { transform: translateX(24px) translateZ(10px) rotateY(90deg); }
        .active .cube-face { background: #a55eea; border-color: #c084fc; box-shadow: 0 0 10px rgba(165, 94, 234, 0.3); }
        .slider { width: 100%; margin: 8px 0; accent-color: #a55eea; cursor: pointer; background: #333; height: 4px; border-radius: 2px; }
        .label-row { display: flex; justify-content: space-between; font-size: 11px; margin-top: 5px; }
        .btn { width: 100%; padding: 10px; margin-top: 10px; background: #2a2a30; border: 1px solid #3a3a42; color: #efefef; border-radius: 5px; cursor: pointer; transition: 0.3s; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .btn:hover:not(:disabled) { background: #35353d; border-color: #a55eea; color: #fff; }
        .btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .destination-row { display: flex; gap: 8px; align-items: flex-start; }
        .destination-box {
            flex: 1;
            background: #121214;
            padding: 6px;
            border-radius: 4px;
            word-break: break-all;
            max-height: 50px;
            overflow-y: auto;
            color: #a55eea;
            border: 1px solid #2a2a30;
            font-size: 11px;
            min-height: 28px;
        }
        .copy-btn {
            background: #2a2a30;
            border: 1px solid #3a3a42;
            color: #a55eea;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: 0.3s;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            white-space: nowrap;
        }
        .copy-btn:hover {
            background: #35353d;
            border-color: #a55eea;
            color: #fff;
        }
        .status { 
            font-size: 11px; 
            color: #a55eea; 
            margin-top: 12px; 
            text-align: center; 
            font-weight: 600;
            font-style: italic; 
        }
        .progress-bar {
            width: 100%;
            height: 3px;
            background: #2a2a30;
            border-radius: 2px;
            margin-top: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #a55eea, #c084fc);
            border-radius: 2px;
            transition: width 1s linear;
        }
        #settings-panel {
            overflow: hidden;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 0;
            opacity: 0;
        }
        #settings-panel.settings-open {
            max-height: 500px;
            opacity: 1;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const overlay = document.createElement('div');
    overlay.id = 'dark-bypasser-overlay';
    document.body.appendChild(overlay);

    const container = document.createElement('div');
    container.id = 'dark-bypasser-root';
    container.innerHTML = `
        <div class="bypass-content">
            <div class="header-row">
                <div class="title">DARK BYPASSER</div>
                <button id="btn-settings" class="settings-btn" title="Settings">⚙</button>
            </div>
            <button id="btn-bypass" class="btn">Bypass</button>
            <div style="margin-top: 12px; font-size: 11px;">
                <span style="font-weight: 600;">Destination:</span>
                <div class="destination-row" style="margin-top: 4px;">
                    <div id="destination-val" class="destination-box">-</div>
                    <button id="btn-copy-dest" class="copy-btn">Copy</button>
                </div>
            </div>
            <button id="btn-redirect" class="btn" disabled style="margin-top: 10px; display: none;">Redirect Now</button>
            <div id="settings-panel" style="margin-top: 15px; border-top: 1px solid #333; padding-top: 15px;">
                <div class="control-group">
                    <span>Auto Bypass</span>
                    <div id="sw-auto-bypass" class="switch-3d ${state.autoBypass ? 'active' : ''}">
                        <div class="cube">
                            <div class="cube-face front"></div><div class="cube-face back"></div>
                            <div class="cube-face right"></div><div class="cube-face left"></div>
                            <div class="cube-face top"></div><div class="cube-face bottom"></div>
                        </div>
                    </div>
                </div>
                <div class="label-row"><span>Start Wait:</span><span id="start-val">${state.startDelay}s</span></div>
                <input type="range" id="start-range" class="slider" min="0" max="10" value="${state.startDelay}">
                <div style="height:1px; background:#333; margin: 15px 0;"></div>
                <div class="control-group">
                    <span>Auto Redirect</span>
                    <div id="sw-auto-redirect" class="switch-3d ${state.autoRedirect ? 'active' : ''}">
                        <div class="cube">
                            <div class="cube-face front"></div><div class="cube-face back"></div>
                            <div class="cube-face right"></div><div class="cube-face left"></div>
                            <div class="cube-face top"></div><div class="cube-face bottom"></div>
                        </div>
                    </div>
                </div>
                <div class="label-row"><span>Redirect Delay:</span><span id="delay-val">${state.delay}s</span></div>
                <input type="range" id="delay-range" class="slider" min="0" max="30" value="${state.delay}">
            </div>
            <div id="status-text" class="status">Idle</div>
            <div id="progress-container" class="progress-bar" style="display: none;">
                <div id="progress-fill" class="progress-fill" style="width: 100%;"></div>
            </div>
        </div>
        <div class="result-content">
            <div class="result-title">BYPASS RESULT</div>
            <div id="result-text-display" class="result-text"></div>
            <div class="result-btns">
                <button id="btn-result-copy" class="btn" style="margin-top:0;">Copy</button>
                <button id="btn-result-back" class="btn" style="margin-top:0; background:#3d3d45;">Back</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    const notifContainer = document.createElement('div');
    notifContainer.id = 'dark-bypasser-notifications';
    document.body.appendChild(notifContainer);

    function showLog(text, type = 'info') {
        const note = document.createElement('div');
        note.className = `bypass-note ${type}`;
        note.innerText = text;
        notifContainer.appendChild(note);
    }

    function showResultModal(text) {
        const resultTextDisplay = document.getElementById('result-text-display');
        resultTextDisplay.innerText = text;
        
        container.classList.add('result-mode');
        overlay.classList.add('visible');
        
        document.getElementById('btn-result-copy').onclick = () => {
            navigator.clipboard.writeText(text);
            showLog("Copied!", "success");
        };
        
        document.getElementById('btn-result-back').onclick = () => {
            container.classList.remove('result-mode');
            overlay.classList.remove('visible');
        };
        
        overlay.onclick = () => {
            container.classList.remove('result-mode');
            overlay.classList.remove('visible');
        };
    }

    let finalUrl = "";
    let countdownInterval = null;
    const el = {
        swBypass: document.getElementById('sw-auto-bypass'),
        swRedirect: document.getElementById('sw-auto-redirect'),
        btnBypass: document.getElementById('btn-bypass'),
        btnRedirect: document.getElementById('btn-redirect'),
        delayRange: document.getElementById('delay-range'),
        delayText: document.getElementById('delay-val'),
        startRange: document.getElementById('start-range'),
        startText: document.getElementById('start-val'),
        status: document.getElementById('status-text'),
        destination: document.getElementById('destination-val'),
        btnSettings: document.getElementById('btn-settings'),
        settingsPanel: document.getElementById('settings-panel'),
        btnCopyDest: document.getElementById('btn-copy-dest'),
        progressContainer: document.getElementById('progress-container'),
        progressFill: document.getElementById('progress-fill')
    };

    const save = () => {
        GM_setValue('autoBypass', state.autoBypass);
        GM_setValue('autoRedirect', state.autoRedirect);
        GM_setValue('delay', state.delay);
        GM_setValue('startDelay', state.startDelay);
    };

    el.swBypass.onclick = () => { state.autoBypass = el.swBypass.classList.toggle('active'); save(); };
    el.swRedirect.onclick = () => { state.autoRedirect = el.swRedirect.classList.toggle('active'); save(); };
    el.delayRange.oninput = (e) => { state.delay = parseInt(e.target.value); el.delayText.innerText = state.delay + 's'; save(); };
    el.startRange.oninput = (e) => { state.startDelay = parseInt(e.target.value); el.startText.innerText = state.startDelay + 's'; save(); };
    el.btnSettings.onclick = () => {
        const isOpen = el.settingsPanel.classList.contains('settings-open');
        if (isOpen) {
            el.settingsPanel.classList.remove('settings-open');
            setTimeout(() => { el.settingsPanel.style.display = 'none'; }, 350);
        } else {
            el.settingsPanel.style.display = 'block';
            setTimeout(() => el.settingsPanel.classList.add('settings-open'), 10);
        }
    };
    el.btnCopyDest.onclick = () => {
        const destText = el.destination.innerText;
        if (destText && destText !== '-') {
            navigator.clipboard.writeText(destText);
            showLog("Destination copied!", "success");
        }
    };

    function handleSuccess(result) {
        el.destination.innerText = result;
        const isLink = /^https?:\/\/\S+/i.test(result);
        if (isLink) {
            showLog("Bypass success!", "success");
            finalUrl = result;
            el.status.innerText = "Redirecting...";
            el.btnRedirect.disabled = false;
            el.btnRedirect.style.display = 'block';
            el.progressContainer.style.display = 'block';
            el.progressFill.style.width = '100%';
            
            if (state.autoRedirect) {
                let timeLeft = state.delay;
                const totalTime = state.delay;
                countdownInterval = setInterval(() => {
                    if (timeLeft <= 0) { 
                        clearInterval(countdownInterval); 
                        el.progressContainer.style.display = 'none';
                        window.location.href = finalUrl; 
                    }
                    el.status.innerText = `Redirecting in ${timeLeft}s...`;
                    const progress = ((totalTime - timeLeft) / totalTime) * 100;
                    el.progressFill.style.width = `${progress}%`;
                    timeLeft--;
                }, 1000);
            }
        } else {
            showLog("Bypass complete!", "success");
            el.status.innerText = "Done";
            el.btnBypass.disabled = false;
            el.btnRedirect.style.display = 'none';
            el.progressContainer.style.display = 'none';
            showResultModal(result);
        }
    }

    function handleError(msg) {
        const errorMsg = msg || "API Error";
        el.status.innerText = errorMsg;
        el.destination.innerText = "Error";
        showLog(`Bypass failed: ${errorMsg}`, "error");
        el.btnBypass.disabled = false;
    }

    function bypassScriptPastebinSimple() {
        const currentUrl = window.location.href;
        
        if (isUrlAlreadyBypassed(currentUrl)) {
            el.status.innerText = "Already bypassed";
            showLog("URL already bypassed!", "info");
            removeUrlFromBypassed(currentUrl);
            return;
        }
        
        markUrlAsBypassed(currentUrl);
        
        const targetUrl = currentUrl.endsWith('/') ? currentUrl + '?r=1' : currentUrl + '/?r=1';
        el.status.innerText = "Bypassing...";
        el.progressContainer.style.display = 'block';
        el.progressFill.style.width = '100%';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            el.progressFill.style.width = `${100 - progress}%`;
            if (progress >= 100) {
                clearInterval(progressInterval);
                showLog("Redirecting...", "success");
                window.location.href = targetUrl;
            }
        }, 100);
    }

    function removeUrlFromBypassed(url) {
        const basePath = getBasePath(url);
        state.bypassedUrls = state.bypassedUrls.filter(savedUrl => {
            const savedBasePath = getBasePath(savedUrl);
            return savedBasePath !== basePath;
        });
        GM_setValue('bypassedUrls', state.bypassedUrls);
    }

    function bypassInternal(url) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://darkk-bypass.vercel.app/resolve?url=${encodeURIComponent(url)}`,
            onload: function(res) {
                try {
                    const data = JSON.parse(res.responseText);
                    if (data.result) handleSuccess(data.result);
                    else bypassVulkan(url);
                } catch(e) { bypassVulkan(url); }
            },
            onerror: function() { bypassVulkan(url); }
        });
    }

    function bypassVulkan(url) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `http://fi10.bot-hosting.net:21375/resolve?url=${encodeURIComponent(url)}`,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ url: url }),
            onload: function(res) {
                try {
                    const data = JSON.parse(res.responseText);
                    const resUrl = data.result || data.key || data.link;
                    if (data.status === "success" && resUrl && resUrl !== "KEY_NOT_FOUND") {
                        handleSuccess(resUrl);
                    } else {
                        bypassUnknown(url);
                    }
                } catch(e) { bypassUnknown(url); }
            },
            onerror: function() { bypassUnknown(url); }
        });
    }

    function bypassUnknown(url) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://unknown-api-one.vercel.app/api/free/bypass?url=${encodeURIComponent(url)}`,
            onload: function(res) {
                try {
                    const data = JSON.parse(res.responseText);
                    const success = data.success;
                    const isSuccess = (success === true || (typeof success === 'string' && success.toLowerCase() === 'true'));
                    if (isSuccess && data.result) handleSuccess(data.result);
                    else handleError("Bypass Failed");
                } catch(e) { handleError("Parse Error"); }
            },
            onerror: function() { handleError("Network Error"); }
        });
    }

    function runBypass() {
        el.status.innerText = "Bypassing...";
        el.btnBypass.disabled = true;
        el.btnRedirect.style.display = 'none';
        el.progressContainer.style.display = 'none';
        showLog("Bypass started...", "info");
        const currentUrl = window.location.href;
        
        if (currentUrl.includes('scriptpastebins.com')) {
            bypassScriptPastebinSimple();
            return;
        }
        
        const myDomains = ["scriptpastebin.com", "link2unlock.com"];
        if (myDomains.some(d => currentUrl.toLowerCase().includes(d))) {
            bypassInternal(currentUrl);
        } else {
            bypassVulkan(currentUrl);
        }
    }

    el.btnBypass.onclick = runBypass;
    el.btnRedirect.onclick = () => { if(finalUrl) window.location.href = finalUrl; };

    if (state.autoBypass) {
        const currentUrl = window.location.href;
        
        if (currentUrl.includes('scriptpastebins.com')) {
            bypassScriptPastebinSimple();
        } else {
            let wait = state.startDelay;
            el.status.innerText = "Bypassing...";
            el.progressContainer.style.display = 'block';
            el.progressFill.style.width = '100%';
            const startTimer = setInterval(() => {
                if (wait <= 0) { 
                    clearInterval(startTimer); 
                    runBypass(); 
                }
                el.status.innerText = `Starting in ${wait}s...`;
                const progress = ((state.startDelay - wait) / state.startDelay) * 100;
                el.progressFill.style.width = `${progress}%`;
                wait--;
            }, 1000);
        }
    }
})();