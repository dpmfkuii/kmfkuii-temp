(() => {
    // daftar verif button is disabled by default
    const daftar_verifikasi_button = document.querySelector('#daftar_verifikasi_button') as HTMLAnchorElement

    // enable when it's Senin—Sabtu
    if (new Date().getDay() !== 0) {
        daftar_verifikasi_button.classList.remove('disabled')
    }
})()
