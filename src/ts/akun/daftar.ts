(() => {
    const form = dom.q<'form'>('#form_pendaftaran_kegiatan')!
    const button_submit = dom.qe<'button'>(form, 'button[type="submit"]')!
    const button_back_home = dom.qe<'a'>(form, 'a[aria-label="Back home"]')!

    const navbar_brand = dom.q<'a'>('.navbar .navbar-brand')!
    const button_masuk = dom.q<'button'>('.navbar button[aria-label="Masuk"]')!

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

    form.addEventListener('submit', async (ev) => {
        let success = true

        ev.preventDefault()

        const disabled_elements = [
            button_submit,
            button_back_home,
            navbar_brand,
            button_masuk,
            input_email_pendaftar,
            input_nama_pendaftar,
            select_organisasi,
            input_nama_kegiatan,
            select_periode_kegiatan,
            select_penyelenggara_kegiatan,
            select_lingkup_kegiatan,
            // input_tanggal_kegiatan,
        ]

        dom.disable(...disabled_elements)

        button_submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Daftar'

        await common.sleep(100)

        const prefix_uid = input_nama_kegiatan.value.substring(0, 3).toLowerCase()
        const new_user: User = {
            uid: `${prefix_uid}${auth.seeded_uid().substring(prefix_uid.length)}`,
            role: UserRole.PENGURUS,
        }

        const created_timestamp = common.timestamp()
        const new_kegiatan: Kegiatan = {
            uid: new_user.uid,
            email_pendaftar: input_email_pendaftar.value,
            nama_pendaftar: input_nama_pendaftar.value,
            organisasi_index: Object.values(OrganisasiKegiatan).indexOf(select_organisasi.value as OrganisasiKegiatan),
            nama_kegiatan: input_nama_kegiatan.value,
            periode_kegiatan: select_periode_kegiatan.value,
            penyelenggara_kegiatan_index: Object.values(PenyelenggaraKegiatan).indexOf(select_penyelenggara_kegiatan.value as PenyelenggaraKegiatan),
            lingkup_kegiatan_index: Object.values(LingkupKegiatan).indexOf(select_lingkup_kegiatan.value as LingkupKegiatan),
            tanggal_kegiatan: ['11-04-2024'], //input_tanggal_kegiatan.value,
            status: {
                diajukan: created_timestamp,
                verifikasi: {
                    proposal: {
                        lem: StatusRapat.NOT_STARTED,
                        dpm: StatusRapat.NOT_STARTED,
                    },
                    lpj: {
                        lem: StatusRapat.NOT_STARTED,
                        dpm: StatusRapat.NOT_STARTED,
                    },
                },
            },
            created_timestamp,
            updated_timestamp: created_timestamp,
        }

        await db.ref(`verifikasi/kegiatan/${new_user.uid}`)
            .set(new_kegiatan)
            .catch(() => {
                // an unexpected error occurred
                success = false
            })

        await db.ref(`verifikasi/kegiatan/logbook/${select_periode_kegiatan.value}/${new_kegiatan.organisasi_index}/${new_user.uid}`)
            .set(new_kegiatan.nama_kegiatan)
            .catch(() => {
                // an unexpected error occurred
                success = false
            })

        if (success) {
            await auth.register(new_user).then(async status => {
                switch (status) {
                    case AuthRegisterStatus.SUCCESS:
                        await main.add_log(new_user.uid, 'success', 'Pendaftaran berhasil.')
                        location.href = `/akun/daftar/berhasil/?uid=${new_user.uid}&nama_kegiatan=${new_kegiatan.nama_kegiatan}#`
                        break
                    default:
                        // an unexpected error occurred
                        success = false
                        break
                }
            })
        }

        if (!success) {
            swal.fire({
                icon: 'error',
                title: 'Ups...',
                text: 'Terjadi kesalahan tak terduga! Coba hubungi sekretariat LEM atau DPM.',
                confirmButtonText: 'Tutup',
                customClass: {
                    confirmButton: 'btn btn-primary',
                },
                buttonsStyling: false,
                showCloseButton: true,
            })

            dom.enable(...disabled_elements)

            button_submit.innerHTML = 'Daftar'
        }

        return false
    })
})()
