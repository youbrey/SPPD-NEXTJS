// lib/utils/tanggal.ts
// Port dari utils/tanggal.py — Utilitas tanggal Bahasa Indonesia

export const BULAN_INDONESIA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

export const BULAN_MAP: Record<string, number> = {
  Januari: 1, Februari: 2, Maret: 3, April: 4,
  Mei: 5, Juni: 6, Juli: 7, Agustus: 8,
  September: 9, Oktober: 10, November: 11, Desember: 12,
};

export const HARI_INDONESIA: Record<string, string> = {
  Monday: "Senin", Tuesday: "Selasa", Wednesday: "Rabu",
  Thursday: "Kamis", Friday: "Jumat", Saturday: "Sabtu", Sunday: "Minggu",
};

const HARI_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Format Date menjadi "D Bulan YYYY" dalam Bahasa Indonesia */
export function formatIndonesianDate(date: Date): string {
  if (!date) return "";
  return `${date.getDate()} ${BULAN_INDONESIA[date.getMonth() + 1]} ${date.getFullYear()}`;
}

/** Nama hari dalam Bahasa Indonesia dari objek Date */
export function getHariIndonesia(date: Date): string {
  return HARI_INDONESIA[HARI_EN[date.getDay()]] ?? HARI_EN[date.getDay()];
}

/** Parse string "D Bulan YYYY" menjadi objek Date */
export function parseIndonesianDate(dateStr: string): Date | null {
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = BULAN_MAP[parts[1]];
  const year = parseInt(parts[2], 10);
  if (!month || isNaN(day) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
}

/** Konversi angka menjadi teks bilangan Indonesia */
export function terbilang(n: number): string {
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (n < 12) return satuan[n] ?? String(n);
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100) {
    const sisa = n % 10 !== 0 ? " " + terbilang(n % 10) : "";
    return terbilang(Math.floor(n / 10)) + " Puluh" + sisa;
  }
  return String(n);
}

/** Hitung selisih hari antara dua tanggal (inklusif) */
export function hitungLamaHari(tanggalMulai: Date, tanggalSelesai: Date): number {
  const diffMs = tanggalSelesai.getTime() - tanggalMulai.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export interface PeriodItem {
  tujuan: string;
  hari: string;
  tanggal: string;
}

/**
 * Generate daftar {tujuan, hari, tanggal} berurutan per kota tujuan.
 * Jika kota pertama di luar Sulawesi Utara, mulai dari +1 hari (perjalanan).
 */
export function generatePeriods(
  tanggalMulaiStr: string,
  destinations: string[],
  isFirstCitySulut: boolean = true,
): PeriodItem[] {
  const startDate = parseIndonesianDate(tanggalMulaiStr);
  if (!startDate) return [];

  const offset = isFirstCitySulut ? 0 : 1;
  const baseDate = new Date(startDate);
  baseDate.setDate(baseDate.getDate() + offset);

  return destinations.map((dest, idx) => {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + idx);
    return {
      tujuan: dest,
      hari: getHariIndonesia(currentDate),
      tanggal: formatIndonesianDate(currentDate),
    };
  });
}

/** Format range tanggal: "25 s/d 27 Juni 2026" atau "25 Juni s/d 2 Juli 2026" */
export function formatRangeTanggal(mulai: Date, selesai: Date): string {
  const tglMulai = mulai.getDate();
  const tglSelesai = selesai.getDate();
  const bulanMulai = BULAN_INDONESIA[mulai.getMonth() + 1];
  const bulanSelesai = BULAN_INDONESIA[selesai.getMonth() + 1];
  const tahunMulai = mulai.getFullYear();
  const tahunSelesai = selesai.getFullYear();

  if (tahunMulai !== tahunSelesai) {
    return `${tglMulai} ${bulanMulai} ${tahunMulai} s/d ${tglSelesai} ${bulanSelesai} ${tahunSelesai}`;
  }
  if (bulanMulai !== bulanSelesai) {
    return `${tglMulai} ${bulanMulai} s/d ${tglSelesai} ${bulanSelesai} ${tahunMulai}`;
  }
  return `${tglMulai} s/d ${tglSelesai} ${bulanMulai} ${tahunMulai}`;
}
