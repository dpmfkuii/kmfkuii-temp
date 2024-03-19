declare const firebase: any
declare const Swal: any

type StatusVerif = 'QUEUED' | 'CONFIRMED'

type VerifItem = {
    nama_pendaftar: string
    organisasi: string
    nama_kegiatan: string
    deskripsi_kegiatan: string
    jenis_kegiatan: string
    jenis_verif: string
    verif_dengan: string
    tanggal_verif: string
    jam_verif: string
    status: StatusVerif
}

// struktur db
// daftar_verif: {
//     "2024": {
//         "03": {
//             "29": {
//                  [key]: VerifItem
//                  [key]: VerifItem
//              }
//         }
//     }
// }
// antrean_verif: {
//     [key]: VerifItem
//     [key]: VerifItem
// }

const G = {
    EMAIL_LEM: 'sekretariatlemfkuii@gmail.com',
    EMAIL_DPM: 'fkuiidpm@gmail.com',
    DB_NAME_DAFTAR_VERIF: 'daftar_verif',
    DB_NAME_ANTREAN_VERIF: 'antrean_verif',
    C: {
        PRESIDIUM: "primary",
        LEM: "warning",
        DPM: "info",
    },
    DAY_NAMES: [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jum’at",
        "Sabtu",
    ],
    MONTH_NAMES: {
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
    DEFAULT_VERIF_HOUR_OPTIONS: [
        '15.30',
        '16.00',
        '16.30',
        '17.00',
        '17.30',
        '18.30',
        '19.30',
        '20.00',
        '-- Bulan puasa --',
        '20.30',
        '21.00',
        '21.30',
    ]
}

const common = {
    convert_date_string_to_text(date_string: string) {
        const split = date_string.split('-')
        const yyyy = split[0]
        const mm = split[1]
        const dd = split[2]
        const d = new Date(date_string).getDay()
        return `${G.DAY_NAMES[d]}, ${dd} ${G.MONTH_NAMES[mm]} ${yyyy}`
    },
    get_date_string(date: Date) {
        const m = date.getMonth() + 1
        const mm = m < 10 ? `0${m}` : m
        const d = date.getDate()
        const dd = d < 10 ? `0${d}` : d
        return `${date.getFullYear()}-${mm}-${dd}`
    },
}
