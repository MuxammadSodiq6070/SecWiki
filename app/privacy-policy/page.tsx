'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  function leaveSite() {
    window.location.href = 'about:blank'
  }

  const sections = [
    {
      title: "Qaysi ma'lumotlar to'planishi mumkin",
      items: [
        'Foydalanuvchi browseri, qurilma turi va operatsion sistema ma\'lumotlari.',
        'Saytdagi sahifalar va amalalar bo\'yicha trafik statistikasi.',
        'Cookie orqali saqlanadigan sozlamalar va tanlangan til/afzalliklar.',
        'Veb-analitika vositalari orqali yig\'ilgan umumlashtirilgan ma\'lumotlar.'
      ]
    },
    {
      title: 'Nima uchun cookie ishlatiladi',
      items: [
        "Saytni to'g'ri ishlashini ta'minlash.",
        'Foydalanuvchi tanlovlarini eslab qolish.',
        'Turli xizmatlar va trafikni tahlil qilish.',
        'Xavfsizlik va ishlashni optimallashtirish.'
      ]
    }
  ]

  return (
    <main className="min-h-screen bg-[#090a0f] px-4 py-12 text-[#f8d8d8]">
      <div className="rn-panel mx-auto max-w-4xl rounded-xl border border-[#ff0033]/80 bg-[#0b0c11] p-6">
        <div className="rn-fade mb-6 flex items-center justify-between gap-3" style={{ animationDelay: '20ms' }}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#ffb6c1] flex items-center gap-2">
              <span className="rn-dot" aria-hidden="true" />
              REDNOTES
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#ffe3e3]">Maxfiylik siyosati</h1>
          </div>
          <Link href="/" className="rn-btn-ghost rounded-md border border-[#ff0033] bg-[#140c10] px-3 py-2 text-sm text-[#ffe3e3]">
            Saytga qaytish
          </Link>
        </div>

        <div className="space-y-5 text-sm leading-7 text-[#f1d7d7]">
          <p className="rn-fade" style={{ animationDelay: '100ms' }}>
            Ushbu sayt o'z xizmatlarini ko'rsatish, trafikni tahlil qilish, xatolarni aniqlash va foydalanuvchi tajribasini yaxshilash uchun cookie-fayllar, mahalliy saqlash va analitik vositalardan foydalanishi mumkin.
          </p>

          {sections.map((section, i) => (
            <div key={section.title} className="rn-fade" style={{ animationDelay: `${180 + i * 90}ms` }}>
              <h2 className="rn-heading mb-2 text-lg font-semibold text-[#ffb6c1]">
                <span className="rn-bracket">[</span>
                {section.title}
                <span className="rn-bracket">]</span>
              </h2>
              <ul className="space-y-1 pl-5">
                {section.items.map((item) => (
                  <li key={item} className="rn-list-item relative">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rn-fade" style={{ animationDelay: '380ms' }}>
            <h2 className="rn-heading mb-2 text-lg font-semibold text-[#ffb6c1]">
              <span className="rn-bracket">[</span>
              Bizning majburiyatlarimiz
              <span className="rn-bracket">]</span>
            </h2>
            <p>
              Biz ma'lumotlarni faqat ushbu saytning ishlashini yaxshilash va texnik tahlillar uchun ishlatamiz. Biz ma'lumotlarni ommaviy yoki uchinchi shaxslar bilan noqonuniy tarzda bo'lishmaymiz.
            </p>
          </div>

          <div className="rn-fade" style={{ animationDelay: '460ms' }}>
            <h2 className="rn-heading mb-2 text-lg font-semibold text-[#ffb6c1]">
              <span className="rn-bracket">[</span>
              Rozilik
              <span className="rn-bracket">]</span>
            </h2>
            <p>
              Saytni ko'rib chiqish orqali yoki banner ustida "Qabul qilaman" bosganingizda, siz ushbu Maxfiylik siyosatidagi ma'lumotlarni to'plash va foydalanish shartlariga rozilik bergansiz.
            </p>
          </div>
        </div>

        <div className="rn-fade mt-8 flex flex-wrap gap-3" style={{ animationDelay: '540ms' }}>
          <button
            type="button"
            onClick={leaveSite}
            className="rn-btn-ghost rounded-md border border-[#ff0033] bg-[#140c10] px-4 py-2 text-sm font-medium text-[#ffd7d7]"
          >
            Saytdan chiqish
          </button>
          <Link
            href="/"
            className="rn-btn-solid rounded-md border border-[#ff0033] bg-[#ff0033] px-4 py-2 text-sm font-medium text-white"
          >
            Saytga kirish
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes rn-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rn-panel-in {
          from { opacity: 0; transform: scale(0.99); box-shadow: 0 0 0 rgba(255,0,51,0); }
          to   { opacity: 1; transform: scale(1); box-shadow: 0 0 18px rgba(255,0,51,0.12); }
        }
        @keyframes rn-dot-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }

        .rn-panel {
          animation: rn-panel-in 0.5s ease forwards;
        }
        .rn-fade {
          opacity: 0;
          animation: rn-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .rn-dot {
          width: 5px; height: 5px; border-radius: 9999px; background: #ff0033;
          display: inline-block;
          animation: rn-dot-blink 1.8s ease-in-out infinite;
        }
        .rn-bracket {
          color: #ff0033;
          margin: 0 4px;
        }
        .rn-list-item {
          padding-left: 14px;
          transition: color 0.2s ease;
        }
        .rn-list-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.65em;
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: #ff0033;
        }
        .rn-list-item:hover {
          color: #ffe3e3;
        }
        .rn-btn-ghost, .rn-btn-solid {
          transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .rn-btn-ghost:hover {
          background-color: #1a1015;
          transform: translateY(-1px);
        }
        .rn-btn-solid {
          box-shadow: 0 0 12px rgba(255,0,51,0.25);
        }
        .rn-btn-solid:hover {
          background-color: #ff1a4d;
          box-shadow: 0 0 18px rgba(255,0,51,0.4);
          transform: translateY(-1px);
        }
        .rn-btn-ghost:active, .rn-btn-solid:active {
          transform: translateY(0) scale(0.98);
        }

        @media (prefers-reduced-motion: reduce) {
          .rn-panel, .rn-fade, .rn-dot { animation: none !important; }
          .rn-panel, .rn-fade { opacity: 1; }
        }
      `}</style>
    </main>
  )
}