// app/(dashboard)/perjalanan-dinas/page.tsx
// SIPS Web — Halaman Perjalanan Dinas (Next.js 14, React, Tailwind)
// Ini adalah file LENGKAP siap pakai di StackBlitz / Vercel

"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";

// ─── TIPE DATA ────────────────────────────────────────────────────────────────

type KategoriDPRD = "Pimpinan DPRD" | "Komisi I" | "Komisi II" | "Komisi III";
type ModeSurat = "dprd" | "setwan";
type JenisSurat = "perjalanan_dinas" | "undangan_paripurna";

interface PersonelDPRD {
  id: string;
  nama: string;
  jabatan: string;
  kategori: KategoriDPRD;
  checked: boolean;
}

interface PersonelASN {
  id: string;
  nama: string;
  nip: string;
  pangkat: string;
  jabatan: string;
  checked: boolean;
}

interface FormData {
  nomorSurat: string;
  nomorSuratAsn: string;
  nomorPemberitahuanDprd: string;
  nomorPemberitahuanAsn: string;
  nomorSpdDprd: string;
  nomorSpdAsn: string;
  dasarSuratTugas: string;
  materi: string;
  jenisPerjalanan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kotaTujuan: string[];
  jabatanTtd: string;
  namaTtd: string;
}

// ─── DATA DUMMY (akan diganti dengan fetch dari API) ─────────────────────────

const DUMMY_DPRD: PersonelDPRD[] = [
  { id: "1", nama: "VIVY JEANET GANAP, S.E.", jabatan: "KETUA", kategori: "Pimpinan DPRD", checked: false },
  { id: "2", nama: "Drs. HENGKY RAWUNG", jabatan: "WAKIL KETUA I", kategori: "Pimpinan DPRD", checked: false },
  { id: "3", nama: "FERLY RUNTUWENE, S.T.", jabatan: "WAKIL KETUA II", kategori: "Pimpinan DPRD", checked: false },
  { id: "4", nama: "JIMMY LALAMENTIK", jabatan: "KETUA KOMISI I", kategori: "Komisi I", checked: false },
  { id: "5", nama: "GRACE SANGER, S.E.", jabatan: "WAKIL KETUA KOMISI I", kategori: "Komisi I", checked: false },
  { id: "6", nama: "RONNY MAENGKOM", jabatan: "ANGGOTA KOMISI I", kategori: "Komisi I", checked: false },
  { id: "7", nama: "BETTY KAUNANG", jabatan: "KETUA KOMISI II", kategori: "Komisi II", checked: false },
  { id: "8", nama: "FERRY WATUPONGOH", jabatan: "ANGGOTA KOMISI II", kategori: "Komisi II", checked: false },
  { id: "9", nama: "ALEX TAMBOTO", jabatan: "KETUA KOMISI III", kategori: "Komisi III", checked: false },
  { id: "10", nama: "LINDA MARAMIS, S.Sos.", jabatan: "ANGGOTA KOMISI III", kategori: "Komisi III", checked: false },
];

const DUMMY_ASN: PersonelASN[] = [
  { id: "a1", nama: "Drs. ALBERT M. SARESE, M.Si.", nip: "19681011 199010 1 002", pangkat: "PEMBINA UTAMA MUDA IV/c", jabatan: "Sekretaris DPRD", checked: false },
  { id: "a2", nama: "MELKY TAMPENAWAS, S.H.", nip: "19750615 200112 1 003", pangkat: "PENATA III/c", jabatan: "Kabag Persidangan", checked: false },
  { id: "a3", nama: "OLIVIA SENDUK, S.E.", nip: "19820318 200604 2 001", pangkat: "PENATA MUDA III/a", jabatan: "Staf Keuangan", checked: false },
];

const KOTA_DATABASE = [
  "Kota Manado", "Kota Bitung", "Kota Tomohon", "Kota Kotamobagu",
  "Kabupaten Minahasa", "Kabupaten Minahasa Utara", "Kabupaten Minahasa Selatan",
  "DKI Jakarta", "Kota Surabaya", "Kota Bandung", "Kota Makassar", "Kota Denpasar",
];

