import { useState } from "react";

// =============================================================
// Design Philosophy: Figma忠実再現 - モバイルファーストLP
// Colors: #f39f88 (accent/heading), #4dce6e (LINE green),
//         #bf1391 (HotPepper magenta), #736357 (body text),
//         #4b4f58 (dark heading), #3a3a3a (text)
// Font: Noto Sans JP + Inter
// =============================================================

// CTA ボタンのURL設定
const LINKS = {
  higashiHiroshima: {
    line: "https://lin.ee/Vzzy14K",
    hotpepper: "https://beauty.hotpepper.jp/kr/slnH000792739/",
  },
  fukuyama: {
    line: "https://lin.ee/v69a7S4",
    hotpepper: "https://beauty.hotpepper.jp/kr/slnH000700971/",
  },
};

// モーダルコンポーネント
function IframeModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{ height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
          <span className="font-semibold text-gray-700 text-sm truncate">{title}</span>
          <button
            onClick={onClose}
            className="ml-2 text-gray-500 hover:text-gray-800 text-2xl leading-none font-bold"
            aria-label="閉じる"
          >
            &times;
          </button>
        </div>
        <iframe
          src={url}
          title={title}
          className="w-full"
          style={{ height: "calc(85vh - 52px)", border: "none" }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}

// CTAセクションコンポーネント
function CTASection({
  clinic,
  onLineClick,
  onHotpepperClick,
}: {
  clinic: "higashiHiroshima" | "fukuyama";
  onLineClick: () => void;
  onHotpepperClick: () => void;
}) {
  const isHigashi = clinic === "higashiHiroshima";
  const clinicName = isHigashi ? "東広島西条整骨院" : "福山整骨院";

  return (
    <div className="py-6 px-4">
      <div className="text-center text-[#3a3a3a] text-sm mb-3">
        --- {clinicName} ---
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onLineClick}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#4dce6e] hover:bg-[#3ab85a] active:bg-[#2ea04c] text-white text-lg font-semibold py-3 px-6 rounded transition-colors"
        >
          <i className="fab fa-line text-xl"></i>
          LINE講座をスタート
        </button>
        <div className="text-[#3a3a3a] text-xs">
          1週間で痩せ体質を作る無料講座をプレゼント中🎁
        </div>
        <button
          onClick={onHotpepperClick}
          className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#bf1391] hover:bg-[#a01079] active:bg-[#880d67] text-white text-lg font-semibold py-3 px-6 rounded transition-colors"
        >
          <i className="fas fa-calendar-check text-xl"></i>
          ホットペッパーで予約する
        </button>
        <div className="text-[#3a3a3a] text-xs">今すぐ予約したい方はこちらからどうぞ</div>
        <div className="text-[#3a3a3a] text-xs">ダイエットカウンセリングが初回限定980円🎉</div>
      </div>
    </div>
  );
}

// 店舗情報リストアイテム
function InfoItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <i className={`${icon} text-[#f39f88] text-base mt-0.5 flex-shrink-0`}></i>
      <span className="text-[#736357] text-sm">{text}</span>
    </div>
  );
}

