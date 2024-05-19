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
    update(value: any): Promise<any>
    on<T = any>(type: 'value', callback: (snapshot: FirebaseSnapshot<T>) => void): Promise<any>
    off(callback: () => void): void
    once<T = any>(type: 'value'): Promise<FirebaseSnapshot<T>>
    remove(): Promise<any>
}

interface FirebaseSnapshot<T = any> {
    exists(): boolean
    val(): T
}

declare const firebase: Firebase
declare const swal: any
declare const Fuse: any

const main_db = {
    ref(path?: string): FirebaseDatabase {
        if (path) {
            path = path.replaceAll('.', '')
                .replaceAll('#', '')
                .replaceAll('$', '')
                .replaceAll('[', '')
                .replaceAll(']', '')
        }
        return firebase.database().ref(path)
    },
}

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
type StatusRapatVerifikasiKegiatan = -1 | 0 | 1 | number

interface LogsKegiatanText {
    [timestamp: string]: LogKegiatanText
}

/**
 * Log kegiatan diawali dengan parameter '@info/@success/@warn/@danger'.
 * 
 * Gunakan '@html' untuk menandakan adanya element html.
 * 
 * @example
 * `log = '@success @html Verifikasi proposal dengan DPM <strong>selesai</strong>.'`
 */
type LogKegiatanText = string

interface LogKegiatan {
    timestamp: number | string
    color: LogColor
    text: string
    is_html: boolean
}

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
    /**
     * created timestamp, for antrean
     */
    t: number
    uid: string
    nama_kegiatan: string
    jenis_rapat: JenisRapat
    rapat_dengan: RapatDengan
    tanggal_rapat: string
    jam_rapat: string
}

enum JenisRapat {
    PROPOSAL = 'proposal',
    LPJ = 'lpj',
}

enum RapatDengan {
    LEM = 'lem',
    DPM = 'dpm',
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
    '19.00',
    '19.30',
    '20.00',
    '-- Bulan puasa --',
    '21.00',
    '21.30',
]

interface AntreanRapat {
    [rapat_dengan: string]: RapatList
}

interface RapatList {
    [timestamp: string]: Rapat
}

interface PengajuanRapatList {
    [uid: string]: PengajuanRapatKegiatan
}

interface PengajuanRapatKegiatan {
    [JenisRapat.PROPOSAL]: JenisPengajuanRapatKegiatan
    [JenisRapat.LPJ]: JenisPengajuanRapatKegiatan
}

interface JenisPengajuanRapatKegiatan {
    [RapatDengan.LEM]: {
        diajukan: number
        diterima: number
    }
    [RapatDengan.DPM]: {
        diajukan: number
        diterima: number
    }
}

type LogColor = 'light' | 'info' | 'success' | 'warning' | 'danger'

