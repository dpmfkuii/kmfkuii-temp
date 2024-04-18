(() => {
    const form = dom.q<'form'>('#form_pendaftaran_rapat')!
    const button_submit = dom.qe<'button'>(form, 'button[type="submit"]')!
    const button_back_home = dom.q<'a'>('a[aria-label="Back home"]')!

    const navbar_brand = dom.q<'a'>('.navbar .navbar-brand')!
    const button_keluar = dom.q<'button'>('.navbar button[aria-label="Keluar"]')!
    const all_a_breadcrumb = dom.qa<'a'>('ol.breadcrumb a', true)! as HTMLAnchorElement[]
    const a_jadwal_rapat = dom.q<'a'>('a[aria-label="Jadwal Rapat"]')!

    const input_jenis_rapat = dom.q<'input'>('input[name="jenis_rapat"]')!
    const input_rapat_dengan = dom.q<'input'>('input[name="rapat_dengan"]')!
    const input_tanggal_rapat = dom.q<'input'>('input[name="tanggal_rapat"]')!
    const select_jam_rapat = dom.q<'select'>('select[name="jam_rapat"]')!
    const input_tanggal_rapat_invalid_feedback = dom.qe<'div'>(input_tanggal_rapat.parentElement!, '.invalid-feedback')!
    const select_jam_rapat_invalid_feedback = dom.qe<'div'>(select_jam_rapat.parentElement!, '.invalid-feedback')!

    input_jenis_rapat.value = common.url_params.get('jenis') || ''
    input_rapat_dengan.value = common.url_params.get('dengan') || ''

    // fill in options
    const set_jam_rapat_options = (_taken_hours?: string[]) => {
        select_jam_rapat.innerHTML = '<option disabled selected value>-- Pilih jam --</option>'
        for (const jam of JamRapat) {
            const option = dom.c('option')
            option.textContent = option.value = jam
            if (jam.includes('--') || _taken_hours?.includes(jam)) {
                option.value = ''
                option.disabled = true
            }
            select_jam_rapat.appendChild(option)
        }
    }

    set_jam_rapat_options()

    const senin_depan = new Date()
    senin_depan.setDate(new Date().getDate() + (8 - new Date().getDay()))

    input_tanggal_rapat.min = common.get_date_string(senin_depan)

    const validate_date_and_time = async () => {
        // reset jam
        select_jam_rapat.value = ''

        const date_tanggal_rapat = input_tanggal_rapat.valueAsDate!

        if (input_tanggal_rapat.classList.contains('is-invalid')) {
            input_tanggal_rapat.classList.remove('is-invalid')
        }

        if (select_jam_rapat.classList.contains('is-invalid')) {
            select_jam_rapat.classList.remove('is-invalid')
        }

        if (date_tanggal_rapat !== null) {
            // cek ini sebelum minggu depan atau ngga
            if (common.is_date_before(date_tanggal_rapat, senin_depan)) {
                // gabole, minimal senin depan
                input_tanggal_rapat_invalid_feedback.innerHTML = 'Pilih waktu verif mulai <strong>Senin</strong> depan!'
                input_tanggal_rapat.classList.add('is-invalid')
            }
            // cek ini hari weekend atau ngga
            else if (date_tanggal_rapat.getDay() === 0 || date_tanggal_rapat?.getDay() === 6) {
                // gabole kalau weekend
                input_tanggal_rapat_invalid_feedback.innerHTML = 'Pilih waktu verif <strong>Senin—Jum’at</strong>!'
                input_tanggal_rapat.classList.add('is-invalid')
            }
        }

        if (input_tanggal_rapat.classList.contains('is-invalid')) {
            set_jam_rapat_options(JamRapat)
            select_jam_rapat_invalid_feedback.innerHTML = 'Pilih tanggal yang sesuai!'
            select_jam_rapat.classList.add('is-invalid')
        }

        // cek jam berapa yg avail di tanggal segitu
        // ambil dari antrean dan terkonfirmasi

        const taken_hours: string[] = []

        await db.ref(`verifikasi/rapat/jadwal/${input_rapat_dengan.value.toLowerCase()}/${input_tanggal_rapat.value.replaceAll('-', '/')}`)
            .once<{ [timestamp: string]: Rapat }>('value')
            .then(snap => {
                if (!snap.exists()) return
                const val = snap.val()
                for (const key in val) {
                    taken_hours.push(val[key].jam_rapat)
                }
            })

        await db.ref(`verifikasi/rapat/antrean/${input_rapat_dengan.value.toLowerCase()}`)
            .once<{ [timestamp: string]: Rapat }>('value')
            .then(snap => {
                if (!snap.exists()) return
                const val = snap.val()
                for (const key in val) {
                    if (val[key].tanggal_rapat === input_tanggal_rapat.value) {
                        taken_hours.push(val[key].jam_rapat)
                    }
                }
            })

        if (input_tanggal_rapat.classList.contains('is-invalid')) {
            set_jam_rapat_options(JamRapat)
        }
        else {
            set_jam_rapat_options(taken_hours)
        }
    }

    input_tanggal_rapat.addEventListener('change', () => validate_date_and_time())

    form.addEventListener('submit', async (ev) => {
        let success = true

        ev.preventDefault()

        const disabled_elements = [
            button_submit,
            button_back_home,
            navbar_brand,
            button_keluar,
            ...all_a_breadcrumb,
            a_jadwal_rapat,
            input_tanggal_rapat,
            select_jam_rapat,
        ]

        dom.disable(...disabled_elements)

        button_submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Daftar'

        await common.sleep(100)

        const uid = auth.get_logged_in_user()!.uid

        const rapat_dengan = input_rapat_dengan.value.toLowerCase()
        const new_rapat: Rapat = {
            uid,
            jenis_rapat: input_jenis_rapat.value.toLowerCase() as JenisRapat,
            tanggal_rapat: input_tanggal_rapat.value,
            jam_rapat: select_jam_rapat.value,
        }

        await db.ref(`verifikasi/rapat/antrean/${rapat_dengan}/${common.timestamp()}`)
            .set(new_rapat)
            .catch(() => {
                // an unexpected error occurred
                success = false
            })

        await db.ref(`verifikasi/kegiatan/${uid}/status/verifikasi/${new_rapat.jenis_rapat}/${rapat_dengan}`)
            .set(StatusRapat.IN_PROGRESS)
            .catch(() => {
                // an unexpected error occurred
                success = false
            })

        await db.ref(`verifikasi/kegiatan/${uid}`)
            .once<Kegiatan>('value')
            .then(async snap => {
                if (!snap.exists()) return
                const kegiatan = snap.val()
                await db.ref(`verifikasi/kegiatan/logbook/${kegiatan.periode_kegiatan}/${kegiatan.organisasi_index}/${uid}`)
                    .set(main.kegiatan_to_logbook_text(kegiatan))
                    .catch(() => {
                        // an unexpected error occurred
                        success = false
                    })
            })

        const jenis_rapat_text = new_rapat.jenis_rapat === JenisRapat.LPJ ? 'LPJ' : JenisRapat.PROPOSAL
        await main.add_log(uid, 'info', `Penjadwalan rapat verifikasi ${jenis_rapat_text} dengan ${input_rapat_dengan.value} dalam antrean.`)

        await main.set_kegiatan_updated_timestamp(uid)

        if (success) {
            location.href = `/urus/`
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
