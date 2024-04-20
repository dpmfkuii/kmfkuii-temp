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
        pendaftaran_berhasil: 'success' as LogColor,
        pembaruan_data_kegiatan: 'light' as LogColor,
        jadwal_masuk_antrean: 'info' as LogColor,
        jadwal_terkonfirmasi: 'success' as LogColor,
        jadwal_ditolak: 'danger' as LogColor,
        jadwal_diubah: 'info' as LogColor,
        jadwal_dibatalkan: 'danger' as LogColor,
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
}
