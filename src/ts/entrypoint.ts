interface EventsMap {
    sistem_data_loaded: SistemData.Snapshot
    sistem_data_organisasi_loaded: SistemData.Snapshot['organisasi']
}

if (events.get_callbacks('sistem_data_organisasi_loaded').length > 0) {
    try {
        db.get_sistem_data_organisasi()
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
        el.role = 'button'
        el.addEventListener('click', () => {
            swal.fire({
                title: 'Web KM FK UII',
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
    }
})()

main.invoke_animation()
