import * as THREE from 'three';
import { InteractiveGlobe } from './globe.js';
import { QuantumState } from './quantum.js';

const globe = new InteractiveGlobe('globe-container');

let task1State = new QuantumState(0, 0);
let task2State = new QuantumState(0, 0);
let activeState = task1State;

let targets = window.SERVER_TARGETS || [];
let activeTarget = targets[0] || { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 };
let circuitTarget = { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 };

// --- BLOCH SPHERE HUD SETUP ---
const blochContainer = document.getElementById('bloch-container');
const bScene = new THREE.Scene();
const bCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const bRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
bRenderer.setSize(blochContainer.clientWidth, blochContainer.clientHeight);
blochContainer.appendChild(bRenderer.domElement);
bCamera.position.z = 2.8;

const bSphereGeo = new THREE.SphereGeometry(1, 24, 24);
const bWireMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.25 });
bScene.add(new THREE.Mesh(bSphereGeo, bWireMat));

const arrowDir = new THREE.Vector3(0, 1, 0);
const arrowOrigin = new THREE.Vector3(0, 0, 0);
const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, 1, 0xf43f5e, 0.2, 0.15);
bScene.add(arrowHelper);

// Inject Dual Probability Graph (|0> and |1>) & Phase Meters
const hudWrapper = document.querySelector('.absolute.bottom-6.right-6');
hudWrapper.insertAdjacentHTML('beforeend', `
    <div class="mt-3 w-48 border-t border-slate-700/60 pt-3">
        <span class="text-[10px] text-cyan-400 font-semibold mb-1 tracking-wider block">STATE PROBABILITIES</span>
        <div class="space-y-1 text-[10px]">
            <div class="flex justify-between text-slate-300"><span>|0⟩:</span><span id="prob-0-val">1.00</span></div>
            <div class="h-2 w-full relative bg-slate-950 rounded overflow-hidden border border-slate-800">
                <div id="prob-bar-0" class="absolute left-0 bottom-0 top-0 bg-cyan-400 transition-all duration-150" style="width: 100%;"></div>
            </div>
            <div class="flex justify-between text-slate-300 pt-1"><span>|1⟩:</span><span id="prob-1-val">0.00</span></div>
            <div class="h-2 w-full relative bg-slate-950 rounded overflow-hidden border border-slate-800">
                <div id="prob-bar-1" class="absolute left-0 bottom-0 top-0 bg-fuchsia-400 transition-all duration-150" style="width: 0%;"></div>
            </div>
        </div>
    </div>
    <div class="mt-3 w-48 border-t border-slate-700/60 pt-3">
        <span class="text-[10px] text-fuchsia-400 font-semibold mb-1 tracking-wider block">RELATIVE PHASE (φ)</span>
        <div class="w-full text-center py-1 rounded bg-slate-950 border border-slate-800">
            <span id="val-phase-phi" class="text-sm font-black text-fuchsia-300">0.00</span><span class="text-[10px] text-slate-500 ml-1">rad</span>
        </div>
    </div>
`);

function updateExtendedHUD(state) {
    const x = Math.sin(state.theta) * Math.cos(state.phi);
    const z = Math.sin(state.theta) * Math.sin(state.phi);
    const y = Math.cos(state.theta);

    arrowHelper.setDirection(new THREE.Vector3(x, y, z).normalize());
    
    const thetaInPi = (state.theta / Math.PI).toFixed(2);
    const phiInPi = (state.phi / Math.PI).toFixed(2);

    document.getElementById('val-theta').innerText = thetaInPi + 'π';
    document.getElementById('val-phi').innerText = phiInPi + 'π';
    document.getElementById('val-phase-phi').innerText = phiInPi;

    const p0 = Math.pow(Math.cos(state.theta / 2), 2);
    const p1 = Math.pow(Math.sin(state.theta / 2), 2);

    document.getElementById('prob-0-val').innerText = p0.toFixed(2);
    document.getElementById('prob-bar-0').style.width = (p0 * 100) + '%';

    document.getElementById('prob-1-val').innerText = p1.toFixed(2);
    document.getElementById('prob-bar-1').style.width = (p1 * 100) + '%';
}

function animateBloch() {
    requestAnimationFrame(animateBloch);
    bRenderer.render(bScene, bCamera);
}
animateBloch();

const panelContent = document.getElementById('panel-content');
const tabGame = document.getElementById('tab-game');
const tabCircuit = document.getElementById('tab-circuit');
const tabTour = document.getElementById('tab-tour');

function setActiveTab(activeBtn) {
    [tabGame, tabCircuit, tabTour].forEach(btn => {
        btn.className = "px-4 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded transition hover:bg-slate-700";
    });
    activeBtn.className = "px-4 py-1.5 text-sm bg-cyan-500/20 border border-cyan-500 text-cyan-300 rounded transition hover:bg-cyan-500/35";
}

