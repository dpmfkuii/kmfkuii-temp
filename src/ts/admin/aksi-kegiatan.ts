(async () => {
    const uid = common.url_params.get('uid') || ''

    if (!uid) auth.redirect_home(UserRole.ADMIN)

    const detail_panel = dom.q<'div'>('#panel_detail_kegiatan')!
    //#region detail panel query elements
    const detail_form = dom.q<'form'>('#form_pendaftaran_kegiatan')!
    const detail_input_uid_kegiatan = dom.qe<'input'>(detail_form, 'input[name="uid_kegiatan"]')!
    const detail_input_email_pendaftar = dom.qe<'input'>(detail_form, 'input[name="email_pendaftar"]')!
    const detail_input_nama_pendaftar = dom.qe<'input'>(detail_form, 'input[name="nama_pendaftar"]')!
    const detail_select_organisasi = dom.qe<'select'>(detail_form, 'select[name="organisasi"]')!
    const detail_input_nama_kegiatan = dom.qe<'input'>(detail_form, 'input[name="nama_kegiatan"]')!
    const detail_select_periode_kegiatan = dom.qe<'select'>(detail_form, 'select[name="periode_kegiatan"]')!
    const detail_select_penyelenggara_kegiatan = dom.qe<'select'>(detail_form, 'select[name="penyelenggara_kegiatan"]')!
    const detail_select_lingkup_kegiatan = dom.qe<'select'>(detail_form, 'select[name="lingkup_kegiatan"]')!
    // const input_tanggal_kegiatan = dom.q<'input'>('input[name="tanggal_kegiatan"]')!
    const detail_button_ubah = dom.qe<'button'>(detail_form, 'button[aria-label="Ubah"]')!
    const detail_button_batal = dom.qe<'button'>(detail_form, 'button[aria-label="Batal"]')!
    //#endregion

    //#region detail panel fill in options
    detail_select_organisasi.innerHTML = '<option disabled selected value>-- Pilih organisasi --</option>'
    for (const n of Object.values(OrganisasiKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        detail_select_organisasi.appendChild(option)
    }

    detail_select_periode_kegiatan.innerHTML = ''
    for (const n of main.get_opsi_periode_kegiatan()) {
        const option = dom.c('option')
        option.value = n
        option.textContent = n.replace('-', '/')
        detail_select_periode_kegiatan.appendChild(option)
        if (main.get_selected_periode_kegiatan() === n) {
            option.selected = true
        }
    }

    detail_select_penyelenggara_kegiatan.innerHTML = ''
    for (const n of Object.values(PenyelenggaraKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        detail_select_penyelenggara_kegiatan.appendChild(option)
        if (detail_select_penyelenggara_kegiatan.childNodes.length === 1) {
            option.selected = true
        }
    }

    detail_select_lingkup_kegiatan.innerHTML = ''
    for (const n of Object.values(LingkupKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        detail_select_lingkup_kegiatan.appendChild(option)
        if (detail_select_lingkup_kegiatan.childNodes.length === 1) {
            option.selected = true
        }
    }
    //#endregion

    //#region detail panel initial state
    dom.disable(
        detail_input_uid_kegiatan,
        detail_input_email_pendaftar,
        detail_input_nama_pendaftar,
        detail_select_organisasi,
        detail_input_nama_kegiatan,
        detail_select_periode_kegiatan,
        detail_select_penyelenggara_kegiatan,
        detail_select_lingkup_kegiatan,
        detail_button_ubah,
    )
    //#endregion

    const rapat_panel = dom.q<'div'>('#panel_rapat_verifikasi')!
    //#region rapat panel query elements
    const rapat_list_group = dom.qe<'div'>(rapat_panel, '.list-group')!
    //#endregion

    //#region rapat panel initial state
    rapat_list_group.innerHTML = `
        <div class="d-flex align-items-center">
            <strong role="status" class="text-secondary fst-italic"
                >Memuat...</strong
            >
            <div class="spinner-border ms-auto" aria-hidden="true"></div>
        </div>
    `
    //#endregion

    //#region detail panel logic
    const detail_panel_update = (kegiatan: Kegiatan) => {
        detail_input_uid_kegiatan.value = kegiatan.uid
        detail_input_email_pendaftar.value = kegiatan.email_pendaftar
        detail_input_nama_pendaftar.value = kegiatan.nama_pendaftar
        detail_select_organisasi.value = Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index]
        detail_input_nama_kegiatan.value = kegiatan.nama_kegiatan
        detail_select_periode_kegiatan.value = kegiatan.periode_kegiatan
        detail_select_penyelenggara_kegiatan.value = Object.values(PenyelenggaraKegiatan)[kegiatan.penyelenggara_kegiatan_index]
        detail_select_lingkup_kegiatan.value = Object.values(LingkupKegiatan)[kegiatan.lingkup_kegiatan_index]
    }
    //#endregion

    //#region rapat panel logic
    const create_rapat_list_group_item = (jenis: JenisRapat, dengan: RapatDengan, status: StatusRapat, status_lem?: StatusRapat) => {
        let status_text = ''
        if (dengan === RapatDengan.DPM && status === StatusRapat.NOT_STARTED && status_lem === StatusRapat.NOT_STARTED) {
            status_text = '<span class="text-secondary">belum daftar LEM</span>'
        }
        else {
            status_text = main.get_status_rapat_text(status, true)
        }

        const nama_rapat = `${defines.jenis_rapat_text[jenis]} ${defines.rapat_dengan_text[dengan]}`
        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'gap-1', 'align-items-center'],
            html: `
                <div class="flex-grow-1">
                    <strong>${nama_rapat}</strong>
                    <div class="text-secondary small">
                        ${status_text}
                    </div>
                </div>
                <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-success">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn btn-danger">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </button>
                </div>
            `
        })

        const li_button_success = dom.qe<'button'>(li, '.btn-success')!
        const li_button_danger = dom.qe<'button'>(li, '.btn-danger')!
        dom.disable(li_button_success)

        if (status === StatusRapat.NOT_STARTED) {
            dom.enable(li_button_success)
            dom.disable(li_button_danger)
        }
        else if (status === StatusRapat.IN_PROGRESS) {
            dom.enable(li_button_success)
        }

        li_button_success.addEventListener('click', () => {
            let next_status = common.timestamp()
            if (status === StatusRapat.NOT_STARTED) {
                next_status = StatusRapat.MARKED_AS_DONE
            }

            swal.fire({
                icon: 'question',
                title: `Verifikasi ${nama_rapat} selesai?`,
                html: `<small>Status akan berubah dari ${status_text} menjadi ${main.get_status_rapat_text(next_status, true)}.</small>`,
                showDenyButton: true,
                confirmButtonText: 'Selesai',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-success',
                    denyButton: 'btn btn-secondary ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                footer: '<small class="text-success fw-bold"><i>Alhamdulillah</i></small>',
            }).then((result: any) => {
                if (result.isConfirmed) {
                    swal.fire({
                        title: 'Verifikasi Selesai',
                        html: '<div><i>Memproses...</i></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        async didOpen() {
                            swal.showLoading()
                            try {
                                await db.sequence_set_status_verifikasi(uid, jenis, dengan, next_status)
                                await Promise.all([
                                    db.add_kegiatan_log(uid,
                                        defines.log_colors.verifikasi_selesai,
                                        defines.log_text.verifikasi_selesai(jenis, dengan),
                                    ),
                                    db.set_kegiatan_updated_timestamp(uid),
                                ])
                            }
                            catch (err) {
                                main.show_unexpected_error_message(err)
                                return
                            }

                            swal.fire({
                                icon: 'success',
                                title: 'Status berhasil diubah!',
                                showConfirmButton: false,
                                timer: 1000,
                                timerProgressBar: true,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                            })
                        },
                    })
                }
            })
        })

        li_button_danger.addEventListener('click', () => {
            const next_status = StatusRapat.NOT_STARTED

            swal.fire({
                icon: 'warning',
                title: `Verifikasi ${nama_rapat} batal?`,
                html: `<small>Status akan berubah dari ${status_text} menjadi ${main.get_status_rapat_text(next_status, true)}.</small>`,
                showDenyButton: true,
                confirmButtonText: 'Batal',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    denyButton: 'btn btn-secondary ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                footer: '<small class="text-danger fw-bold">Jangan lupa kirim email konfirmasi dan sertakan alasan!</small>',
            }).then((result: any) => {
                if (result.isConfirmed) {
                    swal.fire({
                        title: 'Verifikasi Batal',
                        html: '<div><i>Memproses...</i></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        async didOpen() {
                            swal.showLoading()
                            try {
                                await db.sequence_set_status_verifikasi(uid, jenis, dengan, next_status)
                                await Promise.all([
                                    db.add_kegiatan_log(uid,
                                        defines.log_colors.verifikasi_dibatalkan,
                                        defines.log_text.verifikasi_dibatalkan(jenis, dengan),
                                    ),
                                    db.set_kegiatan_updated_timestamp(uid),
                                ])
                            }
                            catch (err) {
                                main.show_unexpected_error_message(err)
                                return
                            }

                            swal.fire({
                                icon: 'success',
                                title: 'Status berhasil diubah!',
                                showConfirmButton: false,
                                timer: 1000,
                                timerProgressBar: true,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                            })
                        },
                    })
                }
            })
        })

        return li
    }

    const rapat_panel_update = (kegiatan: Kegiatan) => {
        const status_verifikasi = kegiatan.status.verifikasi
        rapat_list_group.innerHTML = ''
        rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.PROPOSAL, RapatDengan.LEM, status_verifikasi.proposal.lem))
        rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.PROPOSAL, RapatDengan.DPM, status_verifikasi.proposal.dpm, status_verifikasi.proposal.lem))
        rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.LPJ, RapatDengan.LEM, status_verifikasi.lpj.lem))
        rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.LPJ, RapatDengan.DPM, status_verifikasi.lpj.dpm, status_verifikasi.lpj.lem))
    }
    //#endregion

    const berkas_panel = dom.q<'div'>('#panel_berkas')!
    //#region berkas panel query elements
    const berkas_list_group = dom.qe(berkas_panel, '.list-group')!
    //#endregion

    //#region berkas panel logic
    const create_berkas_list_group_item = (dengan: RapatDengan, link_berkas: string) => {
        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'align-items-center'],
            html: `<div class="flex-grow-1 pe-2">Akses Berkas ${defines.rapat_dengan_text[dengan]}</div>`
        })

        li.appendChild(dom.c('a', {
            classes: ['btn', 'btn-km-primary'],
            attributes: {
                role: 'button',
                target: '_blank',
                style: 'width: max-content',
                href: link_berkas,
            },
            html: `BERKAS VERIFIKASI (${defines.rapat_dengan_text[dengan]}) <i class="fa-solid fa-arrow-up-right-from-square"></i>`,
        }))

        return li
    }

    berkas_list_group.innerHTML = ''
    berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.LEM, sistem.data.link_berkas_lem))
    berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.DPM, sistem.data.link_berkas_dpm))
    //#endregion

    //#region komunikasi panel
    enum TemplatEmail {
        KONFIRMASI_VERIFIKASI_PROPOSAL = 'Konfirmasi Verifikasi Proposal',
        KONFIRMASI_VERIFIKASI_LPJ = 'Konfirmasi Verifikasi LPJ',
        ANTREAN_DITOLAK = 'Antrean Ditolak',
        PERINTAH_REVISI = 'Perintah Revisi',
        PERINTAH_REVISI_2 = 'Perintah Revisi 2',
        SELESAI_VERIFIKASI = 'Selesai Verifikasi',
        PEMBATALAN_VERIFIKASI = 'Pembatalan Verifikasi',
        ACC_DITANDAI_SELESAI = 'Acc Ditandai Selesai',
        LUPA_UID = 'Lupa UID',
    }

    let _komunikasi_kegiatan: Kegiatan = {} as any
    let _pengajuan_rapat_kegiatan: PengajuanRapatKegiatan = {} as any

    const panel_komunikasi = dom.q<'div'>('#panel_urus_komunikasi')!
    const select_templat_email = dom.q<'select'>('#select_templat_email')!
    const select_waktu_verifikasi = dom.q<'input'>('#select_waktu_verifikasi')!
    const select_waktu_verifikasi_parent = select_waktu_verifikasi.parentElement! as HTMLLIElement
    const select_tujuan_email = dom.q<'select'>('#select_tujuan_email')!
    const span_subjek_email = dom.q<'span'>('#span_subjek_email')!
    const text_isi_email = dom.q<'div'>('#text_isi_email')!
    const button_buka_aplikasi_email = dom.q<'div'>('#button_buka_aplikasi_email')!
    const button_copy_tujuan_email = dom.q<'span'>('span[button-copy-target="select_tujuan_email"]')!
    const button_copy_subjek_email = dom.q<'span'>('span[button-copy-target="span_subjek_email"]')!
    const button_copy_isi_email = dom.q<'span'>('span[button-copy-target="text_isi_email"]')!

    select_templat_email.innerHTML = ''
    for (const n of Object.values(TemplatEmail)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_templat_email.appendChild(option)
    }

    const button_copy_action = (data: string, el_to_highlight: HTMLElement) => {
        common.copy(data).then(() => {
            el_to_highlight.style.opacity = '0'
            setTimeout(() => el_to_highlight.style.opacity = '1', 250)
        })
    }

    const get_subjek_email = () => {
        return {
            [TemplatEmail.KONFIRMASI_VERIFIKASI_PROPOSAL]: `KONFIRMASI VERIFIKASI PROPOSAL_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.KONFIRMASI_VERIFIKASI_LPJ]: `KONFIRMASI VERIFIKASI LPJ_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.ANTREAN_DITOLAK]: `ANTREAN DITOLAK_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.PERINTAH_REVISI]: `PERINTAH REVISI_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.PERINTAH_REVISI_2]: `PERINTAH REVISI 2_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.SELESAI_VERIFIKASI]: `SELESAI VERIFIKASI_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.PEMBATALAN_VERIFIKASI]: `PEMBATALAN VERIFIKASI_${_komunikasi_kegiatan.nama_kegiatan}`,
            [TemplatEmail.ACC_DITANDAI_SELESAI]: `ACC DITANDAI SELESAI`,
            [TemplatEmail.LUPA_UID]: `UID [${uid}]_${_komunikasi_kegiatan.nama_kegiatan}`,
        }[select_templat_email.value as TemplatEmail] || ''
    }

    const get_isi_email = () => {
        const templat = select_templat_email.value as TemplatEmail
        let pre = `Assalamu'alaikum warahmatullahi wabarakatuh\n\n`
        let post = `\n\nTerima kasih,\nWassalamu'alaikum warahmatullahi wabarakatuh`
        if (templat === TemplatEmail.KONFIRMASI_VERIFIKASI_PROPOSAL || templat === TemplatEmail.KONFIRMASI_VERIFIKASI_LPJ) {
            pre += `Terima kasih atas pengajuan verifikasinya. Verifikasi diterima dan akan dijadwalkan pada hari ${select_waktu_verifikasi.value}.

Berikut informasi lanjut terkait proses verifikasi ini:
1. PENGUMPULAN FILE\nUnggah file `
            post = ` dalam format PDF sesuai perintah yang ada di website.
Feedback akan diberikan lewat comment di file PDF dan secara langsung saat pertemuan verifikasi.

2. PENGIRIMAN LINK ZOOM
Jangan lupa untuk mengirim link Zoom yang telah disiapkan melalui fitur yang sudah ada di website.

*NOTE: DEADLINE pengumpulan berkas & link zoom adalah H-8 JAM sebelum verifikasi${post}`
        }
        return pre + {
            [TemplatEmail.KONFIRMASI_VERIFIKASI_PROPOSAL]: `proposal dan SPD`,
            [TemplatEmail.KONFIRMASI_VERIFIKASI_LPJ]: `LPJ`,
            [TemplatEmail.ANTREAN_DITOLAK]: `Mohon maaf karena pengajuan verifikasi tidak sesuai dengan alur/ketentuan yang telah ditetapkan, maka pengajuan verifikasi kami tolak.\n\nSilahkan cermati alur/ketentuan yang sudah tertera di website.`,
            [TemplatEmail.PERINTAH_REVISI]: `Terima kasih telah melakukan verifikasi, untuk selanjutnya karena masih ada yang perlu direvisi silahkan upload file hasil revisi melalui fitur yang tersedia di website.`,
            [TemplatEmail.PERINTAH_REVISI_2]: `Terima kasih telah mengirim berkas hasil revisi, untuk selanjutnya masih ada yang perlu direvisi, silahkan upload file hasil revisi 2 melalui fitur yang tersedia di website.`,
            [TemplatEmail.SELESAI_VERIFIKASI]: `Alhamdulillah proses verifikasi kegiatan sudah selesai, berikut file yang sudah ditandatangani.`,
            [TemplatEmail.PEMBATALAN_VERIFIKASI]: `Mohon maaf, karena ada proses yang tidak dijalankan sesuai tenggat waktu/ketentuan yang berlaku, maka verifikasi kami batalkan.\n\nSilahkan daftar dan ajukan ulang verifikasi.`,
            [TemplatEmail.ACC_DITANDAI_SELESAI]: `Terima kasih atas permohonannya, sudah kami tandai selesai. Silahkan melanjutkan alur verifikasi.`,
            [TemplatEmail.LUPA_UID]: `Silahkan gunakan UID berikut untuk login di website.\n\n${_komunikasi_kegiatan.nama_kegiatan}\nUID: ${uid}`
        }[templat] + post
    }

    const update_templat_email = () => {
        select_waktu_verifikasi_parent.classList.add('visually-hidden')
        if (select_templat_email.value === TemplatEmail.KONFIRMASI_VERIFIKASI_PROPOSAL
            || select_templat_email.value === TemplatEmail.KONFIRMASI_VERIFIKASI_LPJ) {
            select_waktu_verifikasi_parent.classList.remove('visually-hidden')
        }
        span_subjek_email.textContent = get_subjek_email()
        text_isi_email.innerHTML = common.text_break_to_html(get_isi_email())
    }

    const update_select_waktu_verifikasi = () => {
        const rapat_names: string[] = []

        const templat = select_templat_email.value as TemplatEmail
        if (templat === TemplatEmail.KONFIRMASI_VERIFIKASI_PROPOSAL) {
            rapat_names.push(`${JenisRapat.PROPOSAL} ${RapatDengan.LEM}`)
            rapat_names.push(`${JenisRapat.PROPOSAL} ${RapatDengan.DPM}`)
        }
        else if (templat === TemplatEmail.KONFIRMASI_VERIFIKASI_LPJ) {
            rapat_names.push(`${JenisRapat.LPJ} ${RapatDengan.LEM}`)
            rapat_names.push(`${JenisRapat.LPJ} ${RapatDengan.DPM}`)
        }

        select_waktu_verifikasi.innerHTML = '<option disabled selected value>-- Pilih waktu verifikasi --</option>'
        for (const rapat_name of rapat_names) {
            const jenis = rapat_name.split(' ')[0] as JenisRapat
            const dengan = rapat_name.split(' ')[1] as RapatDengan

            let waktu_pengajuan_diajukan = -1
            let waktu_pengajuan_diterima = -1

            if (_pengajuan_rapat_kegiatan) {
                if (_pengajuan_rapat_kegiatan[jenis]) {
                    if (_pengajuan_rapat_kegiatan[jenis][dengan]) {
                        waktu_pengajuan_diajukan = _pengajuan_rapat_kegiatan[jenis][dengan].diajukan || -1
                        waktu_pengajuan_diterima = _pengajuan_rapat_kegiatan[jenis][dengan].diterima || -1
                    }
                }
            }

            let waktu_pengajuan_text = 'tidak ada data'
            let post_text = ''
            if (waktu_pengajuan_diajukan >= 0 && waktu_pengajuan_diterima >= 0) {
                try {
                    waktu_pengajuan_text = common.to_date_pukul_text(new Date(waktu_pengajuan_diterima))
                    post_text = `, ${waktu_pengajuan_diterima === waktu_pengajuan_diajukan
                        ? 'sesuai'
                        : waktu_pengajuan_diterima > waktu_pengajuan_diajukan
                            ? 'diundur dari'
                            : 'dimajukan dari'} permohonan`
                }
                catch { }
            }

            const option = dom.c('option')
            option.value = `${waktu_pengajuan_text}${post_text}`
            option.textContent = `${defines.rapat_dengan_text[dengan]} (${waktu_pengajuan_text})`
            select_waktu_verifikasi.appendChild(option)
        }
    }

    select_templat_email.addEventListener('change', () => {
        update_select_waktu_verifikasi()
        update_templat_email()
    })

    select_waktu_verifikasi.addEventListener('change', () => {
        update_templat_email()
    })

    button_copy_tujuan_email.addEventListener('click', () => button_copy_action(
        select_tujuan_email.value,
        select_tujuan_email,
    ))

    button_copy_subjek_email.addEventListener('click', () => button_copy_action(
        get_subjek_email(),
        span_subjek_email,
    ))

    button_copy_isi_email.addEventListener('click', () => button_copy_action(
        get_isi_email(),
        text_isi_email,
    ))

    const init_komunikasi_panel = (kegiatan: Kegiatan) => {
        select_tujuan_email.innerHTML = `<option value="${kegiatan.email_pendaftar}" selected>${kegiatan.email_pendaftar} (${kegiatan.nama_pendaftar})</option>`
        update_select_waktu_verifikasi()
        update_templat_email()
    }

    button_buka_aplikasi_email.addEventListener('click', () => {
        const tujuan = select_tujuan_email.value
        const subject = encodeURIComponent(get_subjek_email())
        const body = encodeURIComponent(get_isi_email())
        location.href = `mailto:${tujuan}?subject=${subject}&body=${body}`
    })
    //#endregion

    //#region query db
    try {
        await db.get_pengajuan_rapat_kegiatan(uid)
            .then(snap => _pengajuan_rapat_kegiatan = snap.val()!)
        await db.on_kegiatan(uid, snap => {
            if (!snap.exists()) throw new Error('Data tidak ditemukan.')

            const kegiatan = snap.val()
            _komunikasi_kegiatan = kegiatan
            detail_panel_update(kegiatan)
            rapat_panel_update(kegiatan)
            init_komunikasi_panel(kegiatan)
        })
    }
    catch (err) {
        main.show_unexpected_error_message(err)
    }
    //#endregion
})();

