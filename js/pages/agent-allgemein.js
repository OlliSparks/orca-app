// ORCA 2.0 - Allgemein-Agent

class AgentAllgemeinPage {
    constructor() { this.messages = []; this.isLoading = false; }

    render() {
        const c = document.getElementById('app');
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Allgemein-Agent';
        document.getElementById('headerSubtitle').textContent = 'KI-Assistent';
        document.getElementById('headerStats').style.display = 'none';
        if (this.messages.length === 0) this.messages.push({role:'assistant',content:this.greet()});
        const k = this.getApiKey();
        c.innerHTML = '<div style="padding:1rem;max-width:900px;margin:0 auto"><div style="background:white;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)"><div style="background:#2c4a8c;color:white;padding:1rem 1.5rem;border-radius:12px 12px 0 0"><span style="font-size:1.5rem">🤖</span> ORCA Assistent</div><div id="chatMessages" style="padding:1.5rem;min-height:300px;max-height:500px;overflow-y:auto">' + this.renderMsgs() + '</div><div style="padding:1rem;border-top:1px solid #e5e7eb;background:#fafbfc;border-radius:0 0 12px 12px"><div style="display:flex;gap:0.75rem"><textarea id="userInput" placeholder="Was kann ich tun?" style="flex:1;padding:0.75rem;border:1px solid #d1d5db;border-radius:8px;resize:none" onkeydown="if(event.key===String.fromCharCode(69,110,116,101,114)&&!event.shiftKey){event.preventDefault();agentAllgemeinPage.send()}"></textarea><button onclick="agentAllgemeinPage.send()" style="width:44px;height:44px;border-radius:50%;background:#2c4a8c;color:white;border:none;cursor:pointer">➤</button></div></div></div><div style="margin-top:1rem"><button onclick="agentAllgemeinPage.ask(String.fromCharCode(73,110,118,101,110,116,117,114))" style="margin:0.25rem;padding:0.5rem 1rem;border:1px solid #e5e7eb;border-radius:20px;background:white;cursor:pointer">📋 Inventur</button><button onclick="agentAllgemeinPage.ask(String.fromCharCode(65,66,76))" style="margin:0.25rem;padding:0.5rem 1rem;border:1px solid #e5e7eb;border-radius:20px;background:white;cursor:pointer">📦 ABL</button></div>' + (k ? '' : '<div style="margin-top:1rem;padding:0.75rem;background:#fef3c7;border-radius:8px;color:#92400e">Kein API Key - <a href="#" onclick="router.navigate(String.fromCharCode(47,101,105,110,115,116,101,108,108,117,110,103,101,110));return false">Einstellungen</a></div>') + '</div>';
        this.scroll();
    }
    greet() { const h=new Date().getHours(); return (h<12?'Morgen':h>=18?'Abend':'Tag')+'! Ich bin der ORCA-Assistent. Fragen Sie mich zu Inventur, ABL, Verlagerung oder Status-Codes.'; }
    renderMsgs() { return this.messages.map(m=>'<div style="display:flex;gap:0.75rem;margin-bottom:1rem;max-width:90%;'+(m.role==='user'?'margin-left:auto;flex-direction:row-reverse':'')+'"><div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#e0e7ff">'+(m.role==='assistant'?'🤖':'👤')+'</div><div style="padding:0.75rem 1rem;border-radius:12px;line-height:1.6;background:'+(m.role==='user'?'#2c4a8c;color:white':'#f0f4ff;color:#1e3a5f')+'">'+m.content.replace(/\n/g,'<br>')+'</div></div>').join(''); }
    scroll() { const c=document.getElementById('chatMessages'); if(c) c.scrollTop=c.scrollHeight; }
    ask(q) { document.getElementById('userInput').value=q; this.send(); }
    async send() {
        const i=document.getElementById('userInput'), m=i.value.trim();
        if(!m||this.isLoading) return;
        this.messages.push({role:'user',content:m}); i.value=''; this.render();
        this.isLoading=true;
        const r=await this.resp(m);
        this.messages.push({role:'assistant',content:r});
        this.isLoading=false; this.render();
    }
    getApiKey() { try{return JSON.parse(localStorage.getItem('orca_api_config')||'{}').claudeApiKey||null}catch{return null} }
    async resp(msg) {
        const k=this.getApiKey();
        if(k) { try {
            const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,system:'ORCA-Assistent. Deutsch, kompakt.',messages:this.messages.slice(-10).map(m=>({role:m.role,content:m.content}))})});
            if(r.ok){const d=await r.json();return d.content[0].text}
        }catch(e){console.error(e)} }
        const l=msg.toLowerCase();
        if(l.includes('inventur')) return 'Inventur = Bestandsaufnahme. Status: I0 (offen), I2 (gemeldet), I6 (bestätigt).';
        if(l.includes('abl')) return 'ABL meldet neue Werkzeuge an. Nutzen Sie den ABL-Agent!';
        if(l.includes('verlager')) return 'Verlagerung = Transport zwischen Standorten.';
        return 'Ich helfe bei Inventur, ABL, Verlagerung, Status-Codes.';
    }
}
const agentAllgemeinPage = new AgentAllgemeinPage();
