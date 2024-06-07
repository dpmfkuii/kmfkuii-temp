(() => {
    enum FINTIME_SEARCH_MODE {
        UID = 'UID',
        NAMA_KEGIATAN = 'Nama Kegiatan',
    }

    const fintime_table_controller = {
        container: dom.q<'div'>('#fintime_table_container')!,
        container_title: dom.q<'h4'>('#fintime_table_container_title')!,
        tbody: dom.q<'tbody'>('#fintime_table tbody')!,
        recap_tbody: dom.q<'tbody'>('#fintime_rekapitulasi_keuangan_table tbody')!,
        recap_tfoot: dom.q<'tfoot'>('#fintime_rekapitulasi_keuangan_table tfoot')!,
        hide() {
            this.container.classList.add('visually-hidden')
            this.container.classList.remove('start-animation-rise')
        },
        show() {
            this.container.classList.remove('visually-hidden')
            this.container.classList.add('start-animation-rise')
        },
        update(title: string, render_list: DatabaseKeuangan.FintimeExt[]) {
            this.container_title.textContent = title
            this.tbody.innerHTML = ''
            this.recap_tbody.innerHTML = ''
            this.recap_tfoot.innerHTML = ''

            // update table
            let current_header = '', current_dd = ''
            for (let i = 0; i < render_list.length; i++) {
                const item = render_list[i]
                const { new_current_header, new_current_dd, tds } = main.keuangan.fintime.generate_tds(item, current_header, current_dd, this.tbody)
                current_header = new_current_header, current_dd = new_current_dd
                this.tbody.appendChild(dom.c('tr', { children: tds }))
            }

            // update recap table
            let no = 1, kredit = 0, debit = 0, saldo = 0
            for (let i = 0; i < render_list.length; i++) {
                const item = render_list[i]
                const { new_no, new_kredit, new_debit, new_saldo } = main.keuangan.fintime.generate_recap_tds(item, no, kredit, debit, saldo, this.recap_tbody)
                no = new_no, kredit = new_kredit, debit = new_debit, saldo = new_saldo
            }

            if (this.recap_tbody.innerHTML !== '') {
                main.keuangan.fintime.generate_recap_tfoot(kredit, debit, saldo, this.recap_tfoot)
            }

            if (this.recap_tbody.innerHTML === '') {
                this.recap_tbody.innerHTML = `<tr><td colspan="5"><i class="text-secondary">Tidak ada data.</i></td></tr>`
                this.recap_tfoot.innerHTML = ''
            }
        },
        init() {
            this.hide()
        },
    }

    fintime_table_controller.init()

    const fintime_search_controller = {
        mode: FINTIME_SEARCH_MODE.UID,
        search_mode_group: dom.q<'ul'>('#fintime_search_mode_group')!,
        get_search_mode_item() {
            const items = {} as { [mode in FINTIME_SEARCH_MODE]: HTMLLIElement }
            dom.qea(this.search_mode_group, 'li').forEach(li => {
                items[li.ariaLabel as FINTIME_SEARCH_MODE] = li
            })
            return items
        },
        search_title: dom.q<'span'>('#fintime_search_title')!,
        search_form: dom.q<'form'>('#fintime_search_form')!,
        search_input: dom.q<'input'>('#fintime_search_input')!,
        search_submit: dom.q<'input'>('#fintime_search_input + button[type="submit"]')!,
        search_result: dom.q<'input'>('#fintime_search_result')!,
        get_fintime_search_mode_text(mode: FINTIME_SEARCH_MODE) {
            switch (mode) {
                case FINTIME_SEARCH_MODE.UID:
                    return 'Semua periode'
                case FINTIME_SEARCH_MODE.NAMA_KEGIATAN:
                    return `Periode logbook (${main.get_logbook_periode_text()})`
            }
        },
        set_mode(mode: FINTIME_SEARCH_MODE) {
            this.mode = mode

            dom.qea(this.search_mode_group, 'li').forEach(li => {
                const item_button = dom.qe<'span'>(li, '.item-button')!
                if (li.ariaLabel === mode) {
                    li.role = ''
                    li.classList.add('list-group-item-warning')
                    li.classList.remove('list-group-item-secondary')
                    item_button.classList.remove('visually-hidden')
                }
                else {
                    li.role = 'button'
                    li.classList.remove('list-group-item-warning')
                    li.classList.add('list-group-item-secondary')
                    item_button.classList.add('visually-hidden')
                }
            })

            this.search_title.textContent = `Masukkan ${mode}`
            this.search_input.placeholder = mode
            this.search_form.reset()

            console.log(mode)

        },
        start_loading() {
            fintime_table_controller.hide()

            dom.disable(
                ...Object.values(this.get_search_mode_item()),
                this.search_input,
                this.search_submit,
            )

            this.search_result.innerHTML = ''
            this.search_result.appendChild(dom.c('div', {
                classes: ['text-break', 'animate', 'animate-rise-on-enter', 'animate-speed-25'],
                html: `
                    <div class="spinner-border mb-3" aria-hidden="true"></div>
                    <p role="status" class="text-secondary fst-italic">Mencari Fintime <span class="text-warning-emphasis">${this.search_input.value}</span>.</p>
                `
            }))

            main.invoke_animation()
        },
        stop_loading() {
            dom.enable(
                ...Object.values(this.get_search_mode_item()),
                this.search_input,
                this.search_submit,
            )
        },
        show_nothing() {
            const mode_text = this.mode === FINTIME_SEARCH_MODE.UID ? this.mode : this.mode.toLowerCase()
            this.search_result.innerHTML = ''
            this.search_result.appendChild(dom.c('div', {
                classes: ['animate', 'animate-rise-on-enter', 'animate-speed-25'],
                html: `
                    <span class="text-secondary fst-italic">Fintime berdasarkan ${mode_text} <span class="text-warning-emphasis">${this.search_input.value}</span> tidak ditemukan.</span>
                `
            }))
            main.invoke_animation()
        },
        update_by_uid(title: string, render_list: DatabaseKeuangan.FintimeExt[]) {
            this.search_result.innerHTML = ''
            fintime_table_controller.update(title, render_list)
            fintime_table_controller.show()
        },
        async on_submit(ev: SubmitEvent) {
            ev.preventDefault()
            this.search_input.blur()

            this.start_loading()
            try {
                await common.sleep(500)
                if (this.mode === FINTIME_SEARCH_MODE.UID) {
                    const uid = this.search_input.value
                    await db.keuangan.get_fintime_list(uid)
                        .then(async snap => {
                            if (!snap.exists()) {
                                this.show_nothing()
                                this.stop_loading()
                                return
                            }
                            let nama_kegiatan = uid
                            const render_list = main.keuangan.fintime.fintime_list_to_render_list(snap.val())
                            await db.get_kegiatan_nama_kegiatan(uid).then(snap => {
                                if (snap.exists()) nama_kegiatan = snap.val()
                            })
                            this.update_by_uid(nama_kegiatan, render_list)
                            this.stop_loading()
                        })
                }
                else if (this.mode === FINTIME_SEARCH_MODE.NAMA_KEGIATAN) {
                    // this.update_by_nama_kegiatan(listtt)
                    this.show_nothing()
                    this.stop_loading()
                    return
                }
            }
            catch (err) {
                main.show_unexpected_error_message(err)
                this.show_nothing()
                this.stop_loading()
                return
            }
        },
        init() {
            this.search_mode_group.innerHTML = ''

            for (const mode of Object.values(FINTIME_SEARCH_MODE)) {
                const item_title = dom.c('strong', { classes: ['item-title'], html: mode })
                const item_text = dom.c('small', { classes: ['item-text'], html: this.get_fintime_search_mode_text(mode) })
                const item_button = dom.c('span', { classes: ['item-button'], attributes: { role: 'button' }, html: '<i class="fa-solid fa-magnifying-glass"></i>' })

                const li = dom.c('li', {
                    classes: ['list-group-item', 'd-flex', 'align-items-center', 'list-group-item-secondary'],
                    attributes: {
                        role: 'button',
                        'aria-label': mode,
                    },
                    children: [
                        dom.c('div', {
                            classes: ['flex-grow-1'], children: [
                                item_title,
                                dom.c('br'),
                                dom.c('small', { classes: ['text-secondary'], children: [item_text] })
                            ]
                        }),
                        item_button,
                    ]
                })

                li.addEventListener('click', () => {
                    if (li.role === 'button') {
                        this.set_mode(mode)
                    }
                })

                item_button.addEventListener('click', () => this.set_mode(mode))

                this.search_mode_group.appendChild(li)
            }

            this.set_mode(this.mode)

            this.search_form.addEventListener('submit', async ev => this.on_submit(ev))
        },
    }

    fintime_search_controller.init()
})()
