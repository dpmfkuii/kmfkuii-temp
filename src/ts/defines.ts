declare const bootstrap: any

interface ObjectOf<T> {
    [key: string]: T
}

type BSColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'dark' | 'light'

// defines
const defines = {
    day_names: [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jum’at',
        'Sabtu',
    ],
    month_names: {
        '01': 'Januari',
        '02': 'Februari',
        '03': 'Maret',
        '04': 'April',
        '05': 'Mei',
        '06': 'Juni',
        '07': 'Juli',
        '08': 'Agustus',
        '09': 'September',
        '10': 'Oktober',
        '11': 'November',
        '12': 'Desember',
    } as { [mm: string]: string },
    store_key: {
        user: 'user',
        daftar_rapat: '',
    },
    log_colors: {
        awal_log: 'light' as LogColor,
        date: 'light' as LogColor,
        akun_berhasil_dibuat: 'light' as LogColor,
        pembaruan_data_kegiatan: 'light' as LogColor,
        jadwal_masuk_antrean: 'info' as LogColor,
        jadwal_terkonfirmasi: 'success' as LogColor,
        jadwal_ditolak: 'danger' as LogColor,
        jadwal_dipindah: 'warning' as LogColor,
        jadwal_dihapus: 'danger' as LogColor,
        verifikasi_selesai: 'success' as LogColor,
        verifikasi_dibatalkan: 'danger' as LogColor,
    },
    jenis_rapat_text: {
        proposal: 'Proposal',
        lpj: 'LPJ',
    },
    /**
     * jenis rapat text in the middle of a sentence
     */
    jenis_rapat_text_mid: {
        proposal: 'proposal',
        lpj: 'LPJ',
    },
    rapat_dengan_text: {
        lem: 'LEM',
        dpm: 'DPM',
    },
    log_text: {
        rapat_dalam_antrean(nama_rapat: string, waktu_rapat: string) {
            return `Penjadwalan rapat ${nama_rapat} pada ${waktu_rapat} dalam antrean.`
        },
        rapat_terkonfirmasi(nama_rapat: string, waktu_rapat: string) {
            return `Penjadwalan rapat ${nama_rapat} pada ${waktu_rapat} terkonfirmasi.`
        },
        rapat_ditolak(nama_rapat: string, waktu_rapat: string) {
            return `Penjadwalan rapat ${nama_rapat} pada ${waktu_rapat} ditolak.`
        },
        rapat_dipindah(nama_rapat: string, waktu_rapat: string, new_waktu_rapat: string) {
            return `Penjadwalan rapat ${nama_rapat} pada ${waktu_rapat} dipindah ke ${new_waktu_rapat}.`
        },
        rapat_dihapus(nama_rapat: string, waktu_rapat: string) {
            return `Penjadwalan rapat ${nama_rapat} pada ${waktu_rapat} dihapus dari kalender.`
        },
        verifikasi_selesai(jenis_rapat: JenisRapat, rapat_dengan: RapatDengan) {
            return `@html Verifikasi ${defines.jenis_rapat_text_mid[jenis_rapat]} dengan ${defines.rapat_dengan_text[rapat_dengan]} <strong>selesai</strong>.`
        },
        verifikasi_dibatalkan(jenis_rapat: JenisRapat, rapat_dengan: RapatDengan) {
            return `@html Verifikasi ${defines.jenis_rapat_text_mid[jenis_rapat]} dengan ${defines.rapat_dengan_text[rapat_dengan]} <strong>dibatalkan</strong>.`
        },
        akun_berhasil_dibuat: 'Akun berhasil dibuat.',
    },
    nama_warna_bs: {
        light: 'Putih',
        info: 'Biru',
        warning: 'Kuning',
        success: 'Hijau',
        danger: 'Merah',
    },
}

const globals = {
    rapat: {
        hide_antrean: false,
        show_available_week_onstart: false,
        show_dpm_onstart: false,
        show_more_info: false,
    },
}

const sistem = {
    data: {
        link_berkas_lem: 'https://drive.google.com/drive/folders/1iwwJJ4WUT8R12fwMdhATC7e_gLRGlYz5?usp=sharing',
        link_berkas_dpm: 'https://drive.google.com/drive/folders/1xZ8mS5auho8IH4omtOqBXBrZDThIdFER?usp=sharing',
    },
}

