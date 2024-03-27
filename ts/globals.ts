declare const firebase: any
declare const Swal: any

type StatusVerif = 'ANTREAN' | 'TERKONFIRMASI' | 'VERIFIKASI' | 'REVISI' | 'DISETUJUI' | 'DISAHKAN' | 'DIKETAHUI'

type VerifItem = {
    nama_pendaftar: string
    organisasi: string
    nama_kegiatan: string
    deskripsi_kegiatan: string
    penyelenggara_kegiatan: string
    lingkup_kegiatan: string
    jenis_verif: string
    anggaran_kegiatan: string
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
        '-- Bukan bulan puasa --',
        '17.00',
        '18.30',
        '19.30',
        '20.00',
        '-- Bulan puasa --',
        '21.00',
        '21.30',
    ],
    CLOSED_DAY: [0] // closed on Sunday
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
    /**
     * Returns true if `date1` < `date2`
     * @param date1 
     * @param date2 
     */
    is_date_before(date1: Date, date2: Date) {
        const sum1 = date1.getFullYear() + ((date1.getMonth() + 1) * 100) + date1.getDate()
        const sum2 = date2.getFullYear() + ((date2.getMonth() + 1) * 100) + date2.getDate()
        return sum1 < sum2
    },
    get_radio_input_value(name: string) {
        let value = ''
        const input = document.querySelectorAll(`input[name="${name}"]`) as NodeListOf<HTMLInputElement>
        input.forEach(n => {
            if (n.checked) value = n.value
        })
        return value
    },
    get_url_params() {
        return new URLSearchParams(window.location.search)
    },
    get_verif_item_from_url_params() {
        const url_params = new URLSearchParams(window.location.search)
        const item: VerifItem = {
            nama_pendaftar: url_params.get('nama_pendaftar') || '',
            organisasi: url_params.get('organisasi') || '',
            nama_kegiatan: url_params.get('nama_kegiatan') || '',
            deskripsi_kegiatan: url_params.get('deskripsi_kegiatan') || '',
            penyelenggara_kegiatan: url_params.get('penyelenggara_kegiatan') || '',
            lingkup_kegiatan: url_params.get('lingkup_kegiatan') || '',
            jenis_verif: url_params.get('jenis_verif') || '',
            anggaran_kegiatan: url_params.get('anggaran_kegiatan') || '',
            verif_dengan: url_params.get('verif_dengan') || '',
            tanggal_verif: url_params.get('tanggal_verif') || '',
            jam_verif: url_params.get('jam_verif') || '',
            status: 'ANTREAN',
        }
        return item
    },
    /**
     * Returns true if today supposed to be closed
     */
    validate_is_today_closed() {
        return G.CLOSED_DAY.includes(new Date().getDay())
    },
}

const swal_bs_primary = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-primary',
    },
    buttonsStyling: false
})
