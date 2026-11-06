/* STARFIELD BACKGROUND */
(()=>{
    const c=document.getElementById('bg'),ctx=c.getContext('2d');
    let s=[];
    const rsz=()=>{c.width=innerWidth;c.height=innerHeight;};
    const ini=()=>{s=[];for(let i=0;i<100;i++)s.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.2,t:3000+Math.random()*3000,p:Math.random()*5000});};
    const drw=(ts)=>{ctx.clearRect(0,0,c.width,c.height);s.forEach(st=>{const a=.1+.7*(.5+.5*Math.sin((ts-st.p)/st.t*Math.PI*2));ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,Math.PI*2);ctx.fillStyle=`rgba(160,220,255,${a})`;ctx.fill();});requestAnimationFrame(drw);};
    window.addEventListener('resize',()=>{rsz();ini();});rsz();ini();requestAnimationFrame(drw);
})();

/* CONFIG & STATE */
const SYMS = {'+0':'↑','+1':'→','x0':'↗','x1':'↘'};
const wait = ms => new Promise(r => setTimeout(r, ms));

function updateEveUI() {
    const isChecked = document.getElementById('eveTog').checked;
    const statusText = document.getElementById('eveStatusText');
    if (isChecked) {
        statusText.textContent = "EVE ACTIVE";
        statusText.className = "active-text";
    } else {
        statusText.textContent = "EVE DISABLED";
        statusText.className = "inactive-text";
    }
}

function addStep(id, title, desc) {
    const card = document.createElement('div');
    card.className = 'step-card active';
    card.id = `card_${id}`;
    card.innerHTML = `
        <div style="padding: 14px 0 10px; font-family:'Orbitron'; font-size:14px; font-weight:700; letter-spacing:1px;">${title}</div>
        <div class="sc-body">
            <div class="sc-inner">
                <p style="font-size:14px; color:var(--sub); border-bottom:1px solid #0d2a40; padding-bottom:12px; margin-bottom:12px; line-height:1.5;">${desc}</p>
            </div>
        </div>`;
    document.getElementById('steps').appendChild(card);
    card.scrollIntoView({behavior:'smooth', block:'center'});
    return card;
}

function renderBits(stepEl, bits, bases) {
    const row = document.createElement('div');
    row.className = 'bit-row';
    bits.forEach((b, i) => {
        const cell = document.createElement('div');
        cell.className = 'bc';
        cell.innerHTML = `<span>${b}</span><small>${bases[i]}</small>`;
        row.appendChild(cell);
    });
    stepEl.querySelector('.sc-inner').appendChild(row);
}

async function animatePhoton(ctx, sym, hasEve) {
    return new Promise(res => {
        let x = 0;
        const w = ctx.canvas.width = ctx.canvas.offsetWidth;
        const h = ctx.canvas.height = 60;
        function frame() {
            ctx.clearRect(0,0,w,h);
            ctx.strokeStyle = '#0d2540'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
            
            const isIntercepted = hasEve && x > w/2 - 20 && x < w/2 + 20;
            ctx.fillStyle = isIntercepted ? '#ff00c8' : '#00f5ff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            
            ctx.font = "bold 22px serif";
            ctx.textAlign = "center";
            ctx.fillText(sym, x, h/2 + 7);
            ctx.shadowBlur = 0;

            x += 12; // Speed of photon
            if(x < w - 10) requestAnimationFrame(frame);
            else res();
        }
        frame();
    });
}

