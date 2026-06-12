// ==UserScript==
// @name         Dark Bypasser
// @namespace    http://tampermonkey.net/
// @version      3.8
// @author       Darknifus
// @match        *://https://linkvertise.com/*
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
// @match        *://panel.orihost.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      darkk-bypass.vercel.app
// @connect      fi10.bot-hosting.net
// @connect      unknown-api-one.vercel.app
// @connect      userscript-status.vercel.app
// @updateURL    https://github.com/Darknife339/Dark-bypasser-userscript/raw/refs/heads/main/dark-bypasser.user.js
// @downloadURL  https://github.com/Darknife339/Dark-bypasser-userscript/raw/refs/heads/main/dark-bypasser.user.js
// ==/UserScript==

(function() {
    'use strict';

    const state = {
        autoBypass: GM_getValue('autoBypass', true),
        autoRedirect: GM_getValue('autoRedirect', true),
        delay: GM_getValue('delay', 30),
        startDelay: GM_getValue('startDelay', 2),
        bypassedUrls: GM_getValue('bypassedUrls', []),
        orihostActive: GM_getValue('orihost_active', false),
        savedServerUrl: GM_getValue('saved_server_url', ''),
        orihostFirstRun: GM_getValue('orihost_first_run', false)
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
            position: fixed; top: 25px; right: 25px; width: 280px;
            background: #1e1e22; border: 1px solid #333; border-radius: 10px;
            padding: 18px; color: #d1d1d1; font-family: 'Segoe UI', sans-serif;
            z-index: 100000; box-shadow: 0 12px 40px rgba(0,0,0,0.6); user-select: none;
            transition: all 0.3s ease;
            min-height: 200px;
        }
        #dark-bypasser-root.minimized {
            width: 40px !important;
            height: 40px !important;
            padding: 0 !important;
            min-height: auto !important;
        }
        #dark-bypasser-root.minimized .bypass-content,
        #dark-bypasser-root.minimized .result-content {
            display: none !important;
        }
        #dark-bypasser-root.minimized .expand-btn {
            display: block !important;
        }
        #dark-bypasser-root .expand-btn {
            display: none;
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
            position: fixed; top: 25px; right: 315px; width: 220px;
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
        .minimize-btn {
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
            margin-right: 8px;
        }
        .minimize-btn:hover {
            background: #35353d;
            border-color: #a55eea;
            color: #fff;
        }
        .expand-btn {
            position: fixed;
            top: 25px;
            right: 25px;
            width: 40px;
            height: 40px;
            background: #1e1e22;
            border: 1px solid #333;
            border-radius: 10px;
            color: #a55eea;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            z-index: 100000;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 40px rgba(0,0,0,0.6);
            transition: 0.3s;
        }
        .expand-btn:hover {
            background: #2a2a30;
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
        .discord-link {
            font-size: 10px;
            color: #7289da;
            text-align: center;
            margin-top: 8px;
            cursor: pointer;
            text-decoration: underline;
            transition: 0.2s;
        }
        .discord-link:hover {
            color: #99aab5;
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
        .orihost-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #333;
        }
        .orihost-title {
            font-weight: 700;
            font-size: 12px;
            color: #3b82f6;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .orihost-url-box {
            background: #121214;
            border: 1px solid #2a2a30;
            border-radius: 4px;
            padding: 6px;
            font-size: 10px;
            color: #64748b;
            word-break: break-all;
            margin-bottom: 8px;
            min-height: 24px;
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
    
    const currentHost = window.location.hostname;
    const isOrihostHost = currentHost === 'panel.orihost.com';
    
    const bypassDisplay = isOrihostHost ? 'none' : 'block';
    const orihostDisplay = isOrihostHost ? 'block' : 'none';
    
    container.innerHTML = `
        <div class="bypass-content">
            <div class="header-row">
                <div class="title">DARK BYPASSER${isOrihostHost ? ' - Orihost' : ''}</div>
                <div style="display: flex; gap: 8px;">
                    <button id="btn-minimize" class="minimize-btn" title="Minimize">−</button>
                    <button id="btn-settings" class="settings-btn" title="Settings" style="display: ${isOrihostHost ? 'none' : 'flex'};">⚙</button>
                </div>
            </div>
            <button id="btn-bypass" class="btn" style="display: ${bypassDisplay};">Bypass</button>
            <div style="margin-top: 12px; font-size: 11px; display: ${bypassDisplay};">
                <span style="font-weight: 600;">Destination:</span>
                <div class="destination-row" style="margin-top: 4px;">
                    <div id="destination-val" class="destination-box">-</div>
                    <button id="btn-copy-dest" class="copy-btn">Copy</button>
                </div>
            </div>
            <button id="btn-redirect" class="btn" disabled style="margin-top: 10px; display: none;">Redirect Now</button>
            <div id="settings-panel" style="display: ${bypassDisplay}; margin-top: 15px; border-top: 1px solid #333; padding-top: 15px;">
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
            <div class="orihost-section" style="display: ${orihostDisplay};">
                <div class="orihost-title">Orihost Automation</div>
                <button id="btn-save-url" class="btn" style="margin-top:0; background:#3b82f6; border-color:#2563eb;">Use This Link</button>
                <div id="orihost-url-preview" class="orihost-url-box" style="margin-top:8px;">No link saved</div>
                <div class="control-group" style="margin-top:10px; margin-bottom:0;">
                    <span style="font-size:11px;">Automation Active</span>
                    <div id="sw-orihost-active" class="switch-3d ${state.orihostActive ? 'active' : ''}">
                        <div class="cube">
                            <div class="cube-face front"></div><div class="cube-face back"></div>
                            <div class="cube-face right"></div><div class="cube-face left"></div>
                            <div class="cube-face top"></div><div class="cube-face bottom"></div>
                        </div>
                    </div>
                </div>
                <div id="progress-container-orihost" class="progress-bar" style="display: none; margin-top:10px;">
                    <div id="progress-fill-orihost" class="progress-fill" style="width: 100%;"></div>
                </div>
                <div id="discord-link-orihost" class="discord-link" style="margin-top:8px;">Discord server</div>
            </div>
            <div id="status-text" class="status" style="display: ${bypassDisplay};">Idle</div>
            <div id="progress-container" class="progress-bar" style="display: none;">
                <div id="progress-fill" class="progress-fill" style="width: 100%;"></div>
            </div>
            <div id="discord-link" class="discord-link" style="display: ${bypassDisplay}; margin-top:8px;">Discord server</div>
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

    const expandBtn = document.createElement('button');
    expandBtn.id = 'dark-bypasser-expand';
    expandBtn.className = 'expand-btn';
    expandBtn.innerText = '+';
    document.body.appendChild(expandBtn);

    const notifContainer = document.createElement('div');
    notifContainer.id = 'dark-bypasser-notifications';
    document.body.appendChild(notifContainer);

    function showLog(text, type = 'info') {
        const note = document.createElement('div');
        note.className = `bypass-note ${type}`;
        note.innerText = text;
        notifContainer.appendChild(note);
    }

    function sendBypassLog(status, destination = null) {
        const logData = {
            url: window.location.href,
            status: status
        };
        
        if (destination) {
            logData.destination = destination;
        }
        
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://userscript-status.vercel.app/api/log",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(logData),
            onload: function(response) {
                console.log("Log sent successfully:", response.responseText);
            },
            onerror: function(error) {
                console.error("Failed to send log:", error);
            }
        });
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
    let orihostCooldownInterval = null;
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
        progressFill: document.getElementById('progress-fill'),
        btnSaveUrl: document.getElementById('btn-save-url'),
        orihostUrlPreview: document.getElementById('orihost-url-preview'),
        swOrihostActive: document.getElementById('sw-orihost-active'),
        btnMinimize: document.getElementById('btn-minimize'),
        discordLink: document.getElementById('discord-link'),
        discordLinkOrihost: document.getElementById('discord-link-orihost'),
        progressContainerOrihost: document.getElementById('progress-container-orihost'),
        progressFillOrihost: document.getElementById('progress-fill-orihost')
    };

    const save = () => {
        GM_setValue('autoBypass', state.autoBypass);
        GM_setValue('autoRedirect', state.autoRedirect);
        GM_setValue('delay', state.delay);
        GM_setValue('startDelay', state.startDelay);
        GM_setValue('orihost_active', state.orihostActive);
        GM_setValue('saved_server_url', state.savedServerUrl);
        GM_setValue('orihost_first_run', state.orihostFirstRun);
    };

    if (el.swBypass) {
        el.swBypass.onclick = () => { state.autoBypass = el.swBypass.classList.toggle('active'); save(); };
    }
    if (el.swRedirect) {
        el.swRedirect.onclick = () => { state.autoRedirect = el.swRedirect.classList.toggle('active'); save(); };
    }
    if (el.delayRange) {
        el.delayRange.oninput = (e) => { state.delay = parseInt(e.target.value); el.delayText.innerText = state.delay + 's'; save(); };
    }
    if (el.startRange) {
        el.startRange.oninput = (e) => { state.startDelay = parseInt(e.target.value); el.startText.innerText = state.startDelay + 's'; save(); };
    }
    
    if (el.swOrihostActive) {
        el.swOrihostActive.onclick = () => {
            const wasActive = state.orihostActive;
            state.orihostActive = el.swOrihostActive.classList.toggle('active');
            
            if (!wasActive && state.orihostActive) {
                state.orihostFirstRun = true;
                showLog("Orihost automation enabled", "success");
                runOrihostLogic();
            } else if (wasActive && !state.orihostActive) {
                state.orihostFirstRun = true;
                showLog("Orihost automation disabled", "info");
                if (orihostCooldownInterval) clearInterval(orihostCooldownInterval);
            }
            
            save();
        };
    }

    if (el.btnSaveUrl) {
        el.btnSaveUrl.onclick = () => {
            const currentUrl = window.location.href;
            if (currentUrl.includes('/server/')) {
                state.savedServerUrl = currentUrl;
                save();
                updateOrihostPreview();
                showLog("Server link saved!", "success");
            } else {
                showLog("Navigate to a server page first (/server/)", "error");
            }
        };
    }

    function updateOrihostPreview() {
        if (el.orihostUrlPreview) {
            if (state.savedServerUrl) {
                const shortened = state.savedServerUrl.replace('https://panel.orihost.com', '');
                el.orihostUrlPreview.textContent = `Target: ${shortened}`;
                el.orihostUrlPreview.style.color = '#3b82f6';
            } else {
                el.orihostUrlPreview.textContent = 'No link saved';
                el.orihostUrlPreview.style.color = '#64748b';
            }
        }
    }

    if (el.btnSettings) {
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
    }
    
    if (el.btnCopyDest) {
        el.btnCopyDest.onclick = () => {
            const destText = el.destination.innerText;
            if (destText && destText !== '-') {
                navigator.clipboard.writeText(destText);
                showLog("Destination copied!", "success");
            }
        };
    }

    setTimeout(() => {
        updateOrihostPreview();
    }, 100);

    let isMinimized = false;
    if (el.btnMinimize) {
        el.btnMinimize.onclick = () => {
            isMinimized = !isMinimized;
            if (isMinimized) {
                container.classList.add('minimized');
                expandBtn.style.display = 'flex';
            } else {
                container.classList.remove('minimized');
                expandBtn.style.display = 'none';
            }
        };
    }
    
    expandBtn.onclick = () => {
        isMinimized = false;
        container.classList.remove('minimized');
        expandBtn.style.display = 'none';
    };

    if (el.discordLink) {
        el.discordLink.onclick = () => {
            window.open('https://discord.gg/4nZxAVTGj', '_blank');
        };
    }

    if (el.discordLinkOrihost) {
        el.discordLinkOrihost.onclick = () => {
            window.open('https://discord.gg/4nZxAVTGj', '_blank');
        };
    }

    function handleSuccess(result) {
        if (el.destination) el.destination.innerText = result;
        const isLink = /^https?:\/\/\S+/i.test(result);
        if (isLink) {
            if (isOrihostPanel(result)) {
                showLog("Orihost panel detected - instant redirect!", "success");
                if (el.status) el.status.innerText = "Instant redirect...";
                sendBypassLog("success", result);
                window.location.href = result;
                return;
            }
            
            showLog("Bypass success!", "success");
            finalUrl = result;
            sendBypassLog("success", result);
            if (el.status) el.status.innerText = "Redirecting...";
            if (el.btnRedirect) el.btnRedirect.disabled = false;
            if (el.btnRedirect) el.btnRedirect.style.display = 'block';
            if (el.progressContainer) el.progressContainer.style.display = 'block';
            if (el.progressFill) el.progressFill.style.width = '100%';
            
            if (state.autoRedirect) {
                let timeLeft = state.delay;
                const totalTime = state.delay;
                countdownInterval = setInterval(() => {
                    if (timeLeft <= 0) { 
                        clearInterval(countdownInterval); 
                        if (el.progressContainer) el.progressContainer.style.display = 'none';
                        window.location.href = finalUrl; 
                    }
                    if (el.status) el.status.innerText = `Redirecting in ${timeLeft}s...`;
                    const progress = ((totalTime - timeLeft) / totalTime) * 100;
                    if (el.progressFill) el.progressFill.style.width = `${progress}%`;
                    timeLeft--;
                }, 1000);
            }
        } else {
            showLog("Bypass complete!", "success");
            if (el.status) el.status.innerText = "Done";
            if (el.btnBypass) el.btnBypass.disabled = false;
            if (el.btnRedirect) el.btnRedirect.style.display = 'none';
            if (el.progressContainer) el.progressContainer.style.display = 'none';
            showResultModal(result);
        }
    }

    function handleError(msg) {
        const errorMsg = msg || "API Error";
        if (el.status) el.status.innerText = errorMsg;
        if (el.destination) el.destination.innerText = "Error";
        showLog(`Bypass failed: ${errorMsg}`, "error");
        if (el.btnBypass) el.btnBypass.disabled = false;
        sendBypassLog("failed");
    }

    function isOrihostPanel(url) {
        return url.includes('panel.orihost.com') && url.includes('?hash=');
    }

    function isLuarmorResult(result) {
        return result.startsWith('https://ads.luarmor.net/');
    }

    function findButtonByText(text) {
        return Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim().includes(text));
    }

    function processOrihostButtons() {
        if (!state.orihostActive) return;

        const limitBtn = findButtonByText('Renew Limit Reached');
        if (limitBtn) {
            showLog("Renew limit reached! Everything is ready.", "success");
            state.orihostActive = false;
            state.orihostFirstRun = true;
            el.swOrihostActive.classList.remove('active');
            save();
            return;
        }

        const renewBtn = findButtonByText('Renew');
        if (renewBtn && !renewBtn.disabled) {
            renewBtn.click();
            showLog("Clicked Renew", "info");
            
            const checkLinkvertiseInterval = setInterval(() => {
                if (!state.orihostActive) {
                    clearInterval(checkLinkvertiseInterval);
                    return;
                }
                const linkvertiseBtn = findButtonByText('Open Linkvertise');
                if (linkvertiseBtn) {
                    clearInterval(checkLinkvertiseInterval);
                    linkvertiseBtn.click();
                    showLog("Clicked Open Linkvertise", "info");
                    state.orihostFirstRun = false;
                    save();
                }
            }, 1000);
            return;
        }

        const directLinkvertiseBtn = findButtonByText('Open Linkvertise');
        if (directLinkvertiseBtn) {
            directLinkvertiseBtn.click();
            showLog("Clicked Open Linkvertise", "info");
            state.orihostFirstRun = false;
            save();
        }
    }

    function runOrihostLogic() {
        if (!state.orihostActive) return;

        const currentPath = window.location.pathname;

        if (currentPath === '/' || currentPath === '') {
            if (state.savedServerUrl) {
                showLog("Redirecting to saved server...", "info");
                window.location.href = state.savedServerUrl;
            } else {
                showLog("No server URL saved", "error");
            }
            return;
        }

        if (currentPath.includes('/server/')) {
            if (state.orihostFirstRun) {
                state.orihostFirstRun = false;
                showLog("First run - processing immediately", "info");
                processOrihostButtons();
            } else {
                let cooldown = 20;
                showLog("Orihost cooldown: 20s", "info");
                
                orihostCooldownInterval = setInterval(() => {
                    if (!state.orihostActive) {
                        clearInterval(orihostCooldownInterval);
                        return;
                    }
                    cooldown--;

                    if (cooldown < 0) {
                        clearInterval(orihostCooldownInterval);
                        processOrihostButtons();
                    }
                }, 1000);
            }
        }
    }

    function initOrihostAutomation() {
        const currentHost = window.location.hostname;
        if (currentHost === 'panel.orihost.com') {
            showLog("Orihost panel detected", "info");
            setTimeout(() => {
                runOrihostLogic();
            }, 2000);
        }
    }

    function bypassScriptPastebinSimple() {
        const currentUrl = window.location.href;
        
        if (isUrlAlreadyBypassed(currentUrl)) {
            if (el.status) el.status.innerText = "Already bypassed";
            showLog("URL already bypassed!", "info");
            removeUrlFromBypassed(currentUrl);
            return;
        }
        
        markUrlAsBypassed(currentUrl);
        
        const targetUrl = currentUrl.endsWith('/') ? currentUrl + '?r=1' : currentUrl + '/?r=1';
        if (el.status) el.status.innerText = "Bypassing...";
        if (el.progressContainer) el.progressContainer.style.display = 'block';
        if (el.progressFill) el.progressFill.style.width = '100%';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (el.progressFill) el.progressFill.style.width = `${100 - progress}%`;
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
                    const resUrl = data.result || data.key || data.link || data.url;
                    if (resUrl && resUrl !== "KEY_NOT_FOUND") {
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
                    const resUrl = data.result;
                    if (data.success && resUrl) {
                        if (window.location.hostname.includes('linkvertise.com') && isLuarmorResult(resUrl)) {
                            const safeRedirectUrl = `https://safety-redirect.vercel.app/?luarmor=${encodeURIComponent(resUrl)}`;
                            showLog("Redirecting via safety proxy...", "success");
                            sendBypassLog("success", resUrl);
                            window.location.href = safeRedirectUrl;
                        } else {
                            handleSuccess(resUrl);
                        }
                    } else {
                        handleError("Bypass Failed");
                    }
                } catch(e) { handleError("Parse Error"); }
            },
            onerror: function() { handleError("Network Error"); }
        });
    }

    function runBypass() {
        if (el.status) el.status.innerText = "Bypassing...";
        if (el.btnBypass) el.btnBypass.disabled = true;
        if (el.btnRedirect) el.btnRedirect.style.display = 'none';
        if (el.progressContainer) el.progressContainer.style.display = 'none';
        showLog("Bypass started...", "info");
        const currentUrl = window.location.href;
        const currentHost = window.location.hostname;
        
        if (currentUrl.includes('scriptpastebins.com')) {
            bypassScriptPastebinSimple();
            return;
        }
        
        const internalDomains = ["link2unlock.com", "sub2get.com"];
        if (internalDomains.some(d => currentHost.includes(d))) {
            bypassInternal(currentUrl);
        } else {
            bypassVulkan(currentUrl);
        }
    }

    if (el.btnBypass) el.btnBypass.onclick = runBypass;
    if (el.btnRedirect) el.btnRedirect.onclick = () => { if(finalUrl) window.location.href = finalUrl; };

    const checkHost = window.location.hostname;
    if (state.autoBypass && checkHost !== 'panel.orihost.com') {
        const currentUrl = window.location.href;
        
        if (currentUrl.includes('scriptpastebins.com')) {
            bypassScriptPastebinSimple();
        } else {
            let wait = state.startDelay;
            if (el.status) el.status.innerText = "Bypassing...";
            if (el.progressContainer) el.progressContainer.style.display = 'block';
            if (el.progressFill) el.progressFill.style.width = '100%';
            const startTimer = setInterval(() => {
                if (wait <= 0) { 
                    clearInterval(startTimer); 
                    
                    const internalDomains = ["link2unlock.com", "sub2get.com"];
                    if (internalDomains.some(d => checkHost.includes(d))) {
                        bypassInternal(currentUrl);
                    } else {
                        bypassVulkan(currentUrl);
                    }
                }
                if (el.status) el.status.innerText = `Starting in ${wait}s...`;
                const progress = ((state.startDelay - wait) / state.startDelay) * 100;
                if (el.progressFill) el.progressFill.style.width = `${progress}%`;
                wait--;
            }, 1000);
        }
    }

    initOrihostAutomation();
})();
