(() => {
    const url_params = new URLSearchParams(window.location.search)
    const form_values: DaftarVerifProps = {
        nama_pendaftar: url_params.get('nama_pendaftar') || '',
        organisasi: url_params.get('organisasi') || '',
        nama_kegiatan: url_params.get('nama_kegiatan') || '',
        deskripsi_kegiatan: url_params.get('deskripsi_kegiatan') || '',
        jenis_kegiatan: url_params.get('jenis_kegiatan') || '',
        jenis_verif: url_params.get('jenis_verif') || '',
        verif_dengan: url_params.get('verif_dengan') || '',
        tanggal_verif: url_params.get('tanggal_verif') || '', // yyyy-mm-dd
        waktu_verif: url_params.get('waktu_verif') || '',
        status: 'QUEUED',
    }
    const template_text_p = document.querySelector('#template_text') as HTMLParagraphElement
    const template_text_text = url_params.get('template_text') || ''
    template_text_p.innerHTML = `<strong>"${template_text_text}"</strong>`

    const link_email = document.querySelector('#link_email') as HTMLAnchorElement
    link_email.href = `mailto:fkuiidpm@gmail.com?subject=${template_text_text}
&body=
Assalamu’alaikum wr. wb.
%0A%0A
Perkenalkan, saya ${form_values.nama_pendaftar} 
mahasiswa FK UII yang saat ini diamanahi menjadi sekretaris ${form_values.nama_kegiatan}. 
Kami bermaksud mengajukan permohonan verifikasi ${form_values.jenis_verif} 
kegiatan ${form_values.nama_kegiatan} dengan ${form_values.verif_dengan} pada tanggal ${form_values.tanggal_verif}. 
Terima kasih.
%0A%0A
Wassalamu’alaikum wr. wb.
%0A%0A`
})()
