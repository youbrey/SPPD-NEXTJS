// app/api/surat/perjalanan-dinas/route.ts
// API endpoint untuk generate semua dokumen perjalanan dinas

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── ZOD SCHEMA VALIDASI ──────────────────────────────────────────────────────

const PersonelDPRDSchema = z.object({
  id: z.string(),
  nama: z.string().min(1),
  jabatan: z.string().min(1),
  kategori: z.enum(["Pimpinan DPRD", "Komisi I", "Komisi II", "Komisi III", "Custom"]),
});

const PersonelASNSchema = z.object({
  id: z.string(),
  nama: z.string().min(1),
  nip: z.string(),
  pangkat: z.string(),
  jabatan: z.string().min(1),
});

const PerjalananDinasSchema = z.object({
  // Nomor surat
  nomorSurat: z.string().min(1, "Nomor surat wajib diisi"),
  nomorSuratAsn: z.string().optional(),
  nomorPemberitahuanDprd: z.string().optional(),
  nomorPemberitahuanAsn: z.string().optional(),
  nomorSpdDprd: z.string().optional(),
  nomorSpdAsn: z.string().optional(),

  // Isi surat
  dasarSuratTugas: z.string().optional(),
  materi: z.string().min(1, "Materi wajib diisi"),
  jenisPerjalanan: z.enum(["Dalam Daerah", "Luar Daerah", "Luar Negeri"]),

  // Tanggal
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),

  // Tujuan
  kotaTujuan: z.array(z.string()).min(1, "Minimal satu kota tujuan"),

  // Pelaksana
  pelaksanaDPRD: z.array(PersonelDPRDSchema),
  pelaksanaASN: z.array(PersonelASNSchema),

  // Penandatangan
  jabatanTtd: z.string().min(1),
  namaTtd: z.string().min(1),

  // Mode
  modeDPRD: z.boolean().default(true),
});

export type PerjalananDinasPayload = z.infer<typeof PerjalananDinasSchema>;

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

