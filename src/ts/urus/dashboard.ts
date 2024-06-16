// dashboard status and panel detail kegiatan
(() => {
    let is_loading = true

    const dashboard_status_controller = {
        container: dom.q<'div'>('#dashboard_status_container')!,
        title: dom.q<'h5'>('#dashboard_status_container > h5')!,
        alert: dom.q<'div'>('#dashboard_status_container > .alert')!,
        alert_last_color: 'secondary',
        alert_change_color(new_color: BSColor) {
            this.alert.classList.remove(`alert-${this.alert_last_color}`)
            this.alert.classList.add(`alert-${new_color}`)
            this.alert_last_color = new_color
        },
        update(kegiatan: Kegiatan) {
            this.title.textContent = kegiatan.nama_kegiatan
            this.alert.innerHTML = ''

            const sv = kegiatan.status.verifikasi
            this.alert.appendChild(main.create_status_verifikasi_badge('Proposal LEM', sv.proposal.lem))
            this.alert.appendChild(dom.c('span', { html: ' ' }))
            this.alert.appendChild(main.create_status_verifikasi_badge('Proposal DPM', sv.proposal.dpm))
            this.alert.appendChild(dom.c('span', { html: ' ' }))
            this.alert.appendChild(main.create_status_verifikasi_badge('LPJ LEM', sv.lpj.lem))
            this.alert.appendChild(dom.c('span', { html: ' ' }))
            this.alert.appendChild(main.create_status_verifikasi_badge('LPJ DPM', sv.lpj.dpm))

            let alert_text = 'Selamat datang!'
            let alert_icon: 'info' | 'check' = 'info'
            let alert_color: BSColor = 'primary'
            if (sv.lpj.dpm > StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi LPJ selesai, sampai bertemu lagi!`
                alert_icon = 'check'
                alert_color = 'success'
            }
            else if (sv.lpj.dpm === StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi LPJ DPM sedang berlangsung.`
                if (sv.lpj.lem === StatusRapat.IN_PROGRESS) {
                    alert_text = `Verifikasi LPJ LEM dan DPM sedang berlangsung.`
                }
            }
            else if (sv.lpj.lem > StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi LPJ LEM selesai, jangan lupa verifikasi LPJ ke DPM!`
                alert_icon = 'check'
                alert_color = 'success'
            }
            else if (sv.lpj.lem === StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi LPJ LEM sedang berlangsung.`
            }
            else if (sv.proposal.dpm > StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi proposal selesai, selamat beraktivitas dan jangan lupa LPJ!`
                alert_icon = 'check'
                alert_color = 'success'
            }
            else if (sv.proposal.dpm === StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi proposal DPM sedang berlangsung.`
                if (sv.proposal.lem === StatusRapat.IN_PROGRESS) {
                    alert_text = `Verifikasi proposal LEM dan DPM sedang berlangsung.`
                }
            }
            else if (sv.proposal.lem > StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi proposal LEM selesai, jangan lupa verifikasi proposal ke DPM!`
                alert_icon = 'check'
                alert_color = 'success'
            }
            else if (sv.proposal.lem === StatusRapat.IN_PROGRESS) {
                alert_text = `Verifikasi proposal LEM sedang berlangsung.`
            }
            else {
                alert_text = `Daftar rapat untuk memulai proses verifikasi.`
                alert_color = 'secondary'
            }
            this.alert.appendChild(dom.c('div', {
                classes: ['small', 'mt-2', 'px-1'],
                children: [dom.c('small', { html: `<i class="fa-solid fa-circle-${alert_icon}"></i> ${alert_text}` })],
            }))
            this.alert_change_color(alert_color)
        },
    }

    //#region panel detail
    const panel_detail = dom.q<'div'>('#panel_urus_detail_kegiatan')!

    const form_edit_detail = dom.q<'form'>('#form_pendaftaran_kegiatan')!

    const button_ubah = dom.qe<'button'>(panel_detail, 'button[aria-label="Ubah"]')!
    const button_batal = dom.qe<'button'>(panel_detail, 'button[aria-label="Batal"]')!

    const input_uid_kegiatan = dom.qe<'input'>(panel_detail, 'input[name="uid_kegiatan"]')!
    const input_email_pendaftar = dom.q<'input'>('input[name="email_pendaftar"]')!
    const input_nama_pendaftar = dom.q<'input'>('input[name="nama_pendaftar"]')!
    const select_organisasi = dom.q<'select'>('select[name="organisasi"]')!
    const input_nama_kegiatan = dom.q<'input'>('input[name="nama_kegiatan"]')!
    const input_tanggal_pertama_kegiatan = dom.q<'input'>('input[name="tanggal_pertama_kegiatan"]')!
    const select_periode_kegiatan = dom.q<'select'>('select[name="periode_kegiatan"]')!
    const select_penyelenggara_kegiatan = dom.q<'select'>('select[name="penyelenggara_kegiatan"]')!
    const select_lingkup_kegiatan = dom.q<'select'>('select[name="lingkup_kegiatan"]')!

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
        input_tanggal_pertama_kegiatan,
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
        input_tanggal_pertama_kegiatan.value = kegiatan.tanggal_kegiatan[0]
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
            input_email_pendaftar,
            input_nama_pendaftar,
            select_organisasi,
            input_nama_kegiatan,
            input_tanggal_pertama_kegiatan,
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
                input_email_pendaftar,
                input_nama_pendaftar,
                select_organisasi,
                input_nama_kegiatan,
                input_tanggal_pertama_kegiatan,
                select_periode_kegiatan,
                select_penyelenggara_kegiatan,
                select_lingkup_kegiatan,
            )

            button_batal.classList.remove('visually-hidden')

            button_ubah.classList.add('btn-success')
            button_ubah.classList.remove('btn-km-primary')
            button_ubah.setAttribute('is-editing', '')

            _form_edit_prev_kegiatan.email_pendaftar = common.remove_extra_spaces(input_email_pendaftar.value)
            _form_edit_prev_kegiatan.nama_pendaftar = common.remove_extra_spaces(input_nama_pendaftar.value)
            _form_edit_prev_kegiatan.organisasi_index = Object.values(OrganisasiKegiatan).indexOf(select_organisasi.value as OrganisasiKegiatan)
            _form_edit_prev_kegiatan.nama_kegiatan = common.remove_extra_spaces(input_nama_kegiatan.value)
            _form_edit_prev_kegiatan.tanggal_kegiatan = [input_tanggal_pertama_kegiatan.value]
            _form_edit_prev_kegiatan.periode_kegiatan = select_periode_kegiatan.value
            _form_edit_prev_kegiatan.penyelenggara_kegiatan_index = Object.values(PenyelenggaraKegiatan).indexOf(select_penyelenggara_kegiatan.value as PenyelenggaraKegiatan)
            _form_edit_prev_kegiatan.lingkup_kegiatan_index = Object.values(LingkupKegiatan).indexOf(select_lingkup_kegiatan.value as LingkupKegiatan)

            return
        }

        const kegiatan_changes = {
            email_pendaftar: input_email_pendaftar.value,
            nama_pendaftar: input_nama_pendaftar.value,
            organisasi_index: Object.values(OrganisasiKegiatan).indexOf(select_organisasi.value as OrganisasiKegiatan),
            nama_kegiatan: input_nama_kegiatan.value,
            tanggal_kegiatan: [input_tanggal_pertama_kegiatan.value],
            periode_kegiatan: select_periode_kegiatan.value,
            penyelenggara_kegiatan_index: Object.values(PenyelenggaraKegiatan).indexOf(select_penyelenggara_kegiatan.value as PenyelenggaraKegiatan),
            lingkup_kegiatan_index: Object.values(LingkupKegiatan).indexOf(select_lingkup_kegiatan.value as LingkupKegiatan),
        } as Kegiatan

        let is_changed
            = kegiatan_changes.email_pendaftar !== _kegiatan.email_pendaftar
            || kegiatan_changes.nama_pendaftar !== _kegiatan.nama_pendaftar
            || kegiatan_changes.organisasi_index !== _kegiatan.organisasi_index
            || kegiatan_changes.nama_kegiatan !== _kegiatan.nama_kegiatan
            || !common.is_ordered_array_equal(kegiatan_changes.tanggal_kegiatan, _kegiatan.tanggal_kegiatan)
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
                const old_organisasi_index = _kegiatan.organisasi_index

                const prop_name = {
                    email_pendaftar: 'Email Pendaftar',
                    nama_pendaftar: 'Nama Pendaftar',
                    organisasi_index: 'Organisasi',
                    nama_kegiatan: 'Nama Kegiatan',
                    tanggal_kegiatan: 'Tanggal Pertama Kegiatan',
                    periode_kegiatan: 'Periode Kegiatan',
                    penyelenggara_kegiatan_index: 'Penyelenggara Kegiatan',
                    lingkup_kegiatan_index: 'Lingkup Kegiatan',
                } as { [key in keyof Kegiatan]: string }

                for (const prop of [
                    'email_pendaftar',
                    'nama_pendaftar',
                    'organisasi_index',
                    'nama_kegiatan',
                    'tanggal_kegiatan',
                    'periode_kegiatan',
                    'penyelenggara_kegiatan_index',
                    'lingkup_kegiatan_index'
                ] as (keyof Kegiatan)[]) {
                    if (prop === 'tanggal_kegiatan') {
                        if (common.is_ordered_array_equal(kegiatan_changes[prop], _kegiatan[prop])) continue
                    }
                    if (kegiatan_changes[prop] === _kegiatan[prop]) continue

                    changes[prop] = [prop, prop_name[prop], _kegiatan[prop] as string, kegiatan_changes[prop] as string]
                    Object.assign(_kegiatan, { [prop]: kegiatan_changes[prop] })
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
                    else if (prop === 'organisasi_index') {
                        old_value = Object.values(OrganisasiKegiatan)[parseInt(old_value)]
                        new_value = Object.values(OrganisasiKegiatan)[parseInt(new_value)]
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
                        db.change_logbook(old_periode_kegiatan, old_organisasi_index, _kegiatan),
                    ])
                    await Promise.all([
                        db.add_kegiatan_log(uid, defines.log_colors.pembaruan_data_kegiatan, log_text),
                        db.set_kegiatan_updated_timestamp(uid),
                    ])

                    update_berkas_ketentuan_table(Object.values(OrganisasiKegiatan)[_kegiatan.organisasi_index], _kegiatan.nama_kegiatan)
                    update_templat_email(_kegiatan, select_templat_email.value as TemplatEmail, select_tujuan_email.value as RapatDengan)
                    dashboard_status_controller.update(_kegiatan)
                    main.swal_fire_success('Berhasil tersimpan!')
                }
                catch (err) {
                    main.show_unexpected_error_message(err)
                }

                button_batal.click()
            },
        })
    })
    //#endregion

    //#region panel rapat
    const panel_rapat_verifikasi = dom.q<'div'>('#panel_urus_rapat_verifikasi')!
    const rapat_list_group = dom.qe(panel_rapat_verifikasi, '.list-group')!
    const alur_daftar_rapat_text_email_pendaftar = dom.q('#alur_daftar_rapat_text_email_pendaftar')

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
                    const penyelenggara_kegiatan = Object.values(PenyelenggaraKegiatan)[_kegiatan.penyelenggara_kegiatan_index]
                    const tanggal_pertama_kegiatan = common.to_date_string(new Date(_kegiatan.tanggal_kegiatan[0]))
                    const params = { jenis, dengan, status_lem, antrean_lem, penyelenggara_kegiatan, tanggal_pertama_kegiatan }
                    store.set_item(defines.store_key.daftar_rapat, JSON.stringify(params))
                    location.href = `/urus/daftar-rapat/`
                })
                children.push(daftar_button)
            }
        }
        else {
            children.push(dom.c('span', { classes: ['text-secondary'], html: main.get_status_rapat_text(status, true) }))
        }

        return dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'align-items-center'],
            html: `<div class="flex-grow-1 pe-2">${defines.jenis_rapat_text[jenis]} ${defines.rapat_dengan_text[dengan]}</div>`,
            children,
        })
    }

    const update_daftar_ketentuan = (kegiatan: Kegiatan) => {
        if (alur_daftar_rapat_text_email_pendaftar) {
            alur_daftar_rapat_text_email_pendaftar.textContent = kegiatan.email_pendaftar
        }
    }

    rapat_list_group.innerHTML = `
        <div class="d-flex align-items-center">
            <strong role="status" class="text-secondary fst-italic"
                >Memuat...</strong
            >
            <div class="spinner-border ms-auto" aria-hidden="true"></div>
        </div>
    `
    //#endregion

    //#region panel berkas
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

    const create_berkas_list_group_item = (dengan: RapatDengan, link_berkas?: string) => {
        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'align-items-center'],
            html: `<div class="flex-grow-1 pe-2">Akses Berkas ${defines.rapat_dengan_text[dengan]}</div>`
        })

        li.appendChild(dom.c('a', {
            classes: ['btn', 'btn-km-primary', ...(typeof link_berkas !== 'string' ? ['disabled'] : [])],
            attributes: {
                role: 'button',
                target: '_blank',
                style: 'width: max-content',
                href: link_berkas || '',
            },
            html: typeof link_berkas === 'string'
                ? `BERKAS VERIFIKASI (${defines.rapat_dengan_text[dengan]}) <i class="fa-solid fa-arrow-up-right-from-square"></i>`
                : '<div class="spinner-border ms-auto" aria-hidden="true"></div>',
        }))

        return li
    }

    berkas_list_group.innerHTML = `
        <div class="d-flex align-items-center">
            <strong role="status" class="text-secondary fst-italic"
                >Memuat...</strong
            >
            <div class="spinner-border ms-auto" aria-hidden="true"></div>
        </div>
    `
    //#endregion

    //#region panel komunikasi
    enum TemplatEmail {
        BERKAS_ZOOM = 'berkas_dan_zoom',
        REVISI = 'revisi',
        REVISI_2 = 'revisi_2',
        PERMOHONAN_TANDA_TANGAN = 'permohonan_tanda_tangan',
        PERMOHONAN_DANA = 'permohonan_dana',
        PEMINJAMAN_DANA = 'peminjaman_dana',
        PEMINJAMAN_INVENTARIS = 'peminjaman_inventaris',
        PERMOHONAN_SAMBUTAN = 'permohonan_sambutan',
        PERMOHONAN_DITANDAI_SELESAI = 'permohonan_ditandai_selesai',
        // Lain = 'lain',
    }

    const tujuan_email = {
        [RapatDengan.LEM]: 'sekretariatlemfkuii@gmail.com',
        [RapatDengan.DPM]: 'fkuiidpm@gmail.com',
    }

    const get_subjek_email = (templat: TemplatEmail, kegiatan: Kegiatan) => {
        return {
            [TemplatEmail.BERKAS_ZOOM]: `VERIFIKASI_BERKAS & LINK ZOOM_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.REVISI]: `VERIFIKASI_REVISI_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.REVISI_2]: `VERIFIKASI_REVISI 2_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.PERMOHONAN_TANDA_TANGAN]: `PERMOHONAN TTD_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.PERMOHONAN_DANA]: `PERMOHONAN DANA_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.PEMINJAMAN_DANA]: `PEMINJAMAN DANA_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.PEMINJAMAN_INVENTARIS]: `PEMINJAMAN_INVENTARIS_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.PERMOHONAN_SAMBUTAN]: `PERMOHONAN SAMBUTAN_${kegiatan.nama_kegiatan}`,
            [TemplatEmail.PERMOHONAN_DITANDAI_SELESAI]: `VERIFIKASI_PERMOHONAN DITANDAI SELESAI_${kegiatan.nama_kegiatan}`,
            // [TemplatEmail.Lain]: `menyesuaikan`,
        }[templat]
    }

    const get_isi_email = (templat: TemplatEmail, dengan: RapatDengan, kegiatan: Kegiatan) => {
        const pre = `Assalamu'alaikum warahmatullahi wabarakatuh\n\n`
        const post = `\n\nTerima kasih,\nWassalamu'alaikum warahmatullahi wabarakatuh`
        const tujuan = `${(defines.rapat_dengan_text as any)[dengan]}`
        const nama_kegiatan = kegiatan.nama_kegiatan
        return pre + {
            [TemplatEmail.BERKAS_ZOOM]: `Izin konfirmasi bahwa berkas verifikasi telah kami upload di folder yang sudah ditetapkan.

Dan berikut link zoom untuk verifikasi dengan ${defines.rapat_dengan_text[dengan]}.

https://zoom.xxx`,
            [TemplatEmail.REVISI]: `Izin konfirmasi bahwa berkas hasil revisi telah kami upload di folder yang sudah ditetapkan.`,
            [TemplatEmail.REVISI_2]: `Izin konfirmasi bahwa berkas hasil revisi 2 telah kami upload di folder yang sudah ditetapkan.`,
            [TemplatEmail.PERMOHONAN_TANDA_TANGAN]:
                `Perkenalkan kami dari panitia kegiatan ${nama_kegiatan} izin mengajukan`
                + ` permohonan tanda tangan [nama surat] kepada ${tujuan} untuk kegiatan ${nama_kegiatan}.`
                + `\n\nBersama ini, turut kami lampirkan 1 buah file terkait.`,
            [TemplatEmail.PERMOHONAN_DANA]:
                `Perkenalkan kami dari panitia kegiatan ${nama_kegiatan} izin mengajukan`
                + ` Surat Permohonan Dana kepada ${tujuan} untuk kegiatan ${nama_kegiatan}.`
                + `\n\nBersama ini, turut kami lampirkan 1 buah file terkait.`,
            [TemplatEmail.PEMINJAMAN_DANA]:
                `Perkenalkan kami dari panitia kegiatan ${nama_kegiatan} izin mengajukan`
                + ` permohonan peminjaman dana kepada ${tujuan} untuk kegiatan ${nama_kegiatan}.`
                + `\n\nBersama ini, turut kami lampirkan surat peminjaman dana, surat permohonan dana, dan proposal terkait.`,
            [TemplatEmail.PEMINJAMAN_INVENTARIS]:
                `Perkenalkan kami dari panitia kegiatan ${nama_kegiatan} izin mengajukan`
                + ` permohonan peminjaman inventaris kepada ${tujuan} untuk kegiatan ${nama_kegiatan},`
                + ` berupa [sebutkan barang yang dipinjam].\n\nBersama ini, turut kami lampirkan surat peminjaman inventaris terkait.`,
            [TemplatEmail.PERMOHONAN_SAMBUTAN]:
                `Perkenalkan kami dari panitia kegiatan ${nama_kegiatan} izin mengirimkan`
                + ` undangan kepada [Ketua LEM/Ketua DPM/Pihak yang diundang] untuk dapat hadir memberikan sambutan`
                + ` dalam kegiatan ${nama_kegiatan}.\n\nBersama ini, turut kami lampirkan 1 buah file surat undangan terkait.`,
            [TemplatEmail.PERMOHONAN_DITANDAI_SELESAI]: `Mohon izin kami dari panitia kegiatan ${nama_kegiatan} ingin memohon kepada LEM`
                + ` untuk membantu alur verifikasi di website dengan cara menandai "selesai" pada proker kami di kolom [proposal / LPJ]`
                + ` oleh LEM untuk melanjutkan proses verifikasi ke DPM karena kami telah melewati verifikasi oleh LEM.`,
            // [TemplatEmail.Lain]: `menyesuaikan`,
        }[templat] + post
    }

    const panel_komunikasi = dom.q<'div'>('#panel_urus_komunikasi')!
    const select_templat_email = dom.q<'select'>('#select_templat_email')!
    const select_tujuan_email = dom.q<'select'>('#select_tujuan_email')!
    const span_subjek_email = dom.q<'span'>('#span_subjek_email')!
    const text_isi_email = dom.q<'div'>('#text_isi_email')!
    const button_buka_aplikasi_email = dom.q<'div'>('#button_buka_aplikasi_email')!
    const button_copy_tujuan_email = dom.q<'span'>('span[button-copy-target="select_tujuan_email"]')!
    const button_copy_subjek_email = dom.q<'span'>('span[button-copy-target="span_subjek_email"]')!
    const button_copy_isi_email = dom.q<'span'>('span[button-copy-target="text_isi_email"]')!

    const update_templat_email = (kegiatan: Kegiatan, templat: TemplatEmail, dengan: RapatDengan) => {
        if (is_loading) return

        span_subjek_email.textContent = get_subjek_email(templat, kegiatan)
        text_isi_email.innerHTML = common.text_break_to_html(get_isi_email(templat, dengan, kegiatan))
    }

    const button_copy_action = (data: string, el_to_highlight: HTMLElement) => {
        common.copy(data).then(() => {
            el_to_highlight.style.opacity = '0'
            setTimeout(() => el_to_highlight.style.opacity = '1', 250)
        })
    }

    select_templat_email.addEventListener('change', () => {
        update_templat_email(_kegiatan, select_templat_email.value as TemplatEmail, select_tujuan_email.value as RapatDengan)
    })

    select_tujuan_email.addEventListener('change', () => {
        update_templat_email(_kegiatan, select_templat_email.value as TemplatEmail, select_tujuan_email.value as RapatDengan)
    })

    button_copy_tujuan_email.addEventListener('click', () => button_copy_action(
        tujuan_email[select_tujuan_email.value as RapatDengan],
        select_tujuan_email,
    ))
    button_copy_subjek_email.addEventListener('click', () => button_copy_action(
        get_subjek_email(select_templat_email.value as TemplatEmail, _kegiatan),
        span_subjek_email,
    ))
    button_copy_isi_email.addEventListener('click', () => button_copy_action(
        get_isi_email(select_templat_email.value as TemplatEmail, select_tujuan_email.value as RapatDengan, _kegiatan),
        text_isi_email,
    ))

    button_buka_aplikasi_email.addEventListener('click', () => {
        const templat = select_templat_email.value as TemplatEmail
        const tujuan = select_tujuan_email.value as RapatDengan
        const subject = encodeURIComponent(get_subjek_email(templat, _kegiatan))
        const body = encodeURIComponent(get_isi_email(templat, tujuan, _kegiatan))
        location.href = `mailto:${tujuan_email[tujuan]}?subject=${subject}&body=${body}`
    })
    //#endregion

    try {
        berkas_list_group.innerHTML = ''
        berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.LEM))
        berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.DPM))
        const link_berkas = {
            lem: sistem.data.link_berkas_lem,
            dpm: sistem.data.link_berkas_dpm,
        }
        db.sistem.get_data_verifikasi_link_berkas()
            .then(snap => {
                if (snap.exists()) {
                    const val = snap.val()
                    if (val.lem) link_berkas.lem = val.lem
                    if (val.dpm) link_berkas.dpm = val.dpm
                }
                berkas_list_group.innerHTML = ''
                berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.LEM, link_berkas.lem))
                berkas_list_group.appendChild(create_berkas_list_group_item(RapatDengan.DPM, link_berkas.dpm))
            })

        db.get_kegiatan(uid).then(snap => {
            if (!snap.exists()) return
            is_loading = false

            const kegiatan = snap.val()
            const organisasi = Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index]

            // detail update
            update_detail_kegiatan(kegiatan)

            // rapat update
            // update ketentuan
            update_daftar_ketentuan(kegiatan)
            // start listening to status verifikasi
            db.on_kegiatan_status_verifikasi(uid, async snap_stat => {
                if (!snap_stat.exists()) return
                const status_verifikasi = snap_stat.val()

                const antrean_lem = {
                    [JenisRapat.PROPOSAL]: '',
                    [JenisRapat.LPJ]: '',
                }
                await db.get_pengajuan_rapat_kegiatan(uid)
                    .then(snap => {
                        if (!snap.exists()) return
                        const val = snap.val()
                        if (val[JenisRapat.PROPOSAL]) {
                            const propo = val[JenisRapat.PROPOSAL][RapatDengan.LEM]
                            if (propo) {
                                antrean_lem[JenisRapat.PROPOSAL] = common.to_date_string(new Date((propo.diterima || propo.diajukan)))
                            }
                        }
                        if (val[JenisRapat.LPJ]) {
                            const lpj = val[JenisRapat.LPJ][RapatDengan.LEM]
                            if (lpj) {
                                antrean_lem[JenisRapat.LPJ] = common.to_date_string(new Date((lpj.diterima || lpj.diajukan)))
                            }
                        }
                    })

                rapat_list_group.innerHTML = ''
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.PROPOSAL, RapatDengan.LEM, status_verifikasi.proposal.lem))
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.PROPOSAL, RapatDengan.DPM, status_verifikasi.proposal.dpm, status_verifikasi.proposal.lem, antrean_lem[JenisRapat.PROPOSAL]))
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.LPJ, RapatDengan.LEM, status_verifikasi.lpj.lem))
                rapat_list_group.appendChild(create_rapat_list_group_item(JenisRapat.LPJ, RapatDengan.DPM, status_verifikasi.lpj.dpm, status_verifikasi.lpj.lem, antrean_lem[JenisRapat.LPJ]))
            })

            update_berkas_ketentuan_table(organisasi, kegiatan.nama_kegiatan)
            update_templat_email(kegiatan, TemplatEmail.BERKAS_ZOOM, select_tujuan_email.value as RapatDengan)
            dashboard_status_controller.update(kegiatan)

            _kegiatan = kegiatan
            _form_edit_prev_kegiatan = kegiatan

            dom.enable(button_ubah)
        })
    }
    catch (err) {
        main.show_unexpected_error_message(err)
    }
})();

// panel log kegiatan
(() => {
    const panel = dom.q<'div'>('#panel_urus_log_kegiatan')!

    const list_group = dom.qe(panel, '.list-group')!

    const create_list_group_item = (log: LogKegiatan, log_number: number) => {
        const li = dom.c('li', {
            classes: ['list-group-item', `list-group-item-${log.color}`, 'pb-0'],
            html: `
                <span></span>
                <div class="text-secondary small text-end">
                    ${common.to_12h_format(new Date(Number(log.timestamp)))} | ${log_number}
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

        list_group.innerHTML = `<li class="list-group-item list-group-item-${defines.log_colors.awal_log} text-center rounded-bottom">Awal log kegiatan <i class="fa-solid fa-arrow-turn-up"></i></li>`

        const logs = snap.val()
        let _current_date_string = ''
        let log_number = 1
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
            list_group.prepend(create_list_group_item(log, log_number))
            log_number++
        }

        list_group.prepend(dom.c('li', {
            classes: ['list-group-item', `list-group-item-${defines.log_colors.awal_log}`, 'text-center', 'rounded-bottom'],
            html: 'Baca log kegiatan dari bawah ke atas <i class="fa-solid fa-arrow-turn-up"></i>',
        }))
    })
})()
