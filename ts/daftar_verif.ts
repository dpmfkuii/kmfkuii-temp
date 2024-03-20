(() => {
    const form = document.querySelector('form') as HTMLFormElement
    const input_nama_kegiatan = document.querySelector('#input_nama_kegiatan') as HTMLInputElement
    const submit_button = document.querySelector('#input_submit_button') as HTMLButtonElement

    const todays_day = new Date().getDay()

    // remove form when it's Minggu
    if (todays_day === 0) {
        form.innerHTML = '<i class="text-secondary">Formulir ditutup di hari Minggu.</i>'
    }

    const input_tanggal_verif = document.querySelector('#input_tanggal_verif') as HTMLInputElement
    const validation_input_tanggal_verif_feedback = document.querySelector('#validation_input_tanggal_verif_feedback') as HTMLDivElement

    // batasi pemilihan tanggal, tidak bisa di minggu yg sama
    const senin_depan = new Date()
    if (todays_day === 0) {
        senin_depan.setDate(senin_depan.getDate() + 1)
    }
    else {
        senin_depan.setDate(senin_depan.getDate() + (8 - todays_day))
    }
    input_tanggal_verif.min = `${common.get_date_string(senin_depan)}`

    const input_jam_verif = document.querySelector('#input_jam_verif') as HTMLSelectElement
    const validation_input_jam_verif_feedback = document.querySelector('#validation_input_jam_verif_feedback') as HTMLDivElement

    const update_input_jam_verif_options = (opsi_jam: string[], taken_jam?: string[]) => {
        input_jam_verif.innerHTML = '<option disabled selected value>-- Pilih jam --</option>'
        for (const jam of opsi_jam) {
            const opt = document.createElement('option')
            opt.value = jam
            opt.innerText = jam
            if (jam.includes('--') || taken_jam?.includes(jam)) {
                opt.setAttribute('value', '')
                opt.setAttribute('disabled', '')
            }
            input_jam_verif.appendChild(opt)
        }
    }

    update_input_jam_verif_options(G.DEFAULT_VERIF_HOUR_OPTIONS, G.DEFAULT_VERIF_HOUR_OPTIONS)

    input_tanggal_verif.addEventListener('change', () => {
        // reset jam
        input_jam_verif.value = ''
        const input_value = input_tanggal_verif.value

        const input_value_date = input_tanggal_verif.valueAsDate

        if (input_tanggal_verif.classList.contains('is-invalid')) {
            input_tanggal_verif.classList.remove('is-invalid')
        }

        if (input_jam_verif.classList.contains('is-invalid')) {
            input_jam_verif.classList.remove('is-invalid')
        }

        if (input_value_date !== null) {
            // cek ini sebelum minggu depan atau ngga
            if (common.is_date_before(input_value_date, senin_depan)) {
                // gabole, minimal senin depan
                validation_input_tanggal_verif_feedback.innerHTML = 'Pilih waktu verif mulai <strong>Senin</strong> depan!'
                input_tanggal_verif.classList.add('is-invalid')
            }
            // cek ini hari weekend atau ngga
            else if (input_value_date.getDay() === 0 || input_value_date?.getDay() === 6) {
                // gabole kalau weekend
                validation_input_tanggal_verif_feedback.innerHTML = 'Pilih waktu verif <strong>Senin—Jum’at</strong>!'
                input_tanggal_verif.classList.add('is-invalid')
            }
        }

        if (input_tanggal_verif.classList.contains('is-invalid')) {
            update_input_jam_verif_options(G.DEFAULT_VERIF_HOUR_OPTIONS, G.DEFAULT_VERIF_HOUR_OPTIONS)
            validation_input_jam_verif_feedback.innerHTML = 'Pilih tanggal yang sesuai!'
            input_jam_verif.classList.add('is-invalid')
        }

        // cek jam berapa yg avail di tanggal segitu
        // ambil dari antrian dan terkonfirmasi

        const db_daftar_verif = firebase.database().ref(`/${G.DB_NAME_DAFTAR_VERIF}/${input_value.replaceAll('-', '/')}`)
        const db_antrean_verif = firebase.database().ref(`/${G.DB_NAME_ANTREAN_VERIF}`)

        const taken_hours: string[] = []

        const get_daftar_promise = new Promise((resolve, reject) => {
            db_daftar_verif.once('value', (snapshot: any) => {
                const val = snapshot.val()
                if (val) {
                    for (const key in val) {
                        const item = val[key] as VerifItem
                        if (item.tanggal_verif === input_value) {
                            taken_hours.push(item.jam_verif)
                        }
                    }
                }
            }).then(resolve)
        })

        const get_antrean_promise = new Promise((resolve, reject) => {
            db_antrean_verif.once('value', (snapshot: any) => {
                const val = snapshot.val()
                if (val) {
                    for (const key in val) {
                        const item = val[key] as VerifItem
                        if (item.tanggal_verif === input_tanggal_verif.value) {
                            taken_hours.push(item.jam_verif)
                        }
                    }
                }
            }).then(resolve)
        })

        Promise.all([get_daftar_promise, get_antrean_promise]).then(() => {
            if (input_tanggal_verif.classList.contains('is-invalid')) {
                update_input_jam_verif_options(G.DEFAULT_VERIF_HOUR_OPTIONS, G.DEFAULT_VERIF_HOUR_OPTIONS)
            }
            else {
                update_input_jam_verif_options(G.DEFAULT_VERIF_HOUR_OPTIONS, taken_hours)
            }
        })
    })

    const get_radio_input_value = (name: string) => {
        let value = ''
        const input = document.querySelectorAll(`input[name="${name}"]`) as NodeListOf<HTMLInputElement>
        input.forEach(n => {
            if (n.checked) value = n.value
        })
        return value
    }

    const get_jenis_verif = () => get_radio_input_value('jenis_verif')
    const get_verif_dengan = () => get_radio_input_value('verif_dengan')

    const loop = () => {
        submit_button.innerHTML = `<strong>DAFTAR VERIF</strong> ${get_jenis_verif()}${input_nama_kegiatan.value ? '_' : ''}${input_nama_kegiatan.value} dengan ${get_verif_dengan()}`
        window.requestAnimationFrame(loop)
    }

    window.requestAnimationFrame(loop)
})()
