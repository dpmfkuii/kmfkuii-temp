(() => {
    let rapat_dengan: RapatDengan = RapatDengan.LEM

    const jadwal_days_amount = 5
    const jadwal_days: string[] = []
    let jadwal_pagination_index = 0
    const jadwal_pagination_items: Date[] = [
        common.get_current_monday(),
        common.get_next_monday(),
        common.get_next_monday(new Date(), 2),
        common.get_next_monday(new Date(), 3),
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
    const jadwal_info_row = dom.q<'div'>('#jadwal_info_row')!
    const jadwal_info_row_icon = dom.qe<'i'>(jadwal_info_row, 'i')!
    const jadwal_info_row_text = dom.qe<'span'>(jadwal_info_row, 'span')!
    const jadwal_pagination_group = dom.q<'div'>('#jadwal_pagination_group')!
    const jadwal_pagination_text = dom.qe<'span'>(jadwal_pagination_group, 'span')!
    const jadwal_pagination_prev_button = dom.qe<'button'>(jadwal_pagination_group, 'button[aria-label="Previous"]')!
    const jadwal_pagination_next_button = dom.qe<'button'>(jadwal_pagination_group, 'button[aria-label="Next"]')!
    const jadwal_table = dom.q<'table'>('#jadwal_table')!
    const jadwal_table_thead_tr = dom.qe<'tr'>(jadwal_table, 'thead tr')!
    const jadwal_table_tbody = dom.qe<'tbody'>(jadwal_table, 'tbody')!
    const jadwal_more_info = dom.q<'div'>('#jadwal_more_info')!

    const list_group_antrean = dom.q<'ul'>('#list_group_antrean')!
    const antrean_card = dom.q<'div'>('#antrean_card')!
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
        const last_day = common.add_date_new(first_day, jadwal_days_amount - 1)
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

    const update_jadwal_info_row = () => {
        const first_day = jadwal_pagination_items[jadwal_pagination_index]
        const min_tanggal_rapat = main.get_min_tanggal_rapat()

        let text = 'Terbuka untuk pendaftaran.'
        jadwal_info_row.classList.add('text-bg-jadwal')
        jadwal_info_row.classList.remove('text-bg-dark')
        jadwal_info_row_icon.classList.add('fa-circle-check')
        jadwal_info_row_icon.classList.remove('fa-circle-exclamation')

        if (common.is_date_before(first_day, min_tanggal_rapat)) {
            text = 'Pendaftaran di minggu ini sudah tutup.'
            jadwal_info_row.classList.remove('text-bg-jadwal')
            jadwal_info_row.classList.add('text-bg-dark')
            jadwal_info_row_icon.classList.remove('fa-circle-check')
            jadwal_info_row_icon.classList.add('fa-circle-exclamation')
        }

        jadwal_info_row_text.textContent = text
    }

    const update_jadwal_table_thead = () => {
        const current_pagination_item = jadwal_pagination_items[jadwal_pagination_index]
        jadwal_table_thead_tr.innerHTML = `<td style="min-width: 50px; width: 10%">Tgl<hr class="m-0" />Jam</td>`
        for (let i = 0; i < jadwal_days_amount; i++) {
            const date_text = common.to_date_text(common.add_date_new(current_pagination_item, i))
            jadwal_table_thead_tr.innerHTML += `<td style="width: ${90 / jadwal_days_amount}%">${date_text.replace(', ', '<br />')}</td>`
        }
    }

    const update_jadwal_table_tbody = async () => {
        const current_pagination_item = jadwal_pagination_items[jadwal_pagination_index]

        jadwal_table_tbody.innerHTML = `
            <tr><td colspan=${jadwal_days_amount + 1}>
            <div class="d-flex flex-column gap-1 align-items-center text-center">
                <div class="spinner-border" aria-hidden="true"></div>
                <strong role="status" class="text-secondary fst-italic"
                    >Memuat...</strong
                >
            </div>
            </td></tr>
        `

        const list_jadwal_rapat_by_jam: { [jam_rapat: string]: (Rapat & { timestamp: string })[] } = {}
        const list_antrean_rapat_by_jam: { [jam_rapat: string]: Rapat[] } = {}

        for (const jam of JamRapat) {
            if (jam.includes('--')) continue
            list_jadwal_rapat_by_jam[jam] = []
            list_antrean_rapat_by_jam[jam] = []
        }

        // filling the lists
        try {
            for (let i = 0; i < jadwal_days_amount; i++) {
                const tanggal_rapat = common.to_date_string(common.add_date_new(current_pagination_item, i))
                await db.get_jadwal_rapat_dengan_tanggal(rapat_dengan, tanggal_rapat.replaceAll('-', '/'))
                    .then(snap => {
                        if (!snap.exists()) return

                        const rapat_list = snap.val()
                        for (const timestamp in rapat_list) {
                            const rapat = rapat_list[timestamp]
                            list_jadwal_rapat_by_jam[rapat.jam_rapat][i] = {
                                ...rapat,
                                timestamp,
                            }
                        }
                    })

                await db.get_antrean_rapat_dengan(rapat_dengan)
                    .then(snap => {
                        if (!snap.exists()) return

                        const rapat_list = snap.val()
                        for (const antrean_key in rapat_list) {
                            const rapat = rapat_list[antrean_key]
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

        jadwal_table_tbody.innerHTML = ''

        for (const jam of JamRapat) {
            if (jam.includes('--')) continue

            const tr = dom.c('tr', {
                html: `<td>${jam}</td>`
            })

            for (let i = 0; i < jadwal_days_amount; i++) {
                const td = dom.c('td')
                if (globals.rapat.show_more_info) {
                    if (jam === '19.00') {
                        td.innerHTML = '<span class="badge text-bg-danger">-</span>'
                    }
                }
                const rapat_terjadwal = list_jadwal_rapat_by_jam[jam][i]
                if (rapat_terjadwal) {
                    td.classList.add('text-bg-jadwal')
                    td.setAttribute('role', 'button')
                    td.textContent = main.get_nama_rapat(rapat_terjadwal)

                    const pindah_button = dom.c('button', {
                        classes: ['btn', 'btn-warning', 'text-light'],
                        html: '<i class="fa-solid fa-calendar-day"></i>'
                    })

                    const batal_button = dom.c('button', {
                        classes: ['btn', 'btn-danger'],
                        html: '<i class="fa-solid fa-trash-can"></i>'
                    })

                    const nama_rapat = main.get_nama_rapat(rapat_terjadwal)
                    const waktu_rapat = main.get_waktu_rapat(rapat_terjadwal)

                    pindah_button.addEventListener('click', async () => {
                        const log_color = defines.log_colors.jadwal_dipindah

                        let jam_options_html = ''
                        for (const jam of JamRapat) {
                            const option = dom.c('option')
                            option.textContent = option.value = jam
                            if (jam.includes('--')) {
                                option.value = ''
                                option.disabled = true
                            }
                            jam_options_html += option.outerHTML
                        }
                        const { value: formValues } = await swal.fire({
                            title: `Pilih waktu baru`,
                            html: `
                                <div class="row row-cols-1 row-cols-sm-2 m-0 mt-2">
                                    <div class="col">
                                        <div class="mb-3">
                                            <div class="form-floating">
                                                <input
                                                    name="tanggal_rapat"
                                                    type="date"
                                                    class="form-control"
                                                    id="input_tanggal_rapat"
                                                    value="${rapat_terjadwal.tanggal_rapat}"
                                                />
                                                <label for="input_tanggal_rapat">Tanggal</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="mb-3">
                                            <div class="form-floating">
                                                <select
                                                    name="jam_rapat"
                                                    class="form-select"
                                                    id="input_jam_rapat"
                                                >
                                                    <option disabled value>-- Pilih jam --</option>
                                                    ${jam_options_html}
                                                </select>
                                                <label for="input_jam_rapat">Jam</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>                        
                            `,
                            showDenyButton: true,
                            confirmButtonText: 'Pindah',
                            denyButtonText: 'Nanti',
                            customClass: {
                                confirmButton: 'btn btn-warning text-light',
                                denyButton: 'btn btn-secondary ms-2',
                            },
                            buttonsStyling: false,
                            showCloseButton: true,
                            footer: `<small id="pindah_footer">Akan muncul log: <span class="text-${log_color}">${defines.log_text.rapat_dipindah(nama_rapat, waktu_rapat, waktu_rapat)}</span></small>`,
                            preConfirm() {
                                return {
                                    new_tanggal_rapat: dom.q<'select'>('#input_tanggal_rapat')!.value,
                                    new_jam_rapat: dom.q<'select'>('#input_jam_rapat')!.value,
                                }
                            },
                            didOpen() {
                                try {
                                    const new_tanggal_rapat = dom.q<'select'>('#input_tanggal_rapat')!
                                    const new_jam_rapat = dom.q<'select'>('#input_jam_rapat')!
                                    const pindah_footer = dom.q<'small'>('#pindah_footer')!
                                    const pindah_footer_log = dom.qe<'span'>(pindah_footer, 'span')!
                                    new_jam_rapat.value = rapat_terjadwal.jam_rapat

                                    const update_footer_log = () => {
                                        const new_waktu_rapat = main.get_waktu_rapat({
                                            ...rapat_terjadwal,
                                            tanggal_rapat: new_tanggal_rapat.value,
                                            jam_rapat: new_jam_rapat.value,
                                        })
                                        pindah_footer_log.innerHTML = defines.log_text.rapat_dipindah(nama_rapat, waktu_rapat, new_waktu_rapat)
                                    }

                                    new_tanggal_rapat.addEventListener('change', () => {
                                        update_footer_log()
                                    })

                                    new_jam_rapat.addEventListener('change', () => {
                                        update_footer_log()
                                    })
                                }
                                catch { }
                            },
                        })

                        if (formValues) {
                            swal.fire({
                                title: 'Pindah Jadwal',
                                html: '<div><i>Memproses...</i></div>',
                                showConfirmButton: false,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                async didOpen() {
                                    swal.showLoading()

                                    const popup = swal.getPopup()
                                    if (!popup) {
                                        swal.hideLoading()
                                        return
                                    }

                                    const new_tanggal_rapat = formValues.new_tanggal_rapat
                                    const new_jam_rapat = formValues.new_jam_rapat
                                    const new_waktu_rapat = main.get_waktu_rapat({
                                        ...rapat_terjadwal,
                                        tanggal_rapat: new_tanggal_rapat,
                                        jam_rapat: new_jam_rapat,
                                    })

                                    // cancel kalau jadwal already taken
                                    let already_taken = ''
                                    try {
                                        await db.get_jadwal_rapat_dengan_tanggal(rapat_terjadwal.rapat_dengan, new_tanggal_rapat.replaceAll('-', '/'))
                                            .then(snap => {
                                                if (snap.exists()) {
                                                    const rapat_list = snap.val()
                                                    for (const timestamp in rapat_list) {
                                                        if (rapat_list[timestamp].jam_rapat === new_jam_rapat) {
                                                            already_taken = main.get_nama_rapat(rapat_list[timestamp])
                                                            break
                                                        }
                                                    }
                                                }
                                            })
                                    }
                                    catch (err) {
                                        main.show_unexpected_error_message(err)
                                        return
                                    }

                                    if (already_taken !== '') {
                                        swal.fire({
                                            icon: 'error',
                                            title: 'Pindah Jadwal',
                                            html: `<small>Jadwal pada ${new_waktu_rapat} sudah diambil ${already_taken}. Coba waktu lain.</small>`,
                                            confirmButtonText: 'Tutup',
                                            customClass: {
                                                confirmButton: 'btn btn-secondary',
                                            },
                                            buttonsStyling: false,
                                            showCloseButton: true,
                                        })
                                        return
                                    }

                                    try {
                                        await Promise.all([
                                            db.move_jadwal_rapat(rapat_terjadwal, rapat_terjadwal.timestamp, new_tanggal_rapat, new_jam_rapat),
                                            db.set_pengajuan_diterima(rapat_terjadwal.uid,
                                                rapat_terjadwal.jenis_rapat, rapat_terjadwal.rapat_dengan,
                                                main.tanggal_dan_jam_to_date(new_tanggal_rapat, new_jam_rapat),
                                            )
                                        ])

                                        await Promise.all([
                                            db.add_kegiatan_log(rapat_terjadwal.uid,
                                                log_color,
                                                defines.log_text.rapat_dipindah(nama_rapat, waktu_rapat, new_waktu_rapat),
                                            ),
                                            db.set_kegiatan_updated_timestamp(rapat_terjadwal.uid),
                                        ])
                                    }
                                    catch (err) {
                                        main.show_unexpected_error_message(err)
                                        return
                                    }

                                    update_jadwal()
                                    update_antrean()

                                    swal.fire({
                                        icon: 'success',
                                        title: 'Pindah berhasil!',
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

                    batal_button.addEventListener('click', () => {
                        const log_color = defines.log_colors.jadwal_dihapus
                        const log_text = defines.log_text.rapat_dihapus(nama_rapat, waktu_rapat)

                        swal.fire({
                            icon: 'warning',
                            title: 'Hapus jadwal?',
                            html: '<small>Hapus jadwal hanya <strong class="text-danger">menghapus dari kalender dan tidak membatalkan</strong> proses verifikasi. Lakukan pembatalan lewat menu kegiatan bila perlu.</small>',
                            showDenyButton: true,
                            confirmButtonText: 'Hapus',
                            denyButtonText: 'Nanti',
                            customClass: {
                                confirmButton: 'btn btn-danger',
                                denyButton: 'btn btn-secondary ms-2',
                            },
                            buttonsStyling: false,
                            showCloseButton: true,
                            footer: `<small>Akan muncul log: <span class="text-${log_color}">${log_text}</span></small>`,
                        }).then((result: any) => {
                            if (result.isConfirmed) {
                                swal.fire({
                                    title: 'Hapus Jadwal',
                                    html: '<div><i>Memproses...</i></div>',
                                    showConfirmButton: false,
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    async didOpen() {
                                        swal.showLoading()
                                        try {
                                            await db.remove_jadwal_rapat(rapat_terjadwal, rapat_terjadwal.timestamp)
                                            await Promise.all([
                                                db.add_kegiatan_log(rapat_terjadwal.uid,
                                                    log_color,
                                                    log_text,
                                                ),
                                                db.set_kegiatan_updated_timestamp(rapat_terjadwal.uid),
                                            ])
                                        }
                                        catch (err) {
                                            main.show_unexpected_error_message(err)
                                            return
                                        }

                                        update_jadwal()
                                        update_antrean()

                                        swal.fire({
                                            icon: 'success',
                                            title: 'Hapus berhasil!',
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

                    const action_el_group = dom.c('div', {
                        classes: ['d-flex', 'gap-1'],
                        children: [
                            pindah_button,
                            batal_button,
                        ]
                    })

                    td.addEventListener('click', () => {
                        main.swal_fire_detail_kegiatan(rapat_terjadwal.nama_kegiatan, rapat_terjadwal.uid, {
                            action_el_group,
                        })
                    })
                }
                else {
                    const rapat_antrean = list_antrean_rapat_by_jam[jam][i]
                    if (rapat_antrean) {
                        td.classList.add('text-bg-antrean')
                        td.setAttribute('role', 'button')
                        td.style.animation = 'placeholder-glow 2s ease-in-out infinite'
                        td.textContent = main.get_nama_rapat(rapat_antrean)

                        td.addEventListener('click', () => {
                            main.swal_fire_detail_kegiatan(rapat_antrean.nama_kegiatan, rapat_antrean.uid)
                        })
                    }
                }
                tr.appendChild(td)
            }

            jadwal_table_tbody.appendChild(tr)
        }
    }

    const update_jadwal_more_info_row = () => {
        if (globals.rapat.show_more_info) {
            jadwal_more_info.classList.remove('visually-hidden')
        }
        else {
            jadwal_more_info.classList.add('visually-hidden')
        }
    }

    const update_jadwal = () => {
        span_jadwal_header_title.textContent = `Jadwal (${defines.rapat_dengan_text[rapat_dengan]})`

        update_jadwal_pagination_elements()
        update_jadwal_info_row()
        update_jadwal_table_thead()
        update_jadwal_table_tbody()
        update_jadwal_more_info_row()
    }

    const create_antrean_list_group_item = (rapat: Rapat) => {
        const nama_rapat = main.get_nama_rapat(rapat)
        const waktu_rapat = main.get_waktu_rapat(rapat)

        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'gap-1', 'align-items-center'],
            html: `
                <div class="flex-grow-1">
                    <span class="span-nama-rapat">${nama_rapat}</span>
                    <div class="text-secondary small">
                        <span class="fw-bold"
                            ><i class="fa-regular fa-clock"></i> ${rapat.jam_rapat}</span
                        >
                        · Dibuat ${new Date(Number(rapat.t)).toLocaleString()}
                    </div>
                </div>
                <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-success">
                        <i class="fa-solid fa-calendar-plus"></i>
                    </button>
                    <button class="btn btn-danger">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </button>
                </div>
            `
        })

        const span_nama_rapat = dom.qe<'button'>(li, '.span-nama-rapat')!
        span_nama_rapat.setAttribute('role', 'button')

        span_nama_rapat.addEventListener('click', () => {
            main.swal_fire_detail_kegiatan(rapat.nama_kegiatan, rapat.uid)
        })

        const confirm_button = dom.qe<'button'>(li, '.btn.btn-success')!
        const reject_button = dom.qe<'button'>(li, '.btn.btn-danger')!

        const role = auth.get_logged_in_user()?.role
        if (role !== UserRole.ADMIN) {
            confirm_button.classList.add('visually-hidden')
            reject_button.classList.add('visually-hidden')
            return li
        }

        confirm_button.addEventListener('click', () => {
            const log_color = defines.log_colors.jadwal_terkonfirmasi
            const log_text = defines.log_text.rapat_terkonfirmasi(nama_rapat, waktu_rapat)

            swal.fire({
                icon: 'question',
                title: `Konfirmasi jadwal?`,
                html: '<small>Konfirmasi akan memindahkan jadwal dari antrean ke kalender. Setelah konfirmasi, jadwal masih bisa diubah atau dihapus.</small>',
                showDenyButton: true,
                confirmButtonText: 'Konfirmasi',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-success',
                    denyButton: 'btn btn-secondary ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                footer: `<small>Akan muncul log: <span class="text-${log_color}">${log_text}</span></small>`,
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
                                    db.move_rapat_from_antrean_to_jadwal(rapat),
                                    db.set_pengajuan_diterima(rapat.uid,
                                        rapat.jenis_rapat, rapat.rapat_dengan,
                                        main.tanggal_dan_jam_to_date(rapat.tanggal_rapat, rapat.jam_rapat),
                                    )
                                ])
                                await Promise.all([
                                    db.add_kegiatan_log(rapat.uid,
                                        log_color,
                                        log_text,
                                    ),
                                    db.set_kegiatan_updated_timestamp(rapat.uid),
                                ])
                            }
                            catch (err) {
                                main.show_unexpected_error_message(err)
                                return
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
            const log_color = defines.log_colors.jadwal_ditolak
            const log_text = defines.log_text.rapat_ditolak(nama_rapat, waktu_rapat)

            swal.fire({
                icon: 'warning',
                title: 'Tolak jadwal?',
                html: '<small>Tolak akan <strong class="text-danger">membatalkan proses verifikasi</strong> dan pendaftar dapat mendaftar ulang. Jika ingin memindah waktu tanpa mendaftar ulang, lakukan konfirmasi lalu pindah.</small>',
                showDenyButton: true,
                confirmButtonText: 'Tolak & Batalkan',
                denyButtonText: 'Nanti',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    denyButton: 'btn btn-secondary ms-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                footer: `<small>Akan muncul log: <span class="text-${log_color}">${log_text}</span></small>`,
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
                                    db.remove_antrean_rapat(rapat),
                                    db.set_kegiatan_status_verifikasi(rapat.uid, rapat.jenis_rapat, rapat.rapat_dengan, StatusRapat.NOT_STARTED),
                                    db.get_kegiatan(rapat.uid).then(snap => db.set_logbook(snap.val()!)),
                                ])
                                await Promise.all([
                                    db.add_kegiatan_log(rapat.uid,
                                        log_color,
                                        log_text,
                                    ),
                                    db.set_kegiatan_updated_timestamp(rapat.uid),
                                ])
                            }
                            catch (err) {
                                main.show_unexpected_error_message(err)
                                return
                            }

                            update_jadwal()
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
        if (globals.rapat.hide_antrean) return

        span_antrean_header_title.textContent = `Antrean (${defines.rapat_dengan_text[rapat_dengan]})`

        list_group_antrean.innerHTML = `
            <div class="d-flex align-items-center p-3">
                <strong role="status" class="text-secondary fst-italic"
                    >Memuat...</strong
                >
                <div class="spinner-border ms-auto" aria-hidden="true"></div>
            </div>
        `

        let rapat_list: RapatList = {}

        await db.get_antrean_rapat_dengan(rapat_dengan)
            .then(snap => {
                if (!snap.exists()) return

                rapat_list = snap.val()
            })

        list_group_antrean.innerHTML = ''

        let count = 0
        let _current_date_string = ''
        for (const key in rapat_list) {
            const rapat = rapat_list[key]
            if (rapat.tanggal_rapat !== _current_date_string) {
                list_group_antrean.appendChild(dom.c('li', {
                    classes: ['list-group-item', 'list-group-item-light', 'fs-6'],
                    html: `<i class="fa-regular fa-calendar"></i> ${common.date_string_to_date_text(rapat.tanggal_rapat)}`,
                }))
                _current_date_string = rapat.tanggal_rapat
            }
            list_group_antrean.appendChild(create_antrean_list_group_item(rapat))
            count++
        }

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

    if (common.today_is(Day.Saturday) || common.today_is(Day.Sunday)) {
        jadwal_pagination_next()
    }
    else {
        jadwal_pagination_prev()
    }

    if (globals.rapat.hide_antrean) {
        antrean_card.classList.add('visually-hidden')
    }

    if (globals.rapat.show_available_week_onstart) {
        const min_tanggal_rapat = main.get_min_tanggal_rapat()
        for (let i = 0; i < jadwal_pagination_items.length; i++) {
            const first_day = jadwal_pagination_items[i]
            const last_day = common.add_date_new(first_day, jadwal_days_amount - 1)

            if (common.is_date_before(last_day, min_tanggal_rapat)) {
                continue
            }

            jadwal_pagination_index = i
            break
        }
    }

    select_rapat_dengan(globals.rapat.show_dpm_onstart ? RapatDengan.DPM : RapatDengan.LEM)
})()
