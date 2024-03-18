const url_params = new URLSearchParams(window.location.search)

const form_values: PesanVerifProps = {
    nama_pemesan: url_params.get('nama_pemesan') || '',
    organisasi: url_params.get('organisasi') || '',
    nama_kegiatan: url_params.get('nama_kegiatan') || '',
    deskripsi_kegiatan: url_params.get('deskripsi_kegiatan') || '',
    jenis_verif: url_params.get('jenis_verif') || '',
    verif_dengan: url_params.get('verif_dengan') || '',
    tanggal_verif: url_params.get('tanggal_verif') || '', // yyyy-mm-dd
    waktu_verif: url_params.get('waktu_verif') || '',
    status: 'QUEUED',
}

pesan_db.push(form_values)
    .then(() => {
        window.location.replace(`./endform.html?template_text=${template_text}`)
    })

const template_text = `SUDAH PESAN VERIF ${form_values.jenis_verif}_${form_values.nama_kegiatan} dengan ${form_values.verif_dengan} [${form_values.tanggal_verif} at ${form_values.waktu_verif}]`
