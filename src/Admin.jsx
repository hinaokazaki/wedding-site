import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const ADMIN_T = {
  ko: {
    langLabel: "한국어",
    title: "참석자 명단",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력하세요",
    login: "입장",
    wrongPassword: "비밀번호가 올바르지 않습니다",
    logout: "로그아웃",
    loading: "불러오는 중...",
    loadError: "데이터를 불러오지 못했습니다",
    refresh: "새로고침",
    summaryTotal: "총 응답",
    summaryAttend: "참석",
    summaryNotAttend: "불참",
    summaryGuests: "참석 인원(본인 포함)",
    summaryMeal: "식사 예정",
    colName: "성함",
    colSide: "구분",
    colAttend: "참석 여부",
    colMeal: "식사",
    colCount: "인원",
    colDate: "응답 일시",
    groom: "신랑측",
    bride: "신부측",
    yes: "예",
    no: "아니오",
    dash: "-",
    empty: "아직 응답이 없습니다.",
  },
  ja: {
    langLabel: "日本語",
    title: "参加者名簿",
    passwordLabel: "パスワード",
    passwordPlaceholder: "パスワードを入力してください",
    login: "入場",
    wrongPassword: "パスワードが正しくありません",
    logout: "ログアウト",
    loading: "読み込み中...",
    loadError: "データの取得に失敗しました",
    refresh: "更新",
    summaryTotal: "総回答数",
    summaryAttend: "出席",
    summaryNotAttend: "欠席",
    summaryGuests: "出席人数(本人含む)",
    summaryMeal: "食事予定",
    colName: "お名前",
    colSide: "ご関係",
    colAttend: "ご出欠",
    colMeal: "お食事",
    colCount: "人数",
    colDate: "回答日時",
    groom: "新郎側",
    bride: "新婦側",
    yes: "はい",
    no: "いいえ",
    dash: "-",
    empty: "まだ回答がありません。",
  },
};

const C = {
  paper: "#FBF9F5",
  ink: "#44403A",
  sub: "#8C857B",
  accent: "#B08D7A",
  line: "#E9E2D8",
  card: "#FFFFFF",
};

const AUTH_KEY = "wedding_admin_authed";