// 店舗の地図（APIキー不要のGoogleマップ埋め込み）
// もとは Manus のプロキシ経由で Google Maps JavaScript API を読み込んでいたため、
// GitHub Pages ではプロキシもAPIキーも無く地図が表示されなかった。
function ShopMap({ query, title }: { query: string; title: string }) {
  return (
    <iframe
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&z=16`}
      title={title}
      className="w-full h-[400px]"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export default function Home() {
  const [modal, setModal] = useState<{ url: string; title: string } | null>(null);

  const openModal = (url: string, title: string) => {
    setModal({ url, title });
  };
  const closeModal = () => setModal(null);

  return (
    <div className="bg-white min-h-screen font-['Noto_Sans_JP',_'Inter',_sans-serif]">
      {/* モーダル */}
      {modal && (
        <IframeModal url={modal.url} title={modal.title} onClose={closeModal} />
      )}

      {/* メインコンテンツ：最大幅700px、中央揃え */}
      <div className="max-w-[700px] mx-auto">

        {/* ===== FV (ファーストビュー) ===== */}
        <section className="w-full">
          <img
            src={`${import.meta.env.BASE_URL}16-4.webp`}
            alt="ファーストビュー"
            className="w-full h-auto object-cover"
          />
        </section>

        {/* ===== CTA セクション 1 ===== */}
        <section className="border-t border-neutral-200 py-4">
          <CTASection
            clinic="higashiHiroshima"
            onLineClick={() => openModal(LINKS.higashiHiroshima.line, "東広島西条整骨院 LINE")}
            onHotpepperClick={() => openModal(LINKS.higashiHiroshima.hotpepper, "東広島西条整骨院 HOT PEPPER予約")}
          />
          <CTASection
            clinic="fukuyama"
            onLineClick={() => openModal(LINKS.fukuyama.line, "福山整骨院 LINE")}
            onHotpepperClick={() => openModal(LINKS.fukuyama.hotpepper, "福山整骨院 HOT PEPPER予約")}
          />
        </section>

        {/* ===== B/A 実績セクション ===== */}
        <section className="border-t border-neutral-200 px-4 py-6">
          <div className="flex flex-col gap-10">
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-19.webp`} alt="ビフォーアフター実績1" className="w-full h-auto" />
            </div>
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-21.webp`} alt="ビフォーアフター実績2" className="w-full h-auto" />
            </div>
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-23.webp`} alt="ビフォーアフター実績3" className="w-full h-auto" />
            </div>
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-25.webp`} alt="ビフォーアフター実績4" className="w-full h-auto" />
            </div>
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-27.webp`} alt="ビフォーアフター実績5" className="w-full h-auto" />
            </div>
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-29.webp`} alt="ビフォーアフター実績6" className="w-full h-auto" />
            </div>
            <div className="overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}16-31.webp`} alt="ビフォーアフター実績7" className="w-full h-auto" />
            </div>
          </div>
        </section>

        {/* ===== CONCEPT セクション ===== */}
        <section className="border-t border-neutral-200 px-4 py-8">
          <h2 className="text-[#f39f88] text-2xl font-bold mb-4">
            CONCEPT<br />我慢しない、無理しないで自分らしく痩せる
          </h2>
          <p className="text-[#3a3a3a] text-base mb-3">
            本当はもう少しカラダを引き締めたい。理想のボディラインがある。でも…「筋トレはきついし、甘いものも食べたいし…」という女性の方へ。
          </p>
          <p className="text-[#3a3a3a] text-base mb-3">
            当店の我慢しないダイエットはいかがですか？「筋トレなし、無理な食事制限なし」なのにストレスなく痩せていく。その後もリバウンドしにくいカラダをずーっとキープしていく。
          </p>
          <p className="text-[#3a3a3a] text-base">
            国家資格である柔道整復師。プロの資格を所有しているので、我慢しないダイエットが実現可能です。
          </p>
        </section>

        {/* ===== 口コミ・Voice セクション ===== */}
        <section className="border-t border-neutral-200 px-4 py-6">
          <div className="grid grid-cols-4 gap-1">
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-11.webp`} alt="口コミ1" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-6.webp`} alt="口コミ2" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-3.webp`} alt="口コミ3" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-9.webp`} alt="口コミ4" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-8.webp`} alt="口コミ5" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-2.webp`} alt="口コミ6" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}109-5.webp`} alt="口コミ7" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-5.webp`} alt="口コミ8" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}109-4.webp`} alt="口コミ9" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}91-4.webp`} alt="口コミ10" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}109-2.webp`} alt="口コミ11" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square">
              <img src={`${import.meta.env.BASE_URL}109-3.webp`} alt="口コミ12" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* ===== ３つのこだわり ===== */}
        <section className="border-t border-neutral-200 px-4 py-8">
          <h2 className="text-[#f39f88] text-2xl font-semibold mb-6">３つのこだわり</h2>

          <div className="mb-8">
            <h3 className="text-[#4b4f58] text-lg font-semibold mb-3">01：個室のプライベート空間</h3>
            <img src={`${import.meta.env.BASE_URL}16-105.webp`} alt="個室のプライベート空間" className="w-full h-auto rounded mb-3" />
            <p className="text-[#736357] text-base">
              プライベート空間になります。多くの場合、お客様ひとりずつでの接遇です。周りを気にせずに、なんでもご相談ください。
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-[#4b4f58] text-lg font-semibold mb-3">02：おひとりおひとりに合わせた無理のないプランをご提案します</h3>
            <img src={`${import.meta.env.BASE_URL}16-109.webp`} alt="個別プラン提案" className="w-full h-auto rounded mb-3" />
            <p className="text-[#736357] text-base">
              カウンセリングではお身体の状態を聞かせて頂き、お悩みに沿って無理なく痩せるプランをご提案できます。
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-[#4b4f58] text-lg font-semibold mb-3">03：ダイエットだけじゃない！全身美容整体も施します</h3>
            <img src={`${import.meta.env.BASE_URL}16-113.webp`} alt="全身美容整体" className="w-full h-auto rounded mb-3" />
            <p className="text-[#736357] text-base">
              ダイエットはもちろんのこと、ストレートネック、反り腰、猫背、産後の骨盤矯正、小顔調整など、美しい姿勢改善もまるごと全部ご提供しています。痛みや疲れが取れて、痩せて見た目が良くなるって良いとは思いませんか？
            </p>
          </div>
        </section>

        {/* ===== 代表紹介 ===== */}
        <section className="border-t border-neutral-200 px-4 py-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-[185px] h-[185px] rounded-full overflow-hidden bg-[#d9d9d9] mb-4">
              <img
                src={`${import.meta.env.BASE_URL}36-2.webp`}
                alt="院長：三木洋陸"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <h3 className="text-[#4b4f58] text-lg font-semibold">院長：三木　洋陸</h3>
          </div>
          <div className="space-y-2 mb-4">
            <InfoItem icon="fas fa-circle" text="31歳" />
            <InfoItem icon="fas fa-circle" text="キャリア10年" />
            <InfoItem icon="fas fa-circle" text="国家資格：柔道整復師所有" />
          </div>
          <p className="text-[#736357] text-base">
            「健康を通じて関わる全ての人を笑顔に」を理念に、皆様の健康をサポートしています。<br />
            身体が変わっていくプロセスを一緒に楽しみながら、理想の自分を手に入れましょう。<br />
            「初回体験セッション」で当院のダイエットコースがどのようなものか？を体験してください。
          </p>
        </section>

        {/* ===== 店舗情報：東広島西条整骨院 ===== */}
        <section className="border-t border-neutral-200 px-4 py-8">
          <h2 className="text-[#f39f88] text-2xl font-semibold mb-4">店舗情報：東広島西条整骨院</h2>
          <img src={`${import.meta.env.BASE_URL}16-181.webp`} alt="東広島西条整骨院 外観" className="w-full h-auto rounded mb-4" />
          <div className="space-y-2 mb-6">
            <InfoItem icon="fas fa-clock" text="営業時間：9時〜20時 (最終受付19時)" />
            <InfoItem icon="fas fa-calendar-times" text="定休日：日曜・祝日" />
            <InfoItem icon="fas fa-map-marker-alt" text="住所：広島県東広島市西条西本町28-30ハローズ 東広島2階" />
            <InfoItem icon="fas fa-credit-card" text="現金・クレジットカード・PayPay・その他QR決済" />
          </div>
          {/* Google マップ（東広島西条整骨院）*/}
          <div className="w-full rounded overflow-hidden mb-4">
            <ShopMap query="東広島西条整骨院 広島県東広島市西条西本町28-30" title="東広島西条整骨院 地図" />
          </div>
        </section>

        {/* ===== 店舗情報：福山整骨院 ===== */}
        <section className="border-t border-neutral-200 px-4 py-8">
          <h2 className="text-[#f39f88] text-2xl font-semibold mb-4">店舗情報：福山整骨院</h2>
          <img src={`${import.meta.env.BASE_URL}109-63.webp`} alt="福山整骨院 外観" className="w-full h-auto rounded mb-4" />
          <div className="space-y-2 mb-6">
            <InfoItem icon="fas fa-clock" text="営業時間：月～金 8：30～12：30・15：00～19：30　土 8：30～17：30" />
            <InfoItem icon="fas fa-calendar-times" text="定休日：日曜・祝日" />
            <InfoItem icon="fas fa-map-marker-alt" text="住所：広島県福山市新涯町３丁目１０－２１" />
            <InfoItem icon="fas fa-credit-card" text="現金・クレジットカード・PayPay・その他QR決済" />
          </div>
          {/* Google マップ（福山整骨院）*/}
          <div className="w-full rounded overflow-hidden mb-4">
            <ShopMap query="福山整骨院 広島県福山市新涯町3丁目10-21" title="福山整骨院 地図" />
          </div>
        </section>

        {/* ===== BOOK特典 ===== */}
        <section className="border-t border-neutral-200 px-4 py-8 flex justify-center">
          <img
            src={`${import.meta.env.BASE_URL}16-235.webp`}
            alt="BOOK特典"
            className="w-[280px] h-auto"
            style={{ transform: "rotate(3deg)" }}
          />
        </section>

        {/* ===== CTA セクション（本の後・成功理由の前）===== */}
        <section className="border-t border-neutral-200 py-4">
          <CTASection
            clinic="higashiHiroshima"
            onLineClick={() => openModal(LINKS.higashiHiroshima.line, "東広島西条整骨院 LINE")}
            onHotpepperClick={() => openModal(LINKS.higashiHiroshima.hotpepper, "東広島西条整骨院 HOT PEPPER予約")}
          />
          <CTASection
            clinic="fukuyama"
            onLineClick={() => openModal(LINKS.fukuyama.line, "福山整骨院 LINE")}
            onHotpepperClick={() => openModal(LINKS.fukuyama.hotpepper, "福山整骨院 HOT PEPPER予約")}
          />
        </section>

        {/* ===== 当店のダイエットが成功する理由 ===== */}
        <section className="border-t border-neutral-200 px-4 py-8">
          <h2 className="text-[#f39f88] text-2xl font-semibold mb-6">当店のダイエットが成功する理由</h2>

          <div className="border-2 border-neutral-200 rounded p-4 mb-6">
            <h3 className="text-[#f39f88] text-xl font-semibold mb-4">理由１：太った理由を徹底分析</h3>
            <div className="flex justify-center mb-4">
              <img src={`${import.meta.env.BASE_URL}16-251.webp`} alt="太った理由を徹底分析" className="w-full max-w-[400px] h-auto rounded" />
            </div>
            <p className="text-[#736357] text-base">
              肥満DNA検査による自分のスーパーフード知ることができ、分子栄養学を用いて体質を考慮した効率的なダイエットメニューを作成します。
            </p>
          </div>

          <div className="border-2 border-neutral-200 rounded p-4 mb-6">
            <h3 className="text-[#f39f88] text-xl font-semibold mb-4">理由２：痩身整体で生涯太りにくい体質作り</h3>
            <div className="flex justify-center mb-4">
              <img src={`${import.meta.env.BASE_URL}16-256.webp`} alt="痩身整体" className="w-full max-w-[400px] h-auto rounded" />
            </div>
            <p className="text-[#736357] text-base">
              主に姿勢矯正と骨盤矯正を行なって、痩せやすい体づくりをしていきます。
            </p>
          </div>

          <div className="border-2 border-neutral-200 rounded p-4 mb-6">
            <h3 className="text-[#f39f88] text-xl font-semibold mb-4">理由３：マンツーマン食事サポート</h3>
            <div className="flex justify-center mb-4">
              <img src={`${import.meta.env.BASE_URL}16-261.webp`} alt="マンツーマン食事サポート" className="w-full max-w-[400px] h-auto rounded" />
            </div>
            <p className="text-[#736357] text-base">
              LINEでサポート！楽しく続く食習慣を形成していきます。
            </p>
          </div>

          <div className="border-2 border-neutral-200 rounded p-4 mb-6">
            <h3 className="text-[#f39f88] text-xl font-semibold mb-4">理由4：国家資格の柔道整復師を所有。だから安心！</h3>
            <div className="flex justify-center mb-4">
              <img
                src={`${import.meta.env.BASE_URL}16-287.webp`}
                alt="資格証"
                className="w-full max-w-[300px] h-auto"
              />
            </div>
            <p className="text-[#736357] text-base">
              体の構造を知り尽くした、プロの整体師の証である「国家資格：柔道整復師」。<br />
              安心してダイエットを任せることができます。
            </p>
          </div>
        </section>

        {/* ===== BOOK特典（成功理由の後）===== */}
        <section className="border-t border-neutral-200 px-4 py-8 flex justify-center">
          <img
            src={`${import.meta.env.BASE_URL}16-267.webp`}
            alt="特典本"
            className="w-[280px] h-auto"
            style={{ transform: "rotate(3deg)" }}
          />
        </section>

        {/* ===== CTA セクション（最終） ===== */}
        <section className="border-t border-neutral-200 py-4 mb-8">
          <CTASection
            clinic="higashiHiroshima"
            onLineClick={() => openModal(LINKS.higashiHiroshima.line, "東広島西条整骨院 LINE")}
            onHotpepperClick={() => openModal(LINKS.higashiHiroshima.hotpepper, "東広島西条整骨院 HOT PEPPER予約")}
          />
          <CTASection
            clinic="fukuyama"
            onLineClick={() => openModal(LINKS.fukuyama.line, "福山整骨院 LINE")}
            onHotpepperClick={() => openModal(LINKS.fukuyama.hotpepper, "福山整骨院 HOT PEPPER予約")}
          />
        </section>

      </div>
    </div>
  );
}
