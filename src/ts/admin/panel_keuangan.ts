interface EventsMap {
    fintime_form_reset: any
}

(async () => {
    const IS_ADMIN = auth.get_logged_in_user()?.role === UserRole.ADMIN
    const PARAMS_UID = common.url_params.get('uid') || ''

    const panel_keuangan = dom.q<'div'>('#panel_keuangan')
    if (!panel_keuangan) return

    const fintime_table = dom.q<'table'>('#fintime_table')!
    const fintime_form = dom.q<'form'>('#fintime_form')!
    const fintime_recap_table = dom.q<'table'>('#fintime_rekapitulasi_keuangan_table')!

    const fintime_table_controller = {
        tbody: dom.qe<'tbody'>(fintime_table, 'tbody')!,
        start_loading() {
            this.tbody.innerHTML = `<tr><td><strong class="text-secondary fst-italic">Memuat...</strong></td></tr>`
        },
        show_nothing() {
            this.tbody.innerHTML = `<tr><td><i class="text-secondary">Tidak ada data.</i></td></tr>`
        },
        update(render_list: (DatabaseKeuangan.Fintime & { last_updated_timestamp: string })[]) {
            this.tbody.innerHTML = ''

            render_list.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

            let current_header = ''
            let current_dd = ''
            for (let i = 0; i < render_list.length; i++) {
                const item = render_list[i]

                const item_date = new Date(item.datetime)
                const item_header = `${common.date_to_month_year_text(item_date)}`

                if (item_header !== current_header) {
                    this.tbody.appendChild(dom.c('tr', {
                        classes: ['fs-6'],
                        children: [
                            dom.c('td', { html: '<i class="fa-regular fa-calendar"></i>' }),
                            dom.c('td', { classes: ['text-bg-light-subtle', 'fw-bold'], html: item_header }),
                        ],
                    }))
                    current_header = item_header
                    current_dd = ''
                }

                let item_dd = common.date_to_dd_text(item_date)

                if (item_dd === current_dd) {
                    item_dd = '○'
                }
                else {
                    current_dd = item_dd
                }

                const item_tipe = Object.values(DatabaseKeuangan.FintimeTipe)[item.tipe_index]
                const item_icon = Object.values(DatabaseKeuangan.FintimeIcon)[item.icon_index]
                const item_color = Object.values(DatabaseKeuangan.FintimeColor)[item.color_index]
                let item_transaksi_li = ``
                for (const transaksi_string of item.transaksi) {
                    const { nama, jumlah } = main.keuangan.parse_transaksi_string(transaksi_string)
                    const post_text = item_tipe === DatabaseKeuangan.FintimeTipe.INFO ? '' : ` <small>(${item_tipe.toLowerCase()})</small>`
                    item_transaksi_li += `<li>${nama}: ${common.format_rupiah(jumlah)}${post_text}</li>`
                }
                const item_keterangan = item.keterangan ? `<span class="small">${item.keterangan}</span>` : ''

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

                if (IS_ADMIN && PARAMS_UID) {
                    const edit_button_text = '<i class="fa-regular fa-pen-to-square"></i> Edit'
                    const edit_button_is_editing_text = '<small>Sedang diedit</small>'
                    const edit_button = dom.c('span', {
                        attributes: { role: 'button' },
                        html: edit_button_text,
                    })
                    const hapus_button = dom.c('span', {
                        classes: ['small'],
                        attributes: { role: 'button' },
                        html: '<i class="fa-solid fa-trash-can"></i>',
                    })
                    tds[tds.length - 1].appendChild(dom.c('div', {
                        classes: ['d-flex', 'justify-content-end', 'align-items-center', 'fs-6'],
                        children: [edit_button, dom.c('span', { classes: ['mx-1'], html: '·' }), hapus_button],
                    }))

                    edit_button.addEventListener('click', () => {
                        fintime_form_controller.templat_index_select.value = Object.keys(fintime_form_templates)[0]
                        fintime_form_controller.set_selected_fintime(item.last_updated_timestamp, item)
                        fintime_form_controller.set_edit_mode(true)
                        fintime_form.scrollIntoView({ behavior: 'smooth' })
                        fintime_form_controller.toggle_collapse(false)

                        events.trigger('fintime_form_reset', 0)

                        edit_button.innerHTML = edit_button_is_editing_text
                        hapus_button.role = ''
                        hapus_button.style.opacity = '0.5'
                    })

                    hapus_button.addEventListener('click', () => {
                        if (fintime_form_controller._is_editing && fintime_form_controller._selected.last_updated_timestamp === item.last_updated_timestamp) {
                            return
                        }
                        swal.fire({
                            icon: 'warning',
                            title: 'Hapus?',
                            html: `
                                <div class="text-start p-2 small">
                                    <div class="text-bg-${item_color}-subtle p-3 rounded">
                                        <i class="${item_icon}"></i> ${item.judul} (${item_dd} ${item_header})
                                        <ul class="small mt-1">${item_transaksi_li}</ul>
                                    </div>
                                </div>
                            `,
                            showDenyButton: true,
                            confirmButtonText: 'Hapus Fintime',
                            denyButtonText: 'Nanti',
                            customClass: {
                                confirmButton: 'btn btn-danger',
                                denyButton: 'btn btn-secondary ms-2',
                            },
                            buttonsStyling: false,
                            showCloseButton: true,
                        }).then((result: any) => {
                            if (result.isConfirmed) {
                                swal.fire({
                                    title: 'Hapus Fintime',
                                    html: '<div><i>Memproses...</i></div>',
                                    showConfirmButton: false,
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    async didOpen() {
                                        swal.showLoading()
                                        try {
                                            await db.keuangan.remove_fintime(PARAMS_UID, item.last_updated_timestamp)
                                        }
                                        catch (err) {
                                            main.show_unexpected_error_message(err)
                                            return
                                        }

                                        main.swal_fire_success('Hapus berhasil!')
                                    },
                                })
                            }
                        })
                    })

                    events.on('fintime_form_reset', () => {
                        if (fintime_form_controller._is_editing && fintime_form_controller._selected.last_updated_timestamp === item.last_updated_timestamp) {
                            return
                        }
                        edit_button.innerHTML = edit_button_text
                        hapus_button.role = 'button'
                        hapus_button.style.opacity = ''
                    })
                }

                this.tbody.appendChild(dom.c('tr', {
                    children: tds,
                }))
            }

            if (this.tbody.innerHTML === '') {
                this.show_nothing()
            }
        },
    }

    const fintime_form_templates: { [name: string]: Partial<DatabaseKeuangan.Fintime> } = {
        'Menyesuaikan': {} as any,
        'Pengajuan dana': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_CASH_REGISTER),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.LIGHT),
            judul: 'Pengajuan dana',
            transaksi: ['RKAT:0', 'DPM:0'],
            keterangan: '',
        },
        'Perubahan pengajuan dana': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_CASH_REGISTER),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.LIGHT),
            judul: 'Perubahan pengajuan dana',
            transaksi: ['RKAT:0', 'DPM:0'],
            keterangan: '',
        },
        'Pengajuan dana diterima': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_CIRCLE_CHECK),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.WARNING),
            judul: 'Pengajuan dana diterima',
            transaksi: ['RKAT:0', 'DPM:0'],
            keterangan: 'Silakan kirimkan SPD kepada pihak terkait dan tunggu dana cair.',
        },
        'Peminjaman dana': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_MONEY_BILL_TRANSFER),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.SUCCESS),
            judul: 'Peminjaman dana',
            transaksi: ['DPM:0'],
            keterangan: '',
        },
        'Dana telah cair': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_COINS),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.WARNING),
            judul: 'Dana telah cair',
            transaksi: ['RKAT:0', 'DPM:0'],
            keterangan: '',
        },
        'Dana telah dikirim': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.KREDIT),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_MONEY_BILL_TRANSFER),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.SUCCESS),
            judul: 'Dana telah dikirim',
            transaksi: ['RKAT:0', 'DPM:0'],
            keterangan: '',
        },
        'Penggunaan dana': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.DEBIT),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_MONEY_BILLS),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.DANGER),
            judul: 'Penggunaan dana',
            transaksi: ['Kegiatan:0'],
            keterangan: '',
        },
        'Pengembalian dana': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_MONEY_BILL_TRANSFER),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.INFO),
            judul: 'Pengembalian dana',
            transaksi: ['Kegiatan:0'],
            keterangan: '',
        },
        'Pengembalian pinjaman': {
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(DatabaseKeuangan.FintimeTipe.INFO),
            icon_index: Object.values(DatabaseKeuangan.FintimeIcon).indexOf(DatabaseKeuangan.FintimeIcon.FA_MONEY_BILL_TRANSFER),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(DatabaseKeuangan.FintimeColor.INFO),
            judul: 'Pengembalian pinjaman',
            transaksi: ['DPM:0'],
            keterangan: '',
        },
    }

    const fintime_form_controller = {
        _is_editing: false,
        _selected: {
            last_updated_timestamp: '',
            fintime: {} as Partial<DatabaseKeuangan.Fintime>,
        },
        form_title: dom.qe(fintime_form, '#fintime_form_title')!,
        form_collapse_container: dom.qe(fintime_form, '#callout_form_fintime')!,
        datetime_input: dom.qe<'input'>(fintime_form, 'input[name="fintime_datetime"]')!,
        templat_index_select: dom.qe<'select'>(fintime_form, 'select[name="fintime_templat_index"]')!,
        tipe_index_select: dom.qe<'select'>(fintime_form, 'select[name="fintime_tipe_index"]')!,
        icon_radio_input_group: dom.qe<'div'>(fintime_form, '#fintime_icon_radio_input_group')!,
        get_icon_radio_inputs() {
            return dom.qea(this.icon_radio_input_group, 'input')
        },
        color_index_select: dom.qe<'select'>(fintime_form, 'select[name="fintime_color_index"]')!,
        judul_input: dom.qe<'input'>(fintime_form, 'input[name="fintime_judul"]')!,
        nama_transaksi_input_group: dom.qe<'div'>(fintime_form, '#fintime_nama_transaksi_input_group')!,
        jumlah_transaksi_input_group: dom.qe<'div'>(fintime_form, '#fintime_jumlah_transaksi_input_group')!,
        get_nama_transaksi_inputs() {
            return dom.qea<'input'>(this.nama_transaksi_input_group, 'input')
        },
        get_jumlah_transaksi_inputs() {
            return dom.qea<'input'>(this.jumlah_transaksi_input_group, 'input')
        },
        button_transaksi_pop: dom.qe<'button'>(fintime_form, '#button_fintime_transaksi_pop')!,
        button_transaksi_push: dom.qe<'button'>(fintime_form, '#button_fintime_transaksi_push')!,
        keterangan_input: dom.qe<'input'>(fintime_form, 'input[name="fintime_keterangan"]')!,
        button_reset: dom.qe<'button'>(fintime_form, 'button[type="reset"]')!,
        button_submit: dom.qe<'button'>(fintime_form, 'button[type="submit"]')!,
        get_icon_index_value() {
            let value = 0
            this.get_icon_radio_inputs().forEach(n => {
                if (n.checked) value = Number(n.value)
            })
            return value || 0
        },
        get_transaksi_value() {
            const transaksi: DatabaseKeuangan.Fintime['transaksi'] = []
            const nama_transaksi_inputs = this.get_nama_transaksi_inputs()
            const jumlah_transaksi_inputs = this.get_jumlah_transaksi_inputs()
            const transaksi_row_count = Math.min(nama_transaksi_inputs.length, jumlah_transaksi_inputs.length)
            for (let i = 0; i < transaksi_row_count; i++) {
                transaksi.push(main.keuangan.stringify_transaksi(nama_transaksi_inputs.item(i).value, jumlah_transaksi_inputs.item(i).valueAsNumber))
            }
            return transaksi
        },
        pop_transaksi_row(update_display = true) {
            const nama_transaksi_inputs = this.get_nama_transaksi_inputs()
            const jumlah_transaksi_inputs = this.get_jumlah_transaksi_inputs()
            let transaksi_row_count = Math.min(nama_transaksi_inputs.length, jumlah_transaksi_inputs.length)

            if (transaksi_row_count > 1) {
                transaksi_row_count -= 1
                this.nama_transaksi_input_group.innerHTML = ''
                this.jumlah_transaksi_input_group.innerHTML = ''
                for (let i = 0; i < transaksi_row_count; i++) {
                    this.nama_transaksi_input_group.appendChild(nama_transaksi_inputs.item(i))
                    this.jumlah_transaksi_input_group.appendChild(jumlah_transaksi_inputs.item(i))
                }
            }

            if (update_display) {
                this.update_button_transaksi_display(transaksi_row_count)
            }
        },
        push_transaksi_row(nama_transaksi: string = '', jumlah_transaksi: number = 0, update_display = true) {
            const nama_transaksi_inputs = this.get_nama_transaksi_inputs()
            const jumlah_transaksi_inputs = this.get_jumlah_transaksi_inputs()
            const transaksi_row_count = Math.min(nama_transaksi_inputs.length, jumlah_transaksi_inputs.length)

            this.nama_transaksi_input_group.appendChild(dom.c('input', {
                classes: ['form-control', 'form-control-sm'],
                attributes: {
                    name: `fintime_nama_transaksi${transaksi_row_count}`,
                    type: 'text',
                    value: nama_transaksi,
                    autocomplete: 'off',
                    required: '',
                }
            }))

            this.jumlah_transaksi_input_group.appendChild(dom.c('input', {
                classes: ['form-control', 'form-control-sm'],
                attributes: {
                    name: `fintime_jumlah_transaksi${transaksi_row_count}`,
                    type: 'number',
                    value: `${jumlah_transaksi}`,
                    min: '0',
                    required: '',
                }
            }))

            if (update_display) {
                this.update_button_transaksi_display(transaksi_row_count + 1)
            }
        },
        reset_transaksi_row() {
            this.nama_transaksi_input_group.innerHTML = ''
            this.jumlah_transaksi_input_group.innerHTML = ''
            if (this._is_editing && this._selected.fintime.transaksi) {
                let transaksi_row_count = 0
                for (const transaksi_string of this._selected.fintime.transaksi) {
                    const { nama, jumlah } = main.keuangan.parse_transaksi_string(transaksi_string)
                    this.push_transaksi_row(nama, jumlah, false)
                    transaksi_row_count++
                }
                this.update_button_transaksi_display(transaksi_row_count)
            }
            else {
                this.push_transaksi_row()
            }
        },
        update_icon_radio_input_group_display() {
            this.icon_radio_input_group.classList.forEach(n => {
                if (n.includes('text-bg-')) {
                    this.icon_radio_input_group.classList.remove(n)
                }
            })
            this.icon_radio_input_group.classList.add(`text-bg-${this.color_index_select.value}-subtle`)
        },
        update_button_transaksi_display(transaksi_row_count: number) {
            this.button_transaksi_pop.classList.add('visually-hidden')
            if (transaksi_row_count > 1) {
                this.button_transaksi_pop.classList.remove('visually-hidden')
            }
        },
        init() {
            fintime_form.classList.remove('visually-hidden')
            if (!IS_ADMIN) {
                fintime_form.classList.add('visually-hidden')
                return
            }

            this.templat_index_select.innerHTML = ''
            for (const name in fintime_form_templates) {
                const option = dom.c('option')
                option.textContent = option.value = name
                this.templat_index_select.options.add(option)
            }

            this.tipe_index_select.innerHTML = ''
            for (const n of Object.values(DatabaseKeuangan.FintimeTipe)) {
                const option = dom.c('option')
                option.textContent = option.value = n
                this.tipe_index_select.options.add(option)
            }

            this.icon_radio_input_group.innerHTML = ''
            let _i = 0
            for (const n of Object.values(DatabaseKeuangan.FintimeIcon)) {
                const id = `radio_fintime_icon_index${_i}`
                this.icon_radio_input_group.appendChild(dom.c('input', {
                    classes: ['btn-check'],
                    attributes: {
                        id,
                        type: 'radio',
                        name: 'fintime_icon_index',
                        value: `${Object.values(DatabaseKeuangan.FintimeIcon).indexOf(n)}`,
                        autocomplete: 'off',
                        ...(_i === 0 ? { 'checked': '' } : {}),
                    }
                }))
                this.icon_radio_input_group.appendChild(dom.c('label', {
                    classes: ['btn', 'mx-1', 'flex-fill'],
                    attributes: { for: id },
                    html: `<i class="${n}"></i>`
                }))
                _i++
            }

            this.color_index_select.innerHTML = ''
            for (const n of Object.values(DatabaseKeuangan.FintimeColor)) {
                const option = dom.c('option')
                option.value = n
                option.textContent = defines.nama_warna_bs[n]
                this.color_index_select.options.add(option)
            }

            this.templat_index_select.addEventListener('change', () => {
                const templat = fintime_form_templates[this.templat_index_select.value]
                this.set_to_template(templat)
            })

            this.color_index_select.addEventListener('change', () => {
                this.update_icon_radio_input_group_display()
            })

            this.button_transaksi_pop.addEventListener('click', () => this.pop_transaksi_row())
            this.button_transaksi_push.addEventListener('click', () => this.push_transaksi_row())
            this.button_reset.addEventListener('click', () => this.reset())

            this.update_icon_radio_input_group_display()
            this.reset_transaksi_row()
        },
        set_to_template(templat: Partial<DatabaseKeuangan.Fintime>) {
            if (templat.datetime) this.datetime_input.value = templat.datetime
            if (typeof templat.tipe_index === 'number') this.tipe_index_select.value = Object.values(DatabaseKeuangan.FintimeTipe)[templat.tipe_index || 0]
            if (typeof templat.icon_index === 'number') {
                this.get_icon_radio_inputs().forEach(n => {
                    n.checked = false
                    if (Number(n.value) === templat.icon_index) {
                        n.checked = true
                    }
                })
            }
            if (typeof templat.color_index === 'number') {
                this.color_index_select.value = Object.values(DatabaseKeuangan.FintimeColor)[templat.color_index || 0]
                this.update_icon_radio_input_group_display()
            }
            if (typeof templat.judul === 'string') this.judul_input.value = templat.judul
            if (templat.transaksi) {
                this.nama_transaksi_input_group.innerHTML = ''
                this.jumlah_transaksi_input_group.innerHTML = ''
                let transaksi_row_count = 0
                for (const transaksi_string of templat.transaksi) {
                    const { nama, jumlah } = main.keuangan.parse_transaksi_string(transaksi_string)
                    this.push_transaksi_row(nama, jumlah, false)
                    transaksi_row_count++
                }
                this.update_button_transaksi_display(transaksi_row_count)
            }
            else {
                this.nama_transaksi_input_group.innerHTML = ''
                this.jumlah_transaksi_input_group.innerHTML = ''
                this.push_transaksi_row()
            }
            if (typeof templat.keterangan === 'string') this.keterangan_input.value = templat.keterangan
        },
        reset() {
            fintime_form.reset()
            this.set_edit_mode(false)
            this._selected.last_updated_timestamp = ''
            this._selected.fintime = {}
            this.update_icon_radio_input_group_display()
            this.reset_transaksi_row()
            events.trigger('fintime_form_reset', 0)
            this.toggle_collapse(true)
        },
        get_action_text(shorten = false) {
            return `${fintime_form_controller._is_editing ? 'Simpan' : `${shorten ? 'Tambah' : 'Tambahkan'}`}`
        },
        set_edit_mode(is_editing: boolean) {
            this._is_editing = is_editing
            this.button_submit.textContent = this.get_action_text()
            this.form_title.textContent = `${is_editing ? 'Edit' : 'Tambah'}`
        },
        set_selected_fintime(last_updated_timestamp: string, fintime: Partial<DatabaseKeuangan.Fintime>) {
            this._selected.last_updated_timestamp = last_updated_timestamp
            this._selected.fintime = fintime
            this.set_to_template(fintime)
        },
        toggle_collapse(new_value?: boolean) {
            if (typeof new_value === 'boolean') {
                this.form_collapse_container.classList.remove('show')
                if (new_value) {
                    this.form_collapse_container.classList.add('show')
                }
            }
            this.form_title.click()
        },
    }

    fintime_form_controller.init()

    fintime_form.addEventListener('submit', async ev => {
        ev.preventDefault()

        if (!IS_ADMIN) return

        const new_fintime: DatabaseKeuangan.Fintime = {
            datetime: fintime_form_controller.datetime_input.value,
            tipe_index: Object.values(DatabaseKeuangan.FintimeTipe).indexOf(fintime_form_controller.tipe_index_select.value as DatabaseKeuangan.FintimeTipe),
            icon_index: fintime_form_controller.get_icon_index_value(),
            color_index: Object.values(DatabaseKeuangan.FintimeColor).indexOf(fintime_form_controller.color_index_select.value as DatabaseKeuangan.FintimeColor),
            judul: fintime_form_controller.judul_input.value,
            transaksi: fintime_form_controller.get_transaksi_value(),
            keterangan: fintime_form_controller.keterangan_input.value,
        }

        if (PARAMS_UID) {
            const action_text = fintime_form_controller.get_action_text(true)
            await swal.fire({
                title: `${action_text} Fintime`,
                html: '<div><i>Memproses...</i></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                async didOpen() {
                    swal.showLoading()
                    try {
                        await db.keuangan.update_fintime_list(PARAMS_UID, {
                            [common.timestamp()]: new_fintime,
                            ...((fintime_form_controller._is_editing && fintime_form_controller._selected.last_updated_timestamp) ? {
                                [fintime_form_controller._selected.last_updated_timestamp]: null as any
                            } : {})
                        })
                    }
                    catch (err) {
                        main.show_unexpected_error_message(err)
                        return
                    }
                    main.swal_fire_success(`${action_text} berhasil!`)
                    fintime_form_controller.reset()
                },
            })
        }
    })

    const fintime_recap_table_controller = {
        tbody: dom.qe<'tbody'>(fintime_recap_table, 'tbody')!,
        tfoot: dom.qe<'tfoot'>(fintime_recap_table, 'tfoot')!,
        start_loading() {
            this.tbody.innerHTML = `<tr><td colspan="5"><strong class="text-secondary fst-italic">Memuat...</strong></td></tr>`
            this.tfoot.innerHTML = ''
        },
        show_nothing() {
            this.tbody.innerHTML = `<tr><td colspan="5"><i class="text-secondary">Tidak ada data.</i></td></tr>`
            this.tfoot.innerHTML = ''
        },
        update(render_list: (DatabaseKeuangan.Fintime & { last_updated_timestamp: string })[]) {
            this.tbody.innerHTML = ''
            this.tfoot.innerHTML = ''

            render_list.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

            let no = 1,
                kredit = 0,
                debit = 0,
                saldo = 0
            for (let i = 0; i < render_list.length; i++) {
                const item = render_list[i]
                const item_tipe = Object.values(DatabaseKeuangan.FintimeTipe)[item.tipe_index]
                if (item_tipe === DatabaseKeuangan.FintimeTipe.INFO) continue
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

                        this.tbody.appendChild(dom.c('tr', {
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

                        this.tbody.appendChild(dom.c('tr', {
                            children: tds,
                        }))
                    }
                }
            }

            if (this.tbody.innerHTML !== '') {
                const tds = [
                    dom.c('td', { attributes: { colspan: '2' }, html: 'Total' }),
                    dom.c('td', { html: common.format_rupiah(kredit) }),
                    dom.c('td', { html: common.format_rupiah(debit) }),
                    dom.c('td', { html: `${common.format_rupiah(saldo)}` }),
                ]

                this.tfoot.appendChild(dom.c('tr', {
                    children: tds,
                }))
            }

            if (this.tbody.innerHTML === '') {
                this.show_nothing()
            }
        },
    }

    fintime_table_controller.start_loading()
    fintime_recap_table_controller.start_loading()

    try {
        let uid = PARAMS_UID
        if (!IS_ADMIN) uid = auth.get_logged_in_user()?.uid || ''
        if (uid) {
            await db.keuangan.on_fintime_list(uid, snap => {
                if (!snap.exists()) {
                    fintime_table_controller.show_nothing()
                    fintime_recap_table_controller.show_nothing()
                    return
                }
                const fintime_list = snap.val()
                const render_list: (DatabaseKeuangan.Fintime & { last_updated_timestamp: string })[] = []
                for (const last_updated_timestamp in fintime_list) {
                    render_list.push({
                        ...fintime_list[last_updated_timestamp],
                        last_updated_timestamp,
                    })
                }
                fintime_table_controller.update(render_list)
                fintime_recap_table_controller.update(render_list)
            })
        }
        else {
            fintime_table_controller.show_nothing()
            fintime_recap_table_controller.show_nothing()
        }
    }
    catch (err) {
        main.show_unexpected_error_message(err)
    }
})()