export default function Admin() {
  const [lang, setLang] = useState("ko");
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(AUTH_KEY) === "1",
  );
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const t = ADMIN_T[lang];

  const fetchRows = async () => {
    setLoading(true);
    setLoadError(false);
    if (!supabase) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setLoadError(true);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchRows();
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    const correct = import.meta.env.VITE_ADMIN_PASSWORD;
    if (correct && pwInput === correct) {
      localStorage.setItem(AUTH_KEY, "1");
      setPwError(false);
      setAuthed(true);
    } else {
      setPwError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setRows([]);
  };

  const summary = useMemo(() => {
    const total = rows.length;
    const attendYes = rows.filter((r) => r.attend).length;
    const attendNo = total - attendYes;
    const totalGuests = rows
      .filter((r) => r.attend)
      .reduce((s, r) => s + (r.guest_count || 0), 0);
    const mealYes = rows.filter((r) => r.attend && r.meal).length;
    return { total, attendYes, attendNo, totalGuests, mealYes };
  }, [rows]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(lang === "ko" ? "ko-KR" : "ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const S = {
    page: {
      minHeight: "100vh",
      background: C.paper,
      color: C.ink,
      fontFamily: "'Noto Sans KR', 'Noto Sans JP', sans-serif",
      padding: "24px 16px 60px",
    },
    langRow: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      maxWidth: 960,
      margin: "0 auto 16px",
    },
    langBtn: (on) => ({
      border: `1px solid ${C.line}`,
      background: on ? C.ink : "transparent",
      color: on ? "#fff" : C.sub,
      borderRadius: 4,
      padding: "4px 10px",
      fontSize: 12,
      cursor: "pointer",
    }),
    center: {
      maxWidth: 360,
      margin: "80px auto",
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: 32,
      textAlign: "center",
    },
    h1: {
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: `1px solid ${C.line}`,
      borderRadius: 4,
      padding: "10px 12px",
      fontSize: 14,
      marginBottom: 12,
      background: "#fff",
      color: C.ink,
    },
    submitBtn: {
      width: "100%",
      background: C.accent,
      color: "#fff",
      border: "none",
      borderRadius: 4,
      padding: "10px 12px",
      fontSize: 14,
      cursor: "pointer",
    },
    error: { color: "#B4443A", fontSize: 12, marginBottom: 12 },
    wrap: { maxWidth: 960, margin: "0 auto" },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    smallBtn: {
      border: `1px solid ${C.line}`,
      background: "transparent",
      color: C.sub,
      borderRadius: 4,
      padding: "6px 12px",
      fontSize: 12,
      cursor: "pointer",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: 8,
      marginBottom: 24,
    },
    summaryCard: {
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      padding: "14px 12px",
      textAlign: "center",
    },
    summaryNum: { fontSize: 22, fontWeight: 700, color: C.accent },
    summaryLabel: { fontSize: 12, color: C.sub, marginTop: 4 },
    tableWrap: {
      overflowX: "auto",
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 8,
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      borderBottom: `1px solid ${C.line}`,
      color: C.sub,
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    td: {
      padding: "10px 12px",
      borderBottom: `1px solid ${C.line}`,
      whiteSpace: "nowrap",
    },
    empty: { textAlign: "center", padding: 40, color: C.sub },
  };

  const LangSwitcher = () => (
    <div style={S.langRow}>
      {["ko", "ja"].map((l) => (
        <button
          key={l}
          style={S.langBtn(lang === l)}
          onClick={() => setLang(l)}
        >
          {ADMIN_T[l].langLabel}
        </button>
      ))}
    </div>
  );

  if (!authed) {
    return (
      <div style={S.page}>
        <LangSwitcher />
        <div style={S.center}>
          <h1 style={S.h1}>{t.title}</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              placeholder={t.passwordPlaceholder}
              style={S.input}
              autoFocus
            />
            {pwError && <p style={S.error}>{t.wrongPassword}</p>}
            <button type="submit" style={S.submitBtn}>
              {t.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <LangSwitcher />
      <div style={S.wrap}>
        <div style={S.headerRow}>
          <h1 style={{ ...S.h1, marginBottom: 0, textAlign: "left" }}>
            {t.title}
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.smallBtn} onClick={fetchRows}>
              {t.refresh}
            </button>
            <button style={S.smallBtn} onClick={handleLogout}>
              {t.logout}
            </button>
          </div>
        </div>

        {loading ? (
          <p style={S.empty}>{t.loading}</p>
        ) : loadError ? (
          <p style={S.empty}>{t.loadError}</p>
        ) : (
          <>
            <div style={S.summaryGrid}>
              <div style={S.summaryCard}>
                <div style={S.summaryNum}>{summary.total}</div>
                <div style={S.summaryLabel}>{t.summaryTotal}</div>
              </div>
              <div style={S.summaryCard}>
                <div style={S.summaryNum}>{summary.attendYes}</div>
                <div style={S.summaryLabel}>{t.summaryAttend}</div>
              </div>
              <div style={S.summaryCard}>
                <div style={S.summaryNum}>{summary.attendNo}</div>
                <div style={S.summaryLabel}>{t.summaryNotAttend}</div>
              </div>
              <div style={S.summaryCard}>
                <div style={S.summaryNum}>{summary.totalGuests}</div>
                <div style={S.summaryLabel}>{t.summaryGuests}</div>
              </div>
              <div style={S.summaryCard}>
                <div style={S.summaryNum}>{summary.mealYes}</div>
                <div style={S.summaryLabel}>{t.summaryMeal}</div>
              </div>
            </div>

            {rows.length === 0 ? (
              <p style={S.empty}>{t.empty}</p>
            ) : (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>{t.colName}</th>
                      <th style={S.th}>{t.colSide}</th>
                      <th style={S.th}>{t.colAttend}</th>
                      <th style={S.th}>{t.colMeal}</th>
                      <th style={S.th}>{t.colCount}</th>
                      <th style={S.th}>{t.colDate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td style={S.td}>{r.name}</td>
                        <td style={S.td}>
                          {r.side === "groom" ? t.groom : t.bride}
                        </td>
                        <td style={S.td}>{r.attend ? t.yes : t.no}</td>
                        <td style={S.td}>
                          {r.attend
                            ? r.meal
                              ? t.yes
                              : t.no
                            : t.dash}
                        </td>
                        <td style={S.td}>{r.attend ? r.guest_count : t.dash}</td>
                        <td style={S.td}>{formatDate(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
