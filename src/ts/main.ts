// firebase
interface Firebase {
    database(): {
        ref(path?: string): FirebaseDatabase
    }
}

interface FirebaseDatabase {
    child(path: string): FirebaseDatabase
    set(value: any): Promise<any>
    get<T = any>(): Promise<FirebaseSnapshot<T>>
    push(value: any): Promise<{ key: string }>
    on<T = any>(type: 'value', callback: (snapshot: FirebaseSnapshot<T>) => void): Promise<any>
    off(callback: () => void): void
    once<T = any>(type: 'value'): Promise<FirebaseSnapshot<T>>
}

interface FirebaseSnapshot<T = any> {
    exists(): boolean
    val(): T
}

declare const firebase: Firebase
const db = firebase.database()

// kegiatan
interface Kegiatan {
    uid: string
    email_pendaftar: string
    nama_pendaftar: string
    organisasi_index: number // index of enum
    nama_kegiatan: string
    periode_kegiatan: string
    penyelenggara_kegiatan_index: number
    lingkup_kegiatan_index: number
    tanggal_kegiatan: string[]
    status: {
        diajukan: number
        verifikasi: {
            proposal: {
                lem: StatusRapatVerifikasiKegiatan
                dpm: StatusRapatVerifikasiKegiatan
            }
            lpj: {
                lem: StatusRapatVerifikasiKegiatan
                dpm: StatusRapatVerifikasiKegiatan
            }
        }
    }
    created_timestamp: number
    updated_timestamp: number
}

/**
 * -1 = not started
 * 
 * 0 = in progress
 * 
 * 1 = marked as done
 * 
 * {timestamp} = done
 */
type StatusRapatVerifikasiKegiatan = -1 | 0 | number

interface LogsKegiatan {
    [timestamp: string]: LogKegiatan
}

/**
 * Log kegiatan diawali dengan parameter '@info/@success/@warn/@danger'.
 * 
 * Gunakan '@html' untuk menandakan adanya element html.
 * 
 * @example
 * `log = '@success @html Verifikasi proposal dengan DPM <strong>selesai</strong>.'`
 */
type LogKegiatan = string

enum OrganisasiKegiatan {
    LEM = 'LEM',
    LPM_CARDIOS = 'LPM CARDIOS',
    CMIA = 'CMIA',
    TBMM_HUMERUS = 'TBMM HUMERUS',
    SMART = 'SMART',
    CIMSA = 'CIMSA',
    MEDICAL_UII_FC = 'Medical UII FC',
    BASKET = 'Basket',
    DARA_MEUTUWAH = 'Dara Meutuwah',
    BADMINTON = 'Badminton',
    NADA_MEDIKA = 'Nada Medika',
    NON_ORGANISASI = 'Non organisasi',
}

enum PenyelenggaraKegiatan {
    INTERNAL_UII = 'Internal UII',
    EKSTERNAL_UII = 'Eksternal UII',
}

enum LingkupKegiatan {
    FAKULTAS = 'Fakultas',
    UNIVERSITAS = 'Universitas',
    DAERAH = 'Daerah',
    WILAYAH = 'Wilayah',
    NASIONAL = 'Nasional',
    INTERNASIONAL = 'Internasional',
}

interface LogbookKegiatan {
    [periode_kegiatan: string]: LogbookPeriode
}

interface LogbookPeriode {
    [organisasi_index: string]: LogbookOrganisasi
}

interface LogbookOrganisasi {
    [uid: string]: LogbookLog
}

/**
 * Log pada logbook kegiatan diawali dengan nama kegiatan.
 * 
 * Gunakan '@proposal_lem/@proposal_dpm/@lpj_lem/@lpj_dpm' untuk menandakan status verifikasi.
 * 
 * Gunakan :p setelah parameter untuk menandakan in progress '@proposal_lem:p'.
 * 
 * @example
 * `logbook_kegiatan[periode_kegiatan][organisasi_index][uid] = 'Konferensi ITAF 2024@proposal_lem@proposal_dpm@lpj_lem@lpj_dpm:p'`
 */