// TASK 1: Gate Tuning with 0.5 and 0.1 Tunability Controls
function renderTask1() {
    setActiveTab(tabGame);
    activeState = task1State;
    globe.setTargetMarker(activeTarget.lat, activeTarget.lon);
    updateExtendedHUD(activeState);

    panelContent.innerHTML = `
        <div class="space-y-4">
            <div>
                <span class="text-xs text-cyan-400 uppercase tracking-wider font-semibold">TASK 1</span>
                <h2 class="text-xl font-bold text-slate-100">Quantum Gate Globe Tuning</h2>
                <p class="text-xs text-slate-300 mt-1">Apply Ry($\\theta$) and Rz($\\phi$) quantum gates (with 0.5 and 0.1 precision steps) to match the target.</p>
            </div>
            
            <div class="space-y-2">
                <label class="text-xs text-slate-400">Search Target Destination:</label>
                <div class="flex space-x-2">
                    <input id="search-destination" type="text" placeholder="Enter city..." class="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-cyan-300 outline-none" value="${activeTarget.name}">
                    <button id="btn-maps-search" class="px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-xs rounded hover:bg-cyan-500/30">Search</button>
                </div>
            </div>

            <div id="superposed-banner" class="hidden bg-emerald-500/20 border border-emerald-500 p-2.5 rounded text-center animate-pulse">
                <span class="text-emerald-300 font-black text-xs tracking-widest">✨ SUPERPOSED! EXACT TARGET MATCH ✨</span>
            </div>

            <!-- Gate Controls with 0.5 & 0.1 tunability -->
            <div class="bg-slate-950/60 p-3 rounded border border-slate-800 space-y-3">
                <div class="text-xs text-cyan-400 font-bold">// GATE OPERATORS</div>
                
                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-300 font-mono">Ry ($\theta$):</span>
                    <div class="flex space-x-1">
                        <button id="ry-sub5" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded">-0.5</button>
                        <button id="ry-sub" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded">-0.1</button>
                        <button id="ry-add" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded">+0.1</button>
                        <button id="ry-add5" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded">+0.5</button>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-300 font-mono">Rz ($\phi$):</span>
                    <div class="flex space-x-1">
                        <button id="rz-sub5" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-xs rounded">-0.5</button>
                        <button id="rz-sub" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-xs rounded">-0.1</button>
                        <button id="rz-add" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-xs rounded">+0.1</button>
                        <button id="rz-add5" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-xs rounded">+0.5</button>
                    </div>
                </div>
            </div>

            <button id="btn-reset-state" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition">Reset Qubit (|0⟩)</button>
        </div>
    `;

    document.getElementById('ry-sub5').onclick = () => { activeState.theta = Math.max(0, activeState.theta - 0.5); updateExtendedHUD(activeState); checkMatch(); };
    document.getElementById('ry-sub').onclick = () => { activeState.theta = Math.max(0, activeState.theta - 0.1); updateExtendedHUD(activeState); checkMatch(); };
    document.getElementById('ry-add').onclick = () => { activeState.theta = Math.min(Math.PI, activeState.theta + 0.1); updateExtendedHUD(activeState); checkMatch(); };
    document.getElementById('ry-add5').onclick = () => { activeState.theta = Math.min(Math.PI, activeState.theta + 0.5); updateExtendedHUD(activeState); checkMatch(); };

    document.getElementById('rz-sub5').onclick = () => { activeState.phi = (activeState.phi - 0.5 + Math.PI * 2) % (Math.PI * 2); updateExtendedHUD(activeState); checkMatch(); };
    document.getElementById('rz-sub').onclick = () => { activeState.phi = (activeState.phi - 0.1 + Math.PI * 2) % (Math.PI * 2); updateExtendedHUD(activeState); checkMatch(); };
    document.getElementById('rz-add').onclick = () => { activeState.phi = (activeState.phi + 0.1) % (Math.PI * 2); updateExtendedHUD(activeState); checkMatch(); };
    document.getElementById('rz-add5').onclick = () => { activeState.phi = (activeState.phi + 0.5) % (Math.PI * 2); updateExtendedHUD(activeState); checkMatch(); };

    document.getElementById('btn-reset-state').onclick = () => { activeState.theta = 0; activeState.phi = 0; updateExtendedHUD(activeState); checkMatch(); };

    function checkMatch() {
        const targetTheta = (90 - activeTarget.lat) * (Math.PI / 180);
        const targetPhi = (activeTarget.lon + 180) * (Math.PI / 180);
        const matchBanner = document.getElementById('superposed-banner');
        if (matchBanner) {
            if (Math.abs(activeState.theta - targetTheta) < 0.1 && Math.abs(activeState.phi - targetPhi) < 0.1) {
                matchBanner.classList.remove('hidden');
            } else {
                matchBanner.classList.add('hidden');
            }
        }
    }

    document.getElementById('btn-maps-search').onclick = async () => {
        const query = document.getElementById('search-destination').value;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                activeTarget = {
                    name: data[0].display_name,
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
                globe.setTargetMarker(activeTarget.lat, activeTarget.lon);
                checkMatch();
            }
        } catch (e) {
            console.error(e);
        }
    };
    checkMatch();
}

