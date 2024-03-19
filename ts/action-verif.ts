(() => {
    const url_params = new URLSearchParams(window.location.search)

    const item: VerifItem = {
        nama_pendaftar: url_params.get('nama_pendaftar') || '',
        organisasi: url_params.get('organisasi') || '',
        nama_kegiatan: url_params.get('nama_kegiatan') || '',
        deskripsi_kegiatan: url_params.get('deskripsi_kegiatan') || '',
        jenis_kegiatan: url_params.get('jenis_kegiatan') || '',
        jenis_verif: url_params.get('jenis_verif') || '',
        verif_dengan: url_params.get('verif_dengan') || '',
        tanggal_verif: url_params.get('tanggal_verif') || '', // yyyy-mm-dd
        jam_verif: url_params.get('jam_verif') || '',
        status: 'QUEUED',
    }

    const template_text = `VERIF ${item.jenis_verif}_${item.nama_kegiatan} dengan ${item.verif_dengan}`

    const db_antrean_verif = firebase.database().ref(`/${G.DB_NAME_ANTREAN_VERIF}`)
    db_antrean_verif.push(item)
        .then(() => {
            window.location.replace(`./endform-verif.html?template_text=${template_text}&${url_params.toString()}`)
        })

})()
