// panel detail kegiatan
(() => {
    const panel = dom.q<'div'>('#panel_urus_detail_kegiatan')!

    const form = dom.q<'form'>('#form_pendaftaran_kegiatan')!

    const button_ubah = dom.qe<'button'>(panel, 'button[aria-label="Ubah"]')!
    const button_batal = dom.qe<'button'>(panel, 'button[aria-label="Batal"]')!

    const navbar_brand = dom.q<'a'>('.navbar .navbar-brand')!
    const button_keluar = dom.q<'button'>('.navbar button[aria-label="Keluar"]')!

    const input_email_pendaftar = dom.q<'input'>('input[name="email_pendaftar"]')!
    const input_nama_pendaftar = dom.q<'input'>('input[name="nama_pendaftar"]')!
    const select_organisasi = dom.q<'select'>('select[name="organisasi"]')!
    const input_nama_kegiatan = dom.q<'input'>('input[name="nama_kegiatan"]')!
    const select_periode_kegiatan = dom.q<'select'>('select[name="periode_kegiatan"]')!
    const select_penyelenggara_kegiatan = dom.q<'select'>('select[name="penyelenggara_kegiatan"]')!
    const select_lingkup_kegiatan = dom.q<'select'>('select[name="lingkup_kegiatan"]')!
    // const input_tanggal_kegiatan = dom.q<'input'>('input[name="tanggal_kegiatan"]')!

    // fill in options
    select_organisasi.innerHTML = '<option disabled selected value>-- Pilih organisasi --</option>'
    for (const n of Object.values(OrganisasiKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_organisasi.appendChild(option)
    }

    select_periode_kegiatan.innerHTML = ''
    for (const n of main.get_opsi_periode_kegiatan()) {
        const option = dom.c('option')
        option.value = n
        option.textContent = n.replace('-', '/')
        select_periode_kegiatan.appendChild(option)
        if (main.get_selected_periode_kegiatan() === n) {
            option.selected = true
        }
    }

    select_penyelenggara_kegiatan.innerHTML = ''
    for (const n of Object.values(PenyelenggaraKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_penyelenggara_kegiatan.appendChild(option)
        if (select_penyelenggara_kegiatan.childNodes.length === 1) {
            option.selected = true
        }
    }

    select_lingkup_kegiatan.innerHTML = ''
    for (const n of Object.values(LingkupKegiatan)) {
        const option = dom.c('option')
        option.textContent = option.value = n
        select_lingkup_kegiatan.appendChild(option)
        if (select_lingkup_kegiatan.childNodes.length === 1) {
            option.selected = true
        }
    }

    dom.disable(
        input_email_pendaftar,
        input_nama_pendaftar,
        select_organisasi,
        input_nama_kegiatan,
        select_periode_kegiatan,
        select_penyelenggara_kegiatan,
        select_lingkup_kegiatan,
        // input_tanggal_kegiatan,
    )

    const logged_in_user = auth.get_logged_in_user()
    if (!logged_in_user) return

    db.ref(`verifikasi/kegiatan/${logged_in_user.uid}`)
        .once<Kegiatan>('value')
        .then(snap => {
            if (!snap.exists()) return
            const kegiatan = snap.val()
            input_email_pendaftar.value = kegiatan.email_pendaftar
            input_nama_pendaftar.value = kegiatan.nama_pendaftar
            select_organisasi.value = Object.values(OrganisasiKegiatan)[kegiatan.organisasi_index]
            input_nama_kegiatan.value = kegiatan.nama_kegiatan
            select_periode_kegiatan.value = kegiatan.periode_kegiatan
            select_penyelenggara_kegiatan.value = Object.values(PenyelenggaraKegiatan)[kegiatan.penyelenggara_kegiatan_index]
            select_lingkup_kegiatan.value = Object.values(LingkupKegiatan)[kegiatan.lingkup_kegiatan_index]
        })

    button_batal.addEventListener('click', () => {
        dom.disable(
            input_nama_kegiatan,
            select_periode_kegiatan,
            select_penyelenggara_kegiatan,
            select_lingkup_kegiatan,
            // input_tanggal_kegiatan,
        )

        button_batal.classList.add('visually-hidden')

        button_ubah.classList.add('btn-km-primary')
        button_ubah.classList.remove('btn-success')
        if (button_ubah.hasAttribute('is-editing')) {
            button_ubah.removeAttribute('is-editing')
        }
    })

    button_ubah.addEventListener('click', () => {
        if (!button_ubah.hasAttribute('is-editing')) {
            dom.enable(
                input_nama_kegiatan,
                select_periode_kegiatan,
                select_penyelenggara_kegiatan,
                select_lingkup_kegiatan,
                // input_tanggal_kegiatan,
            )

            button_batal.classList.remove('visually-hidden')

            button_ubah.classList.add('btn-success')
            button_ubah.classList.remove('btn-km-primary')
            button_ubah.setAttribute('is-editing', '')

            return
        }

        // submit()
        // swal.fire
        button_batal.click()
    })
})();

// panel rapat verifikasi
(() => {
    const panel = dom.q<'div'>('#panel_urus_rapat_verifikasi')!

    const list_group = dom.qe(panel, '.list-group')!

    const create_list_group_item = (nama_rapat: string, status: StatusRapat) => {
        const li = dom.c('li', {
            classes: ['list-group-item', 'd-flex', 'align-items-center'],
            html: `<div class="flex-grow-1 pe-2">${nama_rapat}</div>`
        })

        if (status === StatusRapat.NOT_STARTED) {
            li.appendChild(dom.c('a', {
                classes: ['btn', 'btn-km-primary'],
                attributes: {
                    role: 'button',
                    style: 'min-width: max-content',
                    href: `/urus/daftar-rapat/?jenis=${nama_rapat.split(' ')[0]}&dengan=${nama_rapat.split(' ')[1]}`,
                },
                html: 'Daftar',
            }))
        }
        else {
            li.appendChild(dom.c('span', {
                classes: ['text-secondary'],
                html: main.get_status_rapat_text(status),
            }))
        }

        return li
    }

    const uid = auth.get_logged_in_user()!.uid
    db.ref(`verifikasi/kegiatan/${uid}/status/verifikasi`)
        .once<Kegiatan['status']['verifikasi']>('value')
        .then(snap => {
            if (!snap.exists()) return

            const status_verifikasi = snap.val()
            list_group.appendChild(create_list_group_item('Proposal LEM', status_verifikasi.proposal.lem))
            list_group.appendChild(create_list_group_item('Proposal DPM', status_verifikasi.proposal.dpm))
            list_group.appendChild(create_list_group_item('LPJ LEM', status_verifikasi.lpj.lem))
            list_group.appendChild(create_list_group_item('LPJ DPM', status_verifikasi.lpj.dpm))
        })

})()
