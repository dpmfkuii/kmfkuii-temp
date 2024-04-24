(() => {
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
                style: 'min-width: max-content',
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

    //#region query db
    try {
        db.on_kegiatan(uid, snap => {
            if (!snap.exists()) throw new Error('Data tidak ditemukan.')

            const kegiatan = snap.val()
            detail_panel_update(kegiatan)
            rapat_panel_update(kegiatan)
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
