(() => {
    enum FINTIME_SEARCH_MODE {
        UID = 'UID',
        NAMA_KEGIATAN = 'Nama Kegiatan',
    }

    const fintime_table_controller = {
        container: dom.q<'div'>('#fintime_table_container')!,
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
        update(render_list: DatabaseKeuangan.FintimeExt[]) {
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
        search_title: dom.q<'span'>('#fintime_search_title')!,
        search_form: dom.q<'form'>('#fintime_search_form')!,
        search_input: dom.q<'input'>('#fintime_search_input')!,
        search_submit: dom.q<'input'>('#fintime_search_input + button[type="submit"]')!,
        search_result: dom.q<'input'>('#fintime_search_result')!,
        start_loading() {
            fintime_table_controller.hide()

            dom.disable(
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
                this.search_input,
                this.search_submit,
            )
        },
        show_nothing() {
            this.search_result.innerHTML = ''
            this.search_result.appendChild(dom.c('div', {
                classes: ['animate', 'animate-rise-on-enter', 'animate-speed-25'],
                html: `
                    <span class="text-secondary fst-italic">Fintime <span class="text-warning-emphasis">${this.search_input.value}</span> tidak ditemukan.</span>
                `
            }))
            main.invoke_animation()
        },
        update_by_uid(render_list: DatabaseKeuangan.FintimeExt[]) {
            this.search_result.innerHTML = ''
            fintime_table_controller.update(render_list)
            fintime_table_controller.show()
        },
        async on_submit(ev: SubmitEvent) {
            ev.preventDefault()
            this.search_input.blur()

            this.start_loading()
            try {
                await common.sleep(500)
                if (this.mode === FINTIME_SEARCH_MODE.UID) {
                    await db.keuangan.get_fintime_list(this.search_input.value)
                        .then(snap => {
                            if (!snap.exists()) {
                                this.show_nothing()
                                this.stop_loading()
                                return
                            }
                            const render_list = main.keuangan.fintime.fintime_list_to_render_list(snap.val())
                            this.update_by_uid(render_list)
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
            this.search_form.addEventListener('submit', async ev => this.on_submit(ev))
        },
    }

    fintime_search_controller.init()
})()
