//#region Requirements
// fincard-explorer.html
// <script defer src="/assets/js/kegiatan/fincard.js"></script>
//#endregion

try {
    enum ExplorerMode {
        PERIODE = 0,
        ORGANISASI,
        KEGIATAN,
    }
    const exp_controller = {
        mode: ExplorerMode.PERIODE,
        fincard_km_cache: {} as DatabaseKeuangan.FincardKM,
        fincard_periode_cards_cache: [] as Fincard.Card[],
        fincard_org_cards_cache: [] as Fincard.Card[],
        fincard_kegiatan_data_cache: [] as DatabaseKeuangan.Fincard[],
        fincard_kegiatan_card_cache: new Fincard.Card(),
        cards: [] as Fincard.Card[],
        el: {
            periode_select: dom.q<'select'>('#fincard_exp_periode_select')!,
            periode_info_button: dom.q<'i'>('#fincard_exp_periode_info_button')!,
            periode_info: {
                el: dom.q<'p'>('#fincard_exp_periode_info')!,
                start_html: dom.q<'p'>('#fincard_exp_periode_info')!.innerHTML,
            },
            card_parent: dom.q<'div'>('#fincard_exp_card_parent')!,
            detail_info: dom.q<'p'>('#fincard_exp_detail_info')!,
            main_table: dom.q<'table'>('#fincard_exp_main_table')!,
        },
        set_cards(new_cards: Fincard.Card[]) {
            dom.hide(this.el.periode_info.el)
            dom.hide(this.el.card_parent)
            this.el.card_parent.innerHTML = ''
            this.cards.length = 0
            for (let i = 0; i < new_cards.length; i++) {
                const col = dom.c('div', { classes: ['col', 'd-flex', 'justify-content-center', 'px-1', ...(i === new_cards.length - 1 ? [] : ['mb-3'])] })
                this.el.card_parent.appendChild(col)
                new_cards[i].mount(col)
                this.cards.push(new_cards[i])
            }
            if (this.cards.length > 0) {
                dom.show(this.el.card_parent)
                let delay = 100
                for (const card of this.cards) {
                    const card_el = card.get_html_element()
                    card_el.classList.remove('animate')
                    card_el.style.opacity = '0'
                    card_el.style.transform = 'translateY(10px)'
                    card.flip_to_front()
                    setTimeout(() => {
                        card_el.style.opacity = '1'
                        card_el.style.transform = ''
                        card_el.classList.add('animate')
                        card.update_height()
                    }, delay)
                    delay += 100
                }
            }
            else {
                dom.show(this.el.periode_info.el)
            }
        },
        start_loading(search_value: string) {
            dom.disable(this.el.periode_select)
            dom.show(this.el.periode_info.el)
            this.el.periode_info.el.innerHTML = ''
            this.el.periode_info.el.appendChild(dom.c('div', {
                classes: ['text-break', 'start-animation-rise'],
                html: `
                    <div class="spinner-border" aria-hidden="true"></div>
                    <p role="status" class="text-secondary fst-italic m-0">Mencari Fincard <span class="text-success-emphasis">${search_value}</span>.</p>
                `
            }))
        },
        stop_loading() {
            dom.enable(this.el.periode_select)
            this.el.periode_info.el.innerHTML = this.el.periode_info.start_html
        },
        set_mode(new_mode: ExplorerMode) {
            this.hide_detail_table()
            if (new_mode === ExplorerMode.KEGIATAN) {
                this.show_detail_table()
            }
            this.mode = new_mode
        },
        async on_periode_change() {
            this.set_mode(ExplorerMode.PERIODE)
            this.fincard_km_cache = {}
            const value = Number(this.el.periode_select.value)

            if (!value) {
                this.set_cards([])
                return
            }

            const opsi = main.get_opsi_periode_kegiatan(value)
            this.start_loading(main.get_logbook_periode_text(value))
            try {
                await common.sleep(500)
                await Promise.all([
                    db.keuangan.fincard.get_periode(opsi[0]).then(snap => this.fincard_km_cache[opsi[0]] = snap.val() || {}),
                    db.keuangan.fincard.get_periode(opsi[1]).then(snap => this.fincard_km_cache[opsi[1]] = snap.val() || {}),
                    db.keuangan.fincard.get_periode(opsi[2]).then(snap => this.fincard_km_cache[opsi[2]] = snap.val() || {}),
                ])
                const periode_cards: Fincard.Card[] = []
                for (const periode in this.fincard_km_cache) {
                    const fincard_periode = this.fincard_km_cache[periode]
                    const n = new Fincard.Card(Fincard.Mode.MULTI, Fincard.Rating.EMERALD)
                    n.update_data_multi_periode(periode, fincard_periode)
                    n.init_more_button(() => {
                        if (this.mode === ExplorerMode.PERIODE) {
                            this.on_periode_select(periode, n)
                        }
                        else {
                            this.on_periode_return()
                        }
                    })
                    periode_cards.push(n)
                }
                this.fincard_periode_cards_cache = periode_cards
                this.set_cards(periode_cards)
            }
            catch (err) {
                main.show_unexpected_error_message(err)
            }
            this.stop_loading()
        },
        on_periode_select(periode: string, selected_card: Fincard.Card) {
            this.set_mode(ExplorerMode.ORGANISASI)
            try {
                const org_cards: Fincard.Card[] = [selected_card]
                for (const organisasi_index in this.fincard_km_cache[periode]) {
                    const fincard_organisasi = this.fincard_km_cache[periode][organisasi_index]
                    const n = new Fincard.Card(Fincard.Mode.MULTI, Fincard.Rating.RUBY)
                    n.update_data_multi_organisasi(periode, organisasi_index, fincard_organisasi)
                    n.init_more_button(() => {
                        if (this.mode === ExplorerMode.ORGANISASI) {
                            this.on_org_select(periode, organisasi_index, selected_card, n)
                            this.update_detail_table(periode, organisasi_index)
                            this.show_detail_table()
                        }
                        else {
                            this.on_org_return()
                        }
                    })
                    org_cards.push(n)
                }
                this.fincard_org_cards_cache = org_cards
                this.set_cards(org_cards)
            }
            catch (err) {
                main.show_unexpected_error_message(err)
            }
        },
        on_org_select(periode: string, organisasi_index: number | string, selected_periode_card: Fincard.Card, selected_org_card: Fincard.Card) {
            this.set_mode(ExplorerMode.KEGIATAN)
            try {
                const kegiatan_cards: Fincard.Card[] = [selected_periode_card, selected_org_card]
                this.fincard_kegiatan_data_cache = Object.values(this.fincard_km_cache[periode][organisasi_index])
                this.fincard_kegiatan_data_cache.sort((a, b) => a.nama_kegiatan < b.nama_kegiatan ? -1 : a.nama_kegiatan > b.nama_kegiatan ? 1 : 0)
                const n = new Fincard.Card()
                n.update_footer_buttons(Fincard.Mode.MULTI)
                n.update_data_single(this.fincard_kegiatan_data_cache[0])
                n.init_more_button(() => this.el.main_table.scrollIntoView({ behavior: 'smooth' }))
                kegiatan_cards.push(n)
                this.fincard_kegiatan_card_cache = n
                this.set_cards(kegiatan_cards)
            }
            catch (err) {
                main.show_unexpected_error_message(err)
            }
        },
        on_kegiatan_select(fincard: DatabaseKeuangan.Fincard) {
            try {
                this.fincard_kegiatan_card_cache.update_data_single(fincard)
                this.fincard_kegiatan_card_cache.flip_to_front()
                this.el.periode_select.scrollIntoView({ behavior: 'smooth' })
            }
            catch (err) {
                main.show_unexpected_error_message(err)
            }
        },
        on_periode_return() {
            this.set_mode(ExplorerMode.PERIODE)
            this.set_cards(this.fincard_periode_cards_cache)
        },
        on_org_return() {
            this.set_mode(ExplorerMode.ORGANISASI)
            this.set_cards(this.fincard_org_cards_cache)
        },
        hide_detail_table() {
            dom.hide(this.el.main_table.parentElement!)
            dom.show(this.el.detail_info)
        },
        show_detail_table() {
            dom.show(this.el.main_table.parentElement!)
            dom.hide(this.el.detail_info)
        },
        update_detail_table(periode: string, organisasi_index: number | string) {
            const organisasi = Object.values(OrganisasiKegiatan)[Number(organisasi_index)] || ''
            const thead_tr_total = dom.qe(this.el.main_table, 'thead > tr:last-child')!
            const tbody = dom.qe(this.el.main_table, 'tbody')!
            let no = 1
            const total_data = {
                tahun_rkat: [] as number[],
                sub_aktivitas_rkat: [] as string[],
                rkat_murni: 0,
                rkat_alokasi: 0,
                dpm: 0,
                sisa: 0,
                sudah_kembali: 0,
                disimpan_dpm: 0,
                alokasi: 0,
                lpj_count: 0,
                lpj_done: 0,
                updated_timestamp: 0,
            }
            try {
                tbody.innerHTML = ''
                const all_show_buttons: HTMLDivElement[] = []
                for (let i = 0; i < this.fincard_kegiatan_data_cache.length; i++) {
                    const fincard = this.fincard_kegiatan_data_cache[i]
                    const sub_aktivitas_rkat = sistem.get_sub_rkat(fincard.tahun_rkat, fincard.sub_aktivitas_rkat_index)
                    const rkat_alokasi = main.keuangan.fincard.get_alokasi_amount(fincard.rkat_alokasi)
                    const alokasi = main.keuangan.fincard.get_alokasi_amount(fincard.alokasi)
                    if (!total_data.tahun_rkat.includes(fincard.tahun_rkat)) {
                        total_data.tahun_rkat.push(fincard.tahun_rkat)
                    }
                    if (!total_data.sub_aktivitas_rkat.includes(sub_aktivitas_rkat)) {
                        total_data.sub_aktivitas_rkat.push(sub_aktivitas_rkat)
                    }
                    total_data.rkat_murni += fincard.rkat_murni
                    total_data.rkat_alokasi += rkat_alokasi
                    total_data.dpm += fincard.dpm
                    total_data.sisa += fincard.sisa
                    total_data.sudah_kembali += fincard.sudah_kembali ? 1 : 0
                    total_data.alokasi += alokasi
                    total_data.lpj_count++
                    if (fincard.status_lpj > StatusRapat.IN_PROGRESS) {
                        total_data.lpj_done++
                    }
                    if (fincard.updated_timestamp > total_data.updated_timestamp) {
                        total_data.updated_timestamp = fincard.updated_timestamp
                    }
                    const show_button = dom.c('div', {
                        classes: ['btn', 'btn-sm', 'btn-km-primary'],
                        text: 'Tampilkan',
                    })
                    all_show_buttons.push(show_button)
                    tbody.appendChild(dom.c('tr', {
                        children: [
                            dom.c('td', { text: `${no++} (${common.remove_whitespaces(fincard.nama_kegiatan).substring(0, 3)})` }),
                            dom.c('td', { text: fincard.nama_kegiatan }),
                            dom.c('td', { text: `${fincard.tahun_rkat}` }),
                            dom.c('td', { text: `${sub_aktivitas_rkat}` }),
                            dom.c('td', { text: common.format_rupiah_num(fincard.rkat_murni) }),
                            dom.c('td', { text: common.format_rupiah_num(rkat_alokasi) }),
                            dom.c('td', { text: common.format_rupiah_num(fincard.dpm) }),
                            dom.c('td', { text: common.format_rupiah_num(fincard.sisa) }),
                            dom.c('td', { text: fincard.sudah_kembali ? 'Sudah' : 'Belum' }),
                            dom.c('td', { text: common.format_rupiah_num(fincard.disimpan_dpm) }),
                            dom.c('td', { text: common.format_rupiah_num(alokasi) }),
                            dom.c('td', { text: fincard.status_lpj > StatusRapat.IN_PROGRESS ? 'Sudah' : 'Belum' }),
                            dom.c('td', { text: new Date(fincard.updated_timestamp).toLocaleString() }),
                            dom.c('td', { children: [show_button] }),
                        ]
                    }))
                    show_button.addEventListener('click', () => {
                        if (show_button.classList.contains('disabled')) return
                        all_show_buttons.forEach(n => {
                            n.classList.remove('btn-secondary')
                            n.classList.add('btn-km-primary')
                            n.textContent = 'Tampilkan'
                            dom.enable(n)
                        })
                        show_button.classList.remove('btn-km-primary')
                        show_button.classList.add('btn-secondary')
                        show_button.innerHTML = '<small>Menampilkan</small>'
                        dom.disable(show_button)
                        this.on_kegiatan_select(fincard)
                    })
                }
                all_show_buttons[0].classList.remove('btn-km-primary')
                all_show_buttons[0].classList.add('btn-secondary')
                all_show_buttons[0].innerHTML = '<small>Menampilkan</small>'
                dom.disable(all_show_buttons[0])

                let tahun_rkat_org_text = '-'
                if (total_data.tahun_rkat.length > 0) {
                    if (total_data.tahun_rkat.length > 1) {
                        total_data.tahun_rkat.sort((a, b) => a - b)
                        tahun_rkat_org_text = `${total_data.tahun_rkat[0]}—${total_data.tahun_rkat[total_data.tahun_rkat.length - 1]}`
                    }
                    else {
                        tahun_rkat_org_text = `${total_data.tahun_rkat[0]}`
                    }
                }

                thead_tr_total.innerHTML = `<th scope="row">Total</th>
<th scope="col">${organisasi} ${main.keuangan.fincard.shorten_periode_text(periode)}</th>
<th>${tahun_rkat_org_text}</th>
<th>-</th>
<th>${common.format_rupiah_num(total_data.rkat_murni)}</th>
<th>${common.format_rupiah_num(total_data.rkat_alokasi)}</th>
<th>${common.format_rupiah_num(total_data.dpm)}</th>
<th>${common.format_rupiah_num(total_data.sisa)}</th>
<th>${total_data.sudah_kembali}/${total_data.lpj_count}</th>
<th>${common.format_rupiah_num(total_data.disimpan_dpm)}</th>
<th>${common.format_rupiah_num(total_data.alokasi)}</th>
<th>${total_data.lpj_done}/${total_data.lpj_count} (${Math.ceil((total_data.lpj_done / (total_data.lpj_count || 1)) * 100)}%)</th>
<th>${new Date(total_data.updated_timestamp).toLocaleString()}</th>
<th></th>
                `
            }
            catch (err) {
                main.show_unexpected_error_message(err)
            }
        },
        init() {
            // HTML & CSS
            this.el.periode_select.innerHTML = '<option selected>-- Pilih --</option>'
            for (let tahun = sistem.tahun_periode.saat_ini; tahun >= sistem.tahun_periode.tertua; tahun--) {
                this.el.periode_select.innerHTML += `<option value="${tahun}">${main.get_logbook_periode_text(tahun)}</option>`
            }

            // JS
            this.el.periode_select.addEventListener('change', () => this.on_periode_change())
            this.el.periode_info_button.addEventListener('click', () => {
                swal.fire({
                    title: 'Periode',
                    html: `
                        <div class="text-start small">
                            <div><strong>${main.get_logbook_periode_text(sistem.tahun_periode.saat_ini)}:</strong><br />Sesuai periode di logbook.</div><br />
                            <div><strong>${main.get_logbook_periode_text(sistem.tahun_periode.saat_ini - 1)}:</strong><br />Sesuai periode di logbook 1 tahun yang lalu.</div><br />
                            <div><strong>${main.get_logbook_periode_text(sistem.tahun_periode.saat_ini - 2)}:</strong><br />Sesuai periode di logbook 2 tahun yang lalu.</div><br />
                            <div><strong>Dan seterusnya.</strong></div>
                        </div>
                    `,
                    confirmButtonText: 'Tutup',
                    customClass: {
                        confirmButton: 'btn btn-secondary',
                    },
                    buttonsStyling: false,
                    showCloseButton: true,
                })
            })
        },
    }
    exp_controller.init()
}
catch { }
