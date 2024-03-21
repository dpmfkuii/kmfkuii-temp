(() => {
    const url_params = new URLSearchParams(window.location.search)
    const item = common.get_verif_item_from_url_params()

    const template_text = `VERIF ${item.jenis_verif}_${item.nama_kegiatan} dengan ${item.verif_dengan}`

    const db_antrean_verif = firebase.database().ref(`/${G.DB_NAME_ANTREAN_VERIF}`)
    db_antrean_verif.push(item)
        .then(() => {
            window.location.replace(`./endform-verif.html?template_text=${template_text}&${url_params.toString()}`)
        })
})()
