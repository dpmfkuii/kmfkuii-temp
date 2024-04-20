(() => {
    let rapat_dengan: RapatDengan = RapatDengan.LEM

    const list_group_rapat_dengan = dom.q<'ul'>('#list_group_rapat_dengan')!
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

    const update_jadwal = () => { }

    const create_antrean_list_group_item = (rapat: Rapat, timestamp: number | string) => {
        const nama_rapat = `${defines.jenis_rapat_text[rapat.jenis_rapat]}_${rapat.nama_kegiatan} (${defines.rapat_dengan_text[rapat.rapat_dengan]})`
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
                                        `Penjadwalan rapat verifikasi ${defines.jenis_rapat_text_mid[rapat.jenis_rapat]} dengan ${defines.rapat_dengan_text[rapat.rapat_dengan]} terkonfirmasi.`
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
                                        `Penjadwalan rapat verifikasi ${defines.jenis_rapat_text_mid[rapat.jenis_rapat]} dengan ${defines.rapat_dengan_text[rapat.rapat_dengan]} ditolak.`
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
                            html: `<i class="fa-regular fa-calendar"></i> ${common.convert_date_string_to_text(rapat.tanggal_rapat)}`,
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

    select_rapat_dengan(RapatDengan.LEM)
})()
