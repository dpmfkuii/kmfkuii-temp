(() => {
    const form = dom.q<'form'>('#auth_login_modal form')!
    form.addEventListener('submit', async (ev) => {
        ev.preventDefault()

        const input_uid = dom.qe<'input'>(form, 'input[name="uid"]')!
        const input_uid_invalid_feedback = dom.qe<'div'>(form, '.invalid-feedback')!
        const button_close = dom.qe<'button'>(form, '.modal-footer button[data-bs-dismiss="modal"]')!
        const button_submit = dom.qe<'button'>(form, 'button[type="submit"]')!

        dom.disable(button_close)
        dom.disable(button_submit)
        button_submit.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Masuk'

        await common.sleep(100)

        auth.login(input_uid.value).then(user => {
            if (user === null) {
                dom.enable(button_close)
                dom.enable(button_submit)
                button_submit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk'

                input_uid_invalid_feedback.textContent = 'Maaf, UID tidak ditemukan. Silahkan periksa kembali.'
                input_uid.classList.add('is-invalid')
            }
        })

        return false
    })
})()