const main = {
    get_opsi_periode_kegiatan(current_year = new Date().getFullYear()) {
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
    get_status_rapat_icon(status: StatusRapatVerifikasiKegiatan) {
        switch (status) {
            case StatusRapat.NOT_STARTED:
                return '<i class="fa-solid fa-asterisk text-secondary"></i>'
            case StatusRapat.IN_PROGRESS:
                return '<i class="fa-solid fa-spinner text-primary"></i>'
            case StatusRapat.MARKED_AS_DONE:
            case StatusRapat.DONE_TIMESTAMP:
            default:
                return '<i class="fa-solid fa-check text-success"></i>'
        }
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
    show_unexpected_error_message(error: any) {
        return swal.fire({
            icon: 'error',
            title: 'Ups...',
            html: `Terjadi kesalahan tak terduga! Coba hubungi sekretariat LEM atau DPM.<br /><code>${error}</code>`,
            confirmButtonText: 'Tutup',
            customClass: {
                confirmButton: 'btn btn-secondary',
            },
            buttonsStyling: false,
            showCloseButton: true,
        })
    },
    extract_log_kegiatan(timestamp: LogKegiatan['timestamp'], log_kegiatan_text: LogKegiatanText): LogKegiatan {
        const is_html = log_kegiatan_text.includes('@html ')
        if (is_html) log_kegiatan_text = log_kegiatan_text.replace('@html ', '')
        const color = log_kegiatan_text.split(' ')[0].substring(1) as LogColor
        return {
            timestamp,
            color,
            text: log_kegiatan_text.split(`@${color} `)[1],
            is_html,
        }
    },
    get_nama_rapat(rapat: Rapat) {
        return `${defines.jenis_rapat_text[rapat.jenis_rapat]}_${rapat.nama_kegiatan} (${defines.rapat_dengan_text[rapat.rapat_dengan]})`
    },
    get_waktu_rapat(rapat: Rapat) {
        return `hari ${common.date_string_to_date_text(rapat.tanggal_rapat)} pukul ${rapat.jam_rapat} WIB`
    },
    get_min_tanggal_rapat() {
        const d = common.get_next_monday()
        if (common.today_is(Day.Sunday)) {
            // udah hari minggu (tutup), minimal daftar mingdepnya lagi yah
            d.setDate(d.getDate() + 7)
        }
        return d
    },
    extract_logbook_text(uid: string, log: string) {
        const nama_kegiatan = log.split('@')[0]

        const get_state = (param: string): StatusRapatVerifikasiKegiatan => {
            return log.indexOf(param) >= 0
                ? log.indexOf(`${param}:p`) >= 0
                    ? 0
                    : 1
                : -1
        }

        const status: Kegiatan['status'] = {
            diajukan: 0,
            verifikasi: {
                proposal: {
                    lem: get_state('@proposal_lem'),
                    dpm: get_state('@proposal_dpm'),
                },
                lpj: {
                    lem: get_state('@lpj_lem'),
                    dpm: get_state('@lpj_dpm'),
                },
            },
        }

        return {
            nama_kegiatan,
            status,
        }
    },
    /**
     * 
     * @param tanggal yyyy-mm-dd
     * @param jam hh.mm
     */
    tanggal_dan_jam_to_date(tanggal: string, jam: string) {
        const iso = `${tanggal}T${jam.replace('.', ':')}`
        return new Date(iso)
    },
    swal_fire_detail_kegiatan(nama_kegiatan: string, uid: string, options: { action_el_group?: HTMLElement } = {}) {
        return swal.fire({
            title: nama_kegiatan,
            html: '<div><i>Memuat detail...</i></div>',
            confirmButtonText: 'Tutup',
            customClass: {
                confirmButton: 'btn btn-secondary',
            },
            buttonsStyling: false,
            showCloseButton: true,
            async didOpen() {
                swal.showLoading()
                db.get_kegiatan(uid)
                    .then(snap => {
                        const popup = swal.getPopup()
                        if (!popup) {
                            swal.hideLoading()
                            return
                        }

                        const div = dom.qe<'div'>(popup, '#swal2-html-container > div')!
                        if (snap.exists()) {
                            const kegiatan = snap.val()
                            let uid_text = ''
                            const role = auth.get_logged_in_user()?.role
                            if (role === UserRole.ADMIN) {
                                uid_text = kegiatan.uid
                            }
                            else {
                                uid_text = `${uid.substring(0, 4)}${common.replace_all_char(uid.substring(4), '*', ['-'])}`
                            }
                            div.classList.add('text-start')
                            div.innerHTML = `
                                <h6>UID</h6>
                                <p class="small">${uid_text}</p>
                                ${role === UserRole.ADMIN ? `
                                    <h6>Email Pendaftar</h6>
                                    <p class="small">${kegiatan.email_pendaftar}</p>
                                    <h6>Nama Pendaftar</h6>
                                    <p class="small">${kegiatan.nama_pendaftar}</p>` : ''}
                                <h6>Organisasi</h6>
                                <p class="small">${Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index]}</p>
                                <h6>Nama Kegiatan</h6>
                                <p class="small">${kegiatan.nama_kegiatan}</p>
                                <h6>Periode Kegiatan</h6>
                                <p class="small">${kegiatan.periode_kegiatan.replace('-', '/')}</p>
                                <h6>Penyelenggara Kegiatan</h6>
                                <p class="small">${Object.values(PenyelenggaraKegiatan)[kegiatan.penyelenggara_kegiatan_index]}</p>
                                <h6>Lingkup Kegiatan</h6>
                                <p class="small">${Object.values(LingkupKegiatan)[kegiatan.lingkup_kegiatan_index]}</p>
                                ${role === UserRole.ADMIN ? `
                                    <h6>Tanggal Pertama Kegiatan</h6>
                                    <p class="small">${kegiatan.tanggal_kegiatan[0]}</p>` : ''}
                                <h6>Status Verifikasi</h6>
                                <p class="small">Proposal LEM ${main.get_status_rapat_text(kegiatan.status.verifikasi.proposal.lem, true)}.<br />
                                Proposal DPM ${main.get_status_rapat_text(kegiatan.status.verifikasi.proposal.dpm, true)}.<br />
                                LPJ LEM ${main.get_status_rapat_text(kegiatan.status.verifikasi.lpj.lem, true)}.<br />
                                LPJ DPM ${main.get_status_rapat_text(kegiatan.status.verifikasi.lpj.dpm, true)}.</p>
                                <h6>Dibuat</h6>
                                <p class="small">${new Date(kegiatan.created_timestamp).toLocaleString()}</p>
                                <h6>Terakhir Diperbarui</h6>
                                <p class="small">${new Date(kegiatan.updated_timestamp).toLocaleString()}</p>
                            `
                            if (role === UserRole.ADMIN && options.action_el_group) {
                                div.innerHTML += '<h6>Aksi</h6>'
                                div.appendChild(options.action_el_group)
                            }
                        }
                        else {
                            div.innerHTML = '<i class="text-secondary">Tidak ada data.</i>'
                        }
                        swal.hideLoading()
                    })
            },
        })
    },
}

const db = {
    get_kegiatan(uid: string): Promise<FirebaseSnapshot<Kegiatan>> {
        return main_db.ref(`verifikasi/kegiatan/${uid}`)
            .once<Kegiatan>('value')
    },
    on_kegiatan(uid: string, callback: (snapshot: FirebaseSnapshot<Kegiatan>) => void) {
        return main_db.ref(`verifikasi/kegiatan/${uid}`)
            .on<Kegiatan>('value', callback)
    },
    set_kegiatan(kegiatan: Kegiatan) {
        return main_db.ref(`verifikasi/kegiatan/${kegiatan.uid}`)
            .set(kegiatan)
    },
    update_kegiatan(uid: string, kegiatan_values: Partial<Kegiatan>) {
        return main_db.ref(`verifikasi/kegiatan/${uid}`)
            .update(kegiatan_values)
    },
    remove_kegiatan(uid: string) {
        return main_db.ref(`verifikasi/kegiatan/${uid}`)
            .remove()
    },
    get_kegiatan_nama_kegiatan(uid: string): Promise<FirebaseSnapshot<Kegiatan['nama_kegiatan']>> {
        return main_db.ref(`verifikasi/kegiatan/${uid}/nama_kegiatan`)
            .once<Kegiatan['nama_kegiatan']>('value')
    },
    get_kegiatan_status_verifikasi(uid: string): Promise<FirebaseSnapshot<Kegiatan['status']['verifikasi']>> {
        return main_db.ref(`verifikasi/kegiatan/${uid}/status/verifikasi`)
            .once<Kegiatan['status']['verifikasi']>('value')
    },
    on_kegiatan_status_verifikasi(uid: string, callback: (snapshot: FirebaseSnapshot<Kegiatan['status']['verifikasi']>) => void) {
        return main_db.ref(`verifikasi/kegiatan/${uid}/status/verifikasi`)
            .on<Kegiatan['status']['verifikasi']>('value', callback)
    },
    set_kegiatan_status_verifikasi(uid: string, jenis_rapat: JenisRapat, rapat_dengan: Rapat['rapat_dengan'], value: StatusRapat | number) {
        return main_db.ref(`verifikasi/kegiatan/${uid}/status/verifikasi/${jenis_rapat}/${rapat_dengan}`)
            .set(value)
    },
    set_kegiatan_updated_timestamp(uid: string) {
        return main_db.ref(`verifikasi/kegiatan/${uid}/updated_timestamp`)
            .set(common.timestamp())
    },
    get_kegiatan_logs(uid: string): Promise<FirebaseSnapshot<LogsKegiatanText>> {
        return main_db.ref(`verifikasi/kegiatan/logs/${uid}`)
            .once<LogsKegiatanText>('value')
    },
    on_kegiatan_logs(uid: string, callback: (snapshot: FirebaseSnapshot<LogsKegiatanText>) => void) {
        return main_db.ref(`verifikasi/kegiatan/logs/${uid}`)
            .on<LogsKegiatanText>('value', callback)
    },
    add_kegiatan_log(uid: string, color: LogColor, log: string, is_html?: boolean) {
        return main_db.ref(`verifikasi/kegiatan/logs/${uid}/${common.timestamp()}`)
            .set(`@${color} ${is_html ? '@html ' : ''}${log}`)
    },
    remove_kegiatan_logs(uid: string) {
        return main_db.ref(`verifikasi/kegiatan/logs/${uid}`)
            .remove()
    },
    get_logbook(): Promise<FirebaseSnapshot<LogbookKegiatan>> {
        return main_db.ref(`verifikasi/kegiatan/logbook`)
            .once<LogbookKegiatan>('value')
    },
    get_logbook_periode(periode: string): Promise<FirebaseSnapshot<LogbookPeriode>> {
        return main_db.ref(`verifikasi/kegiatan/logbook/${periode}`)
            .once<LogbookPeriode>('value')
    },
    async get_logbook_in_periode_range(year: number): Promise<LogbookKegiatan> {
        const logbook_in_periode_range: LogbookKegiatan = {}

        const promises = []

        for (const periode of main.get_opsi_periode_kegiatan(year)) {
            promises.push(this.get_logbook_periode(periode).then(snap => {
                if (snap.exists()) {
                    logbook_in_periode_range[periode] = snap.val()
                }
            }))
        }

        await Promise.all(promises)

        return logbook_in_periode_range
    },
    set_logbook(kegiatan: Kegiatan) {
        return main_db.ref(`verifikasi/kegiatan/logbook/${kegiatan.periode_kegiatan}/${kegiatan.organisasi_index}/${kegiatan.uid}`)
            .set(main.kegiatan_to_logbook_text(kegiatan))
    },
    remove_logbook(kegiatan: Kegiatan) {
        return main_db.ref(`verifikasi/kegiatan/logbook/${kegiatan.periode_kegiatan}/${kegiatan.organisasi_index}/${kegiatan.uid}`)
            .remove()
    },
    change_logbook(old_periode_kegiatan: string, old_organisasi_index: number, new_kegiatan: Kegiatan) {
        if (old_periode_kegiatan === new_kegiatan.periode_kegiatan && old_organisasi_index === new_kegiatan.organisasi_index) {
            return this.set_logbook(new_kegiatan)
        }
        return Promise.all([
            main_db.ref(`verifikasi/kegiatan/logbook/${old_periode_kegiatan}/${old_organisasi_index}/${new_kegiatan.uid}`)
                .remove(),
            this.set_logbook(new_kegiatan),
        ])
    },
    get_antrean_rapat(): Promise<FirebaseSnapshot<AntreanRapat>> {
        return main_db.ref('verifikasi/rapat/antrean')
            .once<AntreanRapat>('value')
    },
    get_antrean_rapat_dengan(rapat_dengan: RapatDengan): Promise<FirebaseSnapshot<RapatList>> {
        return main_db.ref(`verifikasi/rapat/antrean/${rapat_dengan}`)
            .once<RapatList>('value')
    },
    get_antrean_key(rapat: Rapat) {
        return `${rapat.tanggal_rapat}${rapat.jam_rapat.replace('.', '')}`
    },
    add_antrean_rapat(rapat: Rapat) {
        return main_db.ref(`verifikasi/rapat/antrean/${rapat.rapat_dengan}/${this.get_antrean_key(rapat)}`)
            .set(rapat)
    },
    remove_antrean_rapat(rapat: Rapat) {
        return main_db.ref(`verifikasi/rapat/antrean/${rapat.rapat_dengan}/${this.get_antrean_key(rapat)}`)
            .remove()
    },
    /**
     * @param rapat_dengan 
     * @param tanggal_rapat yyyy/mm/dd
     */
    get_jadwal_rapat_dengan_tanggal(rapat_dengan: string, tanggal_rapat: string): Promise<FirebaseSnapshot<RapatList>> {
        return main_db.ref(`verifikasi/rapat/jadwal/${rapat_dengan}/${tanggal_rapat}`)
            .once<RapatList>('value')
    },
    add_jadwal_rapat(rapat: Rapat) {
        return main_db.ref(`verifikasi/rapat/jadwal/${rapat.rapat_dengan}/${rapat.tanggal_rapat.replaceAll('-', '/')}/${common.timestamp()}`)
            .set(rapat)
    },
    remove_jadwal_rapat(rapat: Rapat, timestamp: string) {
        return main_db.ref(`verifikasi/rapat/jadwal/${rapat.rapat_dengan}/${rapat.tanggal_rapat.replaceAll('-', '/')}/${timestamp}`)
            .remove()
    },
    /**
     * 
     * @param rapat 
     * @param timestamp
     * @param new_tanggal_rapat yyyy-mm-dd
     * @param new_jam_rapat hh.mm
     */
    move_jadwal_rapat(rapat: Rapat, timestamp: string, new_tanggal_rapat: string, new_jam_rapat: string) {
        db.add_jadwal_rapat({
            ...rapat,
            tanggal_rapat: new_tanggal_rapat,
            jam_rapat: new_jam_rapat,
        })
        db.remove_jadwal_rapat(rapat, timestamp)
    },
    move_rapat_from_antrean_to_jadwal(rapat_in_antrean: Rapat) {
        return Promise.all([
            this.remove_antrean_rapat(rapat_in_antrean),
            this.add_jadwal_rapat(rapat_in_antrean),
        ])
    },
    /**
     * Set status verifikasi and the logbook text
     */
    async sequence_set_status_verifikasi(uid: string, jenis_rapat: JenisRapat, rapat_dengan: RapatDengan, value: StatusRapat | number = common.timestamp()) {
        await Promise.all([
            db.set_kegiatan_status_verifikasi(uid, jenis_rapat, rapat_dengan, value),
            db.get_kegiatan(uid).then(snap => db.set_logbook(snap.val()!)),
        ])
    },
    async sequence_hapus_akun_kegiatan(uid: string) {
        await Promise.all([
            db.get_kegiatan(uid).then(snap => db.remove_logbook(snap.val()!)),
            db.remove_kegiatan_logs(uid),
            db.remove_pengajuan(uid),
        ])
        await db.remove_kegiatan(uid)
        await main_db.ref(`users/${uid}`).remove()
    },
    get_pengajuan_rapat_kegiatan(uid: string): Promise<FirebaseSnapshot<PengajuanRapatKegiatan>> {
        return main_db.ref(`verifikasi/rapat/pengajuan/${uid}`)
            .once<PengajuanRapatKegiatan>('value')
    },
    set_pengajuan_diajukan(uid: string, jenis: JenisRapat, dengan: RapatDengan, date_diajukan: Date) {
        return main_db.ref(`verifikasi/rapat/pengajuan/${uid}/${jenis}/${dengan}/diajukan`)
            .set(date_diajukan.getTime())
    },
    set_pengajuan_diterima(uid: string, jenis: JenisRapat, dengan: RapatDengan, date_diterima: Date) {
        return main_db.ref(`verifikasi/rapat/pengajuan/${uid}/${jenis}/${dengan}/diterima`)
            .set(date_diterima.getTime())
    },
    remove_pengajuan(uid: string) {
        return main_db.ref(`verifikasi/rapat/pengajuan/${uid}`)
            .remove()
    },
}

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
