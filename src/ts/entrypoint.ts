interface EventsMap {
    sistem_data_loaded: SistemData.Snapshot
    sistem_data_organisasi_loaded: SistemData.Snapshot['organisasi']
}

if (events.get_callbacks('sistem_data_organisasi_loaded').length > 0) {
    try {
        db.sistem.get_data_organisasi()
            .then(snap => {
                if (!snap.exists()) return
                events.trigger('sistem_data_organisasi_loaded', snap.val())
            })
    }
    catch (err) {
        main.show_unexpected_error_message(err)
    }
}

(() => {
    const el = dom.q('#hbdhbdhbd')
    if (el) {
        const ver = `<small class="text-secondary">${dom.q('meta[name="static-version"]')?.getAttribute('content') || 'v0'}</small>`
        el.role = 'button'
        el.addEventListener('click', () => {
            swal.fire({
                title: `Web KM FK UII ${ver}`,
                html: `<i class="small">${'dami yb 3< htiw edam'.split('').reverse().join('')}</i>`,
                confirmButtonText: 'take care',
                customClass: {
                    popup: 'w-auto small',
                    title: 'fs-6 p-3',
                    htmlContainer: 'border-bottom border-top m-0 p-3',
                    confirmButton: 'btn btn-sm btn-km-primary',
                },
                buttonsStyling: false,
                allowEnterKey: false,
            })
        })
        el.appendChild(dom.c('span', { html: ver }))
    }
})()

main.invoke_animation()

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service_worker.js')
    })
}
