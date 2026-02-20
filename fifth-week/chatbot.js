// ================================================================
// Q-FARM CHATBOT v1.0
// Fuse.js ile tam site araması yapan akıllı sohbet robotu
// CDN: https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js
// ================================================================

/* ── CHATBOT HTML WIDGET (tüm sayfalara enjekte edilir) ── */
(function injectChatbot() {
  const html = `
  <!-- Chatbot Toggle Button -->
  <button id="chatbot-toggle" aria-label="Yardım chatini aç" onclick="ChatBot.toggle()">
    💬
    <span class="chat-notif"></span>
  </button>

  <!-- Chat Window -->
  <div id="chatbot-window" role="dialog" aria-label="Q-Farm Yardım Chatı">
    <div class="chat-header">
      <div class="chat-header-left">
        <div class="chat-avatar">🤖</div>
        <div class="chat-header-info">
          <div class="chat-name">Q-Farm Asistanı</div>
          <div class="chat-status">Çevrimiçi</div>
        </div>
      </div>
      <button class="chat-close-btn" onclick="ChatBot.toggle()" aria-label="Kapat">✕</button>
    </div>

    <div class="chat-messages" id="chat-messages"></div>

    <div class="chat-suggestions" id="chat-suggestions">
      <button class="suggestion-chip" onclick="ChatBot.ask('Fiyatlar nedir?')">💰 Fiyatlar</button>
      <button class="suggestion-chip" onclick="ChatBot.ask('Otomatik sağım sistemi ne kadar?')">🥛 Sağım</button>
      <button class="suggestion-chip" onclick="ChatBot.ask('Ekip kimlerden oluşuyor?')">👥 Ekip</button>
      <button class="suggestion-chip" onclick="ChatBot.ask('Hava durumu')">🌤️ Hava</button>
    </div>

    <div class="chat-input-area">
      <input
        id="chat-input"
        type="text"
        placeholder="Bir şey sorun..."
        autocomplete="off"
        onkeydown="if(event.key==='Enter') ChatBot.sendMsg()"
        aria-label="Mesaj yaz"
      />
      <button id="chat-send" onclick="ChatBot.sendMsg()" aria-label="Gönder">➤</button>
    </div>
  </div>
  `;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
})();

