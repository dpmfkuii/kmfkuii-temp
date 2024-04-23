// panel detail kegiatan
(() => {
    const panel_detail = dom.q<'div'>('#panel_urus_detail_kegiatan')!

    const form_edit_detail = dom.q<'form'>('#form_pendaftaran_kegiatan')!

    const button_ubah = dom.qe<'button'>(panel_detail, 'button[aria-label="Ubah"]')!
    const button_batal = dom.qe<'button'>(panel_detail, 'button[aria-label="Batal"]')!

    const input_uid_kegiatan = dom.qe<'input'>(panel_detail, 'input[name="uid_kegiatan"]')!
    const input_email_pendaftar = dom.q<'input'>('input[name="email_pendaftar"]')!
    const input_nama_pendaftar = dom.q<'input'>('input[name="nama_pendaftar"]')!
    const select_organisasi = dom.q<'select'>('select[name="organisasi"]')!
    const input_nama_kegiatan = dom.q<'input'>('input[name="nama_kegiatan"]')!
    const select_periode_kegiatan = dom.q<'select'>('select[name="periode_kegiatan"]')!
    const select_penyelenggara_kegiatan = dom.q<'select'>('select[name="penyelenggara_kegiatan"]')!
    const select_lingkup_kegiatan = dom.q<'select'>('select[name="lingkup_kegiatan"]')!
    // const input_tanggal_kegiatan = dom.q<'input'>('input[name="tanggal_kegiatan"]')!

    input_uid_kegiatan.value = auth.get_logged_in_user()?.uid || ''

    // fill in options
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

    dom.disable(
        input_email_pendaftar,
        input_nama_pendaftar,
        select_organisasi,
        input_nama_kegiatan,
        select_periode_kegiatan,
        select_penyelenggara_kegiatan,
        select_lingkup_kegiatan,
        button_ubah,
    )

    const update_detail_kegiatan = (kegiatan: Kegiatan) => {
        input_email_pendaftar.value = kegiatan.email_pendaftar
        input_nama_pendaftar.value = kegiatan.nama_pendaftar
        select_organisasi.value = Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index]
        input_nama_kegiatan.value = kegiatan.nama_kegiatan
        select_periode_kegiatan.value = kegiatan.periode_kegiatan
        select_penyelenggara_kegiatan.value = Object.values(PenyelenggaraKegiatan)[kegiatan.penyelenggara_kegiatan_index]
        select_lingkup_kegiatan.value = Object.values(LingkupKegiatan)[kegiatan.lingkup_kegiatan_index]
    }

    const logged_in_user = auth.get_logged_in_user()
    if (!logged_in_user) return

    const uid = logged_in_user.uid
    let _kegiatan: Kegiatan = {} as any
    let _form_edit_prev_kegiatan: Kegiatan = {} as any

    button_batal.addEventListener('click', () => {
        dom.disable(
            input_nama_kegiatan,
            select_periode_kegiatan,
            select_penyelenggara_kegiatan,
            select_lingkup_kegiatan,
        )

        button_batal.classList.add('visually-hidden')

        button_ubah.classList.add('btn-km-primary')
        button_ubah.classList.remove('btn-success')
        if (button_ubah.hasAttribute('is-editing')) {
            button_ubah.removeAttribute('is-editing')
        }

        update_detail_kegiatan(_form_edit_prev_kegiatan)
    })

    form_edit_detail.addEventListener('submit', ev => {
        ev.preventDefault()

        if (!button_ubah.hasAttribute('is-editing')) {
            dom.enable(
                input_nama_kegiatan,
                select_periode_kegiatan,
                select_penyelenggara_kegiatan,
                select_lingkup_kegiatan,
            )

            button_batal.classList.remove('visually-hidden')

            button_ubah.classList.add('btn-success')
            button_ubah.classList.remove('btn-km-primary')
            button_ubah.setAttribute('is-editing', '')

            _form_edit_prev_kegiatan.nama_kegiatan = input_nama_kegiatan.value
            _form_edit_prev_kegiatan.periode_kegiatan = select_periode_kegiatan.value
            _form_edit_prev_kegiatan.penyelenggara_kegiatan_index = Object.values(PenyelenggaraKegiatan).indexOf(select_penyelenggara_kegiatan.value as PenyelenggaraKegiatan)
            _form_edit_prev_kegiatan.lingkup_kegiatan_index = Object.values(LingkupKegiatan).indexOf(select_lingkup_kegiatan.value as LingkupKegiatan)

            return
        }

        const kegiatan_changes = {
            nama_kegiatan: input_nama_kegiatan.value,
            periode_kegiatan: select_periode_kegiatan.value,
            penyelenggara_kegiatan_index: Object.values(PenyelenggaraKegiatan).indexOf(select_penyelenggara_kegiatan.value as PenyelenggaraKegiatan),
            lingkup_kegiatan_index: Object.values(LingkupKegiatan).indexOf(select_lingkup_kegiatan.value as LingkupKegiatan),
        } as Kegiatan

        let is_changed
            = kegiatan_changes.nama_kegiatan !== _kegiatan.nama_kegiatan
            || kegiatan_changes.periode_kegiatan !== _kegiatan.periode_kegiatan
            || kegiatan_changes.penyelenggara_kegiatan_index !== _kegiatan.penyelenggara_kegiatan_index
            || kegiatan_changes.lingkup_kegiatan_index !== _kegiatan.lingkup_kegiatan_index

        if (!is_changed) {
            swal.fire({
                icon: 'info',
                title: 'Tidak ada perubahan.',
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
            button_batal.click()
            return
        }

        swal.fire({
            title: 'Ubah Detail Kegiatan',
            html: '<div><i>Memperbarui detail...</i></div>',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            async didOpen() {
                swal.showLoading()

                const changes = {} as { [key in keyof Kegiatan]: string[] }
                const old_periode_kegiatan = _kegiatan.periode_kegiatan

                const prop_name = {
                    nama_kegiatan: 'Nama Kegiatan',
                    periode_kegiatan: 'Periode Kegiatan',
                    penyelenggara_kegiatan_index: 'Penyelenggara Kegiatan',
                    lingkup_kegiatan_index: 'Lingkup Kegiatan',
                } as { [key in keyof Kegiatan]: string }

                for (const prop of [
                    'nama_kegiatan',
                    'periode_kegiatan',
                    'penyelenggara_kegiatan_index',
                    'lingkup_kegiatan_index'
                ] as (keyof Kegiatan)[]) {
                    if (kegiatan_changes[prop] !== _kegiatan[prop]) {
                        changes[prop] = [prop, prop_name[prop], _kegiatan[prop] as string, kegiatan_changes[prop] as string]
                        Object.assign(_kegiatan, { [prop]: kegiatan_changes[prop] })
                    }
                }

                const changes_text: string[] = []
                for (const change of Object.values(changes)) {
                    const prop = change[0] as keyof Kegiatan
                    const prop_name = change[1]
                    let old_value = change[2]
                    let new_value = change[3]
                    if (prop === 'periode_kegiatan') {
                        old_value = old_value.replace('-', '/')
                        new_value = new_value.replace('-', '/')
                    }
                    else if (prop === 'penyelenggara_kegiatan_index') {
                        old_value = Object.values(PenyelenggaraKegiatan)[parseInt(old_value)]
                        new_value = Object.values(PenyelenggaraKegiatan)[parseInt(new_value)]
                    }
                    else if (prop === 'lingkup_kegiatan_index') {
                        old_value = Object.values(LingkupKegiatan)[parseInt(old_value)]
                        new_value = Object.values(LingkupKegiatan)[parseInt(new_value)]
                    }
                    changes_text.push(`<li>${prop_name}: "${new_value}" ← "${old_value}"</li>`)
                }

                const log_text = `@html Pembaruan data kegiatan.<ul>${changes_text.join('')}</ul>`

                try {
                    await Promise.all([
                        db.update_kegiatan(uid, kegiatan_changes),
                        db.change_logbook(old_periode_kegiatan, _kegiatan),
                    ])
                    await Promise.all([
                        db.add_kegiatan_log(uid, defines.log_colors.pembaruan_data_kegiatan, log_text),
                        db.set_kegiatan_updated_timestamp(uid),
                    ])
                    swal.fire({
                        icon: 'success',
                        title: 'Berhasil tersimpan!',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    })
                }
                catch (err) {
                    main.show_unexpected_error_message(err)
                }

                button_batal.click()
            },
        })
    })

    const panel_rapat_verifikasi = dom.q<'div'>('#panel_urus_rapat_verifikasi')!
    const rapat_list_group = dom.qe(panel_rapat_verifikasi, '.list-group')!

    /**
     * @param antrean_lem tanggal lem buat dicari diff nya dg dpm
     * @returns 
     */
    const create_rapat_list_group_item = (jenis: JenisRapat, dengan: RapatDengan, status: StatusRapat, status_lem?: StatusRapat, antrean_lem: string = '') => {
        const children: Node[] = []

        if (status === StatusRapat.NOT_STARTED) {
            if (dengan === RapatDengan.DPM && status === StatusRapat.NOT_STARTED && status_lem === StatusRapat.NOT_STARTED) {
                children.push(dom.c('span', { classes: ['text-secondary'], html: 'belum daftar LEM' }))
            }
            else {
                const daftar_button = dom.c('button', {
                    classes: ['btn', 'btn-km-primary'],
                    attributes: {
                        style: 'min-width: max-content',
                    },
                    html: 'Daftar',
                })
                daftar_button.addEventListener('click', () => {
                    const params = { jenis, dengan, status_lem, antrean_lem }
                    store.set_item(defines.store_key.daftar_rapat, JSON.stringify(params))
                    location.href = `/urus/daftar-rapat/`
                })
                children.push(daftar_button)
            }
        }
        else {
            children.push(dom.c('span', { classes: ['text-secondary'], html: main.get_status_rapat_text(status) }))
        }

        return dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'align-items-center'],
            html: `<div class="flex-grow-1 pe-2">${defines.jenis_rapat_text[jenis]} ${defines.rapat_dengan_text[dengan]}</div>`,
            children,
        })
    }

    rapat_list_group.innerHTML = `
        <div class="d-flex align-items-center">
            <strong role="status" class="text-secondary fst-italic"
                >Memuat...</strong
            >
            <div class="spinner-border ms-auto" aria-hidden="true"></div>
        </div>
    `

    const panel_berkas = dom.q<'div'>('#panel_urus_berkas')!
    const berkas_list_group = dom.qe(panel_berkas, 'ul.list-group')!
    const berkas_ketentuan_table = dom.q<'table'>('#berkas_ketentuan_table')!
    const berkas_ketentuan_table_tbody = dom.qe<'tbody'>(berkas_ketentuan_table, 'tbody')!

    const get_berkas_ketentuan_table_rows = (dengan: RapatDengan, organisasi: OrganisasiKegiatan, nama_kegiatan: string) => {
        const dengan_text = defines.rapat_dengan_text[dengan]
        const main_folder_path = `BERKAS VERIFIKASI (${dengan_text}) / ${organisasi} / `
        const pre_path = `${main_folder_path}<strong class="text-danger">${nama_kegiatan} / `
        const post_path = ' / </strong><em>unggah berkas disini</em>'
        return [
            [
                `<td rowspan="6" class="text-center">${dengan_text}</td>`,
                `<td>Proposal & SPD</td>`,
                `<td>${pre_path}PROPOSAL${post_path}</td>`,
            ],
            [
                `<td>Revisi Proposal & SPD</td>`,
                `<td>${pre_path}PROPOSAL / REVISI${post_path}</td>`,
            ],
            [
                `<td>Revisi Proposal & SPD #2</td>`,
                `<td>${pre_path}PROPOSAL / REVISI 2${post_path}</td>`,
            ],
            [
                `<td>LPJ</td>`,
                `<td>${pre_path}LPJ${post_path}</td>`,
            ],
            [
                `<td>Revisi LPJ</td>`,
                `<td>${pre_path}LPJ / REVISI${post_path}</td>`,
            ],
            [
                `<td>Revisi LPJ #2</td>`,
                `<td>${pre_path}LPJ / REVISI 2${post_path}</td>`,
            ],
        ]
    }

    const update_berkas_ketentuan_table = (organisasi: OrganisasiKegiatan, nama_kegiatan: string) => {
        berkas_ketentuan_table_tbody.innerHTML = ''

        const lem_rows = get_berkas_ketentuan_table_rows(RapatDengan.LEM, organisasi, nama_kegiatan)
        const dpm_rows = get_berkas_ketentuan_table_rows(RapatDengan.DPM, organisasi, nama_kegiatan)
        for (const row of [...lem_rows, ...dpm_rows]) {
            const tr = dom.c('tr', { html: row.join('') })
            berkas_ketentuan_table_tbody.appendChild(tr)
        }
    }

    const create_berkas_list_group_item = (dengan: RapatDengan, link_berkas: string) => {
        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'align-items-center'],
            html: `<div class="flex-grow-1 pe-2">Unggah Berkas ${defines.rapat_dengan_text[dengan]}</div>`
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

    const update_berkas_list_group = () => {
        berkas_list_group.innerHTML = ''
        berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.LEM, sistem.data.link_berkas_lem))
        berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.DPM, sistem.data.link_berkas_dpm))
    }

    berkas_list_group.innerHTML = `
        <div class="d-flex align-items-center">
            <strong role="status" class="text-secondary fst-italic"
                >Memuat...</strong
            >
            <div class="spinner-border ms-auto" aria-hidden="true"></div>
        </div>
    `

    db.get_kegiatan(uid)
        .then(snap => {
            if (!snap.exists()) return
            const kegiatan = snap.val()
            const organisasi = Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index]

            // detail update
            update_detail_kegiatan(kegiatan)

            // rapat update
            // start listening to status verifikasi
            db.on_kegiatan_status_verifikasi(uid, async snap_stat => {
                if (!snap_stat.exists()) return
                const status_verifikasi = snap_stat.val()

                const antrean_lem = {
                    [JenisRapat.PROPOSAL]: '',
                    [JenisRapat.LPJ]: '',
                }
                await db.get_antrean_rapat_dengan(RapatDengan.LEM)
                    .then(snap => {
                        if (!snap.exists()) return
                        const rapat_list = snap.val()
                        for (const key in rapat_list) {
                            const rapat = rapat_list[key]
                            if (rapat.uid === uid) {
                                antrean_lem[rapat.jenis_rapat] = rapat.tanggal_rapat
                            }
                        }
                    })

                rapat_list_group.innerHTML = ''
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.PROPOSAL, RapatDengan.LEM, status_verifikasi.proposal.lem))
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.PROPOSAL, RapatDengan.DPM, status_verifikasi.proposal.dpm, status_verifikasi.proposal.lem, antrean_lem[JenisRapat.PROPOSAL]))
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.LPJ, RapatDengan.LEM, status_verifikasi.lpj.lem))
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.LPJ, RapatDengan.DPM, status_verifikasi.lpj.dpm, status_verifikasi.lpj.lem, antrean_lem[JenisRapat.LPJ]))
            })

            // berkas update
            // update ketentuan
            update_berkas_ketentuan_table(organisasi, kegiatan.nama_kegiatan)
            // ga butuh db sebenarnya, tapi nunggu update ketentuan selesai
            update_berkas_list_group()

            _kegiatan = kegiatan
            _form_edit_prev_kegiatan = kegiatan
            dom.enable(button_ubah)
        })
})();

// panel log kegiatan
(() => {
    const panel = dom.q<'div'>('#panel_urus_log_kegiatan')!

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

    const uid = auth.get_logged_in_user()!.uid
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
