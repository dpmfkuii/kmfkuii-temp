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
    },
}