type LogbookLog = string

interface Rapat {
    uid: string
    jenis_rapat: JenisRapat
    tanggal_rapat: string
    jam_rapat: string
}

enum JenisRapat {
    PROPOSAL = 'proposal',
    LPJ = 'lpj',
}

enum StatusRapat {
    NOT_STARTED = -1,
    IN_PROGRESS = 0,
    MARKED_AS_DONE = 1,
    DONE_TIMESTAMP = 2, // the value should be timestamp
}

const JamRapat = [
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
]

interface AntreanRapat {
    [rapat_dengan: string]: {
        [timestamp: string]: Rapat
    }
}

type LogColor = 'info' | 'success' | 'warning' | 'danger'

const main = {
    get_opsi_periode_kegiatan() {
        const current_year = new Date().getFullYear()
        return [
            `${current_year - 2}-${current_year - 1}`,
            `${current_year - 1}-${current_year}`,
            `${current_year}-${current_year + 1}`,
        ]
    },
    get_selected_periode_kegiatan() {
        return this.get_opsi_periode_kegiatan()[new Date().getMonth() > 5 ? 0 : 1]
    },
    get_status_rapat_text(status: StatusRapat | StatusRapatVerifikasiKegiatan, with_html_color?: boolean): string {
        const text =
            status === StatusRapat.NOT_STARTED
                ? 'belum dimulai'
                : status === StatusRapat.IN_PROGRESS
                    ? 'sedang berlangsung'
                    : status === StatusRapat.MARKED_AS_DONE
                        ? 'ditandai selesai'
                        : `selesai pada ${new Date(status).toLocaleDateString()}`

        return with_html_color
            ? `<span class="text-${status === 0 ? 'primary' : status > 0 ? 'success' : 'secondary'}">${text}</span>`
            : text
    },
    is_status_verifikasi_selesai(status_verifikasi: Kegiatan['status']['verifikasi']) {
        return status_verifikasi.proposal.lem > 0
            && status_verifikasi.proposal.dpm > 0
            && status_verifikasi.lpj.lem > 0
            && status_verifikasi.lpj.dpm > 0
    },
    kegiatan_to_logbook_text(kegiatan: Kegiatan) {
        let status = ''
        if (kegiatan.status.verifikasi.proposal.lem >= 0) status += '@proposal_lem'
        if (kegiatan.status.verifikasi.proposal.lem === 0) status += ':p'
        if (kegiatan.status.verifikasi.proposal.dpm >= 0) status += '@proposal_dpm'
        if (kegiatan.status.verifikasi.proposal.dpm === 0) status += ':p'
        if (kegiatan.status.verifikasi.lpj.lem >= 0) status += '@lpj_lem'
        if (kegiatan.status.verifikasi.lpj.lem === 0) status += ':p'
        if (kegiatan.status.verifikasi.lpj.dpm >= 0) status += '@lpj_dpm'
        if (kegiatan.status.verifikasi.lpj.dpm === 0) status += ':p'
        return `${kegiatan.nama_kegiatan}${status}`
    },
    set_kegiatan_updated_timestamp(uid: string) {
        return db.ref(`verifikasi/kegiatan/${uid}/updated_timestamp`)
            .set(common.timestamp())
    },
    add_log(uid: string, color: LogColor, log: string) {
        return db.ref(`verifikasi/kegiatan/logs/${uid}/${common.timestamp()}`)
            .set(`@${color} ${log}`)
    },
}

declare const swal: any

// animate system
setTimeout(() => {
    for (const animation_name of [
        'fade-on-enter',
        'rise-on-enter',
    ]) {
        document
            .querySelectorAll(`.animate.animate-${animation_name}`)
            .forEach((el) => {
                el.classList.remove(`animate-${animation_name}`)
            })
    }
}, 100)