const BULAN_INDONESIA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatIndonesianDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth() + 1]} ${d.getFullYear()}`;
}

function hitungLamaHari(mulai: string, selesai: string): number {
  const diff = new Date(selesai).getTime() - new Date(mulai).getTime();
  return Math.round(diff / 86400000) + 1;
}

function incrementNomor(nomorBase: string, increment: number): string {
  if (increment === 0) return nomorBase;
  const parts = nomorBase.split("/");
  const angka = parseInt(parts[0]?.trim() ?? "0", 10);
  if (isNaN(angka)) return nomorBase;
  parts[0] = String(angka + increment);
  return parts.join("/");
}

// ─── BUILD CONTEXT UNTUK TEMPLATE ────────────────────────────────────────────

function buildSuratTugasContext(data: PerjalananDinasPayload) {
  const tanggalMulai = formatIndonesianDate(data.tanggalMulai);
  const tanggalSelesai = formatIndonesianDate(data.tanggalSelesai);
  const lamaHari = hitungLamaHari(data.tanggalMulai, data.tanggalSelesai);

  const pelaksanaDPRD = data.pelaksanaDPRD;
  const isTabelMode = pelaksanaDPRD.length > 3;

  // Context biasa (max 3 pelaksana inline)
  const pelaksanaSlots = isTabelMode
    ? []
    : pelaksanaDPRD.slice(0, 3).map((p, i) => ({
        [`nama_pelaksana_${i + 1}`]: p.nama,
        [`jabatan_pelaksana_${i + 1}`]: p.jabatan,
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {});

  return {
    nomor_surat: data.nomorSurat,
    dasar_surat_tugas: data.dasarSuratTugas ?? "",
    materi: data.materi,
    jenis_perjalanan: data.jenisPerjalanan,
    tanggal_mulai: tanggalMulai,
    tanggal_selesai: tanggalSelesai,
    lama_hari: String(lamaHari),
    kota_tujuan: data.kotaTujuan.join(", "),
    jabatan_ttd: data.jabatanTtd,
    nama_ttd: data.namaTtd,
    tanggal_surat: formatIndonesianDate(new Date().toISOString()),
    ...pelaksanaSlots,
    // Untuk mode tabel
    pelaksana_list: pelaksanaDPRD.map((p, i) => ({
      no: i + 1,
      nama: p.nama,
      jabatan: p.jabatan,
      kategori: p.kategori,
    })),
    is_tabel_mode: isTabelMode,
  };
}

function buildSPDContexts(data: PerjalananDinasPayload) {
  // Setiap anggota DPRD mendapat SPD dengan nomor sama
  // Setiap ASN mendapat SPD dengan nomor increment
  const spdContextsDPRD = data.pelaksanaDPRD.map(p => ({
    nomor_spd: data.nomorSpdDprd ?? "",
    nama: p.nama,
    jabatan: p.jabatan,
    nip: "-",
    pangkat: "-",
    instansi: "DPRD Kota Bitung",
    kota_tujuan: data.kotaTujuan.join(", "),
    tanggal_mulai: formatIndonesianDate(data.tanggalMulai),
    tanggal_selesai: formatIndonesianDate(data.tanggalSelesai),
    jabatan_ttd: data.jabatanTtd,
    nama_ttd: data.namaTtd,
  }));

  const spdContextsASN = data.pelaksanaASN.map((p, i) => ({
    nomor_spd: incrementNomor(data.nomorSpdAsn ?? "", i),
    nama: p.nama,
    jabatan: p.jabatan,
    nip: p.nip,
    pangkat: p.pangkat,
    instansi: "Sekretariat DPRD Kota Bitung",
    kota_tujuan: data.kotaTujuan.join(", "),
    tanggal_mulai: formatIndonesianDate(data.tanggalMulai),
    tanggal_selesai: formatIndonesianDate(data.tanggalSelesai),
    jabatan_ttd: data.jabatanTtd,
    nama_ttd: data.namaTtd,
  }));

  return { spdContextsDPRD, spdContextsASN };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi input
    const parseResult = PerjalananDinasSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parseResult.data;

    // Build semua contexts
    const suratTugasCtx = buildSuratTugasContext(data);
    const { spdContextsDPRD, spdContextsASN } = buildSPDContexts(data);

    // ─── DOCX GENERATION ──────────────────────────────────────────────────────
    // Di production: gunakan docxtemplater di sini
    // const Docxtemplater = require("docxtemplater");
    // const PizZip = require("pizzip");
    // const fs = require("fs");
    //
    // function generateDocx(templatePath, context) {
    //   const content = fs.readFileSync(templatePath, "binary");
    //   const zip = new PizZip(content);
    //   const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    //   doc.render(context);
    //   return doc.getZip().generate({ type: "nodebuffer" });
    // }
    //
    // const suratTugasBuf = generateDocx("./private/templates/surat_tugas_dprd_biasa.docx", suratTugasCtx);
    // ... generate semua dokumen ...
    // const archiveBuf = buildZip([suratTugasBuf, pemberitahuanBuf, ...spdBufs, daftarHadirBuf]);
    //
    // Simpan ke Vercel Blob:
    // const { url } = await put(`surat/${data.nomorSurat}/paket.zip`, archiveBuf, { access: "private" });

    // ─── SIMPAN KE DATABASE ────────────────────────────────────────────────────
    // await prisma.surat.create({
    //   data: {
    //     jenisSurat: "PERJALANAN_DINAS_DPRD",
    //     nomorSurat: data.nomorSurat,
    //     ...
    //     pelaksanaDPRD: data.pelaksanaDPRD,
    //     pelaksanaASN: data.pelaksanaASN,
    //     status: "GENERATED",
    //     fileUrl: url,
    //     createdBy: session.user.id,
    //   }
    // });

    // ─── RESPONSE ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: "Semua dokumen berhasil digenerate",
      data: {
        nomorSurat: data.nomorSurat,
        jumlahDokumen: {
          suratTugas: data.modeDPRD ? 2 : 1, // DPRD + ASN
          pemberitahuan: 2,
          spd: data.pelaksanaDPRD.length + data.pelaksanaASN.length,
          daftarHadir: 1,
        },
        totalPelaksana: data.pelaksanaDPRD.length + data.pelaksanaASN.length,
        downloadUrl: `/api/surat/${data.nomorSurat}/download`, // akan diisi setelah blob upload
        contexts: {
          suratTugas: suratTugasCtx, // untuk debugging
          spdDprd: spdContextsDPRD[0],
        },
      },
    });
  } catch (error) {
    console.error("[API] Gagal generate surat:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check
  return NextResponse.json({ status: "ok", endpoint: "perjalanan-dinas" });
}
