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
