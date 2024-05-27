(() => {
    const modal = dom.q<'div'>('#auth_login_modal')!
    const form = dom.q<'form'>('#auth_login_modal form')!
    const input_uid = dom.qe<'input'>(form, 'input[name="uid"]')!
    const input_uid_group = input_uid.parentElement!
    const input_uid_invalid_feedback = dom.qe<'div'>(form, '.invalid-feedback')!
    const button_close = dom.qe<'button'>(form, '.modal-footer button[data-bs-dismiss="modal"]')!
    const button_submit = dom.qe<'button'>(form, 'button[type="submit"]')!
    const a_lupa_uid = dom.qe<'a'>(form, 'a[aria-label="Lupa UID"]')!
    const a_daftar = dom.qe<'a'>(form, 'a[aria-label="Daftar"]')!
    const checkbox_hide_uid = dom.q<'input'>('#login_modal_hide_uid_input')!
    const label_hide_uid = dom.q<'label'>('label[for="login_modal_hide_uid_input"]')!

    checkbox_hide_uid.addEventListener('change', () => {
        if (checkbox_hide_uid.checked) {
            label_hide_uid.innerHTML = '<i class="fa-solid fa-eye"></i>'
            input_uid.placeholder = '~ UID ~'
            input_uid.autocomplete = 'off'
        }
        else {
            label_hide_uid.innerHTML = '<i class="fa-solid fa-eye-slash"></i>'
            input_uid.placeholder = 'UID'
            input_uid.autocomplete = 'on'
        }
    })

    modal.addEventListener('shown.bs.modal', () => {
        input_uid.focus()
    })

    modal.addEventListener('hidden.bs.modal', () => {
        input_uid_group.classList.remove('is-invalid')
        input_uid.classList.remove('is-invalid')
        input_uid.classList.add('border-end-0')
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
        input_uid_group.classList.remove('is-invalid')
        input_uid.classList.remove('is-invalid')
        input_uid.classList.add('border-end-0')

        await common.sleep(100)

        await auth.login(input_uid.value, false).then(user => {
            if (user === null) {
                dom.enable(...disabled_elements)
                button_submit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk'

                input_uid_invalid_feedback.textContent = 'Maaf, UID tidak ditemukan. Silakan periksa kembali.'
                input_uid_group.classList.add('is-invalid')
                input_uid.classList.add('is-invalid')
                input_uid.classList.remove('border-end-0')

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
