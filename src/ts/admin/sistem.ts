(() => {
    enum ATUR_MENU {
        VERIFIKASI = 'Verifikasi',
        KEUANGAN = 'Keuangan',
        // ORGANISASI = 'Organisasi',
        DATA_USANG = 'Data Usang',
        PANDUAN = 'Panduan',
    }

    const atur_nav_controller = {
        menu: ATUR_MENU.VERIFIKASI,
        list_group: dom.q('#atur_menu_list_group')!,
        change_nav(new_menu: ATUR_MENU) {
            if (new_menu !== this.menu && !atur_card_controller.simpan_button.classList.contains('disabled')) {
                swal.fire({
                    icon: 'info',
                    title: 'Simpan Perubahan',
                    html: 'Simpan perubahan atau <i>reload</i> untuk membatalkan perubahan.',
                    confirmButtonText: 'Tutup',
                    customClass: {
                        confirmButton: 'btn btn-secondary',
                    },
                    buttonsStyling: false,
                    showCloseButton: true,
                })
                return
            }

            this.menu = new_menu

            dom.qea(this.list_group, 'li').forEach(li => {
                if (li.ariaLabel === new_menu) {
                    li.role = ''
                    li.classList.add('list-group-item-primary')
                    li.classList.remove('list-group-item-secondary')
                }
                else {
                    li.role = 'button'
                    li.classList.remove('list-group-item-primary')
                    li.classList.add('list-group-item-secondary')
                }
            })

            atur_card_controller.change_card(new_menu)
        },
        init() {
            this.list_group.innerHTML = ''
            for (const menu of Object.values(ATUR_MENU)) {
                const item_title = dom.c('span', { classes: ['item-title'], html: menu })

                const li = dom.c('li', {
                    classes: ['list-group-item', 'd-flex', 'align-items-center', 'list-group-item-secondary'],
                    attributes: {
                        role: 'button',
                        'aria-label': menu,
                    },
                    children: [item_title]
                })

                li.addEventListener('click', () => {
                    if (li.role === 'button') {
                        this.change_nav(menu)
                    }
                })

                this.list_group.appendChild(li)
            }
            this.change_nav(this.menu)
        },
    }

    const atur_card_controller = {
        container: dom.q<'div'>('#atur_card')!,
        header_title: dom.q<'div'>('#atur_card > .card-header > .title')!,
        simpan_button: dom.q<'button'>('#simpan_button')!,
        [ATUR_MENU.VERIFIKASI]: {
            snapshot: {} as SistemData.Snapshot['verifikasi'],
            container: dom.q<'div'>('#atur_card_verifikasi')!,
            inputs: {
                link_berkas: {
                    lem: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Link Berkas LEM"]')!,
                    dpm: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Link Berkas DPM"]')!,
                },
                jam_rapat: {
                    tersedia: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Jam Rapat Tersedia"]')!,
                    resched_lem: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Jam Resched LEM"]')!,
                    resched_dpm: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Jam Resched DPM"]')!,
                },
                komunikasi: {
                    ig_lem: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Instagram LEM"]')!,
                    ig_dpm: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Instagram DPM"]')!,
                    line_lem: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Line OA LEM"]')!,
                    email_lem: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Email LEM"]')!,
                    email_dpm: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Email DPM"]')!,
                    email_kemahasiswaan: dom.q<'input'>('#atur_card_verifikasi input[aria-label="Verifikasi Email Kemahasiswaan"]')!,
                },
            },
            async save() {
                const new_snapshot = {
                    link_berkas: {
                        lem: this.inputs.link_berkas.lem.value,
                        dpm: this.inputs.link_berkas.dpm.value,
                    },
                    jam_rapat: {
                        opsi: common.remove_whitespaces(this.inputs.jam_rapat.tersedia.value).split(','),
                        jam_reschedule_lem: common.remove_whitespaces(this.inputs.jam_rapat.resched_lem.value).split(','),
                        jam_reschedule_dpm: common.remove_whitespaces(this.inputs.jam_rapat.resched_dpm.value).split(','),
                    },
                    komunikasi: {
                        ig_lem: this.inputs.komunikasi.ig_lem.value,
                        ig_dpm: this.inputs.komunikasi.ig_dpm.value,
                        line_lem: this.inputs.komunikasi.line_lem.value,
                        email_lem: this.inputs.komunikasi.email_lem.value,
                        email_dpm: this.inputs.komunikasi.email_dpm.value,
                        email_kemahasiswaan: this.inputs.komunikasi.email_kemahasiswaan.value,
                    },
                } as SistemData.Snapshot['verifikasi']

                await db.sistem.update_data_verifikasi(new_snapshot)
            },
            init() {
                const flattened_inputs = Object.values(common.flat_object(this.inputs)) as HTMLInputElement[]

                dom.disable(...flattened_inputs)
                for (const input of flattened_inputs) {
                    input.addEventListener('change', () => {
                        atur_card_controller.unsave()
                    })
                }

                try {
                    db.sistem.get_data_verifikasi().then(snap => {
                        try {
                            if (snap.exists()) {
                                this.snapshot = snap.val()
                            }
                            this.inputs.link_berkas.lem.value = this.snapshot.link_berkas.lem
                            this.inputs.link_berkas.dpm.value = this.snapshot.link_berkas.dpm
                            this.inputs.jam_rapat.tersedia.value = this.snapshot.jam_rapat.opsi.join(', ')
                            this.inputs.jam_rapat.resched_lem.value = this.snapshot.jam_rapat.jam_reschedule_lem.join(', ')
                            this.inputs.jam_rapat.resched_dpm.value = this.snapshot.jam_rapat.jam_reschedule_dpm.join(', ')
                            this.inputs.komunikasi.ig_lem.value = this.snapshot.komunikasi.ig_lem
                            this.inputs.komunikasi.ig_dpm.value = this.snapshot.komunikasi.ig_dpm
                            this.inputs.komunikasi.line_lem.value = this.snapshot.komunikasi.line_lem
                            this.inputs.komunikasi.email_lem.value = this.snapshot.komunikasi.email_lem
                            this.inputs.komunikasi.email_dpm.value = this.snapshot.komunikasi.email_dpm
                            this.inputs.komunikasi.email_kemahasiswaan.value = this.snapshot.komunikasi.email_kemahasiswaan
                            dom.enable(...flattened_inputs)
                        }
                        catch { }
                    })
                }
                catch (err) {
                    main.show_unexpected_error_message(err)
                }
            },
        },
        // [ATUR_MENU.ORGANISASI]: {
        //     container: dom.q<'div'>('#atur_card_organisasi')!,
        //     async save() { },
        //     init() { },
        // },
        [ATUR_MENU.KEUANGAN]: {
            container: dom.q<'div'>('#atur_card_keuangan')!,
            async save() { },
            init() { },
        },
        [ATUR_MENU.DATA_USANG]: {
            container: dom.q<'div'>('#atur_card_data_usang')!,
            async save() { },
            init() { },
        },
        [ATUR_MENU.PANDUAN]: {
            container: dom.q<'div'>('#atur_card_panduan')!,
            async save() { },
            init() { },
        },
        hide_all_card() {
            for (const menu of Object.values(ATUR_MENU)) {
                this[menu].container.classList.add('visually-hidden')
                this[menu].container.classList.remove('start-animation-rise')
            }
        },
        show_card(menu: ATUR_MENU) {
            this[menu].container.classList.remove('visually-hidden')
            this[menu].container.classList.add('start-animation-rise')
        },
        change_card(menu: ATUR_MENU) {
            this.hide_all_card()
            this.show_card(menu)
            this.header_title.textContent = menu
        },
        unsave() {
            dom.enable(this.simpan_button)
            this.simpan_button.classList.remove('btn-km-primary')
            this.simpan_button.classList.add('btn-success')
            this.simpan_button.innerHTML = 'Simpan'
        },
        save() {
            dom.disable(this.simpan_button)
            this.simpan_button.classList.add('btn-km-primary')
            this.simpan_button.classList.remove('btn-success')
            swal.fire({
                title: 'Sistem',
                html: '<div><i>Menyimpan...</i></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                async didOpen() {
                    swal.showLoading()
                    try {
                        await atur_card_controller[atur_nav_controller.menu].save()
                        atur_card_controller.simpan_button.innerHTML = 'Tersimpan <i class="fa-solid fa-check"></i>'
                        main.swal_fire_success('Berhasil tersimpan!')
                    }
                    catch (err) {
                        atur_card_controller.unsave()
                        main.show_unexpected_error_message(err)
                    }
                },
            })
        },
        init() {
            this.simpan_button.addEventListener('click', () => this.save())
            for (const menu of Object.values(ATUR_MENU)) {
                this[menu].init()
            }
        },
    }

    atur_nav_controller.init()
    atur_card_controller.init()

})()