const BULAN_INDONESIA = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const HARI_MAP: Record<number, string> = {
  0: "Minggu", 1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat", 6: "Sabtu"
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatIdDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth() + 1]} ${d.getFullYear()}`;
}

function hitungHari(mulai: string, selesai: string): number {
  if (!mulai || !selesai) return 0;
  const diff = new Date(selesai).getTime() - new Date(mulai).getTime();
  return Math.max(0, Math.round(diff / 86400000) + 1);
}

// ─── KOMPONEN ATOM ────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Input({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        {...props}
        className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white
          text-slate-800 placeholder-slate-400 transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 ${props.className ?? ""}`}
      />
    </div>
  );
}

function Textarea({ label, required, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; required?: boolean }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        {...props}
        className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white
          text-slate-800 placeholder-slate-400 transition-all resize-none
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-slate-300 ${props.className ?? ""}`}
      />
    </div>
  );
}

function Select({ label, required, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string; required?: boolean; options: { value: string; label: string }[];
}) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select
        {...props}
        className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white
          text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          focus:border-indigo-400 hover:border-slate-300 appearance-none cursor-pointer ${props.className ?? ""}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ activeMenu, onMenuClick, collapsed, onToggle }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    perjalanan: true,
    undangan: false,
  });

  const toggle = (key: string) => setOpenMenus(p => ({ ...p, [key]: !p[key] }));

  const menuItem = (id: string, icon: string, label: string, parent?: string) => {
    const isActive = activeMenu === id;
    return (
      <button
        key={id}
        onClick={() => onMenuClick(id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative
          ${isActive
            ? "text-indigo-700 bg-indigo-50 font-semibold"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          } ${parent ? "pl-10" : ""}`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-600 rounded-r" />
        )}
        <span className="text-base flex-shrink-0">{icon}</span>
        {!collapsed && <span className="truncate">{label}</span>}
      </button>
    );
  };

  return (
    <aside className={`h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300
      ${collapsed ? "w-16" : "w-60"} flex-shrink-0`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">SIPS</p>
              <p className="text-xs text-slate-400 leading-none mt-0.5">DPRD Kota Bitung</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
            ◀
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {menuItem("dashboard", "🏠", "Dashboard")}

        {/* Perjalanan Dinas */}
        <button
          onClick={() => toggle("perjalanan")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600
            hover:text-slate-800 hover:bg-slate-50 transition-all`}
        >
          <span className="text-base">✈️</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left font-medium">Perjalanan Dinas</span>
              <span className="text-xs transition-transform duration-200" style={{ transform: openMenus.perjalanan ? "rotate(180deg)" : "" }}>▾</span>
            </>
          )}
        </button>
        {openMenus.perjalanan && !collapsed && (
          <div className="bg-slate-50/50">
            {menuItem("perjalanan_dprd", "🏛️", "DPRD", "perjalanan")}
            {menuItem("perjalanan_setwan", "👔", "Setwan / ASN", "perjalanan")}
          </div>
        )}

        {/* Undangan */}
        <button
          onClick={() => toggle("undangan")}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
        >
          <span className="text-base">📨</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left font-medium">Surat Undangan</span>
              <span className="text-xs transition-transform duration-200" style={{ transform: openMenus.undangan ? "rotate(180deg)" : "" }}>▾</span>
            </>
          )}
        </button>
        {openMenus.undangan && !collapsed && (
          <div className="bg-slate-50/50">
            {menuItem("undangan_paripurna", "🏛️", "Rapat Paripurna", "undangan")}
            {menuItem("undangan_biasa", "📋", "Undangan Biasa", "undangan")}
          </div>
        )}

        <div className="border-t border-slate-100 my-2" />
        {menuItem("personel", "👥", "Data Personel")}
        {menuItem("riwayat", "📂", "Riwayat Surat")}
        {menuItem("pengaturan", "⚙️", "Pengaturan")}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs">👤</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">Operator</p>
              <p className="text-xs text-slate-400">v7.0</p>
            </div>
            <button onClick={onToggle} className="ml-auto p-1 rounded hover:bg-slate-100 text-slate-400 text-xs">▶</button>
          </div>
        ) : (
          <button onClick={onToggle} className="w-full flex justify-center p-1 rounded hover:bg-slate-100 text-slate-400 text-xs">▶</button>
        )}
      </div>
    </aside>
  );
}

// ─── PANEL PERSONEL ───────────────────────────────────────────────────────────

interface PersonelPanelProps {
  dprd: PersonelDPRD[];
  asn: PersonelASN[];
  onToggleDPRD: (id: string) => void;
  onToggleASN: (id: string) => void;
  mode: ModeSurat;
}

function PersonelPanel({ dprd, asn, onToggleDPRD, onToggleASN, mode }: PersonelPanelProps) {
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const KATEGORI_LIST = ["Pimpinan DPRD", "Komisi I", "Komisi II", "Komisi III"];

  const filteredDPRD = useMemo(() => {
    return dprd.filter(p => {
      const matchKat = filterKategori === "semua" || p.kategori === filterKategori;
      const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase());
      return matchKat && matchSearch;
    });
  }, [dprd, filterKategori, searchQuery]);

  const selectedDPRDCount = dprd.filter(p => p.checked).length;
  const selectedASNCount = asn.filter(p => p.checked).length;

  return (
    <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">Pilih Pelaksana</h3>
          <div className="flex gap-1.5">
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              {selectedDPRDCount} DPRD
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              {selectedASNCount} ASN
            </span>
          </div>
        </div>
        <input
          placeholder="Cari nama..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
        />
      </div>

      {/* Filter Kategori */}
      <div className="px-3 py-2 border-b border-slate-200 flex gap-1 flex-wrap">
        {["semua", ...KATEGORI_LIST].map(k => (
          <button
            key={k}
            onClick={() => setFilterKategori(k)}
            className={`text-xs px-2 py-1 rounded-md transition-all ${
              filterKategori === k
                ? "bg-indigo-600 text-white font-medium"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {k === "semua" ? "Semua" : k.replace("Pimpinan DPRD", "Pimpinan")}
          </button>
        ))}
      </div>

      {/* Daftar Personel */}
      <div className="flex-1 overflow-y-auto">
        {/* DPRD Section */}
        <div className="px-3 pt-3 pb-1">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>🏛️</span> Anggota DPRD
          </p>
        </div>
        {filteredDPRD.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Tidak ada hasil</p>
        ) : (
          filteredDPRD.map(p => (
            <label
              key={p.id}
              className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50
                ${p.checked ? "bg-indigo-50/60" : ""}`}
            >
              <input
                type="checkbox"
                checked={p.checked}
                onChange={() => onToggleDPRD(p.id)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
              />
              <div className="min-w-0">
                <p className={`text-xs leading-tight ${p.checked ? "text-indigo-800 font-medium" : "text-slate-700"}`}>
                  {p.nama}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{p.jabatan}</p>
                <span className="inline-block text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-1">
                  {p.kategori}
                </span>
              </div>
            </label>
          ))
        )}

        {/* ASN Section */}
        <div className="px-3 pt-4 pb-1 border-t border-slate-100 mt-2">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>👔</span> ASN / Setwan
          </p>
        </div>
        {asn.filter(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
          <label
            key={p.id}
            className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50
              ${p.checked ? "bg-emerald-50/60" : ""}`}
          >
            <input
              type="checkbox"
              checked={p.checked}
              onChange={() => onToggleASN(p.id)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 cursor-pointer accent-emerald-600"
            />
            <div className="min-w-0">
              <p className={`text-xs leading-tight ${p.checked ? "text-emerald-800 font-medium" : "text-slate-700"}`}>
                {p.nama}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{p.pangkat}</p>
              <p className="text-xs text-slate-400">{p.jabatan}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Select All / Clear */}
      <div className="border-t border-slate-200 px-4 py-2 flex gap-2">
        <button
          onClick={() => filteredDPRD.forEach(p => !p.checked && onToggleDPRD(p.id))}
          className="flex-1 text-xs py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
        >
          Pilih Semua
        </button>
        <button
          onClick={() => {
            dprd.filter(p => p.checked).forEach(p => onToggleDPRD(p.id));
            asn.filter(p => p.checked).forEach(p => onToggleASN(p.id));
          }}
          className="flex-1 text-xs py-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Hapus Pilihan
        </button>
      </div>
    </div>
  );
}

// ─── LIVE PREVIEW ─────────────────────────────────────────────────────────────

interface PreviewProps {
  formData: FormData;
  selectedDPRD: PersonelDPRD[];
  selectedASN: PersonelASN[];
  mode: ModeSurat;
}

function LivePreview({ formData, selectedDPRD, selectedASN, mode }: PreviewProps) {
  const [activeTab, setActiveTab] = useState("surat_tugas");
  const lamaHari = hitungHari(formData.tanggalMulai, formData.tanggalSelesai);

  const tabs = [
    { id: "surat_tugas", label: mode === "dprd" ? "Surat Tugas DPRD" : "Surat Tugas ASN" },
    { id: "pemberitahuan", label: "Pemberitahuan" },
    { id: "spd", label: "SPD" },
    { id: "daftar_hadir", label: "Daftar Hadir" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px
              ${activeTab === tab.id
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preview content */}
      <div className="p-4 bg-slate-50 min-h-48">
        <div className="bg-white shadow-sm border border-slate-100 rounded-lg p-6 max-w-2xl mx-auto text-xs font-serif">
          {/* Kop surat simulasi */}
          <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
            <p className="font-bold text-sm uppercase tracking-wide">DEWAN PERWAKILAN RAKYAT DAERAH</p>
            <p className="font-bold text-sm uppercase tracking-wide">KOTA BITUNG</p>
            <p className="text-xs text-slate-500">Jl. Sam Ratulangi No. 1, Kota Bitung, Sulawesi Utara</p>
          </div>

          {/* Judul */}
          <div className="text-center mb-4">
            <p className="font-bold underline uppercase">
              {activeTab === "surat_tugas" && "SURAT TUGAS"}
              {activeTab === "pemberitahuan" && "SURAT PEMBERITAHUAN"}
              {activeTab === "spd" && "SURAT PERINTAH DINAS"}
              {activeTab === "daftar_hadir" && "DAFTAR HADIR"}
            </p>
            <p className="text-slate-600 mt-1">
              Nomor: {formData.nomorSurat || "[Nomor Surat]"}
            </p>
          </div>

          {/* Isi */}
          {activeTab === "surat_tugas" && (
            <div className="space-y-1 text-slate-700">
              <p>Dasar: {formData.dasarSuratTugas || <span className="text-slate-300 italic">Belum diisi</span>}</p>
              <p className="mt-2">Menugaskan:</p>
              {selectedDPRD.length === 0 && selectedASN.length === 0 ? (
                <p className="text-slate-300 italic ml-4">Pilih pelaksana di panel kanan →</p>
              ) : (
                <ol className="ml-4 space-y-0.5">
                  {selectedDPRD.map((p, i) => (
                    <li key={p.id}>{i + 1}. {p.nama} — {p.jabatan}</li>
                  ))}
                  {selectedASN.map((p, i) => (
                    <li key={p.id}>{selectedDPRD.length + i + 1}. {p.nama} — {p.jabatan}</li>
                  ))}
                </ol>
              )}
              <div className="mt-2 space-y-0.5">
                <p>Untuk: {formData.materi || <span className="text-slate-300 italic">Belum diisi</span>}</p>
                <p>Tujuan: {formData.kotaTujuan.join(", ") || <span className="text-slate-300 italic">Belum dipilih</span>}</p>
                <p>
                  Tanggal: {formData.tanggalMulai ? formatIdDate(formData.tanggalMulai) : "—"} s/d{" "}
                  {formData.tanggalSelesai ? formatIdDate(formData.tanggalSelesai) : "—"}
                  {lamaHari > 0 && ` (${lamaHari} hari)`}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="text-center">
                  <p>Bitung, {formatIdDate(new Date().toISOString().split("T")[0])}</p>
                  <p>{formData.jabatanTtd || "[Jabatan Penandatangan]"}</p>
                  <p className="mt-10">{formData.namaTtd || "[Nama Penandatangan]"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "surat_tugas" && (
            <div className="text-center text-slate-400 py-6">
              <p className="text-2xl mb-2">📄</p>
              <p>Preview akan tampil setelah semua data diisi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FORM PERJALANAN DINAS ────────────────────────────────────────────────────

function PerjalananDinasForm() {
  const [mode, setMode] = useState<ModeSurat>("dprd");
  const [kotaTujuanInput, setKotaTujuanInput] = useState("");
  const [kotaSuggestions, setKotaSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nomorSurat: "",
    nomorSuratAsn: "",
    nomorPemberitahuanDprd: "",
    nomorPemberitahuanAsn: "",
    nomorSpdDprd: "",
    nomorSpdAsn: "",
    dasarSuratTugas: "",
    materi: "",
    jenisPerjalanan: "Dalam Daerah",
    tanggalMulai: "",
    tanggalSelesai: "",
    kotaTujuan: [],
    jabatanTtd: "KETUA DPRD KOTA BITUNG",
    namaTtd: "VIVY JEANET GANAP, S.E.",
  });

  const [dprdList, setDprdList] = useState<PersonelDPRD[]>(DUMMY_DPRD);
  const [asnList, setAsnList] = useState<PersonelASN[]>(DUMMY_ASN);

  const setField = useCallback((key: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleDPRD = useCallback((id: string) => {
    setDprdList(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  }, []);

  const toggleASN = useCallback((id: string) => {
    setAsnList(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  }, []);

  const selectedDPRD = useMemo(() => dprdList.filter(p => p.checked), [dprdList]);
  const selectedASN = useMemo(() => asnList.filter(p => p.checked), [asnList]);

  const addKota = (kota: string) => {
    const trimmed = kota.trim();
    if (trimmed && !formData.kotaTujuan.includes(trimmed)) {
      setField("kotaTujuan", [...formData.kotaTujuan, trimmed]);
    }
    setKotaTujuanInput("");
    setKotaSuggestions([]);
  };

  const removeKota = (idx: number) => {
    setField("kotaTujuan", formData.kotaTujuan.filter((_, i) => i !== idx));
  };

  const handleKotaInput = (val: string) => {
    setKotaTujuanInput(val);
    if (val.length >= 2) {
      setKotaSuggestions(KOTA_DATABASE.filter(k => k.toLowerCase().includes(val.toLowerCase())).slice(0, 6));
    } else {
      setKotaSuggestions([]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateSuccess(false);
    // Simulasi API call
    await new Promise(r => setTimeout(r, 2000));
    setIsGenerating(false);
    setGenerateSuccess(true);
    setTimeout(() => setGenerateSuccess(false), 5000);
  };

  const lamaHari = hitungHari(formData.tanggalMulai, formData.tanggalSelesai);
  const canGenerate = formData.nomorSurat && formData.tanggalMulai && formData.tanggalSelesai &&
    formData.kotaTujuan.length > 0 && (selectedDPRD.length > 0 || selectedASN.length > 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Surat Perjalanan Dinas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Buat surat tugas, SPD, pemberitahuan & daftar hadir sekaligus</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode tab */}
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setMode("dprd")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${mode === "dprd" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              🏛️ DPRD
            </button>
            <button
              onClick={() => setMode("setwan")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${mode === "setwan" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              👔 Setwan
            </button>
            <button
              onClick={() => setMode("dprd")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${mode === "dprd" && mode === "setwan" ? "bg-white text-purple-700 shadow-sm" : ""} 
                text-slate-500 hover:text-slate-700`}
            >
              ⚡ Gabungan
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 max-w-3xl">

            {/* Nomor Surat */}
            <section>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded text-center text-xs leading-5">1</span>
                Nomor Surat
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nomor Surat Tugas DPRD"
                  required
                  placeholder="Contoh: 001/ST.DPRD/VI/2026"
                  value={formData.nomorSurat}
                  onChange={e => setField("nomorSurat", e.target.value)}
                />
                <Input
                  label="Nomor Surat Tugas Setwan"
                  placeholder="Contoh: 001/ST.SETWAN/VI/2026"
                  value={formData.nomorSuratAsn}
                  onChange={e => setField("nomorSuratAsn", e.target.value)}
                />
                <Input
                  label="Nomor Pemberitahuan DPRD"
                  placeholder="Contoh: 001/PBT.DPRD/VI/2026"
                  value={formData.nomorPemberitahuanDprd}
                  onChange={e => setField("nomorPemberitahuanDprd", e.target.value)}
                />
                <Input
                  label="Nomor Pemberitahuan Setwan"
                  placeholder="Contoh: 001/PBT.SETWAN/VI/2026"
                  value={formData.nomorPemberitahuanAsn}
                  onChange={e => setField("nomorPemberitahuanAsn", e.target.value)}
                />
                <Input
                  label="Nomor SPD DPRD"
                  placeholder="Contoh: 010/SPD/VI/2026/"
                  value={formData.nomorSpdDprd}
                  onChange={e => setField("nomorSpdDprd", e.target.value)}
                />
                <Input
                  label="Nomor SPD Setwan (ASN)"
                  placeholder="Contoh: 020/SPD/VI/2026/"
                  value={formData.nomorSpdAsn}
                  onChange={e => setField("nomorSpdAsn", e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <span>ℹ️</span> SPD DPRD: semua anggota pakai nomor sama · SPD ASN: nomor otomatis berurutan
              </p>
            </section>

            {/* Dasar & Materi */}
            <section>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded text-center text-xs leading-5">2</span>
                Isi Surat
              </h2>
              <div className="space-y-3">
                <Textarea
                  label="Dasar Surat Tugas"
                  placeholder="Contoh: 1. Peraturan Dewan Perwakilan Rakyat Daerah..."
                  rows={3}
                  value={formData.dasarSuratTugas}
                  onChange={e => setField("dasarSuratTugas", e.target.value)}
                />
                <Textarea
                  label="Materi / Maksud dan Tujuan"
                  required
                  placeholder="Contoh: Menghadiri Rapat Koordinasi..."
                  rows={3}
                  value={formData.materi}
                  onChange={e => setField("materi", e.target.value)}
                />
                <Select
                  label="Jenis Perjalanan"
                  value={formData.jenisPerjalanan}
                  onChange={e => setField("jenisPerjalanan", e.target.value)}
                  options={[
                    { value: "Dalam Daerah", label: "Dalam Daerah" },
                    { value: "Luar Daerah", label: "Luar Daerah" },
                    { value: "Luar Negeri", label: "Luar Negeri" },
                  ]}
                />
              </div>
            </section>

            {/* Tanggal */}
            <section>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded text-center text-xs leading-5">3</span>
                Tanggal Pelaksanaan
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tanggal Mulai"
                  required
                  type="date"
                  value={formData.tanggalMulai}
                  onChange={e => setField("tanggalMulai", e.target.value)}
                />
                <Input
                  label="Tanggal Selesai"
                  required
                  type="date"
                  value={formData.tanggalSelesai}
                  onChange={e => setField("tanggalSelesai", e.target.value)}
                />
              </div>
              {lamaHari > 0 && (
                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                  <span className="text-blue-500">📅</span>
                  <p className="text-xs text-blue-700 font-medium">
                    Durasi: <strong>{lamaHari} hari</strong>
                    {" · "}{formatIdDate(formData.tanggalMulai)} s/d {formatIdDate(formData.tanggalSelesai)}
                  </p>
                </div>
              )}
            </section>

            {/* Kota Tujuan */}
            <section>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded text-center text-xs leading-5">4</span>
                Kota Tujuan Bertugas
              </h2>
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    value={kotaTujuanInput}
                    onChange={e => handleKotaInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); addKota(kotaTujuanInput); }
                    }}
                    placeholder="Ketik nama kota atau kabupaten..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  <button
                    onClick={() => addKota(kotaTujuanInput)}
                    disabled={!kotaTujuanInput.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    + Tambah
                  </button>
                </div>
                {/* Autocomplete */}
                {kotaSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-10 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {kotaSuggestions.map(kota => (
                      <button
                        key={kota}
                        onClick={() => addKota(kota)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        📍 {kota}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Kota dipilih */}
              {formData.kotaTujuan.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {formData.kotaTujuan.map((kota, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs text-slate-400 font-mono w-5">{idx + 1}.</span>
                      <span className="text-xs font-medium text-slate-700 flex-1">📍 {kota}</span>
                      {formData.tanggalMulai && (
                        <span className="text-xs text-slate-400">
                          {(() => {
                            const d = new Date(formData.tanggalMulai);
                            d.setDate(d.getDate() + idx);
                            return `${HARI_MAP[d.getDay()]}, ${formatIdDate(d.toISOString().split("T")[0])}`;
                          })()}
                        </span>
                      )}
                      <button
                        onClick={() => removeKota(idx)}
                        className="text-red-400 hover:text-red-600 text-xs ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Penandatangan */}
            <section>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded text-center text-xs leading-5">5</span>
                Penandatangan
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Jabatan Penandatangan"
                  placeholder="Contoh: KETUA DPRD KOTA BITUNG"
                  value={formData.jabatanTtd}
                  onChange={e => setField("jabatanTtd", e.target.value)}
                />
                <Input
                  label="Nama Penandatangan"
                  placeholder="Contoh: VIVY JEANET GANAP, S.E."
                  value={formData.namaTtd}
                  onChange={e => setField("namaTtd", e.target.value)}
                />
              </div>
            </section>

            {/* Live Preview */}
            <section>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-slate-400 text-white rounded text-center text-xs leading-5">👁</span>
                Preview Surat
              </h2>
              <LivePreview
                formData={formData}
                selectedDPRD={selectedDPRD}
                selectedASN={selectedASN}
                mode={mode}
              />
            </section>

            {/* Generate Button */}
            <section className="pb-8">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className={`w-full py-4 rounded-xl text-white font-semibold text-sm transition-all duration-200
                  flex items-center justify-center gap-2 shadow-sm
                  ${canGenerate && !isGenerating
                    ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-98"
                    : "bg-slate-300 cursor-not-allowed"
                  }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sedang Membuat Dokumen...
                  </>
                ) : generateSuccess ? (
                  <>✅ Dokumen Berhasil Dibuat — Klik untuk Unduh</>
                ) : (
                  <>🖨️ Generate Semua Dokumen ({selectedDPRD.length + selectedASN.length} pelaksana)</>
                )}
              </button>
              {!canGenerate && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  Lengkapi: nomor surat, tanggal, kota tujuan, dan minimal 1 pelaksana
                </p>
              )}
              {generateSuccess && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium text-center">
                    ✅ Semua dokumen berhasil digenerate! Paket .zip berisi Surat Tugas, Pemberitahuan, SPD & Daftar Hadir siap diunduh.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Panel Personel */}
        <PersonelPanel
          dprd={dprdList}
          asn={asnList}
          onToggleDPRD={toggleDPRD}
          onToggleASN={toggleASN}
          mode={mode}
        />
      </div>
    </div>
  );
}

// ─── HALAMAN DASHBOARD ────────────────────────────────────────────────────────

function DashboardPage() {
  const stats = [
    { label: "Surat Dibuat Bulan Ini", value: "47", icon: "📄", color: "indigo" },
    { label: "Total Personel DPRD", value: "30", icon: "🏛️", color: "blue" },
    { label: "Total Personel ASN", value: "12", icon: "👔", color: "emerald" },
    { label: "Riwayat Surat", value: "312", icon: "📂", color: "amber" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Selamat Datang di SIPS</h1>
        <p className="text-sm text-slate-500 mt-1">Sistem Informasi Persuratan DPRD Kota Bitung · v7.0</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Surat Terbaru</h3>
          <div className="space-y-2">
            {["001/ST.DPRD/VI/2026", "002/ST.DPRD/VI/2026", "003/ST.DPRD/VI/2026"].map((n, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-xs font-medium text-slate-700">{n}</p>
                  <p className="text-xs text-slate-400">Perjalanan Dinas DPRD</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Generated</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "✈️", label: "Perjalanan Dinas DPRD", desc: "Buat surat perjalanan" },
              { icon: "📨", label: "Undangan Paripurna", desc: "Buat surat undangan" },
              { icon: "👥", label: "Import Personel", desc: "Upload file Excel" },
              { icon: "📂", label: "Riwayat Surat", desc: "Lihat semua riwayat" },
            ].map((item, i) => (
              <button key={i} className="text-left p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all">
                <p className="text-lg">{item.icon}</p>
                <p className="text-xs font-medium text-slate-700 mt-1">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function SIPSApp() {
  const [activeMenu, setActiveMenu] = useState("perjalanan_dprd");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    if (activeMenu === "dashboard") return <DashboardPage />;
    if (activeMenu === "perjalanan_dprd" || activeMenu === "perjalanan_setwan") {
      return <PerjalananDinasForm />;
    }
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-slate-500 font-medium">Halaman dalam pengembangan</p>
          <p className="text-xs text-slate-400 mt-1">Fitur "{activeMenu}" akan segera tersedia</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={setActiveMenu}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>SIPS</span>
            <span>›</span>
            <span className="text-slate-600 font-medium capitalize">
              {activeMenu.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="text-slate-500">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-700">Admin DPRD</p>
                <p className="text-xs text-slate-400">Operator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
