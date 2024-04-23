interface ObjectOf<T> {
    [key: string]: T
}

// defines
const defines = {
    day_names: [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jum’at",
        "Sabtu",
    ],
    month_names: {
        "01": "Januari",
        "02": "Februari",
        "03": "Maret",
        "04": "April",
        "05": "Mei",
        "06": "Juni",
        "07": "Juli",
        "08": "Agustus",
        "09": "September",
        "10": "Oktober",
        "11": "November",
        "12": "Desember",
    } as { [mm: string]: string },
    store_key: {
        user: 'user'
    },
    log_colors: {
        awal_log: 'light' as LogColor,
        date: 'light' as LogColor,
        akun_berhasil_dibuat: 'light' as LogColor,
        pembaruan_data_kegiatan: 'light' as LogColor,
        jadwal_masuk_antrean: 'info' as LogColor,
        jadwal_terkonfirmasi: 'success' as LogColor,
        jadwal_ditolak: 'danger' as LogColor,
        jadwal_diubah: 'info' as LogColor,
        jadwal_dibatalkan: 'danger' as LogColor,
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
        verifikasi_selesai(jenis_rapat: JenisRapat, rapat_dengan: RapatDengan) {
            return `@html Verifikasi ${defines.jenis_rapat_text_mid[jenis_rapat]} dengan ${defines.rapat_dengan_text[rapat_dengan]} <strong>selesai</strong>.`
        },
        verifikasi_dibatalkan(jenis_rapat: JenisRapat, rapat_dengan: RapatDengan) {
            return `@html Verifikasi ${defines.jenis_rapat_text_mid[jenis_rapat]} dengan ${defines.rapat_dengan_text[rapat_dengan]} <strong>dibatalkan</strong>.`
        },
        akun_berhasil_dibuat: 'Akun berhasil dibuat.',
    },
}

const globals = {
    rapat: {
        hide_antrean: false,
        show_available_week_onstart: false,
        show_dpm_onstart: false,
    },
}

const sistem = {
    data: {
        link_berkas_lem: 'https://drive.google.com/drive/folders/1iwwJJ4WUT8R12fwMdhATC7e_gLRGlYz5?usp=sharing',
        link_berkas_dpm: 'https://drive.google.com/drive/folders/1xZ8mS5auho8IH4omtOqBXBrZDThIdFER?usp=sharing',
    },
}