namespace DatabaseKeuangan {
    export interface Snapshot {
        fincard: FincardKM & {
            recap: FincardRecapKM
        }
        fintime: {
            [uid: string]: FintimeList
        }
    }

    export interface FincardKM {
        [periode: string]: FincardPeriode
    }

    export interface FincardPeriode {
        [organisasi_index: string | number]: FincardOrganisasi
    }

    export interface FincardOrganisasi {
        [uid: string]: Fincard
    }

    export interface FincardRecapKM {
        [periode: string]: FincardRecapPeriode
    }

    export interface FincardRecapPeriode {
        [organisasi_index: string | number]: FincardRecapOrganisasi
    }

    export interface FincardRecapOrganisasi {
        [uid: string]: FincardRecap
    }

    export interface FintimeList {
        [last_updated_timestamp: string]: Fintime
    }

    /**
     * !IMPORTANT: make sure every time the main kegiatan changes, `nama_kegiatan` and
     * `status_lpj` also CHANGE, but the `updated_timestamp` should NOT updated
     */
    export interface Fincard {
        nama_kegiatan: string // !IMPORTANT
        tahun_rkat: number
        sub_aktivitas_rkat_index: number
        rkat_murni: number
        rkat_alokasi: {
            [dari_uid: string]: number
        }
        dpm: number
        sisa: number
        sudah_kembali: boolean
        disimpan_dpm: number
        alokasi: {
            [untuk_uid: string]: number
        }
        status_lpj: StatusRapat // !IMPORTANT
        updated_timestamp: number
    }

    export interface FincardRecap {
        tahun_rkat: number[]
        rkat_murni: number
        rkat_alokasi: number
        dpm: number
        sisa: number
        disimpan_dpm: number
        alokasi: number
        lpj_progress: number
        updated_timestamp: number
    }

    /**
     * 0 (INFO) - transaksi has no meaning
     * 
     * 1 (KREDIT) - transaksi's kredit will be added to rekapitulasi keuangan
     * 
     * 2 (DEBIT) - transaksi's debit will be added to rekapitulasi keuangan
     */
    export enum FintimeTipe {
        INFO = 'Info',
        KREDIT = 'Kredit',
        DEBIT = 'Debit',
    }

    export enum FintimeIcon {
        FA_CASH_REGISTER = 'fa-solid fa-cash-register',
        FA_CIRCLE_CHECK = 'fa-regular fa-circle-check',
        FA_MONEY_BILL_TRANSFER = 'fa-solid fa-money-bill-transfer',
        FA_COINS = 'fa-solid fa-coins',
        FA_MONEY_BILLS = 'fa-solid fa-money-bills',
    }

    export enum FintimeColor {
        LIGHT = 'light',
        INFO = 'info',
        WARNING = 'warning',
        SUCCESS = 'success',
        DANGER = 'danger',
    }

    export interface Fintime {
        datetime: string
        tipe_index: number
        icon_index: number
        color_index: number
        judul: string
        transaksi: string[] // [ `${nama_transaksi}:${jumlah_transaksi}`, ... ]
        keterangan: string
    }

    export interface FintimeExt extends Fintime {
        last_updated_timestamp: string
    }
}

namespace SistemData {
    export interface Snapshot {
        verifikasi: Verifikasi
        keuangan: Keuangan
        organisasi: Organisasi[]
    }

    export interface Verifikasi {
        link_berkas: {
            lem: string
            dpm: string
        }
        jam_rapat: {
            opsi: string[]
            jam_reschedule_lem: string[]
            jam_reschedule_dpm: string[]
        }
        komunikasi: {
            ig_lem: string
            ig_dpm: string
            line_lem: string
            email_lem: string
            email_dpm: string
            email_kemahasiswaan: string
        }
    }

    export interface Keuangan {
        sub_aktivitas_rkat: {
            [tahun_rkat: string]: {
                [kode_rkat: string]: SubAktivitasRKAT
            }
        }
    }

    export interface SubAktivitasRKAT {
        nama: string
        anggaran: number
    }

    export interface Organisasi {
        nama: string
        color: string
        title: string
        profil: string
        keunggulan: string
        link: string
    }
}
