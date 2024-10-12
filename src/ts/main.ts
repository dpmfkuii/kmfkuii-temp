//#region defines

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
    INTERNAL_KM = 'Internal KM',
    EKSTERNAL_KM = 'Eksternal KM',
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

interface LogbookData {
    uid: string
    organisasi_index: number
    nama_kegiatan: string
    status_verifikasi: Kegiatan['status']['verifikasi']
}

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

//#endregion

const main = {
    keuangan: {} as MainKeuangan,
    set_bs_tooltip(el: HTMLElement, tooltip_text: string) {
        if (tooltip_text) {
            dom.qa('.tooltip').forEach(n => {
                if (dom.qe(n, '.tooltip-inner')?.textContent === el.getAttribute('data-bs-title')) {
                    n.remove()
                }
            })
            el.setAttribute('data-bs-title', tooltip_text)
            new bootstrap.Tooltip(el)
        }
    },
    init_bs_tooltip(tooltip_elements: HTMLElement[] | NodeListOf<HTMLElement> = dom.qa('[data-bs-toggle="tooltip"]')) {
        dom.qa('.tooltip').forEach(n => n.remove())
        tooltip_elements.forEach(n => new bootstrap.Tooltip(n))
    },
    get_logbook_periode_text(current_fullyear: number = new Date().getFullYear()) {
        return `${current_fullyear - 1}—${current_fullyear + 1}`
    },
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
    get_status_rapat_icon(status: StatusRapatVerifikasiKegiatan, no_color = false) {
        switch (status) {
            case StatusRapat.NOT_STARTED:
                return `<i class="fa-solid fa-asterisk ${no_color ? '' : 'text-secondary'}"></i>`
            case StatusRapat.IN_PROGRESS:
                return `<i class="fa-solid fa-spinner ${no_color ? '' : 'text-primary'}"></i>`
            case StatusRapat.MARKED_AS_DONE:
            case StatusRapat.DONE_TIMESTAMP:
            default:
                return `<i class="fa-solid fa-check ${no_color ? '' : 'text-success'}"></i>`
        }
    },
    is_status_verifikasi_selesai(organisasi: OrganisasiKegiatan, status_verifikasi: Kegiatan['status']['verifikasi']) {
        if (organisasi === OrganisasiKegiatan.LPM_CARDIOS) {
            return status_verifikasi.proposal.dpm > 0
                && status_verifikasi.lpj.dpm > 0
        }

        return status_verifikasi.proposal.lem > 0
            && status_verifikasi.proposal.dpm > 0
            && status_verifikasi.lpj.lem > 0
            && status_verifikasi.lpj.dpm > 0
    },
    create_status_verifikasi_badge(text: string, state: StatusRapatVerifikasiKegiatan, onclick?: (this: HTMLSpanElement, ev: MouseEvent) => any) {
        const color = state === 0 ? 'primary' : state > 0 ? 'success' : 'secondary'
        const badge = dom.c('span', {
            classes: ['badge', `text-bg-${color}`, 'rounded-pill'],
            html: `${text}${state === 0 ? ' <i class="fa-solid fa-spinner"></i>' : state > 0 ? ' <i class="fa-solid fa-check"></i>' : ''}`,
        })
        if (onclick) {
            badge.role = 'button'
            badge.addEventListener('click', onclick)
        }
        return badge
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
    logbook_kegiatan_to_logbook_data(logbook_kegiatan: LogbookKegiatan) {
        const logbook_data: LogbookData[] = []
        for (const periode in logbook_kegiatan) {
            const logbook_periode = logbook_kegiatan[periode]
            for (const organisasi_index in logbook_periode) {
                const logbook_organisasi = logbook_periode[organisasi_index]
                for (const uid in logbook_organisasi) {
                    const logbook_text = logbook_organisasi[uid]
                    const { nama_kegiatan, status } = main.extract_logbook_text(logbook_text)
                    logbook_data.push({
                        uid,
                        organisasi_index: Number(organisasi_index),
                        nama_kegiatan,
                        status_verifikasi: status.verifikasi,
                    })
                }
            }
        }
        logbook_data.sort((a, b) => a.nama_kegiatan < b.nama_kegiatan ? -1 : a.nama_kegiatan > b.nama_kegiatan ? 1 : 0)
        return logbook_data
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
    extract_logbook_text(log: string): { nama_kegiatan: string, status: Kegiatan['status'] } {
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
                            const is_LPM = Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index] === OrganisasiKegiatan.LPM_CARDIOS
                            const LEM_LPM_status_text = '<span class="text-secondary">LPM tidak perlu</span>'
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
                                <p class="small">Proposal LEM ${is_LPM ? LEM_LPM_status_text : main.get_status_rapat_text(kegiatan.status.verifikasi.proposal.lem, true)}.<br />
                                Proposal DPM ${main.get_status_rapat_text(kegiatan.status.verifikasi.proposal.dpm, true)}.<br />
                                LPJ LEM ${is_LPM ? LEM_LPM_status_text : main.get_status_rapat_text(kegiatan.status.verifikasi.lpj.lem, true)}.<br />
                                LPJ DPM ${main.get_status_rapat_text(kegiatan.status.verifikasi.lpj.dpm, true)}.</p>
                                <h6>Dibuat</h6>
                                <p class="small">${new Date(kegiatan.created_timestamp).toLocaleString()}</p>
                                <h6>Terakhir Diperbarui</h6>
                                <p class="small">${new Date(kegiatan.updated_timestamp).toLocaleString()}</p>
                            `
                            if (role === UserRole.ADMIN) {
                                const aksi_button = dom.c('a', {
                                    classes: ['btn', 'btn-km-primary'],
                                    attributes: {
                                        href: `/admin/kegiatan/aksi/?uid=${uid}`,
                                        role: 'button',
                                        'aria-label': 'Action',
                                    },
                                    html: '<i class="fa-solid fa-gear"></i>'
                                })


                                if (options.action_el_group) {
                                    if (!dom.qe(options.action_el_group, 'a[aria-label="Action"]')) {
                                        options.action_el_group.prepend(aksi_button)
                                    }
                                }
                                else {
                                    options.action_el_group = dom.c('div', {
                                        classes: ['d-flex', 'gap-1'],
                                        children: [aksi_button]
                                    })
                                }

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
    swal_fire_success(title: string) {
        return swal.fire({
            icon: 'success',
            title,
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
        })
    },
    invoke_animation(refresh_time = 100) {
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
        }, refresh_time)
    },
}

interface MainKeuangan {
    stringify_transaksi(nama: string, jumlah: number): string
    parse_transaksi_string(s: string): { nama: string, jumlah: number }
    fintime: {
        fintime_list_to_render_list(fintime_list: DatabaseKeuangan.FintimeList): DatabaseKeuangan.FintimeExt[]
        generate_tds(item: DatabaseKeuangan.FintimeExt, current_header: string, current_dd: string, tbody: HTMLTableSectionElement): {
            new_current_header: string,
            new_current_dd: string,
            item_date: Date
            item_header: string
            item_dd: string
            item_tipe: DatabaseKeuangan.FintimeTipe
            item_icon: DatabaseKeuangan.FintimeIcon
            item_color: DatabaseKeuangan.FintimeColor
            item_transaksi_li: string
            item_keterangan: string
            tds: HTMLTableCellElement[]
        }
        generate_recap_tds(item: DatabaseKeuangan.FintimeExt, no: number, kredit: number, debit: number, saldo: number, tbody: HTMLTableSectionElement): {
            new_no: number
            new_kredit: number
            new_debit: number
            new_saldo: number
        }
        generate_recap_tfoot(kredit: number, debit: number, saldo: number, tfoot: HTMLTableSectionElement): void
    }
    fincard: {
        shorten_periode_text(periode_kegiatan: string): string
        get_alokasi_amount(alokasi: DatabaseKeuangan.Fincard['alokasi'] | DatabaseKeuangan.Fincard['rkat_alokasi']): number
        get_front_card_data_single(fincard: DatabaseKeuangan.Fincard): {
            title: string
            out: number
            in: number
            left: number
            rkat: string
            rkat_tooltip: string
            lpj: string
        }
        get_back_card_data_single(fincard: DatabaseKeuangan.Fincard): {
            out_rkat: number
            out_dpm: number
            in_dpm: number
            in_alokasi: number
            out_alokasi: number
            left: number
        }
    }
}

main.keuangan = {
    stringify_transaksi(nama, jumlah) {
        return `${nama}:${jumlah}`
    },
    parse_transaksi_string(s) {
        const t = s.split(':')
        const jumlah = Number(t.pop()) || 0
        return {
            nama: t.join(''),
            jumlah,
        }
    },
    fintime: {
        fintime_list_to_render_list(fintime_list) {
            const render_list: DatabaseKeuangan.FintimeExt[] = []
            for (const last_updated_timestamp in fintime_list) {
                render_list.push({
                    ...fintime_list[last_updated_timestamp],
                    last_updated_timestamp,
                })
            }
            render_list.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
            return render_list
        },
        generate_tds(item, current_header, current_dd, tbody) {
            const item_date = new Date(item.datetime)
            const item_header = `${common.date_to_month_year_text(item_date)}`
            let item_dd = common.date_to_dd_text(item_date)
            const item_tipe = Object.values(DatabaseKeuangan.FintimeTipe)[item.tipe_index]
            const item_icon = Object.values(DatabaseKeuangan.FintimeIcon)[item.icon_index]
            const item_color = Object.values(DatabaseKeuangan.FintimeColor)[item.color_index]
            let item_transaksi_li = ``
            const item_keterangan = item.keterangan ? `<span class="small">${item.keterangan}</span>` : ''

            if (item_header !== current_header) {
                tbody.appendChild(dom.c('tr', {
                    classes: ['fs-6'],
                    children: [
                        dom.c('td', { html: '<i class="fa-regular fa-calendar"></i>' }),
                        dom.c('td', { classes: ['text-bg-light-subtle', 'fw-bold'], html: item_header }),
                    ],
                }))
                current_header = item_header
                current_dd = ''
            }

            if (item_dd === current_dd) {
                item_dd = '<span style="margin-left: 1px">○</span>'
            }
            else {
                current_dd = item_dd
            }

            for (const transaksi_string of item.transaksi) {
                const { nama, jumlah } = main.keuangan.parse_transaksi_string(transaksi_string)
                const post_text = item_tipe === DatabaseKeuangan.FintimeTipe.INFO ? '' : ` <small>(${item_tipe.toLowerCase()})</small>`
                item_transaksi_li += `<li>${nama}: ${common.format_rupiah(jumlah)}${post_text}</li>`
            }

            const tds = [
                dom.c('td', { html: item_dd }),
                dom.c('td', {
                    classes: [`text-bg-${item_color}-subtle`],
                    html: `
                        <i class="${item_icon}"></i> ${item.judul}
                        <ul class="small">${item_transaksi_li}</ul>
                        ${item_keterangan}
                    `
                }),
            ]

            return {
                new_current_header: current_header,
                new_current_dd: current_dd,
                item_date,
                item_header,
                item_dd,
                item_tipe,
                item_icon,
                item_color,
                item_transaksi_li,
                item_keterangan,
                tds,
            }
        },
        generate_recap_tds(item, no, kredit, debit, saldo, tbody) {
            const item_tipe = Object.values(DatabaseKeuangan.FintimeTipe)[item.tipe_index]
            if (item_tipe === DatabaseKeuangan.FintimeTipe.KREDIT) {
                for (const transaksi_string of item.transaksi) {
                    const { nama, jumlah } = main.keuangan.parse_transaksi_string(transaksi_string)

                    kredit += jumlah
                    saldo += jumlah

                    const tds = [
                        dom.c('td', { html: `${no++}` }),
                        dom.c('td', { html: nama }),
                        dom.c('td', { html: common.format_rupiah(jumlah) }),
                        dom.c('td', { html: '-' }),
                        dom.c('td', { html: `${common.format_rupiah(saldo)}` }),
                    ]

                    tbody.appendChild(dom.c('tr', {
                        children: tds,
                    }))
                }
            }
            else if (item_tipe === DatabaseKeuangan.FintimeTipe.DEBIT) {
                for (const transaksi_string of item.transaksi) {
                    const { nama, jumlah } = main.keuangan.parse_transaksi_string(transaksi_string)

                    debit += jumlah
                    saldo -= jumlah

                    const tds = [
                        dom.c('td', { html: `${no++}` }),
                        dom.c('td', { html: nama }),
                        dom.c('td', { html: '-' }),
                        dom.c('td', { html: common.format_rupiah(jumlah) }),
                        dom.c('td', { html: `${common.format_rupiah(saldo)}` }),
                    ]

                    tbody.appendChild(dom.c('tr', {
                        children: tds,
                    }))
                }
            }

            return {
                new_no: no,
                new_kredit: kredit,
                new_debit: debit,
                new_saldo: saldo,
            }
        },
        generate_recap_tfoot(kredit, debit, saldo, tfoot) {
            const tds = [
                dom.c('td', { attributes: { colspan: '2' }, html: 'Total' }),
                dom.c('td', { html: common.format_rupiah(kredit) }),
                dom.c('td', { html: common.format_rupiah(debit) }),
                dom.c('td', { html: `${common.format_rupiah(saldo)}` }),
            ]

            tfoot.appendChild(dom.c('tr', {
                children: tds,
            }))
        },
    },
    fincard: {
        shorten_periode_text(periode_kegiatan) {
            return periode_kegiatan.split('-').map(s => s.slice(-2)).join('/')
        },
        get_alokasi_amount(alokasi) {
            return Object.values(alokasi || []).reduce((a, b) => a + b, 0) || 0
        },
        get_front_card_data_single(fincard) {
            const out_amount = fincard.rkat_murni + this.get_alokasi_amount(fincard.rkat_alokasi) + fincard.dpm
            const sub_rkat_text = `${sistem.get_sub_rkat_text(fincard.tahun_rkat, fincard.sub_aktivitas_rkat_index, '')}`
            let rkat = `${fincard.tahun_rkat}`
            let rkat_tooltip = rkat
            if (sub_rkat_text) {
                rkat_tooltip = `${fincard.tahun_rkat}/${sub_rkat_text}`
                rkat = `${fincard.tahun_rkat}/${sub_rkat_text.substring(0, 2)}`
            }
            return {
                title: fincard.nama_kegiatan,
                out: out_amount,
                in: fincard.sisa,
                left: fincard.sisa - fincard.disimpan_dpm - this.get_alokasi_amount(fincard.alokasi),
                rkat,
                rkat_tooltip,
                lpj: fincard.status_lpj > StatusRapat.IN_PROGRESS ? 'Verified' : 'Unverified'
            }
        },
        get_back_card_data_single(fincard) {
            const out_rkat_amount = fincard.rkat_murni + this.get_alokasi_amount(fincard.rkat_alokasi)
            const in_alokasi_amount = fincard.sisa - fincard.disimpan_dpm
            const out_alokasi_amount = this.get_alokasi_amount(fincard.alokasi)
            return {
                out_rkat: out_rkat_amount,
                out_dpm: fincard.dpm,
                in_dpm: fincard.disimpan_dpm,
                in_alokasi: in_alokasi_amount,
                out_alokasi: out_alokasi_amount,
                left: in_alokasi_amount - out_alokasi_amount,
            }
        },
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
            db.get_kegiatan(uid).then(snap => {
                const kegiatan = snap.val()!
                db.set_logbook(kegiatan)
                db.keuangan.fincard.update(
                    kegiatan.periode_kegiatan, kegiatan.periode_kegiatan,
                    kegiatan.organisasi_index, kegiatan.organisasi_index, uid,
                    {
                        status_lpj: kegiatan.status.verifikasi.lpj.dpm
                    }
                )
            }),
        ])
    },
    async sequence_update_detail_kegiatan(uid: string, kegiatan_changes: Kegiatan, old_periode_kegiatan: string, old_organisasi_index: number, new_kegiatan: Kegiatan) {
        await Promise.all([
            db.update_kegiatan(uid, kegiatan_changes),
            db.change_logbook(old_periode_kegiatan, old_organisasi_index, new_kegiatan),
            db.keuangan.fincard.update(
                old_periode_kegiatan, new_kegiatan.periode_kegiatan,
                old_organisasi_index, new_kegiatan.organisasi_index, uid,
                {
                    nama_kegiatan: new_kegiatan.nama_kegiatan,
                    status_lpj: new_kegiatan.status.verifikasi.lpj.dpm,
                }
            ),
        ])
    },
    async sequence_hapus_akun_kegiatan(uid: string) {
        await Promise.all([
            db.get_kegiatan(uid).then(snap => {
                const kegiatan = snap.val()!
                db.remove_logbook(kegiatan)
                db.keuangan.fincard.remove(kegiatan.periode_kegiatan, kegiatan.organisasi_index, uid)
            }),
            db.remove_kegiatan_logs(uid),
            db.remove_pengajuan(uid),
            db.keuangan.remove_fintime_list(uid),
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
    sistem: {
        get_data<T = SistemData.Snapshot>(): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`sistem/data`)
                .once<T>('value')
        },
        get_data_verifikasi<T = SistemData.Snapshot['verifikasi']>(): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`sistem/data/verifikasi`)
                .once<T>('value')
        },
        update_data_verifikasi(value: Partial<SistemData.Snapshot['verifikasi']>) {
            return main_db.ref(`sistem/data/verifikasi`)
                .update(value)
        },
        get_data_verifikasi_link_berkas<T = SistemData.Snapshot['verifikasi']['link_berkas']>(): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`sistem/data/verifikasi/link_berkas`)
                .once<T>('value')
        },
        get_data_verifikasi_jam_rapat<T = SistemData.Snapshot['verifikasi']['jam_rapat']>(): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`sistem/data/verifikasi/jam_rapat`)
                .once<T>('value')
        },
        get_data_keuangan<T = SistemData.Snapshot['keuangan']>(): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`sistem/data/keuangan`)
                .once<T>('value')
        },
        get_data_organisasi<T = SistemData.Snapshot['organisasi']>(): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`sistem/data/organisasi`)
                .once<T>('value')
        },
    },
    keuangan: {
        get_fintime_list<T = DatabaseKeuangan.FintimeList>(uid: string): Promise<FirebaseSnapshot<T>> {
            return main_db.ref(`verifikasi/keuangan/fintime/${uid}`)
                .once<T>('value')
        },
        on_fintime_list<T = DatabaseKeuangan.FintimeList>(uid: string, callback: (snapshot: FirebaseSnapshot<T>) => void) {
            return main_db.ref(`verifikasi/keuangan/fintime/${uid}`)
                .on<T>('value', callback)
        },
        update_fintime_list(uid: string, fintime_list_updates: DatabaseKeuangan.FintimeList) {
            return main_db.ref(`verifikasi/keuangan/fintime/${uid}`)
                .update(fintime_list_updates)
        },
        remove_fintime(uid: string, last_updated_timestamp: string | number) {
            return main_db.ref(`verifikasi/keuangan/fintime/${uid}/${last_updated_timestamp}`)
                .remove()
        },
        remove_fintime_list(uid: string) {
            return main_db.ref(`verifikasi/keuangan/fintime/${uid}`)
                .remove()
        },
        fincard: {
            /**
             * @param old_ required to check if periode and organisasi changed
             * @param new_ new/updated values
             * @returns 
             */
            async update(
                old_periode: string,
                new_periode: string,
                old_organisasi_index: number,
                new_organisasi_index: number,
                uid: string,
                fincard_updates: Partial<DatabaseKeuangan.Fincard>,
                old_fincard?: DatabaseKeuangan.Fincard,
            ) {
                if (old_periode !== new_periode || old_organisasi_index !== new_organisasi_index) {
                    if (!old_fincard) {
                        await this.get(old_periode, old_organisasi_index, uid).then(snap => old_fincard = snap.val()!)
                    }

                    if (old_fincard) {
                        this.remove(old_periode, old_organisasi_index, uid)
                        this.set(new_periode, new_organisasi_index, uid, {
                            ...old_fincard,
                            ...fincard_updates,
                        })
                    }
                    else {
                        throw new Error('Gagal menyimpan Fincard.')
                    }
                }
                else {
                    main_db.ref(`verifikasi/keuangan/fincard/${new_periode}/${new_organisasi_index}/${uid}`).update(fincard_updates)
                }
            },
            set(
                periode: string,
                organisasi_index: number,
                uid: string,
                fincard: DatabaseKeuangan.Fincard
            ) {
                return main_db.ref(`verifikasi/keuangan/fincard/${periode}/${organisasi_index}/${uid}`).set(fincard)
            },
            get<T = DatabaseKeuangan.Fincard>(periode: string, organisasi_index: number, uid: string): Promise<FirebaseSnapshot<T>> {
                return main_db.ref(`verifikasi/keuangan/fincard/${periode}/${organisasi_index}/${uid}`).once<T>('value')
            },
            remove(periode: string, organisasi_index: number, uid: string) {
                main_db.ref(`verifikasi/keuangan/fincard/${periode}/${organisasi_index}/${uid}`).remove()
            },
            update_organisasi(
                periode: string,
                organisasi_index: number,
                fincard_organisasi_updates: Partial<DatabaseKeuangan.FincardOrganisasi>
            ) {
                return main_db.ref(`verifikasi/keuangan/fincard/${periode}/${organisasi_index}`).update(fincard_organisasi_updates)
            },
            get_periode<T = DatabaseKeuangan.FincardPeriode>(periode: string): Promise<FirebaseSnapshot<T>> {
                return main_db.ref(`verifikasi/keuangan/fincard/${periode}`).once<T>('value')
            },
        },
    },
}