/* ──────────────────────────────────────────────────────────
   KNOWLEDGE BASE — tüm Q-Farm site içeriği
────────────────────────────────────────────────────────── */
const KB = [
  // HİZMETLER
  {
    id: "servis-sagim",
    title: "Otomatik Sağım Sistemi",
    excerpt:
      "El değmeden hijyenik süt sağım sistemleri. Günlük veriler ile süt kalitesini anlık izleme.",
    keywords: "sağım süt otomasyon hijyen otomatik manda inek sütçü",
    category: "Hizmetler",
    link: "index.html#services",
    answer:
      "🥛 <strong>Otomatik Sağım Sistemi</strong>: El değmeden, tam hijyenik koşullarda süt sağımı yapılır. Günlük sağım verileri ile süt kalitesi ve miktarı anlık takip edilir. Fiyat: +25.000 ₺ kurulum.",
  },
  {
    id: "servis-yemleme",
    title: "Akıllı Yemleme Sistemi",
    excerpt:
      "Hayvanlarınız için optimize edilmiş yem dağıtımı. Bireysel ihtiyaçlara göre kişiselleştirilmiş beslenme.",
    keywords: "yem yemleme yiyecek beslenme besle akıllı otomasyon dağıtım",
    category: "Hizmetler",
    link: "index.html#services",
    answer:
      "🌾 <strong>Akıllı Yemleme Sistemi</strong>: Her hayvanın bireysel ihtiyacına göre optimize edilmiş yem dağıtımı yapar. Yem israfını ortadan kaldırır, aylık ortalama %30 tasarruf sağlar. Fiyat: +15.000 ₺.",
  },
  {
    id: "servis-surü-takip",
    title: "Sürü Takip Sistemi",
    excerpt:
      "Dijital küpeler ile 7/24 sağlık izleme. Anormal davranışlar için anlık uyarı sistemi.",
    keywords: "sürü takip izleme küpe dijital sağlık hayvan monitoring",
    category: "Hizmetler",
    link: "index.html#services",
    answer:
      "📊 <strong>Sürü Takip Sistemi</strong>: Dijital küpeler ile her hayvanın sağlık durumu, hareketi ve davranışları 7/24 izlenir. Anormal durum tespitinde anlık bildirim gönderilir. Hayvan başı +500 ₺.",
  },
  {
    id: "servis-iklim",
    title: "İklim Kontrol Sistemi",
    excerpt:
      "Ahır içi sıcaklık, nem ve hava kalitesini otomatik kontrol eden akıllı sistemler.",
    keywords: "iklim sıcaklık nem hava ahır kontrol otomasyon sensör",
    category: "Hizmetler",
    link: "index.html#services",
    answer:
      "🌡️ <strong>İklim Kontrol Sistemi</strong>: Ahır içi sıcaklık, nem, amonyak ve CO₂ seviyelerini otomatik olarak izler ve kontrol eder. Hayvan sağlığı için ideal ortam koşulları sağlar.",
  },
  {
    id: "servis-saglik",
    title: "Yapay Zeka Sağlık Analizi",
    excerpt:
      "Yapay zeka destekli hastalık tespiti. Erken uyarı sistemi ile veteriner müdahalesi gecikmez.",
    keywords: "sağlık hastalık yapay zeka AI erken uyarı veteriner analiz",
    category: "Hizmetler",
    link: "index.html#services",
    answer:
      "🔬 <strong>Sağlık Analizi</strong>: Yapay zeka (AI) tabanlı sistem, hayvan davranışlarını analiz ederek hastalık belirtilerini veteriner müdahalesi gerektirmeden 48 saat öncesinden tespit eder.",
  },
  {
    id: "servis-mobil",
    title: "Mobil Yönetim Uygulaması",
    excerpt:
      "Çiftliğinizi cebinizden yönetin. iOS ve Android uyumlu kapsamlı mobil uygulama.",
    keywords: "mobil uygulama telefon iOS Android cep yönetim app",
    category: "Hizmetler",
    link: "index.html#services",
    answer:
      "📱 <strong>Mobil Uygulama</strong>: Q-Farm'ın iOS ve Android uygulaması ile çiftliğinizi her yerden yönetebilirsiniz. Anlık bildirimler, raporlar ve kontrol paneli cebinizde.",
  },

  // MALİYET HESAPLAMA
  {
    id: "hesaplama",
    title: "Maliyet Hesaplama Aracı",
    excerpt:
      "Büyükbaş sayısını ve istediğiniz hizmetleri girerek tahmini yatırım maliyetinizi öğrenin.",
    keywords: "maliyet hesap fiyat teklif yatırım hesaplama ne kadar kaç para",
    category: "Hesaplama",
    link: "index.html#calculator",
    answer:
      '💰 <strong>Maliyet Hesaplama</strong>: Sabit kurulum ücreti: 10.000 ₺. Hayvan başına: +200 ₺. Sağım sistemi: +25.000 ₺. Yemleme: +15.000 ₺. Sürü takip: Hayvan başı +500 ₺. <a href="index.html#calculator" class="msg-result-link">→ Hesaplama aracına git</a>',
  },

  // FİYATLAR
  {
    id: "fiyat-baslangic",
    title: "Başlangıç Paketi",
    excerpt:
      "Temel Q-Farm hizmetleri için başlangıç paketi. Küçük işletmeler için ideal.",
    keywords: "fiyat paket başlangıç temel ucuz ekonomik küçük",
    category: "Fiyatlar",
    link: "task2.html",
    answer:
      '🥈 <strong>Başlangıç Paketi</strong>: 50 baş hayvan altındaki küçük işletmeler için temel pakettir. Detaylı fiyatlar için paket sayfasına bakın. <a href="task2.html" class="msg-result-link">→ Tüm paketleri gör</a>',
  },
  {
    id: "fiyat-profesyonel",
    title: "Profesyonel Paket",
    excerpt:
      "En popüler paket. Orta ve büyük işletmeler için tüm Q-Farm özellikleri.",
    keywords: "profesyonel paket popüler orta büyük çiftlik",
    category: "Fiyatlar",
    link: "task2.html",
    answer:
      '🥇 <strong>Profesyonel Paket</strong>: En çok tercih edilen pakettir. Otomatik sağım + Akıllı yemleme + Sürü takibi dahildir. <a href="task2.html" class="msg-result-link">→ Paket detaylarına bak</a>',
  },

  // EKİP
  {
    id: "ekip-ahmet",
    title: "Ahmet Yılmaz — Genel Müdür",
    excerpt:
      "15+ yıl deneyim, stratejik planlama ve global liderlik alanlarında uzman.",
    keywords: "ekip ahmet yılmaz genel müdür CEO lider yönetici deneyim",
    category: "Ekip",
    link: "team.html",
    answer:
      '👔 <strong>Ahmet Yılmaz</strong> — Genel Müdür. 15+ yıl sektör deneyimi ile stratejik planlama ve global liderlik konusunda uzman. <a href="team.html" class="msg-result-link">→ Ekibi tanıyın</a>',
  },
  {
    id: "ekip-zeynep",
    title: "Zeynep Kaya — Kreatif Direktör",
    excerpt:
      "UI/UX Design, Brand Strategy ve Visual Storytelling alanlarında uzman.",
    keywords: "ekip zeynep kaya kreatif direktör tasarım design ux ui",
    category: "Ekip",
    link: "team.html",
    answer:
      '🎨 <strong>Zeynep Kaya</strong> — Kreatif Direktör. UI/UX tasarım, marka stratejisi ve görsel iletişim alanında deneyimli. <a href="team.html" class="msg-result-link">→ Ekibi tanıyın</a>',
  },
  {
    id: "ekip-genel",
    title: "Q-Farm Ekibi",
    excerpt:
      "Uzman kadromuz ile tanışın. Genel Müdür, Lead Developer, Kreatif Direktör.",
    keywords: "ekip takım kim çalışan kadrro kadro personel",
    category: "Ekip",
    link: "team.html",
    answer:
      '👥 <strong>Q-Farm Ekibi</strong>: Ahmet Yılmaz (Genel Müdür), Zeynep Kaya (Kreatif Direktör) ve Lead Developer\'dan oluşan uzman kadromuz. <a href="team.html" class="msg-result-link">→ Ekibi tanıyın</a>',
  },

  // HAVA DURUMU
  {
    id: "hava-durumu",
    title: "Hava Durumu Uygulaması",
    excerpt:
      "Ücretsiz Open-Meteo API ile anlık hava durumu ve 7 günlük tahmin. Şehir bazlı arama.",
    keywords:
      "hava durumu weather sıcaklık yağmur kar tahmin şehir arama meteoroloji",
    category: "Araçlar",
    link: "weather.html",
    answer:
      '🌤️ <strong>Hava Durumu</strong>: Q-Farm\'ın hava durumu sayfasında herhangi bir şehrin anlık hava koşullarını (sıcaklık, nem, rüzgar, UV) ve 7 günlük tahminini ücretsiz görebilirsiniz. <a href="weather.html" class="msg-result-link">→ Hava durumunu kontrol et</a>',
  },

  // HAKKIMIZDA / GENEL
  {
    id: "hakkimizda",
    title: "Q-Farm Hakkında",
    excerpt:
      "Türkiye'nin #1 akıllı çiftlik platformu. 8 yıllık deneyim, 500+ aktif çiftlik, 12.500+ izlenen hayvan.",
    keywords:
      "hakkında q-farm kim nedir ne ne kadar yıl kuruluş tarih deneyim güven",
    category: "Genel",
    link: "index.html",
    answer:
      "🏢 <strong>Q-Farm Teknoloji A.Ş.</strong>: Türkiye'nin #1 akıllı çiftlik platformu. 8 yıllık deneyim ile 500+ çiftlikte 12.500'den fazla hayvanı dijital olarak izliyoruz. Verimliliği ortalama %40 artırıyoruz.",
  },
  {
    id: "iletisim",
    title: "İletişim Bilgileri",
    excerpt:
      "Bize ulaşın. E-posta: info@qfarm.com.tr, Telefon: 0212 123 45 67, İstanbul.",
    keywords: "iletişim telefon email mail adres arama ulaş destek contact",
    category: "Genel",
    link: "index.html",
    answer:
      "📞 <strong>İletişim</strong>:<br>• E-posta: info@qfarm.com.tr<br>• Telefon: 0212 123 45 67<br>• Adres: İstanbul, Türkiye<br>Detaylı teklif için bizimle iletişime geçin.",
  },
  {
    id: "vizyon",
    title: "Vizyonumuz",
    excerpt:
      "Teknolojinin gücünü doğanın bereketiyle birleştirerek sürdürülebilir ve verimli tarımın öncüsü olmak.",
    keywords: "vizyon misyon amaç hedef sürdürülebilir yeşil tarım gelecek",
    category: "Genel",
    link: "team.html",
    answer:
      "🌱 <strong>Vizyonumuz</strong>: Teknolojinin gücünü doğanın bereketiyle birleştiriyoruz. Sürdürülebilir, verimli ve akıllı tarım teknolojileri ile geleceği bugünden inşa ediyoruz.",
  },
  {
    id: "quiz",
    title: "IK Aday Değerlendirme Sınavı",
    excerpt:
      "Q-Line IK Aday Değerlendirme — 4 soruluk teknik bilgi ölçme sınavı.",
    keywords:
      "quiz sınav ik değerlendirme aday test insan kaynakları hr kariyer iş",
    category: "Araçlar",
    link: "quiz.html",
    answer:
      '📝 <strong>IK Değerlendirme Sınavı</strong>: Q-Line\'ın 4 soruluk teknik değerlendirme sınavına katılın. Her doğru yanıt puan kazandırır. <a href="quiz.html" class="msg-result-link">→ Sınava katıl</a>',
  },
];

