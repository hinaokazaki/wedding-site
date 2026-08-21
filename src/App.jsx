import { useState, useEffect, useMemo, useRef } from "react";
import * as Tone from "tone";
import { supabase } from "./supabase";

/* ============================================================
   ✏️ ここを編集すれば内容が変わります / 여기를 수정하면 내용이 바뀝니다
   ============================================================ */
const WEDDING = {
  dateISO: "2026-11-01T12:10:00+09:00",
  lat: 37.2505144677203,
  lng: 127.019638678088,
  groom: {
    ko: "표민우",
    ja: "ピョ・ミヌ",
    fatherKo: "표승훈",
    motherKo: "김영옥",
    fatherJa: "ピョ・スンフン",
    motherJa: "キム・ヨンオク",
    relationKo: "장남",
    relationJa: "長男",
    fatherPhone: "010-9268-9747",
    motherPhone: "010-7625-6877",
  },
  bride: {
    ko: "오카자키 히나",
    ja: "岡﨑 弘奈", // ← 漢字表記に差し替え可
    fatherKo: "오카자키 히로야스",
    motherKo: "오카자키 리호",
    fatherJa: "岡﨑 弘恭",
    motherJa: "岡﨑 理穂",
    relationKo: "장녀",
    relationJa: "長女",
    fatherPhone: "010-0000-0000", // ← 実際の番号に差し替え
    motherPhone: "010-0000-0000", // ← 実際の番号に差し替え
  },
  venue: {
    nameKo: "수원 마이어스 웨딩홀 2F",
    nameJa: "水原マイアスウェディングホール 2F",
    addrKo: "경기 수원시 권선구 경수대로 270 터미널동 2층",
    addrJa: "京畿道 水原市 勧善区 京水大路270 ターミナル棟2F",
    tel: "031-267-5500",
  },
  accounts: {
    groomFather: {
      bankKo: "농협은행",
      number: "3021449643411",
      holderKo: "표승훈",
    },
    groomMother: {
      bankKo: "국민은행",
      number: "27250104116284",
      holderKo: "김영옥",
    },
    groom: {
      bankKo: "기업은행",
      number: "01051286879",
      holderKo: "표민우",
    },
  },
};

/* ---------- BGM ----------
   public/bgm/bgm.mp3 を置くとその曲が流れます。
   ファイルが無い/再生できない場合は自動でデモピアノにフォールバックします。
   別の場所(Supabase Storage等)に置くならURLをここに書き換えてください。 */
const BGM_URL = "/bgm/bgmBlue.mp3";

/* ---------- 写真 / 사진 (自動埋め込み) ---------- */
const HERO_IMG = "/images/hero.webp";
const GALLERY_COUNT = 19; // public/images/gallery-XX.webp の枚数
const GALLERY_IMGS = Array.from(
  { length: GALLERY_COUNT },
  (_, i) => `/images/gallery-${String(i + 1).padStart(2, "0")}.webp`,
);