// TASK 2: State to Circuit
function renderTask2() {
    setActiveTab(tabCircuit);
    activeState = task2State;
    updateExtendedHUD(activeState);

    panelContent.innerHTML = `
        <div class="space-y-4">
            <div>
                <span class="text-xs text-cyan-400 uppercase tracking-wider font-semibold">TASK 2</span>
                <h2 class="text-xl font-bold text-slate-100">Location to Circuit</h2>
                <p class="text-xs text-slate-300 mt-1">Search any world location to generate its quantum circuit.</p>
            </div>
            
            <div class="space-y-2">
                <label class="text-xs text-slate-400">Search Destination:</label>
                <div class="flex space-x-2">
                    <input id="search-circuit-dest" type="text" placeholder="Enter place..." class="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-cyan-300 outline-none" value="${circuitTarget.name}">
                    <button id="btn-circuit-maps" class="px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-xs rounded hover:bg-cyan-500/30">Find</button>
                </div>
            </div>

            <div id="circuit-box" class="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                Loading circuit...
            </div>
        </div>
    `;

    const circuitBox = document.getElementById('circuit-box');

    const fetchCircuit = async (lat, lon) => {
        activeState = QuantumState.fromLatLon(lat, lon);
        task2State = activeState;
        updateExtendedHUD(activeState);
        globe.setTargetMarker(lat, lon);

        try {
            const res = await fetch('/api/compute-circuit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: lat, lon: lon })
            });
            const data = await res.json();
            
            circuitBox.innerHTML = `
                <div class="text-slate-500 mb-2">// Qiskit Engine</div>
                <div>q_0: |0⟩ ── [ ${data.circuit.map(g => `${g.gate}(${g.angle})`).join(' ── ')} ] ── Target</div>
            `;
        } catch (e) {
            circuitBox.innerText = "Error fetching circuit from backend.";
        }
    };

    document.getElementById('btn-circuit-maps').onclick = async () => {
        const query = document.getElementById('search-circuit-dest').value;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                circuitTarget = {
                    name: data[0].display_name,
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
                fetchCircuit(circuitTarget.lat, circuitTarget.lon);
            }
        } catch (e) {
            console.error(e);
        }
    };

    fetchCircuit(circuitTarget.lat, circuitTarget.lon);
}

// TASK 3: Random State Tour (Photos Removed)
function renderTask3() {
    setActiveTab(tabTour);

    panelContent.innerHTML = `
        <div class="space-y-4">
            <div>
                <span class="text-xs text-cyan-400 uppercase tracking-wider font-semibold">TASK 3</span>
                <h2 class="text-xl font-bold text-slate-100">Random State Tour</h2>
                <p class="text-xs text-slate-300 mt-1">Roll a random quantum superposition state and teleport across the globe!</p>
            </div>
            <button id="btn-roll-state" class="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded font-bold text-sm shadow-lg hover:opacity-90 transition">🎲 Entangle & Teleport</button>
            <div id="tour-info" class="bg-slate-950/50 p-3 rounded border border-slate-800 text-xs text-slate-300 hidden space-y-2">
                <div>Mapped Coords: <span id="tour-coords" class="text-cyan-300"></span></div>
            </div>
        </div>
    `;

    document.getElementById('btn-roll-state').onclick = async () => {
        try {
            const res = await fetch(`/api/random-state?t=${Date.now()}`);
            const data = await res.json();

            task1State = new QuantumState(data.theta, data.phi);
            activeState = task1State;
            updateExtendedHUD(activeState);
            globe.setTargetMarker(data.lat, data.lon);

            const tourInfo = document.getElementById('tour-info');
            const tourCoords = document.getElementById('tour-coords');
            
            tourInfo.classList.remove('hidden');
            tourCoords.innerText = `${data.lat.toFixed(2)}°, ${data.lon.toFixed(2)}°`;
        } catch (e) {
            console.error("Failed to fetch random state", e);
        }
    };
}

tabGame.addEventListener('click', renderTask1);
tabCircuit.addEventListener('click', renderTask2);
tabTour.addEventListener('click', renderTask3);

renderTask1();