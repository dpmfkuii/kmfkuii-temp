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
                            <a
                                href="/admin/kegiatan/aksi/?uid=${uid}"
                                class="text-km-primary"
                                role="button"
                            >
                                <i class="fa-solid fa-gear"></i>
                            </a>
                        </td>
                    `
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