/* ---------- 言語別テキスト / 언어별 텍스트 ---------- */
const T = {
  ko: {
    langLabel: "한국어",
    hero_eyebrow: "WEDDING INVITATION",
    and: "그리고",
    dateLine: "2026년 11월 1일 일요일 낮 12시 10분",
    dateShort: "2026. 11. 01. SUN PM 12:10",
    invite_title: "소중한 분들을 초대합니다",
    invite_body:
      "호주에서 처음 만나\n7년간 서로의 곁을 지켜온 저희가\n이제 부부의 연을 맺게 되었습니다.\n\n나란히 같은 곳을 바라보며\n한결같이 예쁘게 살아가겠습니다.\n\n저희의 설레는 첫걸음을\n함께 빛내 주시면 감사하겠습니다.",
    family_title: "혼주",
    call: "전화",
    calendar_title: "예식 일시",
    dday: (d) =>
      d > 0
        ? `결혼식까지 ${d}일 남았습니다`
        : d === 0
          ? "오늘은 결혼식 날입니다 🤍"
          : "결혼식이 무사히 끝났습니다",
    gallery_title: "갤러리",
    location_title: "오시는 길",
    map_open_kakao: "카카오맵",
    map_open_naver: "네이버지도",
    map_open_tmap: "티맵",
    map_note: "버튼을 누르면 지도 앱으로 연결됩니다",
    transport_title: "교통 안내",
    bus_label: "버스",
    bus_body:
      "수원역 6번 출구 앞 버스정류장에서\n5, 5-1, 7-1, 7-2, 13-5, 88, 88-1, 150, 900번 탑승\n→ 수원버스터미널 정류장 하차",
    parking_label: "주차",
    parking_body:
      "NC몰 지하주차장 이용 (2시간 무료, 터미널 쪽 엘리베이터 이용)\n만차 시 이마트 주차장 이용 가능 (2시간 무료)",
    account_title: "마음 전하실 곳",
    account_note:
      "참석이 어려우신 분들을 위해 기재했습니다.\n너그러운 마음으로 양해 부탁드립니다.",
    groom_side: "신랑측",
    bride_side: "신부측",
    account_groom_father: "신랑의 아버지",
    account_groom_mother: "신랑의 어머니",
    account_groom: "신랑",
    copy: "복사",
    copied: "복사되었습니다",
    rsvp_title: "참석 여부",
    rsvp_lead: "특별한 날, 귀한 발걸음을\n참석 여부를 통해 전해 주세요.",
    rsvp_name: "성함",
    rsvp_side: "구분",
    rsvp_attend: "참석 여부",
    attend_yes: "참석",
    attend_no: "불참",
    rsvp_meal: "식사 여부",
    meal_yes: "예정",
    meal_no: "미예정",
    rsvp_count: "본인 포함 인원",
    rsvp_submit: "참석 여부 전달하기",
    rsvp_done: "전달되었습니다. 감사합니다 🤍",
    guestbook_title: "방명록",
    gb_placeholder_name: "이름",
    gb_placeholder_msg: "축하 메시지를 남겨 주세요",
    gb_submit: "남기기",
    gb_empty: "아직 작성된 방명록이 없습니다.",
    footer: "민우 · 히나 올림",
    error: "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  },
  ja: {
    langLabel: "日本語",
    hero_eyebrow: "WEDDING INVITATION",
    and: "&",
    dateLine: "2026年11月1日(日) 12時10分",
    dateShort: "2026. 11. 01. SUN PM 12:10",
    invite_title: "ご招待のごあいさつ",
    invite_body:
      "オーストラリアで出会ってから7年\n互いに支え合ってきた私たちは\nこのたび夫婦として\n新しい一歩を踏み出すことになりました。\n\nこれからも同じ方向を見つめながら\n変わらず仲睦まじく歩んでまいります。\n\n私たちの門出を\n温かく見守っていただければ幸いです。",
    family_title: "両家のご案内",
    call: "電話",
    calendar_title: "挙式日時",
    dday: (d) =>
      d > 0
        ? `挙式まで あと${d}日`
        : d === 0
          ? "本日、挙式当日です 🤍"
          : "挙式は無事に終わりました",
    gallery_title: "ギャラリー",
    location_title: "アクセス",
    map_open_kakao: "カカオマップ",
    map_open_naver: "NAVERマップ",
    map_open_tmap: "Tmap",
    map_note: "Googleマップで会場の位置をご確認いただけます",
    map_open_google: "Googleマップで開く",
    transport_title: "交通のご案内",
    bus_label: "バス",
    bus_body:
      "水原(スウォン)駅6番出口前のバス停から\n5・5-1・7-1・7-2・13-5・88・88-1・150・900番に乗車\n→「水原バスターミナル」下車",
    parking_label: "駐車場",
    parking_body:
      "NCモール地下駐車場をご利用ください(2時間無料・ターミナル側エレベーター)\n満車の場合はEマート駐車場もご利用いただけます(2時間無料)",
    groom_side: "新郎側",
    bride_side: "新婦側",
    copy: "コピー",
    copied: "コピーしました",
    rsvp_title: "ご出欠のご連絡",
    rsvp_lead:
      "お手数ですが、ご出欠を\nこちらからお知らせいただけますと幸いです。",
    rsvp_name: "お名前",
    rsvp_side: "ご関係",
    rsvp_attend: "ご出欠",
    attend_yes: "出席",
    attend_no: "欠席",
    rsvp_meal: "お食事",
    meal_yes: "いただく",
    meal_no: "不要",
    rsvp_count: "ご本人を含む人数",
    rsvp_submit: "出欠を送信する",
    rsvp_done: "送信しました。ありがとうございます 🤍",
    guestbook_title: "ゲストブック",
    gb_placeholder_name: "お名前",
    gb_placeholder_msg: "お祝いのメッセージをどうぞ",
    gb_submit: "書き込む",
    gb_empty: "まだメッセージはありません。",
    footer: "ミヌ · 弘奈",
    error: "送信に失敗しました。しばらくしてからもう一度お試しください。",
  },
};

/* ---------- フォント / 폰트 (모던 명조 고정) ---------- */
const BODY_FONT = {
  kr: "'Noto Serif KR', serif",
  jp: "'Noto Serif JP', serif",
};

const C = {
  paper: "#FBF9F5",
  ink: "#44403A",
  sub: "#8C857B",
  accent: "#B08D7A",
  line: "#E9E2D8",
  card: "#FFFFFF",
};

export default function WeddingInvitation() {
  const [lang, setLang] = useState("ko");
  const [fade, setFade] = useState(false);
  const [toast, setToast] = useState("");
  const [rsvps, setRsvps] = useState([]);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    name: "",
    side: "groom",
    attend: "yes",
    meal: "yes",
    count: 1,
  });
  const [guestbook, setGuestbook] = useState([]);
  const [gbForm, setGbForm] = useState({ name: "", msg: "" });
  const [lightbox, setLightbox] = useState(null);
  const [bgmOn, setBgmOn] = useState(false);
  const [sending, setSending] = useState(false);
  const audioRef = useRef(null);
  const toneRef = useRef(null);
  const bgmStartedRef = useRef(false);
  const touchStartXRef = useRef(null);

  const showPrevImage = (e) => {
    e.stopPropagation();
    setLightbox((i) => (i - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length);
  };
  const showNextImage = (e) => {
    e.stopPropagation();
    setLightbox((i) => (i + 1) % GALLERY_IMGS.length);
  };
  const handleLightboxTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleLightboxTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) {
      setLightbox((i) => (i - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length);
    } else {
      setLightbox((i) => (i + 1) % GALLERY_IMGS.length);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("guestbook")
      .select("name, message, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data)
          setGuestbook(data.map((r) => ({ name: r.name, msg: r.message })));
      });
  }, []);

  const startDemoPiano = async () => {
    if (!toneRef.current) {
      await Tone.start();
      const reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).toDestination();
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.2, release: 2 },
        volume: -16,
      }).connect(reverb);
      const chords = [
        ["C4", "E4", "G4"],
        ["G3", "B3", "D4"],
        ["A3", "C4", "E4"],
        ["E3", "G3", "B3"],
        ["F3", "A3", "C4"],
        ["C4", "E4", "G4"],
        ["F3", "A3", "C4"],
        ["G3", "B3", "D4"],
      ];
      let step = 0;
      const loop = new Tone.Loop((time) => {
        const ch = chords[Math.floor(step / 3) % chords.length];
        synth.triggerAttackRelease(ch[step % 3], "2n", time);
        if (step % 3 === 0)
          synth.triggerAttackRelease(
            ch[0].replace(/\d/, (d) => d - 1),
            "1n",
            time,
          );
        step++;
      }, "4n");
      Tone.Transport.bpm.value = 72;
      loop.start(0);
      toneRef.current = loop;
    }
    Tone.Transport.start();
  };

  const playBgm = async () => {
    if (bgmStartedRef.current) return;
    try {
      if (BGM_URL) {
        if (!audioRef.current) {
          audioRef.current = new Audio(BGM_URL);
          audioRef.current.loop = true;
          audioRef.current.volume = 0.6;
        }
        try {
          await audioRef.current.play();
        } catch {
          audioRef.current = null;
          await startDemoPiano(); // 音源が無ければデモピアノ
        }
      } else {
        await startDemoPiano();
      }
      bgmStartedRef.current = true;
      setBgmOn(true);
    } catch {
      // ブラウザの自動再生制限でブロックされた場合はユーザー操作を待って再試行する
    }
  };

  const toggleBgm = async () => {
    if (bgmOn) {
      audioRef.current?.pause();
      Tone.Transport.pause();
      bgmStartedRef.current = false;
      setBgmOn(false);
      return;
    }
    await playBgm();
  };

  // ページ読み込み時に自動再生を試み、ブロックされた場合は最初のユーザー操作で再生を開始する
  useEffect(() => {
    let active = true;
    const events = ["pointerdown", "keydown", "touchstart"];
    const tryStart = async () => {
      if (!active || bgmStartedRef.current) return;
      await playBgm();
      if (bgmStartedRef.current) {
        events.forEach((ev) => window.removeEventListener(ev, tryStart));
      }
    };
    tryStart();
    events.forEach((ev) => window.addEventListener(ev, tryStart));
    return () => {
      active = false;
      events.forEach((ev) => window.removeEventListener(ev, tryStart));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = T[lang];
  const bodyFont = lang === "ko" ? BODY_FONT.kr : BODY_FONT.jp;

  const switchLang = (next) => {
    if (next === lang) return;
    setFade(true);
    setTimeout(() => {
      setLang(next);
      setFade(false);
    }, 220);
  };

  const dday = useMemo(() => {
    const now = new Date();
    const target = new Date(WEDDING.dateISO);
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );
    return Math.round((b - a) / 86400000);
  }, []);

  const copyText = (text) => {
    const done = () => {
      setToast(t.copied);
      setTimeout(() => setToast(""), 1600);
    };
    if (navigator.clipboard?.writeText)
      navigator.clipboard.writeText(text).then(done).catch(done);
    else done();
  };

  const submitRsvp = async () => {
    if (!rsvpForm.name.trim() || sending) return;
    setSending(true);
    if (supabase) {
      const { error } = await supabase.from("rsvps").insert({
        name: rsvpForm.name.trim(),
        side: rsvpForm.side,
        attend: rsvpForm.attend === "yes",
        meal: rsvpForm.attend === "yes" ? rsvpForm.meal === "yes" : null,
        guest_count: rsvpForm.attend === "yes" ? rsvpForm.count : 0,
      });
      if (error) {
        setSending(false);
        setToast(t.error);
        setTimeout(() => setToast(""), 2200);
        return;
      }
    }
    setSending(false);
    setRsvpDone(true);
  };

  const submitGb = async () => {
    if (!gbForm.name.trim() || !gbForm.msg.trim() || sending) return;
    setSending(true);
    const entry = { name: gbForm.name.trim(), message: gbForm.msg.trim() };
    if (supabase) {
      const { error } = await supabase.from("guestbook").insert(entry);
      if (error) {
        setSending(false);
        setToast(t.error);
        setTimeout(() => setToast(""), 2200);
        return;
      }
    }
    setSending(false);
    setGuestbook([{ name: entry.name, msg: entry.message }, ...guestbook]);
    setGbForm({ name: "", msg: "" });
  };

  const names =
    lang === "ko"
      ? { g: WEDDING.groom.ko, b: WEDDING.bride.ko }
      : { g: WEDDING.groom.ja, b: WEDDING.bride.ja };

  const venueName = lang === "ko" ? WEDDING.venue.nameKo : WEDDING.venue.nameJa;
  const venueAddr = lang === "ko" ? WEDDING.venue.addrKo : WEDDING.venue.addrJa;

  const kakaoUrl = `https://map.kakao.com/link/map/${encodeURIComponent("수원 마이어스 웨딩홀")},${WEDDING.lat},${WEDDING.lng}`;
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent("수원 마이어스 웨딩홀")}`;
  const tmapUrl = `https://tmap.life/route?goalname=${encodeURIComponent("수원 마이어스 웨딩홀")}&goalx=${WEDDING.lng}&goaly=${WEDDING.lat}`;
  const googleEmbed = `https://maps.google.com/maps?q=${WEDDING.lat},${WEDDING.lng}&z=16&hl=ja&output=embed`;
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${WEDDING.lat},${WEDDING.lng}`;

  /* November 2026 mini calendar (Nov 1 = Sunday) */
  const calCells = [];
  for (let d = 1; d <= 30; d++) calCells.push(d);

  const S = styles(bodyFont);

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&family=Noto+Serif+JP:wght@300;400;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        input, select, textarea, button { font-family: inherit; }
        ::placeholder { color: #B7AFA3; }
      `}</style>

      {/* ---- 上部コントロールバー ---- */}
      <div style={S.topBar}>
        <div style={S.langPill}>
          <button
            onClick={() => switchLang("ko")}
            style={{ ...S.langBtn, ...(lang === "ko" ? S.langBtnOn : {}) }}
          >
            한국어
          </button>
          <button
            onClick={() => switchLang("ja")}
            style={{ ...S.langBtn, ...(lang === "ja" ? S.langBtnOn : {}) }}
          >
            日本語
          </button>
        </div>
      </div>

      <div
        style={{
          ...S.card,
          opacity: fade ? 0 : 1,
          transition: "opacity .22s ease",
        }}
      >
        {/* ---- HERO ---- */}
        <section style={{ ...S.section, paddingTop: 72 }}>
          <p style={S.eyebrow}>{t.hero_eyebrow}</p>
          <div style={S.heroPhoto}>
            <img src={HERO_IMG} alt="" style={S.photoImg} />
          </div>
          <h1 style={S.heroNames}>
            {names.g}
            <span style={S.heroAnd}>{t.and}</span>
            {names.b}
          </h1>
          <div style={S.hairline} />
          <p style={S.heroDate}>{t.dateLine}</p>
          <p style={S.heroVenue}>{venueName}</p>
        </section>

        {/* ---- INVITATION ---- */}
        <section style={S.section}>
          <p style={S.eyebrow}>INVITATION</p>
          <h2 style={S.h2}>{t.invite_title}</h2>
          <p style={S.body}>{t.invite_body}</p>
        </section>

        {/* ---- FAMILY ---- */}
        <section style={{ ...S.section, background: "#F6F1EA" }}>
          <p style={S.eyebrow}>FAMILY</p>
          <h2 style={S.h2}>{t.family_title}</h2>
          {[
            {
              f:
                lang === "ko" ? WEDDING.groom.fatherKo : WEDDING.groom.fatherJa,
              m:
                lang === "ko" ? WEDDING.groom.motherKo : WEDDING.groom.motherJa,
              r:
                lang === "ko"
                  ? WEDDING.groom.relationKo
                  : WEDDING.groom.relationJa,
              n: names.g,
              side: "groom",
              fatherPhone: WEDDING.groom.fatherPhone,
              motherPhone: WEDDING.groom.motherPhone,
            },
            {
              f:
                lang === "ko" ? WEDDING.bride.fatherKo : WEDDING.bride.fatherJa,
              m:
                lang === "ko" ? WEDDING.bride.motherKo : WEDDING.bride.motherJa,
              r:
                lang === "ko"
                  ? WEDDING.bride.relationKo
                  : WEDDING.bride.relationJa,
              n: names.b,
              side: "bride",
              fatherPhone: WEDDING.bride.fatherPhone,
              motherPhone: WEDDING.bride.motherPhone,
            },
          ].map((fam, i) => (
            <div key={i} style={S.famRow}>
              <p style={{ ...S.body, margin: 0 }}>
                {fam.f} · {fam.m}
              </p>
              <p style={{ fontSize: 13, color: C.sub, margin: "6px 0" }}>
                {fam.r}
              </p>
              <p style={{ ...S.body, margin: 0, fontWeight: 600 }}>{fam.n}</p>
              {lang === "ko" && fam.side === "groom" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ ...S.body, margin: 0 }}>
                      {fam.f} : {fam.fatherPhone}
                    </span>
                    <a href={`tel:${fam.fatherPhone}`} style={S.miniBtn}>
                      {t.call}
                    </a>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ ...S.body, margin: 0 }}>
                      {fam.m} : {fam.motherPhone}
                    </span>
                    <a href={`tel:${fam.motherPhone}`} style={S.miniBtn}>
                      {t.call}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ---- CALENDAR ---- */}
        <section style={S.section}>
          <p style={S.eyebrow}>SAVE THE DATE</p>
          <h2 style={S.h2}>{t.calendar_title}</h2>
          <p style={{ ...S.body, marginBottom: 20 }}>{t.dateLine}</p>
          <div style={S.calWrap}>
            <p style={S.calMonth}>NOVEMBER 2026</p>
            <div style={S.calGrid}>
              {(lang === "ko"
                ? ["일", "월", "화", "수", "목", "금", "토"]
                : ["日", "月", "火", "水", "木", "金", "土"]
              ).map((d, i) => (
                <div
                  key={d}
                  style={{ ...S.calHead, color: i === 0 ? "#C77" : C.sub }}
                >
                  {d}
                </div>
              ))}
              {calCells.map((d) => (
                <div
                  key={d}
                  style={{ ...S.calCell, ...(d === 1 ? S.calToday : {}) }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
          <p style={{ ...S.sub, marginTop: 18 }}>{t.dday(dday)}</p>
        </section>

        {/* ---- GALLERY ---- */}
        <section style={{ ...S.section, background: "#F6F1EA" }}>
          <p style={S.eyebrow}>GALLERY</p>
          <h2 style={S.h2}>{t.gallery_title}</h2>
          <div style={S.galleryGrid}>
            {GALLERY_IMGS.map((src, i) => (
              <div
                key={i}
                style={S.galleryCell}
                onClick={() => setLightbox(i)}
              >
                <img src={src} alt="" style={S.photoImg} loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        {/* ---- LOCATION ---- */}
        <section style={S.section}>
          <p style={S.eyebrow}>LOCATION</p>
          <h2 style={S.h2}>{t.location_title}</h2>
          <p style={{ ...S.body, marginBottom: 4, fontWeight: 600 }}>
            {venueName}
          </p>
          <p style={{ ...S.sub, whiteSpace: "pre-line" }}>
            {venueAddr}
            {"\n"}Tel. {WEDDING.venue.tel}
          </p>

          {lang === "ja" ? (
            <>
              <div style={S.mapFrame}>
                <iframe
                  title="Google Map"
                  src={googleEmbed}
                  style={{ border: 0, width: "100%", height: "100%" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p style={S.sub}>{t.map_note}</p>
              <a
                href={googleUrl}
                target="_blank"
                rel="noreferrer"
                style={{ ...S.wideBtn, marginTop: 10 }}
              >
                {t.map_open_google}
              </a>
            </>
          ) : (
            <>
              <div style={S.mapPlaceholderKo}>
                <span style={{ fontSize: 26 }}>📍</span>
                <span style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>
                  수원 마이어스 웨딩홀
                </span>
              </div>
              <p style={S.sub}>{t.map_note}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <a
                  href={kakaoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...S.mapBtn,
                    background: "#FEE500",
                    color: "#3B1E1E",
                    border: "none",
                  }}
                >
                  {t.map_open_kakao}
                </a>
                <a
                  href={naverUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...S.mapBtn,
                    background: "#03C75A",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {t.map_open_naver}
                </a>
                <a
                  href={tmapUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={S.mapBtn}
                >
                  {t.map_open_tmap}
                </a>
              </div>
            </>
          )}

          <div style={{ marginTop: 32, textAlign: "left" }}>
            <p style={S.transportLabel}>{t.bus_label}</p>
            <p style={S.transportBody}>{t.bus_body}</p>
            <p style={S.transportLabel}>{t.parking_label}</p>
            <p style={S.transportBody}>{t.parking_body}</p>
          </div>
        </section>

        {/* ---- ACCOUNTS ---- */}
        {lang === "ko" && (
          <section style={{ ...S.section, background: "#F6F1EA" }}>
            <p style={S.eyebrow}>WITH LOVE</p>
            <h2 style={S.h2}>{t.account_title}</h2>
            <p style={{ ...S.sub, whiteSpace: "pre-line", marginBottom: 22 }}>
              {t.account_note}
            </p>
            {[
              { label: t.account_groom_father, account: WEDDING.accounts.groomFather },
              { label: t.account_groom_mother, account: WEDDING.accounts.groomMother },
              { label: t.account_groom, account: WEDDING.accounts.groom },
            ].map((grp) => (
              <div key={grp.label} style={{ marginBottom: 16 }}>
                <p
                  style={{
                    ...S.sub,
                    fontSize: 12,
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  {grp.label}
                </p>
                <div style={S.accountCard}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: 0, fontSize: 13, color: C.sub }}>
                      {grp.account.bankKo} · {grp.account.holderKo}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 15,
                        letterSpacing: 0.5,
                      }}
                    >
                      {grp.account.number}
                    </p>
                  </div>
                  <button
                    onClick={() => copyText(grp.account.number)}
                    style={S.miniBtn}
                  >
                    {t.copy}
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ---- RSVP ---- */}
        <section style={{ ...S.section, borderTop: `1px solid ${C.line}` }}>
          <p style={S.eyebrow}>R.S.V.P</p>
          <h2 style={S.h2}>{t.rsvp_title}</h2>
          <p style={{ ...S.body, marginBottom: 24 }}>{t.rsvp_lead}</p>
          {rsvpDone ? (
            <p style={{ ...S.body, color: C.accent }}>{t.rsvp_done}</p>
          ) : (
            <div style={{ textAlign: "left" }}>
              <label style={S.formLabel}>{t.rsvp_name}</label>
              <input
                value={rsvpForm.name}
                onChange={(e) =>
                  setRsvpForm({ ...rsvpForm, name: e.target.value })
                }
                style={S.input}
              />
              <label style={S.formLabel}>{t.rsvp_side}</label>
              <div style={S.segRow}>
                {[
                  ["groom", t.groom_side],
                  ["bride", t.bride_side],
                ].map(([v, lb]) => (
                  <button
                    key={v}
                    onClick={() => setRsvpForm({ ...rsvpForm, side: v })}
                    style={{
                      ...S.seg,
                      ...(rsvpForm.side === v ? S.segOn : {}),
                    }}
                  >
                    {lb}
                  </button>
                ))}
              </div>
              <label style={S.formLabel}>{t.rsvp_attend}</label>
              <div style={S.segRow}>
                {[
                  ["yes", t.attend_yes],
                  ["no", t.attend_no],
                ].map(([v, lb]) => (
                  <button
                    key={v}
                    onClick={() => setRsvpForm({ ...rsvpForm, attend: v })}
                    style={{
                      ...S.seg,
                      ...(rsvpForm.attend === v ? S.segOn : {}),
                    }}
                  >
                    {lb}
                  </button>
                ))}
              </div>
              {rsvpForm.attend === "yes" && (
                <>
                  <label style={S.formLabel}>{t.rsvp_meal}</label>
                  <div style={S.segRow}>
                    {[
                      ["yes", t.meal_yes],
                      ["no", t.meal_no],
                    ].map(([v, lb]) => (
                      <button
                        key={v}
                        onClick={() => setRsvpForm({ ...rsvpForm, meal: v })}
                        style={{
                          ...S.seg,
                          ...(rsvpForm.meal === v ? S.segOn : {}),
                        }}
                      >
                        {lb}
                      </button>
                    ))}
                  </div>
                  <label style={S.formLabel}>{t.rsvp_count}</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rsvpForm.count}
                    onChange={(e) =>
                      setRsvpForm({
                        ...rsvpForm,
                        count: Number(e.target.value),
                      })
                    }
                    style={S.input}
                  />
                </>
              )}
              <button
                onClick={submitRsvp}
                style={{ ...S.wideBtn, marginTop: 8 }}
              >
                {t.rsvp_submit}
              </button>
            </div>
          )}
        </section>

        {/* ---- GUESTBOOK ---- */}
        <section style={{ ...S.section, background: "#F6F1EA" }}>
          <p style={S.eyebrow}>GUESTBOOK</p>
          <h2 style={S.h2}>{t.guestbook_title}</h2>
          <div style={{ textAlign: "left" }}>
            <input
              value={gbForm.name}
              onChange={(e) => setGbForm({ ...gbForm, name: e.target.value })}
              placeholder={t.gb_placeholder_name}
              style={S.input}
            />
            <textarea
              value={gbForm.msg}
              onChange={(e) => setGbForm({ ...gbForm, msg: e.target.value })}
              placeholder={t.gb_placeholder_msg}
              rows={3}
              style={{ ...S.input, resize: "none" }}
            />
            <button onClick={submitGb} style={S.wideBtn}>
              {t.gb_submit}
            </button>
          </div>
          <div style={{ marginTop: 22 }}>
            {guestbook.length === 0 ? (
              <p style={S.sub}>{t.gb_empty}</p>
            ) : (
              guestbook.map((g, i) => (
                <div
                  key={i}
                  style={{
                    ...S.accountCard,
                    alignItems: "flex-start",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: C.accent,
                      fontWeight: 600,
                    }}
                  >
                    {g.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      whiteSpace: "pre-line",
                      textAlign: "left",
                    }}
                  >
                    {g.msg}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ---- FOOTER ---- */}
        <section style={{ ...S.section, paddingBottom: 64 }}>
          <div style={S.hairline} />
          <p
            style={{
              ...S.sub,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 15,
              letterSpacing: 3,
            }}
          >
            {names.g} & {names.b}
          </p>
          <p style={S.sub}>{t.dateShort}</p>
          <p style={{ ...S.sub, marginTop: 16 }}>{t.footer}</p>
        </section>
      </div>

      {lightbox !== null && (
        <div
          style={S.lightbox}
          onClick={() => setLightbox(null)}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <button
            type="button"
            aria-label="Previous"
            style={{ ...S.lightboxNav, ...S.lightboxNavLeft }}
            onClick={showPrevImage}
          >
            ‹
          </button>
          <img
            src={GALLERY_IMGS[lightbox]}
            alt=""
            style={S.lightboxImg}
          />
          <button
            type="button"
            aria-label="Next"
            style={{ ...S.lightboxNav, ...S.lightboxNavRight }}
            onClick={showNextImage}
          >
            ›
          </button>
        </div>
      )}
      <button
        onClick={toggleBgm}
        aria-label="BGM"
        style={{ ...S.bgmBtn, ...(bgmOn ? S.bgmBtnOn : {}) }}
      >
        {"♪"}
        <span style={{ fontSize: 9, letterSpacing: 1, display: "block" }}>
          {bgmOn ? "ON" : "OFF"}
        </span>
      </button>
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

/* ---------- styles ---------- */
function styles(bodyFont) {
  return {
    page: {
      minHeight: "100vh",
      background: "#EFEAE2",
      display: "flex",
      justifyContent: "center",
      fontFamily: bodyFont,
      color: C.ink,
      padding: "0 0 40px",
    },
    topBar: {
      position: "fixed",
      top: 12,
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(430px, calc(100% - 24px))",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      zIndex: 50,
    },
    langPill: {
      display: "flex",
      background: "rgba(255,255,255,.92)",
      border: `1px solid ${C.line}`,
      borderRadius: 999,
      padding: 3,
      boxShadow: "0 2px 10px rgba(0,0,0,.06)",
    },
    langBtn: {
      border: "none",
      background: "transparent",
      borderRadius: 999,
      padding: "6px 14px",
      fontSize: 12,
      color: C.sub,
      transition: "all .2s",
    },
    langBtnOn: { background: C.ink, color: "#fff" },
    card: {
      width: "min(430px, 100%)",
      background: C.paper,
      boxShadow: "0 0 40px rgba(0,0,0,.08)",
    },
    section: { padding: "56px 28px", textAlign: "center" },
    eyebrow: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 12,
      letterSpacing: 5,
      color: C.accent,
      margin: "0 0 14px",
    },
    h2: { fontSize: 19, fontWeight: 600, margin: "0 0 22px", letterSpacing: 1 },
    body: { fontSize: 15, lineHeight: 2, whiteSpace: "pre-line", margin: 0 },
    sub: {
      fontSize: 13,
      lineHeight: 1.9,
      color: C.sub,
      margin: 0,
      whiteSpace: "pre-line",
    },
    hairline: {
      width: 36,
      height: 1,
      background: C.accent,
      margin: "26px auto",
    },
    heroPhoto: {
      width: "100%",
      aspectRatio: "3/4",
      background: "#EFE7DB",
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 30,
    },
    heroPhotoLabel: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 12,
      letterSpacing: 4,
      color: "#B3A895",
    },
    heroNames: {
      fontSize: 24,
      fontWeight: 600,
      margin: 0,
      letterSpacing: 1,
      lineHeight: 1.6,
    },
    heroAnd: {
      display: "block",
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      fontSize: 15,
      color: C.accent,
      margin: "4px 0",
      letterSpacing: 2,
    },
    heroDate: { fontSize: 14, margin: "0 0 4px", color: C.ink },
    heroVenue: { fontSize: 13, color: C.sub, margin: 0 },
    famRow: {
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: "18px 16px",
      marginBottom: 12,
    },
    miniBtn: {
      border: `1px solid ${C.line}`,
      background: "#fff",
      color: C.ink,
      borderRadius: 999,
      padding: "6px 16px",
      fontSize: 12,
      textDecoration: "none",
    },
    calWrap: {
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 10,
      padding: "18px 14px",
    },
    calMonth: {
      fontFamily: "'Cormorant Garamond', serif",
      letterSpacing: 4,
      fontSize: 13,
      color: C.sub,
      margin: "0 0 12px",
    },
    calGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      rowGap: 8,
    },
    calHead: { fontSize: 11 },
    calCell: { fontSize: 13, padding: "6px 0", color: C.ink },
    calToday: {
      background: C.accent,
      color: "#fff",
      borderRadius: "50%",
      width: 30,
      height: 30,
      lineHeight: "18px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    galleryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
    galleryCell: {
      aspectRatio: "3/4",
      borderRadius: 4,
      overflow: "hidden",
      cursor: "pointer",
      background: "#EDE4D8",
    },
    photoImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    lightbox: {
      position: "fixed",
      inset: 0,
      background: "rgba(30,27,24,.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
      cursor: "pointer",
      padding: 16,
    },
    lightboxImg: {
      maxWidth: "100%",
      maxHeight: "92vh",
      borderRadius: 4,
      objectFit: "contain",
    },
    lightboxNav: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 44,
      height: 44,
      borderRadius: "50%",
      border: "none",
      background: "rgba(255,255,255,.15)",
      color: "#fff",
      fontSize: 28,
      lineHeight: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: 210,
    },
    lightboxNavLeft: { left: 8 },
    lightboxNavRight: { right: 8 },
    bgmBtn: {
      position: "fixed",
      right: "max(12px, calc(50% - 215px + 12px))",
      bottom: 20,
      width: 46,
      height: 46,
      borderRadius: "50%",
      border: `1px solid ${C.line}`,
      background: "rgba(255,255,255,.94)",
      color: C.sub,
      fontSize: 16,
      lineHeight: 1.1,
      boxShadow: "0 2px 12px rgba(0,0,0,.12)",
      zIndex: 60,
    },
    bgmBtnOn: { background: C.ink, color: "#fff", borderColor: C.ink },
    mapFrame: {
      width: "100%",
      height: 260,
      borderRadius: 8,
      overflow: "hidden",
      border: `1px solid ${C.line}`,
      margin: "18px 0 10px",
      background: "#EDE8E0",
    },
    mapPlaceholderKo: {
      width: "100%",
      height: 180,
      borderRadius: 8,
      border: `1px dashed ${C.line}`,
      background: "#F4EFE8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "18px 0 10px",
    },
    mapBtn: {
      flex: 1,
      border: `1px solid ${C.line}`,
      background: "#fff",
      color: C.ink,
      borderRadius: 8,
      padding: "11px 0",
      fontSize: 13,
      textDecoration: "none",
      textAlign: "center",
      fontWeight: 500,
    },
    wideBtn: {
      display: "block",
      width: "100%",
      background: C.ink,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "13px 0",
      fontSize: 14,
      letterSpacing: 1,
      textAlign: "center",
      textDecoration: "none",
    },
    transportLabel: {
      fontSize: 12,
      letterSpacing: 2,
      color: C.accent,
      margin: "18px 0 6px",
      fontWeight: 600,
    },
    transportBody: {
      fontSize: 13,
      lineHeight: 1.9,
      color: C.ink,
      whiteSpace: "pre-line",
      margin: 0,
    },
    accountCard: {
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: "14px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    formLabel: {
      display: "block",
      fontSize: 12,
      color: C.sub,
      letterSpacing: 1,
      margin: "14px 0 6px",
    },
    input: {
      width: "100%",
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: "11px 12px",
      fontSize: 14,
      background: "#fff",
      color: C.ink,
      outline: "none",
      marginBottom: 6,
    },
    segRow: { display: "flex", gap: 8 },
    seg: {
      flex: 1,
      border: `1px solid ${C.line}`,
      background: "#fff",
      color: C.sub,
      borderRadius: 8,
      padding: "10px 0",
      fontSize: 13,
      transition: "all .15s",
    },
    segOn: { background: C.ink, color: "#fff", borderColor: C.ink },
    toast: {
      position: "fixed",
      bottom: 30,
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(50,46,42,.92)",
      color: "#fff",
      borderRadius: 999,
      padding: "10px 22px",
      fontSize: 13,
      zIndex: 100,
    },
  };
}
