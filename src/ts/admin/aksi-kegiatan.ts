(() => {
    const uid = common.url_params.get('uid') || ''

    if (!uid) auth.redirect_home(UserRole.ADMIN)

    const detail_panel = dom.q<'div'>('#panel_detail_kegiatan')!
    //#region detail panel query elements
    const detail_form = dom.q<'form'>('#form_pendaftaran_kegiatan')!
    const input_uid_kegiatan = dom.qe<'input'>(detail_form, 'input[name="uid_kegiatan"]')!
    const input_email_pendaftar = dom.qe<'input'>(detail_form, 'input[name="email_pendaftar"]')!
    const input_nama_pendaftar = dom.qe<'input'>(detail_form, 'input[name="nama_pendaftar"]')!
    const select_organisasi = dom.qe<'select'>(detail_form, 'select[name="organisasi"]')!
    const input_nama_kegiatan = dom.qe<'input'>(detail_form, 'input[name="nama_kegiatan"]')!
    const select_periode_kegiatan = dom.qe<'select'>(detail_form, 'select[name="periode_kegiatan"]')!
    const select_penyelenggara_kegiatan = dom.qe<'select'>(detail_form, 'select[name="penyelenggara_kegiatan"]')!
    const select_lingkup_kegiatan = dom.qe<'select'>(detail_form, 'select[name="lingkup_kegiatan"]')!
    // const input_tanggal_kegiatan = dom.q<'input'>('input[name="tanggal_kegiatan"]')!
    const detail_button_ubah = dom.qe<'button'>(detail_form, 'button[aria-label="Ubah"]')!
    const detail_button_batal = dom.qe<'button'>(detail_form, 'button[aria-label="Batal"]')!
    //#endregion

    //#region detail panel fill in options
    select_organisasi.innerHTML = '<option disabled selected value>-- Pilih organisasi --</option>'
    for (const n of Object.values(OrganisasiKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_organisasi.appendChild(option)
    }

    select_periode_kegiatan.innerHTML = ''
    for (const n of main.get_opsi_periode_kegiatan()) {
        const option = dom.c('option')
        option.value = n
        option.textContent = n.replace('-', '/')
        select_periode_kegiatan.appendChild(option)
        if (main.get_selected_periode_kegiatan() === n) {
            option.selected = true
        }
    }

    select_penyelenggara_kegiatan.innerHTML = ''
    for (const n of Object.values(PenyelenggaraKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_penyelenggara_kegiatan.appendChild(option)
        if (select_penyelenggara_kegiatan.childNodes.length === 1) {
            option.selected = true
        }
    }

    select_lingkup_kegiatan.innerHTML = ''
    for (const n of Object.values(LingkupKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_lingkup_kegiatan.appendChild(option)
        if (select_lingkup_kegiatan.childNodes.length === 1) {
            option.selected = true
        }
    }
    //#endregion

    //#region detail panel initial state
    dom.disable(
        input_uid_kegiatan,
        input_email_pendaftar,
        input_nama_pendaftar,
        select_organisasi,
        input_nama_kegiatan,
        select_periode_kegiatan,
        select_penyelenggara_kegiatan,
        select_lingkup_kegiatan,
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

        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'gap-1', 'align-items-center'],
            html: `
                <div class="flex-grow-1">
                    <strong>${defines.jenis_rapat_text[jenis]} ${defines.rapat_dengan_text[dengan]}</strong>
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
})()