// panel log kegiatan
(() => {
    const panel = dom.q<'div'>('#panel_log_kegiatan')!

    const list_group = dom.qe(panel, '.list-group')!

    const create_list_group_item = (log: LogKegiatan) => {
        const li = dom.c('li', {
            classes: ['list-group-item', `list-group-item-${log.color}`, 'pb-0'],
            html: `
                <span></span>
                <div class="text-secondary small text-end">
                    ${common.to_12h_format(new Date(Number(log.timestamp)))}
                </div>
            `
        })

        const span = dom.qe(li, 'span')!
        if (log.is_html) span.innerHTML = log.text
        else span.textContent = log.text

        return li
    }

    const uid = common.url_params.get('uid') || ''
    db.on_kegiatan_logs(uid, snap => {
        if (!snap.exists()) return

        list_group.innerHTML = `<li class="list-group-item list-group-item-${defines.log_colors.awal_log} text-center rounded-bottom">-- Awal log --</li>`

        const logs = snap.val()
        let _current_date_string = ''
        for (const timestamp in logs) {
            const _date = new Date(Number(timestamp))
            if (_date.toDateString() !== _current_date_string) {
                list_group.prepend(dom.c('li', {
                    classes: ['list-group-item', `list-group-item-${defines.log_colors.date}`, 'text-center'],
                    html: common.to_date_text(_date),
                }))
                _current_date_string = _date.toDateString()
            }
            const log = main.extract_log_kegiatan(timestamp, logs[timestamp])
            list_group.prepend(create_list_group_item(log))
        }
    })
})()
