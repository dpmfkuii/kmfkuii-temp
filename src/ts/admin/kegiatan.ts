(async () => {
    let _logbook_snapshot: LogbookKegiatan | null = null

    const table_logbook_kegiatan = dom.q<'table'>('#table_logbook_kegiatan')!
    const table_logbook_kegiatan_tbody = dom.qe<'tbody'>(table_logbook_kegiatan, 'tbody')!
    const input_table_search = dom.q<'input'>('#input_table_search')!
    const select_periode = dom.q<'select'>('.card-header select')!
    const select_periode_info_button = dom.q<'i'>('.card-header i.fa-circle-info')!

    const current_year = new Date().getFullYear()
    let select_periode_previous_value = select_periode.value = `${current_year}`
    const get_periode_option = (year: number) => `${year - 1}—${year + 1}`
    select_periode.innerHTML = `
        <option value="${current_year}" selected>${get_periode_option(current_year)}</option>
        <option value="${current_year - 1}">${get_periode_option(current_year - 1)}</option>
        <option value="${current_year - 2}">${get_periode_option(current_year - 2)}</option>
        <option value="">Semua</option>
    `

    select_periode_info_button.addEventListener('click', () => {
        swal.fire({
            title: 'Kegiatan',
            html: `
                <div class="text-start small">
                    <div><strong>${get_periode_option(current_year)}:</strong><br />Sesuai periode di logbook.</div><br />
                    <div><strong>${get_periode_option(current_year - 1)}:</strong><br />Sesuai periode di logbook 1 tahun yang lalu.</div><br />
                    <div><strong>${get_periode_option(current_year - 2)}:</strong><br />Sesuai periode di logbook 2 tahun yang lalu.</div><br />
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

    type TableLogbookData = {
        uid: string
        nama_kegiatan: string
        status_verifikasi: Kegiatan['status']['verifikasi']
    }

    const table_logbook_list: TableLogbookData[] = []
    let fuse: any = null

    const update_table_logbook_data = (list: TableLogbookData[]) => {
        table_logbook_kegiatan_tbody.innerHTML = ''
        let no = 1
        for (const item of list) {
            const tr = dom.c('tr')
            tr.innerHTML = `
                <td>${no++}</td>
                <td>${item.uid}</td>
                <td>${item.nama_kegiatan}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.proposal.lem)}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.proposal.dpm)}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.lpj.lem)}</td>
                <td>${main.get_status_rapat_icon(item.status_verifikasi.lpj.dpm)}</td>
                <td>
                    <div class="d-flex gap-1 justify-content-center">
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

            table_logbook_kegiatan_tbody.appendChild(tr)
        }
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
                        update_table_logbook_data(table_logbook_list)

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
    }

    const update_fuse = (list: TableLogbookData[]) => {
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
            // useExtendedSearch: false,
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
        for (const periode in _logbook_snapshot) {
            const logbook_periode = _logbook_snapshot[periode]
            for (const organisasi_index in logbook_periode) {
                const logbook_organisasi = logbook_periode[organisasi_index]
                for (const uid in logbook_organisasi) {
                    const logbook_text = logbook_organisasi[uid]
                    const { nama_kegiatan, status } = main.extract_logbook_text(uid, logbook_text)
                    table_logbook_list.push({
                        uid,
                        nama_kegiatan,
                        status_verifikasi: status.verifikasi,
                    })
                }
            }
        }

        table_logbook_list.sort((a, b) => a.nama_kegiatan < b.nama_kegiatan ? -1 : a.nama_kegiatan > b.nama_kegiatan ? 1 : 0)

        update_fuse(table_logbook_list)

        update_table_logbook_data(table_logbook_list)
    }

    const update_table_logbook_kegiatan = () => {
        update_table_logbook_kegiatan_from_database()
    }

    input_table_search.addEventListener('keyup', () => {
        const search_pattern = input_table_search.value
        if (search_pattern === '') {
            update_table_logbook_data(table_logbook_list)
        }
        else if (fuse && fuse.search) {
            const list = []
            for (const item of fuse.search(`'${search_pattern}`)) {
                list.push(item.item)
            }
            update_table_logbook_data(list)
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
