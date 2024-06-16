(() => {
    const logbook_container = dom.q<'div'>('#logbook_container')!
    const radio_periode_kegiatan_group = dom.q<'div'>('#radio_periode_kegiatan_group')!

    radio_periode_kegiatan_group.innerHTML = ''
    for (const n of main.get_opsi_periode_kegiatan()) {
        const div = dom.c('div', { classes: ['flex-fill', 'd-grid', 'p-1'] })
        div.innerHTML = `
            <input
                type="radio"
                name="periode_kegiatan"
                value="${n}"
                class="btn-check"
                id="radio_periode_kegiatan_${n}"
                autocomplete="off"
                ${main.get_selected_periode_kegiatan() === n ? 'checked' : ''}
            />
            <label
                class="btn btn-outline-primary"
                for="radio_periode_kegiatan_${n}"
                >${n.replace('-', '/')} <span class="badge text-bg-dark">*</span></label
            >
        `
        radio_periode_kegiatan_group.appendChild(div)
    }

    const refresh_logbook = async (periode: string) => {
        let success = true

        logbook_container.innerHTML = `
            <div class="d-flex align-items-center">
                <strong role="status" class="text-secondary fst-italic"
                    >Memuat...</strong
                >
                <div class="spinner-border ms-auto" aria-hidden="true"></div>
            </div>
        `

        await common.sleep(100)

        let kegiatan_periode_count = 0

        await db.get_logbook_periode(periode)
            .then(snap => {
                logbook_container.innerHTML = ''
                if (snap.exists()) {
                    const logbook_periode = snap.val()

                    const periode_text = periode.replace('-', '/')

                    const quick_lookup_button = dom.c('button', {
                        classes: ['btn', 'btn-success'],
                        html: `<small>LIHAT LPJ ${periode_text} YANG BELUM SELESAI <i class="fa-solid fa-comment-dots"></i></small>`,
                    })

                    logbook_container.appendChild(dom.c('div', { classes: ['d-grid', 'mb-3'], children: [quick_lookup_button] }))

                    const quick_lookup_list: { [organisasi: string]: string[] } = {}
                    let quick_lookup_list_count = 0

                    for (const organisasi_index in logbook_periode) {
                        const organisasi = Object.values(OrganisasiKegiatan)[parseInt(organisasi_index)]

                        const list_item_organisasi = dom.c('div', {
                            classes: ['d-flex', 'align-items-center'],
                            html: `
                                <span class="fs-4 pe-1">${organisasi}</span>
                                <span class="badge text-bg-success"></span>
                                <span class="badge text-bg-secondary ms-1"></span>
                            `
                        })

                        const list_group = dom.c('ul',
                            {
                                classes: ['list-group', 'mb-3'],
                                children: [
                                    dom.c('li', {
                                        classes: ['list-group-item', 'list-group-item-success'],
                                        children: [list_item_organisasi],
                                    })
                                ],
                            }
                        )

                        logbook_container.appendChild(list_group)

                        let organisasi_verifikasi_selesai_count = 0
                        let organisasi_verifikasi_dimulai_count = 0
                        for (const uid in logbook_periode[organisasi_index]) {
                            kegiatan_periode_count++

                            const log = logbook_periode[organisasi_index][uid]
                            const nama_kegiatan = log.split('@')[0]

                            const get_state = (param: string): StatusRapatVerifikasiKegiatan => {
                                return log.indexOf(param) >= 0
                                    ? log.indexOf(`${param}:p`) >= 0
                                        ? 0
                                        : 1
                                    : -1
                            }

                            const status: Kegiatan['status'] = {
                                diajukan: 0,
                                verifikasi: {
                                    proposal: {
                                        lem: get_state('@proposal_lem'),
                                        dpm: get_state('@proposal_dpm'),
                                    },
                                    lpj: {
                                        lem: get_state('@lpj_lem'),
                                        dpm: get_state('@lpj_dpm'),
                                    },
                                },
                            }

                            organisasi_verifikasi_selesai_count += main.is_status_verifikasi_selesai(status.verifikasi) ? 1 : 0

                            const list_item_kegiatan_title = dom.c('span', {
                                attributes: { role: 'button' },
                                html: `${nama_kegiatan} <small class="text-secondary">#${uid.substring(0, 4)}</small> <i class="fa-solid fa-circle-info"></i>`,
                            })

                            list_item_kegiatan_title.addEventListener('click', () => {
                                main.swal_fire_detail_kegiatan(nama_kegiatan, uid)
                            })

                            const badge_onclick = () => list_item_kegiatan_title.click()
                            const list_item_kegiatan = dom.c('li', {
                                classes: ['list-group-item'],
                                children: [
                                    dom.c('div', { classes: ['fw-bold'], children: [list_item_kegiatan_title] }),
                                    main.create_status_verifikasi_badge('Proposal LEM', status.verifikasi.proposal.lem, badge_onclick),
                                    dom.c('span', { html: ' ' }),
                                    main.create_status_verifikasi_badge('Proposal DPM', status.verifikasi.proposal.dpm, badge_onclick),
                                    dom.c('span', { html: ' ' }),
                                    main.create_status_verifikasi_badge('LPJ LEM', status.verifikasi.lpj.lem, badge_onclick),
                                    dom.c('span', { html: ' ' }),
                                    main.create_status_verifikasi_badge('LPJ DPM', status.verifikasi.lpj.dpm, badge_onclick),
                                ],
                            })

                            if (status.verifikasi.proposal.lem > StatusRapat.NOT_STARTED || status.verifikasi.lpj.lem > StatusRapat.NOT_STARTED) {
                                organisasi_verifikasi_dimulai_count++
                                if (status.verifikasi.lpj.dpm < StatusRapat.MARKED_AS_DONE) {
                                    if (!quick_lookup_list[organisasi]) {
                                        quick_lookup_list[organisasi] = []
                                    }
                                    quick_lookup_list[organisasi].push(nama_kegiatan, uid.substring(0, 4))
                                    quick_lookup_list_count++
                                }
                            }

                            list_group.appendChild(list_item_kegiatan)
                        }

                        dom.qe(list_item_organisasi, 'span.badge.text-bg-success')!.innerHTML = `
                            <span><i class="fa-solid fa-check-double"></i>:
                            ${organisasi_verifikasi_selesai_count}/${organisasi_verifikasi_dimulai_count}</span>
                        `

                        dom.qe(list_item_organisasi, 'span.badge.text-bg-secondary')!.innerHTML = `
                            <span><i class="fa-solid fa-asterisk"></i>:
                            ${Object.values(logbook_periode[organisasi_index]).length - organisasi_verifikasi_dimulai_count}</span>
                        `
                    }

                    let quick_lookup_button_html = ''
                    let quick_lookup_text = ''

                    if (Object.keys(quick_lookup_list).length > 0) {
                        let quick_lookup_list_html = ''
                        let quick_lookup_list_text = ''

                        for (const org in quick_lookup_list) {
                            const list = quick_lookup_list[org]
                            let lis = '', lis_text = ''
                            for (let i = 0; i < list.length; i += 2) {
                                lis += `<li>${list[i]} <small class="text-secondary">#${list[i + 1]}</small></li>`
                                lis_text += `\n${Math.floor(i / 2) + 1}. ${list[i]} #${list[i + 1]}`
                            }
                            quick_lookup_list_html += `
                                <br />
                                <strong>${org}:</strong>
                                <ol class="mb-0 text-black">
                                    ${lis}
                                </ol>
                            `
                            quick_lookup_list_text += `\n\n${org}:${lis_text}`
                        }

                        quick_lookup_button_html = `
                            <div class="text-start small">
                                <strong>LPJ ${periode_text} yang belum selesai ke DPM (${quick_lookup_list_count}):</strong><br />
                                Keterangan: Nama Kegiatan #UID (4 karakter pertama)<br />
                                ${quick_lookup_list_html}
                            </div>
                        `

                        quick_lookup_text = `LPJ ${periode_text} yang belum selesai ke DPM (${quick_lookup_list_count}):\nKeterangan: Nama Kegiatan #UID (4 karakter pertama)${quick_lookup_list_text}`
                    }

                    quick_lookup_button.addEventListener('click', () => {
                        const swal_title = `LPJ Belum Selesai${quick_lookup_list_count > 0 ? ` (${quick_lookup_list_count})` : ''}`
                        swal.fire({
                            title: swal_title,
                            html: quick_lookup_button_html || `<strong>Tidak ada LPJ ${periode_text} yang belum selesai!</strong>`,
                            showDenyButton: true,
                            denyButtonText: 'Tutup',
                            confirmButtonText: 'Salin',
                            showConfirmButton: quick_lookup_button_html ? true : false,
                            customClass: {
                                confirmButton: 'btn btn-success',
                                denyButton: `btn btn-secondary${quick_lookup_button_html ? ' ms-2' : ''}`,
                            },
                            buttonsStyling: false,
                            showCloseButton: true,
                        }).then((result: any) => {
                            if (result.isConfirmed) {
                                common.copy(quick_lookup_text).then(() => {
                                    swal.fire({
                                        icon: 'success',
                                        title: swal_title,
                                        html: 'Teks berhasil disalin!',
                                        showConfirmButton: false,
                                        timer: 1000,
                                        timerProgressBar: true,
                                    })
                                })
                            }
                        })
                    })
                }
                else {
                    success = false
                }
            })
            .catch(() => {
                success = false
            })

        if (logbook_container.innerHTML === '') {
            logbook_container.innerHTML = '<i class="text-secondary">Tidak ada data.</i>'
        }

        dom.qe(radio_periode_kegiatan_group, `label[for="radio_periode_kegiatan_${periode}"] span.badge`)!
            .innerHTML = kegiatan_periode_count.toString()

        return success
    }

    dom.qea(radio_periode_kegiatan_group, 'label').forEach(label => {
        const input = dom.qe(label.parentElement!, 'input')!
        input.addEventListener('change', () => refresh_logbook(dom.get_input_radio_value('periode_kegiatan')))
    })

    refresh_logbook(main.get_selected_periode_kegiatan())
})()
