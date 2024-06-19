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
    const input_tanggal_pertama_kegiatan = dom.q<'input'>('input[name="tanggal_pertama_kegiatan"]')!
    const select_periode_kegiatan = dom.q<'select'>('select[name="periode_kegiatan"]')!
    const select_penyelenggara_kegiatan = dom.q<'select'>('select[name="penyelenggara_kegiatan"]')!
    const select_lingkup_kegiatan = dom.q<'select'>('select[name="lingkup_kegiatan"]')!

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

    form.addEventListener('submit', async ev => {
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
            input_tanggal_pertama_kegiatan,
            select_periode_kegiatan,
            select_penyelenggara_kegiatan,
            select_lingkup_kegiatan,
        ]

        dom.disable(...disabled_elements)

        button_submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Daftar'

        await common.sleep(100)

        const prefix_uid = input_nama_kegiatan.value.substring(0, 3).toLowerCase()
        const new_user: User = {
            uid: `${prefix_uid}${auth.make_uid().substring(prefix_uid.length)}`,
            role: UserRole.PENGURUS,
        }

        const created_timestamp = common.timestamp()
        const new_kegiatan: Kegiatan = {
            uid: new_user.uid,
            email_pendaftar: common.remove_extra_spaces(input_email_pendaftar.value),
            nama_pendaftar: common.remove_extra_spaces(input_nama_pendaftar.value),
            organisasi_index: Object.values(OrganisasiKegiatan).indexOf(select_organisasi.value as OrganisasiKegiatan),
            nama_kegiatan: common.remove_extra_spaces(input_nama_kegiatan.value),
            periode_kegiatan: select_periode_kegiatan.value,
            penyelenggara_kegiatan_index: Object.values(PenyelenggaraKegiatan).indexOf(select_penyelenggara_kegiatan.value as PenyelenggaraKegiatan),
            lingkup_kegiatan_index: Object.values(LingkupKegiatan).indexOf(select_lingkup_kegiatan.value as LingkupKegiatan),
            tanggal_kegiatan: [input_tanggal_pertama_kegiatan.value],
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

        try {
            await Promise.all([
                db.set_kegiatan(new_kegiatan),
                db.set_logbook(new_kegiatan),
                db.keuangan.fincard.set(new_kegiatan.periode_kegiatan, new_kegiatan.organisasi_index, new_kegiatan.uid, {
                    nama_kegiatan: new_kegiatan.nama_kegiatan,
                    tahun_rkat: new Date().getFullYear(),
                    sub_aktivitas_rkat_index: -1,
                    rkat_murni: 0,
                    rkat_alokasi: {},
                    dpm: 0,
                    sisa: 0,
                    sudah_kembali: false,
                    disimpan_dpm: 0,
                    alokasi: {},
                    status_lpj: StatusRapat.NOT_STARTED,
                    updated_timestamp: created_timestamp,
                }),
                db.add_kegiatan_log(new_user.uid, defines.log_colors.akun_berhasil_dibuat, defines.log_text.akun_berhasil_dibuat),
            ])
            await auth.register(new_user)
                .then(status => {
                    if (status === AuthRegisterStatus.SUCCESS) {
                        location.href = `/akun/daftar/berhasil/?uid=${new_user.uid}&nama_kegiatan=${new_kegiatan.nama_kegiatan}#`
                    }
                    else {
                        throw new Error()
                    }
                })
        }
        catch (err) {
            main.show_unexpected_error_message(err)
            dom.enable(...disabled_elements)
            button_submit.innerHTML = 'Daftar'
        }

        return false
    })
})()