/* ──────────────────────────────────────────────────────────
   FUSE.JS KURULUMU
────────────────────────────────────────────────────────── */
let fuseInstance = null;

function initFuse() {
  if (typeof Fuse === "undefined") {
    console.warn("Fuse.js henüz yüklenemedi, bekleniyor...");
    return false;
  }
  fuseInstance = new Fuse(KB, {
    keys: [
      { name: "title", weight: 0.35 },
      { name: "keywords", weight: 0.35 },
      { name: "excerpt", weight: 0.2 },
      { name: "answer", weight: 0.1 },
    ],
    threshold: 0.45, // 0 = mükemmel eşleşme, 1 = her şeyi eşleştir
    minMatchCharLength: 2,
    includeScore: true,
    ignoreLocation: true,
    useExtendedSearch: false,
  });
  return true;
}

/* ──────────────────────────────────────────────────────────
   CHATBOT CONTROLLER
────────────────────────────────────────────────────────── */
const ChatBot = {
  isOpen: false,
  msgEl: null,
  inputEl: null,
  typingTimeout: null,

  init() {
    this.msgEl = document.getElementById("chat-messages");
    this.inputEl = document.getElementById("chat-input");
    this.addBotMsg(
      "👋 Merhaba! Ben Q-Farm'ın akıllı asistanıyım.<br>" +
        "Hizmetler, fiyatlar, ekip veya herhangi bir konu hakkında soru sorabilirsiniz!",
    );
  },

  toggle() {
    const win = document.getElementById("chatbot-window");
    const btn = document.getElementById("chatbot-toggle");
    this.isOpen = !this.isOpen;
    win.classList.toggle("open", this.isOpen);
    // Remove notification dot on open
    const notif = btn.querySelector(".chat-notif");
    if (notif && this.isOpen) notif.style.display = "none";
    if (this.isOpen) {
      setTimeout(() => this.inputEl && this.inputEl.focus(), 350);
    }
  },

  sendMsg() {
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.inputEl.value = "";
    this.ask(text);
  },

  ask(query) {
    // Show suggestions area (hide)
    document.getElementById("chat-suggestions").style.display = "none";

    // Add user message
    this.addUserMsg(query);

    // Start typing indicator
    const typingId = this.showTyping();

    setTimeout(() => {
      this.removeTyping(typingId);
      this.processQuery(query);
    }, 650);
  },

  processQuery(query) {
    /* Ensure Fuse is ready */
    if (!fuseInstance && !initFuse()) {
      this.addBotMsg(
        "⚠️ Arama motoru henüz hazır değil, lütfen 1 saniye bekleyin ve tekrar deneyin.",
      );
      return;
    }

    const results = fuseInstance.search(query);

    if (results.length === 0) {
      this.addBotMsg(
        `"<em>${this.esc(query)}</em>" için sonuç bulunamadı. 🤔<br>` +
          "Farklı anahtar kelimeler deneyin veya iletişime geçin: <strong>info@qfarm.com.tr</strong>",
      );
      return;
    }

    const top = results[0];

    if (top.score < 0.15) {
      // Very high confidence → inline answer
      this.addBotMsg(top.item.answer);
    } else if (results.length === 1) {
      // Single result
      this.addBotMsg(top.item.answer);
    } else {
      // Multiple results → show cards
      const count = Math.min(results.length, 4);
      let html = `<strong>${count} sonuç bulundu:</strong><div class="result-cards">`;
      results.slice(0, count).forEach((r) => {
        html += `
          <a href="${r.item.link}" class="result-card">
            <div class="rc-title">${r.item.title}</div>
            <div class="rc-excerpt">${r.item.excerpt}</div>
            <span class="rc-category">${r.item.category}</span>
          </a>`;
      });
      html += "</div>";
      this.addBotMsg(html);
    }
  },

  addBotMsg(html) {
    const div = document.createElement("div");
    div.className = "chat-msg bot";
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">${html}</div>`;
    this.msgEl.appendChild(div);
    this.scrollDown();
  },

  addUserMsg(text) {
    const div = document.createElement("div");
    div.className = "chat-msg user";
    div.innerHTML = `
      <div class="msg-avatar">👤</div>
      <div class="msg-bubble">${this.esc(text)}</div>`;
    this.msgEl.appendChild(div);
    this.scrollDown();
  },

  showTyping() {
    const id = "typing-" + Date.now();
    const div = document.createElement("div");
    div.className = "typing-indicator";
    div.id = id;
    div.innerHTML = `
      <div class="msg-avatar" style="background:linear-gradient(135deg,var(--primary),var(--primary-light));color:#fff;font-size:.9rem;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;">🤖</div>
      <div class="typing-dots"><span></span><span></span><span></span></div>`;
    this.msgEl.appendChild(div);
    this.scrollDown();
    return id;
  },

  removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  scrollDown() {
    requestAnimationFrame(() => {
      this.msgEl.scrollTop = this.msgEl.scrollHeight;
    });
  },

  esc(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },
};

/* ──────────────────────────────────────────────────────────
   BOOTSTRAP — Fuse.js CDN yüklendikten sonra başlat
────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Load Fuse.js from CDN
  const fuseScript = document.createElement("script");
  fuseScript.src =
    "https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js";
  fuseScript.onload = () => {
    initFuse();
    console.log("✅ Fuse.js yüklendi, Chatbot hazır.");
  };
  fuseScript.onerror = () => {
    console.warn("Fuse.js CDN yüklenemedi, temel mod aktif.");
  };
  document.head.appendChild(fuseScript);

  // Init chatbot UI
  ChatBot.init();
});
