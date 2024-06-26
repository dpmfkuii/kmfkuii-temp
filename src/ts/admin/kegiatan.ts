(async () => {
    let _logbook_snapshot: LogbookKegiatan | null = null
    let _recent_fuse_list: LogbookData[] = []

    const table_logbook_kegiatan = dom.q<'table'>('#table_logbook_kegiatan')!
    const table_logbook_kegiatan_tbody = dom.qe<'tbody'>(table_logbook_kegiatan, 'tbody')!
    const input_table_search = dom.q<'input'>('#input_table_search')!
    const select_periode = dom.q<'select'>('.card-header select')!
    const select_periode_info_button = dom.q<'i'>('.card-header i.fa-circle-info')!

    const pagination_select_jumlah_ditampilkan = dom.q<'select'>('#logbook_table_select_jumlah_ditampilkan')!
    const pagination_span_jumlah_data = dom.q<'span'>('#logbook_table_jumlah_data')!
    const pagination_button_container = dom.q<'ul'>('.pagination')!
    const pagination_button_prev = dom.qe<'button'>(pagination_button_container, 'button[aria-label="Previous"]')!
    const pagination_button_next = dom.qe<'button'>(pagination_button_container, 'button[aria-label="Next"]')!

    // todo: use tahun settings
    const current_year = new Date().getFullYear()
    let select_periode_previous_value = select_periode.value = `${current_year}`
    select_periode.innerHTML = `
        <option value="${current_year}" selected>${main.get_logbook_periode_text(current_year)}</option>
        <option value="${current_year - 1}">${main.get_logbook_periode_text(current_year - 1)}</option>
        <option value="${current_year - 2}">${main.get_logbook_periode_text(current_year - 2)}</option>
        <option value="">Semua</option>
    `

    select_periode_info_button.addEventListener('click', () => {
        swal.fire({
            title: 'Kegiatan',
            html: `
                <div class="text-start small">
                    <div><strong>${main.get_logbook_periode_text(current_year)}:</strong><br />Sesuai periode di logbook.</div><br />
                    <div><strong>${main.get_logbook_periode_text(current_year - 1)}:</strong><br />Sesuai periode di logbook 1 tahun yang lalu.</div><br />
                    <div><strong>${main.get_logbook_periode_text(current_year - 2)}:</strong><br />Sesuai periode di logbook 2 tahun yang lalu.</div><br />
                    <div><strong>Semua:</strong><br />Seluruh periode (lebih banyak data.)</div>
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

    const pagination_display_amount_options = [10, 25, 50, 100]
    let _paginated_list: LogbookData[] = []
    let pagination_current_page = 0
    let pagination_display_amount = pagination_display_amount_options[0]
    const get_pagination_index = () => pagination_current_page * pagination_display_amount

    const get_paginated_sliced_list = () => {
        const index = get_pagination_index()
        return _paginated_list.slice(index, index + pagination_display_amount)
    }

    pagination_select_jumlah_ditampilkan.addEventListener('change', () => {
        pagination_current_page = 0
        pagination_display_amount = Number(pagination_select_jumlah_ditampilkan.value)
        update_table_logbook_paginated()
    })

    const update_pagination_buttons = () => {
        const page_amount = Math.ceil(_paginated_list.length / pagination_display_amount)

        dom.enable(pagination_button_prev, pagination_button_next)

        if (pagination_current_page === 0) {
            dom.disable(pagination_button_prev)
        }

        if (pagination_current_page === page_amount - 1) {
            dom.disable(pagination_button_next)
        }

        dom.qea(pagination_button_container, 'li.page-number').forEach(n => {
            n.parentElement!.removeChild(n)
        })

        let starting_i = Math.max(0, pagination_current_page - 1)
        if (pagination_current_page + 1 > page_amount - 1) {
            starting_i = Math.max(0, starting_i - 1)
        }

        for (let i = 0; i < Math.min(3, page_amount); i++, starting_i++) {
            const li = dom.c('li', {
                classes: ['page-item', 'page-number'],
                html: `<button class="page-link ${starting_i === pagination_current_page ? 'active' : ''}">${starting_i + 1}</button>`,
            })

            const goto_page = starting_i
            dom.qe(li, 'button')!.addEventListener('click', () => {
                pagination_current_page = Math.max(0, Math.min(Math.ceil(_paginated_list.length / pagination_display_amount) - 1, goto_page))
                update_table_logbook_paginated()
            })

            pagination_button_container.insertBefore(li, pagination_button_next.parentNode!)
        }
    }

    pagination_button_prev.addEventListener('click', () => {
        pagination_current_page = Math.max(0, pagination_current_page - 1)
        update_table_logbook_paginated()
    })

    pagination_button_next.addEventListener('click', () => {
        pagination_current_page = Math.min(Math.ceil(_paginated_list.length / pagination_display_amount) - 1, pagination_current_page + 1)
        update_table_logbook_paginated()
    })

    const filter_button_th_status_proposal_lem = dom.q<'th'>('#th_status_proposal_lem')!
    const filter_button_th_status_proposal_dpm = dom.q<'th'>('#th_status_proposal_dpm')!
    const filter_button_th_status_lpj_lem = dom.q<'th'>('#th_status_lpj_lem')!
    const filter_button_th_status_lpj_dpm = dom.q<'th'>('#th_status_lpj_dpm')!

    /**
     * 0 = all
     * 1 = not started
     * 2 = in progress
     * 3 = done
     */
    const filter_status = [0, 0, 0, 0]
    const is_filter_status_matched_status_rapat = (filter: number, status_rapat: number) => {
        if (filter === 1) {
            if (status_rapat !== StatusRapat.NOT_STARTED) {
                return false
            }
        }
        else if (filter === 2) {
            if (status_rapat !== StatusRapat.IN_PROGRESS) {
                return false
            }
        }
        else if (filter === 3) {
            if (status_rapat < StatusRapat.MARKED_AS_DONE) {
                return false
            }
        }
        return true
    }

    const run_filter = (list: LogbookData[]) => {
        return list.filter(n => {
            const s = n.status_verifikasi
            const filter_propo_lem = filter_status[0]
            const filter_propo_dpm = filter_status[1]
            const filter_lpj_lem = filter_status[2]
            const filter_lpj_dpm = filter_status[3]
            if (!is_filter_status_matched_status_rapat(filter_propo_lem, s.proposal.lem)) return false
            if (!is_filter_status_matched_status_rapat(filter_propo_dpm, s.proposal.dpm)) return false
            if (!is_filter_status_matched_status_rapat(filter_lpj_lem, s.lpj.lem)) return false
            if (!is_filter_status_matched_status_rapat(filter_lpj_dpm, s.lpj.dpm)) return false
            return true
        })
    }

    const setup_filter_button_th_status = (button: HTMLElement, filter_status_index: number) => {
        const button_small = dom.qe<'small'>(button, 'small')!
        button.addEventListener('click', () => {
            filter_status[filter_status_index] = (filter_status[filter_status_index] + 1) % 4
            switch (filter_status[filter_status_index]) {
                case 1:
                    button_small.innerHTML = main.get_status_rapat_icon(StatusRapat.NOT_STARTED, true)
                    button.className = `text-bg-secondary`
                    break
                case 2:
                    button_small.innerHTML = main.get_status_rapat_icon(StatusRapat.IN_PROGRESS, true)
                    button.className = `text-bg-primary`
                    break
                case 3:
                    button_small.innerHTML = main.get_status_rapat_icon(StatusRapat.MARKED_AS_DONE, true)
                    button.className = `text-bg-success`
                    break
                default:
                    button_small.innerHTML = `<i class="fa-solid fa-filter"></i>`
                    button.className = ''
                    break
            }

            if (input_table_search.value !== '') {
                generate_table_logbook(_recent_fuse_list)
            }
            else {
                generate_table_logbook(table_logbook_list)
            }
        })
    }

    setup_filter_button_th_status(filter_button_th_status_proposal_lem, 0)
    setup_filter_button_th_status(filter_button_th_status_proposal_dpm, 1)
    setup_filter_button_th_status(filter_button_th_status_lpj_lem, 2)
    setup_filter_button_th_status(filter_button_th_status_lpj_dpm, 3)

    let table_logbook_list: LogbookData[] = []
    let fuse: any = null

    const update_table_logbook = (list: LogbookData[], starting_number = 1) => {
        if (list.length === 0) {
            table_logbook_kegiatan_tbody.innerHTML = `
                <tr>
                    <td colspan="8"><i class="text-secondary">Tidak ada data.</i></td>
                </tr>
            `
            return
        }

        table_logbook_kegiatan_tbody.innerHTML = ''
        for (const item of list) {
            const tr = dom.c('tr')
            tr.innerHTML = `
                <td>${starting_number++}</td>
                <td>${item.uid}</td>
                <td><span role="button" class="border-bottom-dotted">${item.nama_kegiatan}</span></td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.proposal.lem)}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.proposal.dpm)}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.lpj.lem)}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.lpj.dpm)}</td>
                <td>
                    <div class="d-flex gap-1 justify-content-center fs-5">
                        <a
                            href="/admin/kegiatan/aksi/?uid=${item.uid}"
                            class="text-km-primary"
                            role="button"
                        >
                            <i class="fa-solid fa-gear"></i>
                        </a>
                        ·
                        <span class="text-danger" role="button">
                            <i class="fa-solid fa-trash-can"></i>
                        </span>
                    </div>
                </td>
            `

            const aksi_button_danger = dom.qe<'span'>(tr, 'td:last-child span.text-danger')!
            aksi_button_danger.addEventListener('click', () => button_action_hapus_kegiatan(item.nama_kegiatan, item.uid))

            const span_nama_kegiatan = dom.qe<'span'>(tr, 'td:nth-child(3) > span')!
            span_nama_kegiatan.addEventListener('click', () => main.swal_fire_detail_kegiatan(item.nama_kegiatan, item.uid))

            table_logbook_kegiatan_tbody.appendChild(tr)
        }
    }

    const update_pagination = (list: LogbookData[]) => {
        _paginated_list = list
        pagination_current_page = 0
        pagination_span_jumlah_data.textContent = `dari ${list.length} data`

        const opts = []
        if (_paginated_list.length < pagination_display_amount_options[pagination_display_amount_options.length - 1]) {
            opts.push(_paginated_list.length)
        }
        for (const opt of pagination_display_amount_options) {
            if (opt < _paginated_list.length) {
                opts.push(opt)
            }
        }

        opts.sort((a, b) => a < b ? -1 : 1)

        pagination_select_jumlah_ditampilkan.innerHTML = ''
        for (const opt of opts) {
            pagination_select_jumlah_ditampilkan.innerHTML += `<option value="${opt}" ${opt === pagination_display_amount ? 'selected' : ''}>${opt}</option>`
        }
    }

    const update_table_logbook_paginated = () => {
        update_table_logbook(get_paginated_sliced_list(), 1 + get_pagination_index())
        update_pagination_buttons()
    }

    const generate_table_logbook = (list: LogbookData[]) => {
        update_pagination(run_filter(list))
        update_table_logbook_paginated()
    }

    const button_action_hapus_kegiatan = (nama_kegiatan: string, uid: string) => {
        swal.fire({
            icon: 'warning',
            title: `Hapus akun kegiatan?`,
            html: `<small>Kegiatan <span class="text-danger">${nama_kegiatan}</span> dengan UID <span class="text-primary">${uid}</span> akan hilang dari database dan tidak bisa dipakai lagi untuk masuk.</small>`,
            showDenyButton: true,
            confirmButtonText: 'Hapus',
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
                    title: 'Hapus Akun',
                    html: '<div><i>Memproses...</i></div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    async didOpen() {
                        swal.showLoading()
                        try {
                            await db.sequence_hapus_akun_kegiatan(uid)
                        }
                        catch (err) {
                            main.show_unexpected_error_message(err)
                            return
                        }

                        for (let i = table_logbook_list.length - 1; i >= 0; i--) {
                            const item = table_logbook_list[i]
                            if (item.uid === uid && item.nama_kegiatan === nama_kegiatan) {
                                table_logbook_list.splice(i, 1)
                                break
                            }
                        }

                        update_fuse(table_logbook_list)
                        generate_table_logbook(table_logbook_list)

                        main.swal_fire_success('Hapus berhasil!')
                    },
                })
            }
        })
    }

    const update_fuse = (list: LogbookData[]) => {
        fuse = new Fuse(list, {
            // isCaseSensitive: false,
            // includeScore: false,
            // shouldSort: true,
            // includeMatches: false,
            // findAllMatches: false,
            // minMatchCharLength: 1,
            // location: 0,
            // threshold: 0.6,
            // distance: 100,
            useExtendedSearch: true,
            // ignoreLocation: false,
            // ignoreFieldNorm: false,
            // fieldNormWeight: 1,
            keys: [
                'uid',
                'nama_kegiatan',
            ]
        })
    }

    const update_table_logbook_kegiatan_from_database = () => {
        if (!_logbook_snapshot) return

        table_logbook_list.length = 0
        table_logbook_list = main.logbook_kegiatan_to_logbook_data(_logbook_snapshot)

        update_fuse(table_logbook_list)

        generate_table_logbook(table_logbook_list)
    }

    const update_table_logbook_kegiatan = () => {
        update_table_logbook_kegiatan_from_database()
    }

    input_table_search.addEventListener('keyup', () => {
        const search_pattern = input_table_search.value
        if (search_pattern === '') {
            generate_table_logbook(table_logbook_list)
        }
        else if (fuse && fuse.search) {
            const list = []
            for (const item of fuse.search(`'${search_pattern}`)) {
                list.push(item.item)
            }
            _recent_fuse_list = list
            generate_table_logbook(list)
        }
    })

    const start_loading = () => {
        table_logbook_kegiatan_tbody.innerHTML = `
            <tr>
                <td colspan=3 class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td colspan=5 class="placeholder-glow"><span class="placeholder w-100"></span></td>
            </tr>
            <tr>
                <td colspan=2 class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td colspan=2 class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td colspan=3 class="placeholder-glow"><span class="placeholder w-100"></span></td>
            </tr>
        `
    }

    const load_kegiatan = async (year: number) => {
        start_loading()

        try {
            if (year) {
                await db.get_logbook_in_periode_range(year)
                    .then(value => _logbook_snapshot = value)
            }
            else {
                await db.get_logbook()
                    .then(snap => { if (snap.exists()) _logbook_snapshot = snap.val() })
            }
        }
        catch (err) {
            main.show_unexpected_error_message(err)
        }

        if (!_logbook_snapshot) return

        update_table_logbook_kegiatan()
    }

    select_periode.addEventListener('change', () => {
        const year = Number(select_periode.value)
        if (!year) {
            swal.fire({
                icon: 'question',
                title: `Tampilkan semua data?`,
                html: `<small>Proses dapat memakan waktu dan paket data lebih banyak.</small>`,
                showDenyButton: true,
                confirmButtonText: 'Tampilkan',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-secondary',
                    denyButton: 'btn btn-success ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
            }).then((result: any) => {
                if (result.isConfirmed) {
                    load_kegiatan(year)
                    select_periode_previous_value = select_periode.value
                }
                else {
                    select_periode.value = select_periode_previous_value
                }
            })
        }
        else {
            load_kegiatan(year)
            select_periode_previous_value = select_periode.value
        }
    })

    load_kegiatan(current_year)
})()