async function startFullProtocol() {
    const n = +document.getElementById('nP').value;
    const hasEve = document.getElementById('eveTog').checked;
    const container = document.getElementById('steps');
    const goBtn = document.getElementById('goBtn');
    
    goBtn.disabled = true;
    container.innerHTML = '';

    // Data Generation
    const aBits = Array.from({length:n}, () => Math.random()<0.5?0:1);
    const aBases = Array.from({length:n}, () => Math.random()<0.5?'+':'x');
    const bBases = Array.from({length:n}, () => Math.random()<0.5?'+':'x');

    // ── STEP 1: ALICE PREPARATION ──
    const s1 = addStep('alice', '1. Alice Generates Raw Bits', 'Alice chooses a random bit string and randomly assigns a measurement basis (+ or x) to each bit.');
    renderBits(s1, aBits, aBases);
    await wait(1000);

    // ── STEP 2: QUANTUM CHANNEL (DYNAMIC SIMULATION) ──
    const s2Desc = hasEve ? 'Eve is intercepting! Her measurements disturb the polarization states, causing irreversible errors.' : 'The channel is secure. Photons travel undisturbed to Bob.';
    const s2 = addStep('channel', '2. Live Quantum Transmission', s2Desc);
    const simBox = document.createElement('div');
    simBox.className = 'sim-container';
    simBox.innerHTML = `<canvas class="mini-channel" id="mainCanvas"></canvas><div class="bit-row" id="liveBits"></div>`;
    s2.querySelector('.sc-inner').appendChild(simBox);
    
    const ctx = document.getElementById('mainCanvas').getContext('2d');
    const liveBitRow = document.getElementById('liveBits');

    for(let i=0; i<n; i++) {
        const sym = SYMS[aBases[i] + aBits[i]];
        await animatePhoton(ctx, sym, hasEve);
        const b = document.createElement('div');
        b.className = 'bc';
        b.style.borderColor = hasEve ? 'var(--mag)' : 'var(--cyan)';
        b.innerHTML = `<span>${sym}</span><small>${aBases[i]}</small>`;
        liveBitRow.appendChild(b);
    }
    await wait(500);

    // ── STEP 3: BOB MEASUREMENT ──
    const s3 = addStep('bob', '3. Bob Measures Photons', 'Bob selects random bases to measure the incoming photons. He doesn\'t know if they were intercepted.');
    const bBits = aBits.map((bit, i) => {
        if (aBases[i] === bBases[i]) {
            return (hasEve && Math.random() < 0.25) ? (bit ^ 1) : bit; 
        }
        return Math.random() < 0.5 ? 0 : 1; 
    });
    renderBits(s3, bBits, bBases);
    await wait(1000);

    // ── STEP 4: SIFTING ──
    const s4 = addStep('sifting', '4. Basis Comparison & Sifting', 'Alice and Bob reveal their bases. They keep bits only where bases match. Discarded bits are shown as "X".');
    const keyRow = document.createElement('div');
    keyRow.className = 'bit-row';
    const siftedKey = [];
    let errors = 0;

    aBases.forEach((base, i) => {
        const match = base === bBases[i];
        if (match) {
            siftedKey.push(bBits[i]);
            if (bBits[i] !== aBits[i]) errors++;
        }
        const b = document.createElement('div');
        b.className = `bc ${match ? 'match' : 'fail'}`;
        b.innerHTML = `<strong>${match ? bBits[i] : 'X'}</strong><small>${match ? 'KEEP' : 'DROP'}</small>`;
        keyRow.appendChild(b);
    });
    s4.querySelector('.sc-inner').appendChild(keyRow);
    await wait(1000);

    // ── STEP 5: VERDICT ──
    const s5 = addStep('verdict', '5. Final Security Verdict', 'Alice and Bob compare a portion of their key. If the error rate exceeds the threshold, Eve was present.');
    const errorRate = siftedKey.length > 0 ? ((errors / siftedKey.length) * 100).toFixed(1) : 0;
    const isSecure = errorRate < 10;

    const verdictBox = document.createElement('div');
    verdictBox.className = 'sim-container';
    verdictBox.style.textAlign = 'center';
    verdictBox.innerHTML = `
        <div class="lbl">SECURITY ANALYSIS</div>
        <div class="verdict-header" style="color:${isSecure ? 'var(--grn)' : 'var(--red)'};">
            ${isSecure ? '✅ SECURE KEY GENERATED' : '🚨 EAVESDROPPER DETECTED'}
        </div>
        <div style="font-family:'Share Tech Mono'; color:var(--sub); font-size: 13px;">
            KEY LENGTH: ${siftedKey.length} bits | TOTAL ERRORS: ${errors} | ERROR RATE: ${errorRate}%
        </div>
        <div style="margin-top:15px; padding:12px; border:1px solid ${isSecure ? 'var(--grn)' : 'var(--red)'}; background: rgba(0,0,0,0.2); color:var(--text); font-size:12px; line-height:1.4;">
            ${isSecure ? 
                'The error rate is negligible. Alice and Bob now have a shared secret key for perfect encryption.' : 
                'Critical Error Rate! Eve has measured the photons, causing quantum state collapse. The key is compromised.'}
        </div>
    `;
    s5.querySelector('.sc-inner').appendChild(verdictBox);

    goBtn.disabled = false;
}
