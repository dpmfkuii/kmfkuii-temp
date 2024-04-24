(async () => {
    let _logbook_snapshot: LogbookKegiatan | null = null

    const table_logbook_kegiatan = dom.q<'table'>('#table_logbook_kegiatan')!
    const table_logbook_kegiatan_tbody = dom.qe<'tbody'>(table_logbook_kegiatan, 'tbody')!

    const update_table_logbook_kegiatan_tbody = () => {
        if (!_logbook_snapshot) return

        table_logbook_kegiatan_tbody.innerHTML = ''
        for (const periode in _logbook_snapshot) {
            const logbook_periode = _logbook_snapshot[periode]
            for (const organisasi_index in logbook_periode) {
                const logbook_organisasi = logbook_periode[organisasi_index]
                for (const uid in logbook_organisasi) {
                    const logbook_text = logbook_organisasi[uid]
                    const { nama_kegiatan, status } = main.extract_logbook_text(uid, logbook_text)

                    const tr = dom.c('tr')
                    tr.innerHTML = `
                        <td>${uid}</td>
                        <td>${nama_kegiatan}</td>
                        <td>${main.get_status_rapat_icon(status.verifikasi.proposal.lem)}</td>
                        <td>${main.get_status_rapat_icon(status.verifikasi.proposal.dpm)}</td>
                        <td>${main.get_status_rapat_icon(status.verifikasi.lpj.lem)}</td>
                        <td>${main.get_status_rapat_icon(status.verifikasi.lpj.dpm)}</td>
                        <td>
                            <div class="d-flex gap-1 justify-content-center">
                                <a
                                    href="/admin/kegiatan/aksi/?uid=${uid}"
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
                    aksi_button_danger.addEventListener('click', () => {
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

                                        location.reload()

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

                    table_logbook_kegiatan_tbody.appendChild(tr)
                }
            }
        }
    }

    const update_table_logbook_kegiatan = () => {
        update_table_logbook_kegiatan_tbody()
    }

    const start_loading = () => {
        table_logbook_kegiatan_tbody.innerHTML = `
            <tr>
                <td colspan=3 class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td colspan=4 class="placeholder-glow"><span class="placeholder w-100"></span></td>
            </tr>
            <tr>
                <td colspan=2 class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td colspan=2 class="placeholder-glow"><span class="placeholder w-100"></span></td>
                <td colspan=2 class="placeholder-glow"><span class="placeholder w-100"></span></td>
            </tr>
        `
    }

    start_loading()

    try {
        await db.get_logbook()
            .then(snap => {
                if (!snap.exists()) return

                _logbook_snapshot = snap.val()
            })
    }
    catch (err) {
        main.show_unexpected_error_message(err)
    }

    if (!_logbook_snapshot) return

    update_table_logbook_kegiatan()

})()
