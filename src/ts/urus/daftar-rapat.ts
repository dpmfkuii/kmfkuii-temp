(() => {
    const form = dom.q<'form'>('#form_pendaftaran_rapat')!
    const button_submit = dom.qe<'button'>(form, 'button[type="submit"]')!
    const button_back_home = dom.q<'a'>('a[aria-label="Back home"]')!

    const navbar_brand = dom.q<'a'>('.navbar .navbar-brand')!
    const button_keluar = dom.q<'button'>('.navbar button[aria-label="Keluar"]')!
    const all_a_breadcrumb = dom.qa<'a'>('ol.breadcrumb a', true)! as HTMLAnchorElement[]

    const input_jenis_rapat = dom.q<'input'>('input[name="jenis_rapat"]')!
    const input_rapat_dengan = dom.q<'input'>('input[name="rapat_dengan"]')!
    const input_tanggal_rapat = dom.q<'input'>('input[name="tanggal_rapat"]')!
    const select_jam_rapat = dom.q<'select'>('select[name="jam_rapat"]')!
    const input_tanggal_rapat_invalid_feedback = dom.qe<'div'>(input_tanggal_rapat.parentElement!, '.invalid-feedback')!
    const select_jam_rapat_invalid_feedback = dom.qe<'div'>(select_jam_rapat.parentElement!, '.invalid-feedback')!

    const uid = auth.get_logged_in_user()!.uid

    let params = store.get_item(defines.store_key.daftar_rapat) as any

    if (params === null) {
        auth.redirect_home(UserRole.PENGURUS)
        return
    }

    params = JSON.parse(params)

    const jenis: string = params.jenis || ''
    const dengan: string = params.dengan || ''
    const status_lem: StatusRapat = params.status_lem || ''
    const antrean_lem: string = params.antrean_lem || ''
    const tanggal_pertama_kegiatan: Date = new Date(params.tanggal_pertama_kegiatan) || new Date()

    if (!jenis || !dengan) {
        auth.redirect_home(UserRole.PENGURUS)
        return
    }

    if (dengan === RapatDengan.DPM && status_lem === StatusRapat.NOT_STARTED) {
        auth.redirect_home(UserRole.PENGURUS)
        return
    }

    input_jenis_rapat.value = (defines.jenis_rapat_text as any)[jenis]
    input_rapat_dengan.value = (defines.rapat_dengan_text as any)[dengan]

    // fill in options
    const set_jam_rapat_options = (_taken_hours?: string[]) => {
        select_jam_rapat.innerHTML = '<option disabled selected value>-- Pilih jam --</option>'
        for (const jam of JamRapat) {
            if (RESCHEDULE_HOURS.includes(jam)) continue
            const option = dom.c('option')
            option.textContent = option.value = jam
            if (jam.includes('--') || (_taken_hours && _taken_hours.includes(jam))) {
                option.value = ''
                option.disabled = true
            }
            select_jam_rapat.appendChild(option)
        }
    }

    set_jam_rapat_options()

    const min_tanggal_rapat = main.get_min_tanggal_rapat()

    input_tanggal_rapat.min = common.to_date_string(min_tanggal_rapat)

    const validate_date_and_time = async () => {
        // reset jam
        select_jam_rapat.value = ''

        const date_tanggal_rapat = input_tanggal_rapat.valueAsDate

        if (date_tanggal_rapat) {
            if (input_tanggal_rapat.classList.contains('is-invalid')) {
                input_tanggal_rapat.classList.remove('is-invalid')
            }

            if (select_jam_rapat.classList.contains('is-invalid')) {
                select_jam_rapat.classList.remove('is-invalid')
            }

            // cek itu hari weekend atau ngga
            if (date_tanggal_rapat.getDay() === Day.Saturday || date_tanggal_rapat.getDay() === Day.Sunday) {
                input_tanggal_rapat_invalid_feedback.innerHTML = 'Pilih waktu <strong>Senin—Jum’at</strong>!'
                input_tanggal_rapat.classList.add('is-invalid')
            }
            // cek itu dah tutup atau belum
            else if (common.is_date_before(date_tanggal_rapat, min_tanggal_rapat)) {
                input_tanggal_rapat_invalid_feedback.innerHTML = 'Pendaftaran di tanggal itu sudah <strong>tutup</strong>!'
                input_tanggal_rapat.classList.add('is-invalid')
            }
            // cek kalau proposal H-7
            else if (jenis === JenisRapat.PROPOSAL && common.get_difference_in_days(date_tanggal_rapat, tanggal_pertama_kegiatan) < 7) {
                input_tanggal_rapat_invalid_feedback.innerHTML = 'Rapat proposal minimal <strong>H-7</strong> kegiatan!'
                input_tanggal_rapat.classList.add('is-invalid')
            }
            // cek jarak lem ke dpm
            else if (dengan === RapatDengan.DPM) {
                // lem udah selesai, lanjut dpm sendiri
                if (status_lem >= StatusRapat.MARKED_AS_DONE) return

                // lem belum selesai, tapi gaada di antrean, lanjut dpm sendiri
                if (!antrean_lem) return

                // lem belum selesai dan lem ada di antrean, pastikan jaraknya sesuai
                const lem_date = new Date(antrean_lem)
                const selected_date = new Date(common.to_date_string(date_tanggal_rapat))
                const diff = common.get_difference_in_days(lem_date, selected_date)
                if (diff < 2) {
                    input_tanggal_rapat_invalid_feedback.innerHTML = 'Jarak antar rapat LEM ke DPM <strong>minimal 2 hari</strong>!'
                    input_tanggal_rapat.classList.add('is-invalid')
                }
            }
        }
        else {
            input_tanggal_rapat_invalid_feedback.innerHTML = 'Tanggal tidak ditemukan!'
            input_tanggal_rapat.classList.add('is-invalid')
        }

        if (input_tanggal_rapat.classList.contains('is-invalid')) {
            select_jam_rapat_invalid_feedback.innerHTML = 'Pilih tanggal yang sesuai!'
            select_jam_rapat.classList.add('is-invalid')
            set_jam_rapat_options(JamRapat)

            return
        }

        // cek jam berapa yg avail di tanggal segitu
        // ambil dari antrean dan terkonfirmasi
        const taken_hours: string[] = []
        const rapat_dengan: RapatDengan = input_rapat_dengan.value.toLowerCase() as RapatDengan

        await db.get_jadwal_rapat_dengan_tanggal(rapat_dengan, input_tanggal_rapat.value.replaceAll('-', '/'))
            .then(snap => {
                if (!snap.exists()) return
                const val = snap.val()
                for (const key in val) {
                    taken_hours.push(val[key].jam_rapat)
                }
            })

        await db.get_antrean_rapat_dengan(rapat_dengan)
            .then(snap => {
                if (!snap.exists()) return
                const val = snap.val()
                for (const key in val) {
                    if (val[key].tanggal_rapat === input_tanggal_rapat.value) {
                        taken_hours.push(val[key].jam_rapat)
                    }
                }
            })

        set_jam_rapat_options(taken_hours)
    }

    input_tanggal_rapat.addEventListener('change', () => validate_date_and_time())

    form.addEventListener('submit', async ev => {
        ev.preventDefault()

        const disabled_elements = [
            button_submit,
            button_back_home,
            navbar_brand,
            button_keluar,
            ...all_a_breadcrumb,
            input_tanggal_rapat,
            select_jam_rapat,
        ]

        dom.disable(...disabled_elements)

        button_submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Daftar'

        await common.sleep(100)

        let nama_kegiatan = ''
        await db.get_kegiatan_nama_kegiatan(uid).then(snap => nama_kegiatan = snap.val()!)

        const new_rapat: Rapat = {
            uid,
            nama_kegiatan,
            jenis_rapat: input_jenis_rapat.value.toLowerCase() as JenisRapat,
            rapat_dengan: input_rapat_dengan.value.toLowerCase() as RapatDengan,
            tanggal_rapat: input_tanggal_rapat.value,
            jam_rapat: select_jam_rapat.value,
            t: common.timestamp(),
        }

        const nama_rapat = main.get_nama_rapat(new_rapat)
        const waktu_rapat = main.get_waktu_rapat(new_rapat)

        try {
            await Promise.all([
                db.add_antrean_rapat(new_rapat),
                db.set_kegiatan_status_verifikasi(uid, new_rapat.jenis_rapat, new_rapat.rapat_dengan, StatusRapat.IN_PROGRESS),
                db.get_kegiatan(uid).then(snap => db.set_logbook(snap.val()!)),
                db.set_pengajuan_diajukan(uid, new_rapat.jenis_rapat, new_rapat.rapat_dengan, main.tanggal_dan_jam_to_date(new_rapat.tanggal_rapat, new_rapat.jam_rapat)),
            ])
            await Promise.all([
                db.add_kegiatan_log(uid,
                    defines.log_colors.jadwal_masuk_antrean,
                    defines.log_text.rapat_dalam_antrean(nama_rapat, waktu_rapat),
                ),
                db.set_kegiatan_updated_timestamp(uid),
            ])
            await swal.fire({
                icon: 'success',
                title: `Jadwal ${input_jenis_rapat.value} ${input_rapat_dengan.value} masuk antrean!`,
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                auth.redirect_home(UserRole.PENGURUS)
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
