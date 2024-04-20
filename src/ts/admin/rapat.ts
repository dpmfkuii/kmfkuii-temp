(() => {
    let rapat_dengan: RapatDengan = RapatDengan.LEM

    const jadwal_days_amount = 5
    const jadwal_days: string[] = []
    let jadwal_pagination_index = 0
    const jadwal_pagination_items: Date[] = [
        common.get_next_monday(),
        common.get_next_monday(new Date(), 2),
    ]

    const jadwal_pagination_prev = () => {
        jadwal_pagination_index--
        if (jadwal_pagination_index < 0) {
            jadwal_pagination_index = 0
        }
    }

    const jadwal_pagination_next = () => {
        jadwal_pagination_index++
        if (jadwal_pagination_index > jadwal_pagination_items.length - 1) {
            jadwal_pagination_index = jadwal_pagination_items.length - 1
        }
    }

    const update_jadwal_days = (starting_date: Date) => {
        jadwal_days.length = 0
        for (let i = 0; i < jadwal_days_amount; i++) {
            jadwal_days.push(common.to_date_text(starting_date))
            starting_date.setDate(starting_date.getDate() + 1)
        }
    }

    update_jadwal_days(new Date())

    const list_group_rapat_dengan = dom.q<'ul'>('#list_group_rapat_dengan')!

    const span_jadwal_header_title = dom.q<'span'>('#jadwal_header_title')!
    const jadwal_pagination_group = dom.q<'div'>('#jadwal_pagination_group')!
    const jadwal_pagination_text = dom.qe<'span'>(jadwal_pagination_group, 'span')!
    const jadwal_pagination_prev_button = dom.qe<'button'>(jadwal_pagination_group, 'button[aria-label="Previous"]')!
    const jadwal_pagination_next_button = dom.qe<'button'>(jadwal_pagination_group, 'button[aria-label="Next"]')!
    const jadwal_table = dom.q<'table'>('#jadwal_table')!
    const jadwal_table_thead_tr = dom.qe<'tr'>(jadwal_table, 'thead tr')!
    const jadwal_table_tbody = dom.qe<'tbody'>(jadwal_table, 'tbody')!

    const list_group_antrean = dom.q<'ul'>('#list_group_antrean')!
    const span_antrean_header_title = dom.q<'span'>('#antrean_header_title')!
    const span_antrean_badge = dom.q<'span'>('#antrean_badge')!

    const select_rapat_dengan = (label: RapatDengan) => {
        dom.qea(list_group_rapat_dengan, '.list-group-item').forEach(n => {
            n.classList.remove('list-group-item-secondary')
            n.classList.remove('list-group-item-primary')
            n.removeAttribute('role')

            const span_refresh_button = dom.qe<'span'>(n, 'span')!
            span_refresh_button.classList.remove('visually-hidden')
            span_refresh_button.setAttribute('role', 'button')

            if (n.getAttribute('aria-label') === label) {
                n.classList.add('list-group-item-primary')
            }
            else {
                n.classList.add('list-group-item-secondary')
                n.setAttribute('role', 'button')
                span_refresh_button.classList.add('visually-hidden')
                span_refresh_button.removeAttribute('role')
            }
        })

        rapat_dengan = label

        update_jadwal()
        update_antrean()
    }

    const update_jadwal_pagination_elements = () => {
        const first_day = jadwal_pagination_items[jadwal_pagination_index]
        const last_day = common.new_date_add(first_day, jadwal_days_amount - 1)
        jadwal_pagination_text.textContent = `${common.to_date_text_date(first_day)}—${common.to_date_text_date(last_day)}`

        jadwal_pagination_prev_button.classList.remove('disabled')
        jadwal_pagination_next_button.classList.remove('disabled')
        if (jadwal_pagination_index === 0) {
            jadwal_pagination_prev_button.classList.add('disabled')
        }
        else if (jadwal_pagination_index === jadwal_pagination_items.length - 1) {
            jadwal_pagination_next_button.classList.add('disabled')
        }
    }

    const update_jadwal_table_thead = () => {
        const current_pagination_item = jadwal_pagination_items[jadwal_pagination_index]
        jadwal_table_thead_tr.innerHTML = `<td style="min-width: 50px; width: 10%"></td>`
        for (let i = 0; i < jadwal_days_amount; i++) {
            const date_text = common.to_date_text(common.new_date_add(current_pagination_item, i))
            jadwal_table_thead_tr.innerHTML += `<td style="width: ${90 / jadwal_days_amount}%">${date_text.replace(', ', '<br />')}</td>`
        }
    }

    const update_jadwal_table_tbody = async () => {
        const current_pagination_item = jadwal_pagination_items[jadwal_pagination_index]

        jadwal_table_tbody.innerHTML = ''

        const list_jadwal_rapat_by_jam: { [jam_rapat: string]: Rapat[] } = {}
        const list_antrean_rapat_by_jam: { [jam_rapat: string]: Rapat[] } = {}

        for (const jam of JamRapat) {
            if (jam.includes('--')) continue
            list_jadwal_rapat_by_jam[jam] = []
            list_antrean_rapat_by_jam[jam] = []
        }

        // filling the lists
        try {
            for (let i = 0; i < jadwal_days_amount; i++) {
                const tanggal_rapat = common.to_date_string(common.new_date_add(current_pagination_item, i))
                await db.get_jadwal_rapat_dengan_tanggal(rapat_dengan, tanggal_rapat.replaceAll('-', '/'))
                    .then(snap => {
                        if (!snap.exists()) return

                        const rapat_list = snap.val()
                        for (const timestamp in rapat_list) {
                            const rapat = rapat_list[timestamp]
                            list_jadwal_rapat_by_jam[rapat.jam_rapat][i] = rapat
                        }
                    })

                await db.get_antrean_rapat_dengan(rapat_dengan)
                    .then(snap => {
                        if (!snap.exists()) return

                        const rapat_list = snap.val()
                        for (const timestamp in rapat_list) {
                            const rapat = rapat_list[timestamp]
                            if (rapat.tanggal_rapat === tanggal_rapat) {
                                list_antrean_rapat_by_jam[rapat.jam_rapat][i] = rapat
                            }
                        }
                    })
            }
        }
        catch (err) {
            main.show_unexpected_error_message(err)
        }

        for (const jam of JamRapat) {
            if (jam.includes('--')) continue

            const tr = dom.c('tr', {
                html: `<td class="table-light">${jam}</td>`
            })

            for (let i = 0; i < jadwal_days_amount; i++) {
                const td = dom.c('td')
                const rapat_terjadwal = list_jadwal_rapat_by_jam[jam][i]
                if (rapat_terjadwal) {
                    td.classList.add('text-bg-jadwal')
                    td.textContent = main.get_nama_rapat(rapat_terjadwal)
                }
                else {
                    const rapat_antrean = list_antrean_rapat_by_jam[jam][i]
                    if (rapat_antrean) {
                        td.classList.add('text-bg-antrean')
                        td.style.animation = 'placeholder-glow 2s ease-in-out infinite'
                        td.textContent = main.get_nama_rapat(rapat_antrean)
                    }
                }
                tr.appendChild(td)
            }

            jadwal_table_tbody.appendChild(tr)
        }
    }

    const update_jadwal = () => {
        span_jadwal_header_title.textContent = `Jadwal (${defines.rapat_dengan_text[rapat_dengan]})`

        update_jadwal_pagination_elements()
        update_jadwal_table_thead()
        update_jadwal_table_tbody()
    }

    const create_antrean_list_group_item = (rapat: Rapat, timestamp: number | string) => {
        const nama_rapat = main.get_nama_rapat(rapat)
        const waktu_rapat = main.get_waktu_rapat(rapat)

        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'gap-1', 'align-items-center'],
            html: `
                <div class="flex-grow-1">
                    <span>${nama_rapat}</span>
                    <div class="text-secondary small">
                        <span class="fw-bold"
                            ><i class="fa-regular fa-clock"></i> ${rapat.jam_rapat}</span
                        >
                        · Dibuat ${new Date(Number(timestamp)).toLocaleString()}
                    </div>
                </div>
                <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-success">
                        <i class="fa-solid fa-calendar-plus"></i>
                    </button>
                    <button class="btn btn-danger">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `
        })

        const confirm_button = dom.qe<'button'>(li, '.btn.btn-success')!
        const reject_button = dom.qe<'button'>(li, '.btn.btn-danger')!

        confirm_button.addEventListener('click', () => {
            swal.fire({
                icon: 'question',
                title: `Konfirmasi jadwal?`,
                html: '<small>Konfirmasi akan memindahkan jadwal dari antrean ke kalender. Setelah konfirmasi, jadwal masih bisa diubah atau dibatalkan.</small>',
                showDenyButton: true,
                confirmButtonText: 'Konfirmasi',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-success',
                    denyButton: 'btn btn-secondary ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                footer: nama_rapat,
            }).then((result: any) => {
                if (result.isConfirmed) {
                    swal.fire({
                        title: 'Konfirmasi Jadwal',
                        html: '<div><i>Memproses...</i></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        async didOpen() {
                            swal.showLoading()
                            try {
                                await Promise.all([
                                    db.move_rapat_from_antrean_to_jadwal(rapat, timestamp),
                                ])
                                await Promise.all([
                                    db.add_kegiatan_log(rapat.uid,
                                        defines.log_colors.jadwal_terkonfirmasi,
                                        defines.log_text.rapat_terkonfirmasi(nama_rapat, waktu_rapat),
                                    ),
                                    db.set_kegiatan_updated_timestamp(rapat.uid),
                                ])
                            }
                            catch (err) {
                                main.show_unexpected_error_message(err)
                            }

                            update_jadwal()
                            update_antrean()

                            swal.fire({
                                icon: 'success',
                                title: 'Konfirmasi berhasil!',
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

        reject_button.addEventListener('click', () => {
            swal.fire({
                icon: 'warning',
                title: 'Tolak jadwal?',
                html: '<small>Tolak akan membatalkan jadwal dan pendaftar dapat mendaftar ulang. Jika ingin mengubah waktu tanpa mendaftar ulang, lakukan konfirmasi lalu ubah.</small>',
                showDenyButton: true,
                confirmButtonText: 'Tolak',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    denyButton: 'btn btn-secondary ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                footer: nama_rapat,
            }).then((result: any) => {
                if (result.isConfirmed) {
                    swal.fire({
                        title: 'Tolak Jadwal',
                        html: '<div><i>Memproses...</i></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        async didOpen() {
                            swal.showLoading()
                            try {
                                await Promise.all([
                                    db.remove_antrean_rapat(rapat, timestamp),
                                    db.set_kegiatan_status_verifikasi(rapat.uid, rapat.jenis_rapat, rapat.rapat_dengan, StatusRapat.NOT_STARTED),
                                    db.get_kegiatan(rapat.uid).then(snap => db.set_logbook(snap.val()!)),
                                ])
                                await Promise.all([
                                    db.add_kegiatan_log(rapat.uid,
                                        defines.log_colors.jadwal_ditolak,
                                        defines.log_text.rapat_ditolak(nama_rapat, waktu_rapat),
                                    ),
                                    db.set_kegiatan_updated_timestamp(rapat.uid),
                                ])
                            }
                            catch (err) {
                                main.show_unexpected_error_message(err)
                            }

                            update_antrean()

                            swal.fire({
                                icon: 'success',
                                title: 'Tolak berhasil!',
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

    const update_antrean = async () => {
        span_antrean_header_title.textContent = `Antrean (${defines.rapat_dengan_text[rapat_dengan]})`
        list_group_antrean.innerHTML = ''
        let count = 0

        await db.get_antrean_rapat_dengan(rapat_dengan)
            .then(snap => {
                if (!snap.exists()) return

                const rapat_list = snap.val()
                let _current_date_string = ''
                for (const timestamp in rapat_list) {
                    const rapat = rapat_list[timestamp]
                    if (rapat.tanggal_rapat !== _current_date_string) {
                        list_group_antrean.appendChild(dom.c('li', {
                            classes: ['list-group-item', 'list-group-item-light', 'fs-6'],
                            html: `<i class="fa-regular fa-calendar"></i> ${common.date_string_to_date_text(rapat.tanggal_rapat)}`,
                        }))
                        _current_date_string = rapat.tanggal_rapat
                    }
                    list_group_antrean.appendChild(create_antrean_list_group_item(rapat, timestamp))
                    count++
                }
            })

        if (list_group_antrean.innerHTML === '') {
            list_group_antrean.innerHTML = '<div class="p-3 fs-6"><i class="text-secondary">Tidak ada antrean.</i></div>'
        }

        span_antrean_badge.textContent = count.toString()
    }

    jadwal_pagination_prev_button.addEventListener('click', () => {
        jadwal_pagination_prev()
        update_jadwal()
    })

    jadwal_pagination_next_button.addEventListener('click', () => {
        jadwal_pagination_next()
        update_jadwal()
    })

    for (const item of Object.values(RapatDengan)) {
        const li = dom.c('li', {
            classes: ['list-group-item', 'list-group-item-secondary', 'd-flex', 'align-items-center'],
            attributes: { role: 'button', 'aria-label': item },
            html: `
                <div class="flex-grow-1">${item.toUpperCase()}</div>
                <span><i class="fa-solid fa-arrows-rotate"></i></span>
            `,
        })

        li.addEventListener('click', () => {
            if (li.classList.contains('list-group-item-secondary')) {
                select_rapat_dengan(item)
            }
        })

        const span_refresh_button = dom.qe<'span'>(li, 'span')!
        span_refresh_button.addEventListener('click', () => {
            if (!span_refresh_button.classList.contains('visually-hidden')) {
                select_rapat_dengan(item)
            }
        })

        list_group_rapat_dengan.appendChild(li)
    }

    jadwal_pagination_prev()
    select_rapat_dengan(RapatDengan.LEM)
})()
