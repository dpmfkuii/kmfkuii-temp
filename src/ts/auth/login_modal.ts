(() => {
    const modal = dom.q<'div'>('#auth_login_modal')!
    const form = dom.q<'form'>('#auth_login_modal form')!
    const input_uid = dom.qe<'input'>(form, 'input[name="uid"]')!
    const input_uid_invalid_feedback = dom.qe<'div'>(form, '.invalid-feedback')!
    const button_close = dom.qe<'button'>(form, '.modal-footer button[data-bs-dismiss="modal"]')!
    const button_submit = dom.qe<'button'>(form, 'button[type="submit"]')!
    const a_lupa_uid = dom.qe<'a'>(form, 'a[aria-label="Lupa UID"]')!
    const a_daftar = dom.qe<'a'>(form, 'a[aria-label="Daftar"]')!

    modal.addEventListener('shown.bs.modal', () => {
        input_uid.focus()
    })

    modal.addEventListener('hidden.bs.modal', () => {
        input_uid.classList.remove('is-invalid')
    })

    form.addEventListener('submit', async ev => {
        ev.preventDefault()

        input_uid.value = input_uid.value.trim()

        const disabled_elements = [
            input_uid,
            button_close,
            button_submit,
            a_lupa_uid,
            a_daftar,
        ]

        dom.disable(...disabled_elements)

        button_submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Masuk'
        input_uid.classList.remove('is-invalid')

        await common.sleep(100)

        await auth.login(input_uid.value, false).then(user => {
            if (user === null) {
                dom.enable(...disabled_elements)
                button_submit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk'

                input_uid_invalid_feedback.textContent = 'Maaf, UID tidak ditemukan. Silakan periksa kembali.'
                input_uid.classList.add('is-invalid')

                input_uid.focus()
            }
            else {
                main.swal_fire_success('Berhasil masuk!').then(() => {
                    auth.redirect_home(user.role)
                })
            }
        })

        return false
    })
})()
