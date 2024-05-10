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

                    for (const organisasi_index in logbook_periode) {
                        const organisasi = Object.values(OrganisasiKegiatan)[parseInt(organisasi_index)]

                        const list_item_organisasi = dom.c('div', {
                            classes: ['d-flex', 'align-items-center'],
                            html: `
                                <span class="fs-4 pe-1">${organisasi}</span>
                                <span class="badge text-bg-success"></span>
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

                            const create_badge = (text: string, state: StatusRapatVerifikasiKegiatan) => {
                                const color = state === 0 ? 'primary' : state > 0 ? 'success' : 'secondary'
                                const badge = dom.c('span', {
                                    classes: ['badge', `text-bg-${color}`, 'rounded-pill'],
                                    attributes: { role: 'button' },
                                    html: `${text}${state === 0 ? ' <i class="fa-solid fa-spinner"></i>' : state > 0 ? ' <i class="fa-solid fa-check"></i>' : ''}`,
                                })
                                badge.addEventListener('click', () => list_item_kegiatan_title.click())
                                return badge
                            }

                            const list_item_kegiatan = dom.c('li', {
                                classes: ['list-group-item'],
                                children: [
                                    dom.c('div', { classes: ['fw-bold'], children: [list_item_kegiatan_title] }),
                                    create_badge('Proposal LEM', status.verifikasi.proposal.lem),
                                    dom.c('span', { html: ' ' }),
                                    create_badge('Proposal DPM', status.verifikasi.proposal.dpm),
                                    dom.c('span', { html: ' ' }),
                                    create_badge('LPJ LEM', status.verifikasi.lpj.lem),
                                    dom.c('span', { html: ' ' }),
                                    create_badge('LPJ DPM', status.verifikasi.lpj.dpm),
                                ],
                            })

                            list_group.appendChild(list_item_kegiatan)
                        }

                        dom.qe(list_item_organisasi, 'span.badge')!.innerHTML = `
                            <span><i class="fa-solid fa-check-double"></i>:
                            ${organisasi_verifikasi_selesai_count}</span>/${Object.values(logbook_periode[organisasi_index]).length}
                        `
                    }
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
